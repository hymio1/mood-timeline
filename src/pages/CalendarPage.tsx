import { useState, useMemo } from 'react';
import dayjs from 'dayjs';
import type { EmotionRecord } from '../types';
import { getDaysInMonth, getWeeksOfMonth, getMoodOption, formatDateShort } from '../utils/helpers';
import { MOOD_HEATMAP, MOOD_HEATMAP_TEXT } from '../types';
import EmptyState from '../components/EmptyState';

interface TooltipState {
  x: number; y: number; date: string; value: string; visible: boolean;
}

type Page = 'today' | 'log' | 'timeline' | 'calendar' | 'stats' | 'insight' | 'memory' | 'achievements' | 'settings';

export default function CalendarPage({ records, onNavigate }: { records: EmotionRecord[]; onNavigate: (page: Page) => void }) {
  const today = dayjs();
  const [viewYear, setViewYear] = useState(today.year());
  const [viewMonth, setViewMonth] = useState(today.month());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const heatmapData = useMemo(() => {
    const map = new Map<string, EmotionRecord>();
    records.forEach(r => map.set(r.date, r));
    return map;
  }, [records]);

  const daysInMonth = useMemo(() => getDaysInMonth(viewYear, viewMonth), [viewYear, viewMonth]);
  const weeks = useMemo(() => getWeeksOfMonth(viewYear, viewMonth), [viewYear, viewMonth]);
  const firstDayOfWeek = useMemo(() => dayjs(`${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-01`).day(), [viewYear, viewMonth]);

  const monthRecords = useMemo(() => records.filter(r => {
    const d = dayjs(r.date);
    return d.year() === viewYear && d.month() === viewMonth;
  }), [records, viewYear, viewMonth]);

  const avgMood = useMemo(() => {
    if (!monthRecords.length) return null;
    return monthRecords.reduce((s, r) => s + r.mood, 0) / monthRecords.length;
  }, [monthRecords]);

  const selectedRecord = useMemo(() => selectedDate ? heatmapData.get(selectedDate) : null, [selectedDate, heatmapData]);

  const prevMonth = () => { const m = viewMonth === 0 ? 11 : viewMonth - 1; const y = viewMonth === 0 ? viewYear - 1 : viewYear; setViewYear(y); setViewMonth(m); };
  const nextMonth = () => { const m = viewMonth === 11 ? 0 : viewMonth + 1; const y = viewMonth === 11 ? viewYear + 1 : viewYear; setViewYear(y); setViewMonth(m); };
  const goToday = () => { setViewYear(today.year()); setViewMonth(today.month()); setSelectedDate(null); };

  const dayLabels = ['日', '一', '二', '三', '四', '五', '六'];

  return (
    <div style={{ animation: 'fadeInUp 0.35s cubic-bezier(0.16,1,0.3,1)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div>
          <p className="font-display" style={{ fontSize: 18, fontWeight: 500, color: '#3D3935', margin: 0 }}>{viewYear}年{viewMonth + 1}月</p>
          {monthRecords.length > 0 && (
            <p style={{ fontSize: 11, color: '#9E9890', margin: '2px 0 0 0' }}>
              记录 {monthRecords.length}/{daysInMonth} 天
              {avgMood !== null && ` · 均分 ${avgMood.toFixed(1)}`}
            </p>
          )}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={prevMonth} style={navBtnStyle}>‹</button>
          <button onClick={goToday} style={navBtnStyle}>今</button>
          <button onClick={nextMonth} style={navBtnStyle}>›</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
        {[1, 2, 3, 4, 5].map(m => {
          const opt = getMoodOption(m);
          return (
            <div key={m} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: MOOD_HEATMAP[m] }} />
              <span style={{ fontSize: 10, color: '#9E9890' }}>{opt?.label}</span>
            </div>
          );
        })}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 10, height: 10, borderRadius: 2, background: '#F0ECE4' }} />
          <span style={{ fontSize: 10, color: '#9E9890' }}>未记录</span>
        </div>
      </div>

      <div className="card" style={{ padding: 12 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3 }}>
          {dayLabels.map(d => (
            <div key={d} style={{ fontSize: 10, color: '#B8B0A8', textAlign: 'center', padding: '4px 0', fontWeight: 500 }}>{d}</div>
          ))}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={`empty-${i}`} style={{ height: 32 }} />)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const record = heatmapData.get(dateStr);
            const isToday = dateStr === today.format('YYYY-MM-DD');
            const isSelected = dateStr === selectedDate;
            return (
              <button key={dateStr} onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                style={{
                  aspectRatio: '1', borderRadius: 6, border: 'none', cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1,
                  background: record ? MOOD_HEATMAP[record.mood]! : isToday ? '#F5F0FA' : 'transparent',
                  color: record ? MOOD_HEATMAP_TEXT[record.mood]! : isToday ? '#8B7EC8' : '#C8C0B8',
                  fontSize: 11, fontWeight: isToday ? 600 : 400,
                  transition: 'all 0.15s ease',
                  boxShadow: isSelected ? '0 0 0 2px #8B7EC8' : 'none',
                  fontFamily: 'inherit',
                }}
                onMouseEnter={e => { if (!record) (e.currentTarget as HTMLElement).style.background = '#F8F4EE'; }}
                onMouseLeave={e => { if (!record) (e.currentTarget as HTMLElement).style.background = isToday ? '#F5F0FA' : 'transparent'; }}
              >
                <span>{day}</span>
                {record && <span style={{ fontSize: 9, lineHeight: 1 }}>{getMoodOption(record.mood)?.emoji}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {selectedRecord && (
        <div className="card" style={{ padding: 14, marginTop: 10, animation: 'fadeInUp 0.2s ease' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 24 }}>{getMoodOption(selectedRecord.mood)?.emoji}</span>
            <div>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#3D3935', margin: 0 }}>{formatDateShort(selectedRecord.date)}</p>
              <p style={{ fontSize: 10, color: getMoodOption(selectedRecord.mood)?.color ?? '#9E8A5C', margin: '1px 0 0 0' }}>{getMoodOption(selectedRecord.mood)?.label}</p>
            </div>
            <button onClick={() => onNavigate('log')} style={{ marginLeft: 'auto', padding: '4px 10px', borderRadius: 6, border: '1px solid #E8E2D8', background: '#fff', color: '#7A756D', fontSize: 10, cursor: 'pointer', fontFamily: 'inherit' }}>编辑</button>
          </div>
          {selectedRecord.content && <p style={{ fontSize: 11, color: '#5A554D', lineHeight: 1.6, margin: '0 0 8px 0', whiteSpace: 'pre-wrap' }}>{selectedRecord.content}</p>}
          {selectedRecord.tags.length > 0 && (
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {selectedRecord.tags.map(t => <span key={t} style={{ padding: '1px 6px', borderRadius: 20, fontSize: 9, background: '#F3EFE8', color: '#7A756D', border: '1px solid #E8E2D8' }}>{t}</span>)}
            </div>
          )}
        </div>
      )}

      {records.length === 0 && <EmptyState icon="▦" title="暂无数据" desc="记录心情后，月历将在这里展示你的情绪轨迹" />}
    </div>
  );
}

const navBtnStyle: React.CSSProperties = {
  width: 28, height: 28, borderRadius: 6, border: '1px solid #E8E2D8', background: '#fff',
  cursor: 'pointer', fontSize: 14, color: '#7A756D', display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontFamily: 'inherit', transition: 'all 0.15s',
};
