import { useState, useMemo } from 'react';
import dayjs from 'dayjs';
import type { EmotionRecord } from '../types';
import { buildHeatmapData, formatDateShort } from '../utils/helpers';
import { MOOD_HEATMAP } from '../types';
import EmptyState from '../components/EmptyState';

type Metric = 'mood' | 'sleep' | 'stress' | 'energy';
interface TooltipState { x: number; y: number; date: string; value: string; visible: boolean; }
const METRIC_LABELS: Record<Metric, string> = { mood: '情绪', sleep: '睡眠', stress: '压力', energy: '精力' };

export default function HeatmapPage({ records }: { records: EmotionRecord[] }) {
  const [metric, setMetric] = useState<Metric>('mood');
  const [tooltip, setTooltip] = useState<TooltipState>({ x: 0, y: 0, date: '', value: '', visible: false });

  const heatmapData = useMemo(() => buildHeatmapData(records), [records]);

  const weeks = useMemo(() => {
    const today = dayjs();
    const start = today.startOf('week').subtract(51, 'week');
    const result: string[][] = [];
    for (let i = 0; i < 52; i++) {
      const ws = start.add(i, 'week');
      const week: string[] = [];
      for (let d = 0; d < 7; d++) week.push(ws.add(d, 'day').format('YYYY-MM-DD'));
      result.push(week);
      if (ws.add(6, 'day').isAfter(today)) break;
    }
    return result;
  }, []);

  const dayLabels = ['一', '二', '三', '四', '五', '六', '日'];

  const getCellData = (date: string) => {
    const r = heatmapData.get(date);
    if (!r) return { value: null as number | null, label: '未记录' };
    if (metric === 'mood') return { value: r.mood, label: `${r.mood}/5` };
    if (metric === 'sleep') return { value: r.sleepHours, label: r.sleepHours !== null ? `${r.sleepHours}h` : '未记录' };
    if (metric === 'stress') return { value: r.stress ?? null, label: r.stress !== null ? `${r.stress}/10` : '未记录' };
    if (metric === 'energy') return { value: r.energy ?? null, label: r.energy !== null ? `${r.energy}/10` : '未记录' };
    return { value: null, label: '' };
  };

  const getCellColor = (date: string): string => {
    const { value } = getCellData(date);
    if (value === null || value === 0) return '#F0ECE4';
    if (metric === 'mood') return MOOD_HEATMAP[value] ?? '#F0ECE4';
    if (metric === 'sleep') {
      const intensity = Math.min(value / 10, 1);
      return `rgba(90, 127, 168, ${0.2 + intensity * 0.6})`;
    }
    if (metric === 'stress') {
      const ratio = (value as number) / 10;
      if (ratio < 0.4) return '#C8DFD0';
      if (ratio < 0.7) return '#F0DDB8';
      return '#F5D5D0';
    }
    if (metric === 'energy') {
      const intensity = Math.min((value as number) / 10, 1);
      return `rgba(90, 138, 110, ${0.2 + intensity * 0.6})`;
    }
    return '#F0ECE4';
  };

  if (records.length === 0) {
    return <EmptyState icon="▦" title="暂无数据" desc="记录心情后，年度热力图将在这里展示你的情绪轨迹" />;
  }

  return (
    <div style={{ animation: 'fadeInUp 0.35s cubic-bezier(0.16,1,0.3,1)' }}>
      <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
        {(['mood', 'sleep', 'stress', 'energy'] as Metric[]).map(m => (
          <button key={m} onClick={() => setMetric(m)} style={{
            padding: '4px 12px', borderRadius: 20, border: metric === m ? '1.5px solid #8B7EC8' : '1.5px solid #E8E2D8',
            background: metric === m ? '#F5F0FA' : '#fff', color: metric === m ? '#7C5CBF' : '#9E9890',
            fontSize: 11, fontWeight: metric === m ? 600 : 400, cursor: 'pointer', fontFamily: 'inherit',
          }}>{METRIC_LABELS[m]}</button>
        ))}
      </div>

      <div className="card" style={{ padding: 16, overflowX: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end', gap: 4, marginBottom: 8 }}>
          <span style={{ fontSize: 9, color: '#B8B0A8' }}>更低</span>
          {[1, 2, 3, 4, 5].map(m => (
            <div key={m} style={{ width: 10, height: 10, borderRadius: 2, background: metric === 'mood' ? MOOD_HEATMAP[m]! : '#D4CFC8' }} />
          ))}
          <span style={{ fontSize: 9, color: '#B8B0A8' }}>更高</span>
        </div>

        <div style={{ display: 'flex', gap: 12, minWidth: 'max-content' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3, paddingTop: 2 }}>
            {dayLabels.map(d => <div key={d} style={{ height: 12, fontSize: 8, color: '#C8C0B8', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', width: 12 }}>{d}</div>)}
          </div>
          <div style={{ display: 'flex', gap: 2 }}>
            {weeks.map((week, wi) => (
              <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {week.map(date => {
                  const { label } = getCellData(date);
                  return (
                    <div key={date} className="heatmap-cell" style={{ width: 12, height: 12, borderRadius: 2, background: getCellColor(date) }}
                      onMouseEnter={e => { const t = e.currentTarget as HTMLDivElement; setTooltip({ x: t.getBoundingClientRect().x + t.offsetWidth / 2, y: t.getBoundingClientRect().y - 6, date, value: label, visible: true }); }}
                      onMouseLeave={() => setTooltip(p => ({ ...p, visible: false }))}
                      title={`${formatDateShort(date)}: ${label}`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 2, marginTop: 4 }}>
          {weeks.map((week, wi) => {
            const fd = dayjs(week[0]);
            const ld = dayjs(week[week.length - 1]);
            if (fd.month() !== ld.month()) return <div key={wi} style={{ width: 14, fontSize: 8, color: '#C8C0B8' }}>{wi === 0 ? fd.format('M月') : ld.format('M月')}</div>;
            return <div key={wi} style={{ width: 14 }} />;
          })}
        </div>
      </div>

      {tooltip.visible && (
        <div style={{ position: 'fixed', zIndex: 50, padding: '4px 8px', background: '#3D3935', color: '#FAF6F1', fontSize: 10, borderRadius: 6, boxShadow: '0 4px 12px rgba(61,57,53,0.2)', pointerEvents: 'none', left: tooltip.x - 44, top: tooltip.y - 44, width: 88 }}>
          <div style={{ fontWeight: 500, marginBottom: 1 }}>{formatDateShort(tooltip.date)}</div>
          <div style={{ color: '#8B7EC8' }}>{tooltip.value}</div>
        </div>
      )}
    </div>
  );
}
