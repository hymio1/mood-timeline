import { useMemo } from 'react';
import {
  LineChart, Line, PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer,
} from 'recharts';
import dayjs from 'dayjs';
import type { EmotionRecord } from '../types';
import {
  calcMoodDistribution, calcAvgMood, calcAvgSleep, calcAvgEnergy, calcAvgStress,
  calcActivityCorrelation, getLast30Days, buildDailyMoodSeries, getMoodOption,
} from '../utils/helpers';
import EmptyState from '../components/EmptyState';

const ACCENT = '#8B7EC8';
const GRID_COLOR = '#F0ECE4';

export default function StatsPage({ records }: { records: EmotionRecord[] }) {
  const moodDist = useMemo(() => calcMoodDistribution(records), [records]);
  const last30Days = useMemo(() => getLast30Days(), []);
  const series = useMemo(() => buildDailyMoodSeries(records), [records]);

  const lineData = useMemo(() => {
    const map = new Map(series.map(r => [r.date, r]));
    return last30Days.map(date => {
      const r = map.get(date);
      return { date: date.slice(5), mood: r ? r.mood : null };
    });
  }, [series, last30Days]);

  const sleepData = useMemo(() => {
    const map = new Map(series.map(r => [r.date, r]));
    return last30Days.map(date => {
      const r = map.get(date);
      return { date: date.slice(5), sleep: r?.sleepHours ?? null };
    });
  }, [series, last30Days]);

  const pieData = useMemo(() =>
    moodDist.filter(d => d.count > 0).map(d => ({ name: d.label, value: d.count, color: d.color })),
    [moodDist]
  );

  const activityInsights = useMemo(() => calcActivityCorrelation(records), [records]);

  // This week vs last week
  const thisWeek = useMemo(() => records.filter(r => dayjs().diff(dayjs(r.date), 'day') <= 7), [records]);
  const lastWeek = useMemo(() => records.filter(r => {
    const d = dayjs(r.date);
    const diff = dayjs().diff(d, 'day');
    return diff > 7 && diff <= 14;
  }), [records]);
  const avgThisWeek = calcAvgMood(thisWeek);
  const avgLastWeek = calcAvgMood(lastWeek);

  // Recent sleep trend
  const recentRecords = useMemo(() => records.filter(r => dayjs().diff(dayjs(r.date), 'day') <= 14), [records]);

  if (records.length === 0) {
    return <EmptyState icon="◉" title="暂无统计" desc="记录心情后，数据仪表盘将展示你的情绪趋势" />;
  }

  return (
    <div style={{ animation: 'fadeInUp 0.35s cubic-bezier(0.16,1,0.3,1)' }}>
      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 12 }}>
        <SummaryCard label="平均心情" value={avgThisWeek > 0 ? avgThisWeek.toFixed(1) : '—'} sub={avgThisWeek > avgLastWeek + 0.1 ? '↑ 比上周高' : avgThisWeek < avgLastWeek - 0.1 ? '↓ 比上周低' : '→ 持平'} color="#8B7EC8" />
        <SummaryCard label="平均睡眠" value={calcAvgSleep(records) !== null ? `${calcAvgSleep(records)!.toFixed(1)}h` : '—'} sub={`${recentRecords.filter(r => r.sleepHours !== null).length} 天有记录`} color="#5A7FA8" />
        <SummaryCard label="平均精力" value={calcAvgEnergy(records) !== null ? `${calcAvgEnergy(records)!.toFixed(1)}/10` : '—'} sub="近30天平均" color="#5A8A6E" />
        <SummaryCard label="平均压力" value={calcAvgStress(records) !== null ? `${calcAvgStress(records)!.toFixed(1)}/10` : '—'} sub="数值越低越好" color="#C4884A" />
      </div>

      {/* Charts grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 12, marginBottom: 12 }}>
        <ChartCard title="近30天情绪变化">
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={lineData} margin={{ top: 4, right: 12, bottom: 4, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#B8B0A8' }} tickLine={false} axisLine={false} />
              <YAxis domain={[0.5, 5.5]} tick={{ fontSize: 9, fill: '#B8B0A8' }} tickLine={false} axisLine={false} ticks={[1, 2, 3, 4, 5]} />
              <RechartsTooltip contentStyle={{ background: '#fff', border: '1px solid #EDE8E0', borderRadius: 10, fontSize: 11, boxShadow: '0 2px 12px rgba(61,57,53,0.08)' }} labelStyle={{ fontWeight: 500, color: '#3D3935' }} />
              <Line type="monotone" dataKey="mood" stroke={ACCENT} strokeWidth={2} dot={{ r: 3, fill: ACCENT, stroke: '#fff', strokeWidth: 1.5 }} activeDot={{ r: 4 }} connectNulls={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="情绪分布">
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="45%" innerRadius={34} outerRadius={64} paddingAngle={4} dataKey="value" strokeWidth={0}>
                {pieData.map((entry, i) => <Cell key={`cell-${i}`} fill={entry.color} />)}
              </Pie>
              <RechartsTooltip contentStyle={{ background: '#fff', border: '1px solid #EDE8E0', borderRadius: 10, fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', marginTop: 4 }}>
            {pieData.map(d => (
              <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 10, color: '#7A756D' }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: d.color, display: 'inline-block' }} />
                {d.name}({d.value})
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* Sleep + Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <ChartCard title="睡眠趋势">
          {recentRecords.filter(r => r.sleepHours !== null).length === 0 ? (
            <p style={{ fontSize: 12, color: '#B8B0A8', margin: 0, textAlign: 'center', padding: '30px 0' }}>暂无睡眠数据</p>
          ) : (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={sleepData} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
                <XAxis dataKey="date" tick={{ fontSize: 8, fill: '#B8B0A8' }} tickLine={false} axisLine={false} />
                <YAxis domain={[0, 12]} tick={{ fontSize: 8, fill: '#B8B0A8' }} tickLine={false} axisLine={false} />
                <RechartsTooltip contentStyle={{ background: '#fff', border: '1px solid #EDE8E0', borderRadius: 8, fontSize: 10 }} />
                <Bar dataKey="sleep" fill={ACCENT} radius={[2, 2, 0, 0]} opacity={0.8} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="活动关联">
          {activityInsights.length === 0 ? (
            <p style={{ fontSize: 12, color: '#B8B0A8', margin: 0, textAlign: 'center', padding: '30px 0' }}>记录更多活动后出现关联</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 4 }}>
              {activityInsights.map(a => (
                <div key={a.activity} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 11, color: '#5A554D', flex: 1 }}>{a.activity}</span>
                  <div style={{ width: 60, height: 5, borderRadius: 3, background: '#F0ECE4', overflow: 'hidden' }}>
                    <div style={{ width: `${(a.avgMood / 5) * 100}%`, height: '100%', borderRadius: 3, background: a.color }} />
                  </div>
                  <span style={{ fontSize: 10, color: '#7A756D', fontVariantNumeric: 'tabular-nums', minWidth: 24 }}>{a.avgMood.toFixed(1)}</span>
                  <span style={{ fontSize: 9, color: '#B8B0A8' }}>×{a.count}</span>
                </div>
              ))}
            </div>
          )}
        </ChartCard>
      </div>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card" style={{ padding: 14 }}>
      <p style={{ fontSize: 10, fontWeight: 600, color: '#8B7EC8', letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0 0 10px 0' }}>{title}</p>
      {children}
    </div>
  );
}

function SummaryCard({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  return (
    <div className="card" style={{ padding: '12px 14px' }}>
      <p style={{ fontSize: 10, color: '#9E9890', margin: 0, fontWeight: 500 }}>{label}</p>
      <p style={{ fontSize: 20, fontWeight: 600, color, margin: '3px 0 0 0', fontFamily: "'Space Mono', monospace", lineHeight: 1 }}>{value}</p>
      <p style={{ fontSize: 9, color: '#B8B0A8', margin: '2px 0 0 0' }}>{sub}</p>
    </div>
  );
}
