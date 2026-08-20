import { useMemo } from 'react';
import type { EmotionRecord } from '../types';
import { findYearAgoRecord, formatDate, getMoodOption, formatTimeAgo } from '../utils/helpers';
import EmptyState from '../components/EmptyState';

export default function MemoryPage({ records }: { records: EmotionRecord[] }) {
  const today = new Date().toISOString().slice(0, 10);
  const yearAgo = useMemo(() => findYearAgoRecord(records, today), [records, today]);
  const firstRecord = useMemo(() => {
    if (!records.length) return null;
    return records.slice().sort((a, b) => a.date.localeCompare(b.date))[0];
  }, [records]);

  return (
    <div style={{ animation: 'fadeInUp 0.35s cubic-bezier(0.16,1,0.3,1)' }}>
      {/* Year ago */}
      <div className="card" style={{ padding: 20, marginBottom: 12 }}>
        <p style={{ fontSize: 10, fontWeight: 600, color: '#8B7EC8', letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0 0 12px 0' }}>
          一年前的今天
        </p>
        {yearAgo ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <span style={{ fontSize: 28 }}>{getMoodOption(yearAgo.record.mood)?.emoji}</span>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#3D3935', margin: 0 }}>
                  {formatDate(yearAgo.record.date)}
                </p>
                <p style={{ fontSize: 11, color: getMoodOption(yearAgo.record.mood)?.color ?? '#9E8A5C', margin: '2px 0 0 0' }}>
                  {getMoodOption(yearAgo.record.mood)?.label}
                </p>
              </div>
              <span style={{ marginLeft: 'auto', fontSize: 10, color: '#B8B0A8' }}>{yearAgo.daysAgo}年前</span>
            </div>
            {yearAgo.record.content && (
              <p style={{ fontSize: 12, color: '#5A554D', lineHeight: 1.6, margin: '0 0 8px 0', whiteSpace: 'pre-wrap' }}>
                {yearAgo.record.content}
              </p>
            )}
            {yearAgo.record.tags.length > 0 && (
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {yearAgo.record.tags.map(t => (
                  <span key={t} style={{ padding: '2px 8px', borderRadius: 20, fontSize: 10, background: '#F3EFE8', color: '#7A756D', border: '1px solid #E8E2D8' }}>{t}</span>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🕐</div>
            <p style={{ fontSize: 12, color: '#B8B0A8', margin: 0 }}>一年前的今天还没有记录</p>
            <p style={{ fontSize: 11, color: '#C8C0B8', margin: '4px 0 0 0' }}>今年此时记得来回顾一下</p>
          </div>
        )}
      </div>

      {/* First record */}
      {firstRecord && (
        <div className="card" style={{ padding: 20 }}>
          <p style={{ fontSize: 10, fontWeight: 600, color: '#8B7EC8', letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0 0 12px 0' }}>
            最初的起点
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 24 }}>{getMoodOption(firstRecord.mood)?.emoji}</span>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#3D3935', margin: 0 }}>{formatDate(firstRecord.date)}</p>
              <p style={{ fontSize: 11, color: getMoodOption(firstRecord.mood)?.color ?? '#9E8A5C', margin: '2px 0 0 0' }}>
                {getMoodOption(firstRecord.mood)?.label}
              </p>
            </div>
            <span style={{ marginLeft: 'auto', fontSize: 10, color: '#B8B0A8' }}>
              第 {records.indexOf(firstRecord) + 1} 条记录
            </span>
          </div>
          {firstRecord.content && (
            <p style={{ fontSize: 12, color: '#5A554D', lineHeight: 1.6, margin: '10px 0 0 0', whiteSpace: 'pre-wrap' }}>
              {firstRecord.content}
            </p>
          )}
        </div>
      )}

      {records.length === 0 && <EmptyState icon="🕐" title="还没有回忆" desc="记录心情后，这里会展示你曾经的轨迹" />}
    </div>
  );
}
