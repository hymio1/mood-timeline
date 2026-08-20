import { useMemo } from 'react';
import type { EmotionRecord } from '../types';
import {
  calcStreak, calcLongestStreak, calcDaysSinceFirst, calcSeenMoods,
  calcUniqueTags,
} from '../utils/helpers';
import { ACHIEVEMENTS } from '../types';
import EmptyState from '../components/EmptyState';

export default function AchievementsPage({ records }: { records: EmotionRecord[] }) {
  const streak = useMemo(() => calcStreak(records), [records]);
  const longestStreak = useMemo(() => calcLongestStreak(records), [records]);
  const totalDays = useMemo(() => records.length, [records]);
  const daysSinceFirst = useMemo(() => calcDaysSinceFirst(records), [records]);
  const seenMoods = useMemo(() => calcSeenMoods(records), [records]);
  const uniqueTags = useMemo(() => calcUniqueTags(records).length, [records]);

  const earned = useMemo(() => {
    return ACHIEVEMENTS.map((a: any) => ({
      ...a,
      earned: (a.check as (r: number, o: any) => boolean)(totalDays, { seenMoods, uniqueTags, daysSinceFirst }),
    }));
  }, [totalDays, seenMoods, uniqueTags, daysSinceFirst]);

  const earnedCount = earned.filter((a: any) => a.earned).length;

  return (
    <div style={{ animation: 'fadeInUp 0.35s cubic-bezier(0.16,1,0.3,1)' }}>
      <div className="card" style={{ padding: 20, marginBottom: 16, background: 'linear-gradient(135deg, #F5F0FA 0%, #FAF6F1 100%)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, textAlign: 'center' }}>
          <div>
            <p style={{ fontSize: 24, fontWeight: 600, color: '#8B7EC8', margin: 0, fontFamily: "'Space Mono', monospace" }}>{streak}</p>
            <p style={{ fontSize: 10, color: '#9E9890', margin: '2px 0 0 0' }}>当前连续</p>
          </div>
          <div>
            <p style={{ fontSize: 24, fontWeight: 600, color: '#C4884A', margin: 0, fontFamily: "'Space Mono', monospace" }}>{longestStreak}</p>
            <p style={{ fontSize: 10, color: '#9E9890', margin: '2px 0 0 0' }}>最长连续</p>
          </div>
          <div>
            <p style={{ fontSize: 24, fontWeight: 600, color: '#5A7FA8', margin: 0, fontFamily: "'Space Mono', monospace" }}>{totalDays}</p>
            <p style={{ fontSize: 10, color: '#9E9890', margin: '2px 0 0 0' }}>累计记录</p>
          </div>
        </div>
        <div style={{ marginTop: 12, height: 4, borderRadius: 2, background: '#E8E2D8', overflow: 'hidden' }}>
          <div style={{ height: '100%', borderRadius: 2, background: 'linear-gradient(90deg, #8B7EC8, #A898D8)', width: `${(earnedCount / ACHIEVEMENTS.length) * 100}%`, transition: 'width 0.5s ease' }} />
        </div>
        <p style={{ fontSize: 10, color: '#B8B0A8', margin: '6px 0 0 0', textAlign: 'center' }}>
          已获得 {earnedCount}/{ACHIEVEMENTS.length} 个成就
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
        {ACHIEVEMENTS.map((a: any) => {
          const isEarned = earned.find((e: any) => e.id === a.id)?.earned ?? false;
          return (
            <div key={a.id} className="card" style={{ padding: 14, opacity: isEarned ? 1 : 0.45, border: isEarned ? '1px solid #E8E2D8' : '1px solid #F0ECE4' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: isEarned ? '#F5F0FA' : '#F0ECE4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                  {isEarned ? a.icon : '🔒'}
                </div>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 600, color: isEarned ? '#3D3935' : '#B8B0A8', margin: 0 }}>{a.title}</p>
                  <p style={{ fontSize: 10, color: isEarned ? '#7A756D' : '#C8C0B8', margin: '2px 0 0 0' }}>{a.desc}</p>
                </div>
              </div>
              {isEarned && <p style={{ fontSize: 10, color: '#5A8A6E', fontWeight: 500, margin: '8px 0 0 0' }}>✓ 已获得</p>}
            </div>
          );
        })}
      </div>

      {records.length === 0 && <EmptyState icon="🌱" title="还没有记录" desc="开始记录后，成就系统将为你解锁里程碑" />}
    </div>
  );
}
