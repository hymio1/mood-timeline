import { useState, useMemo } from 'react';
import dayjs from 'dayjs';
import type { EmotionRecord } from '../types';
import {
  getToday, formatDate, getGreeting, getMoodOption,
  calcAvgMood, calcStreak, calcDaysSinceFirst, getLast30Days,
  buildDailyMoodSeries, generateInsights,
} from '../utils/helpers';
import EmptyState from '../components/EmptyState';

export default function TodayPage({ records }: { records: EmotionRecord[] }) {
  const today = getToday();
  const todayRecord = useMemo(() => records.find(r => r.date === today), [records, today]);
  const last30 = useMemo(() => getLast30Days(), []);
  const series = useMemo(() => buildDailyMoodSeries(records), [records]);
  const last7 = useMemo(() => {
    return last30.slice(-7).map(d => series.find(r => r.date === d)).filter((r): r is NonNullable<typeof r> => r !== undefined);
  }, [series, last30]);
  const prev7 = useMemo(() => {
    return last30.slice(-14, -7).map(d => series.find(r => r.date === d)).filter((r): r is NonNullable<typeof r> => r !== undefined);
  }, [series, last30]);
  const avgThisWeek = useMemo(() => last7.length > 0 ? last7.reduce((s, r) => s + r.mood, 0) / last7.length : 0, [last7]);
  const avgLastWeek = useMemo(() => prev7.length > 0 ? prev7.reduce((s, r) => s + r.mood, 0) / prev7.length : 0, [prev7]);
  const streak = useMemo(() => calcStreak(records), [records]);
  const daysSinceFirst = useMemo(() => calcDaysSinceFirst(records), [records]);
  const insights = useMemo(() => generateInsights(records), [records]);
  const moodDist = useMemo(() => {
    const c: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    records.forEach(r => c[r.mood]++);
    const total = records.length || 1;
    return [1, 2, 3, 4, 5].map(m => ({ m, count: c[m], pct: Math.round(c[m] / total * 100) }));
  }, [records]);

  const trendDir = avgThisWeek > avgLastWeek + 0.1 ? 'up' : avgThisWeek < avgLastWeek - 0.1 ? 'down' : 'flat';
  const monthCount = records.filter(r => { const d = new Date(r.date); return d.getMonth() === new Date().getMonth(); }).length;

  return (
    <div style={{ animation: 'fadeInUp 0.35s cubic-bezier(0.16,1,0.3,1)' }}>
      {/* Greeting */}
      <div style={{ marginBottom: 20 }}>
        <p style={{ fontSize: 11, color: '#9E9890', margin: '0 0 4px 0', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          {getGreeting()}
        </p>
        <p className="font-display" style={{ fontSize: 26, fontWeight: 500, color: '#3D3935', margin: '0 0 4px 0', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
          今天感觉怎么样？
        </p>
        {todayRecord ? (
          <p style={{ fontSize: 12, color: '#5A8A6E', margin: '4px 0 0 0', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 15 }}>{getMoodOption(todayRecord.mood)?.emoji}</span>
            今天记录过：{getMoodOption(todayRecord.mood)?.label} · {formatDate(todayRecord.date)}
          </p>
        ) : (
          <p style={{ fontSize: 12, color: '#B8B0A8', margin: '4px 0 0 0' }}>还没有今天的记录，来写一条吧</p>
        )}
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 16 }}>
        <StatBox label="连续记录" value={`${streak}天`} sub={streak >= 7 ? '太棒了' : streak >= 3 ? '继续加油' : '开始记录'} color="#8B7EC8" />
        <StatBox label="累计天数" value={`${records.length}天`} sub={`使用 ${daysSinceFirst} 天`} color="#5A7FA8" />
        <StatBox label="本周均分" value={avgThisWeek > 0 ? avgThisWeek.toFixed(1) : '—'} sub={trendDir === 'up' ? '↑ 上升' : trendDir === 'down' ? '↓ 下降' : '→ 持平'} color={trendDir === 'up' ? '#5A8A6E' : trendDir === 'down' ? '#B8605A' : '#9E8A5C'} />
        <StatBox label="本月记录" value={`${monthCount}条`} sub="本月" color="#C4884A" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 10 }}>
        {/* Last 7 days */}
        <div className="card" style={{ padding: 14 }}>
          <p style={{ fontSize: 10, fontWeight: 600, color: '#8B7EC8', letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0 0 10px 0' }}>最近7天</p>
          {last7.length === 0 ? (
            <p style={{ fontSize: 11, color: '#B8B0A8', margin: 0, textAlign: 'center', padding: '16px 0' }}>暂无数据</p>
          ) : (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5, height: 80 }}>
              {last7.map(r => {
                const h = (r.mood / 5) * 60 + 10;
                const opt = getMoodOption(r.mood);
                const isToday = r.date === today;
                return (
                  <div key={r.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                    <span style={{ fontSize: 12 }}>{opt?.emoji}</span>
                    <div style={{ width: '100%', height: h, borderRadius: 3, background: opt?.bg ?? '#FAF8F0', border: `1px solid ${opt?.bar ?? '#9E8A5C'}40` }} />
                    <span style={{ fontSize: 8, color: isToday ? '#8B7EC8' : '#C8C0B8', fontWeight: isToday ? 600 : 400 }}>
                      {isToday ? '今' : dayjs(r.date).format('D')}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Mood distribution */}
        <div className="card" style={{ padding: 14 }}>
          <p style={{ fontSize: 10, fontWeight: 600, color: '#8B7EC8', letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0 0 10px 0' }}>本月分布</p>
          {records.length === 0 ? (
            <p style={{ fontSize: 11, color: '#B8B0A8', margin: 0, textAlign: 'center', padding: '16px 0' }}>暂无数据</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {moodDist.map(d => {
                const opt = getMoodOption(d.m);
                return (
                  <div key={d.m} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 12, width: 16, textAlign: 'center' }}>{opt?.emoji}</span>
                    <div style={{ flex: 1, height: 5, borderRadius: 3, background: '#F0ECE4', overflow: 'hidden' }}>
                      <div style={{ width: `${d.pct}%`, height: '100%', borderRadius: 3, background: opt?.bar ?? '#9E8A5C', transition: 'width 0.4s ease' }} />
                    </div>
                    <span style={{ fontSize: 9, color: '#9E9890', width: 24, textAlign: 'right' }}>{d.pct}%</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <div className="card" style={{ padding: 14, marginTop: 10 }}>
          <p style={{ fontSize: 10, fontWeight: 600, color: '#8B7EC8', letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0 0 8px 0' }}>今日洞察</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {insights.map((text, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 12, flexShrink: 0, marginTop: 1 }}>✦</span>
                <p style={{ fontSize: 11, color: '#5A554D', lineHeight: 1.6, margin: 0 }}>{text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {records.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 24px' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>✏</div>
          <p style={{ fontSize: 13, color: '#7A756D', margin: '0 0 4px 0', fontWeight: 500 }}>开始记录你的第一心情吧</p>
          <p style={{ fontSize: 11, color: '#B8B0A8', margin: 0 }}>去「记录」页面写下今天的心情</p>
        </div>
      )}
    </div>
  );
}

function StatBox({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  return (
    <div className="card" style={{ padding: '12px 14px' }}>
      <p style={{ fontSize: 10, color: '#9E9890', margin: 0, fontWeight: 500 }}>{label}</p>
      <p style={{ fontSize: 20, fontWeight: 600, color, margin: '2px 0 0 0', fontFamily: "'Space Mono', monospace", lineHeight: 1 }}>{value}</p>
      <p style={{ fontSize: 9, color: '#B8B0A8', margin: '2px 0 0 0' }}>{sub}</p>
    </div>
  );
}
