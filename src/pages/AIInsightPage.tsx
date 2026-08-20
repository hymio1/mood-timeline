import { useState, useCallback, useMemo } from 'react';
import type { EmotionRecord } from '../types';
import { generateInsights, calcStreak, calcAvgMood, calcAvgSleep } from '../utils/helpers';
import EmptyState from '../components/EmptyState';
import Toast from '../components/Toast';
import { useToast } from '../components/Toast';

export default function InsightPage({ records }: { records: EmotionRecord[] }) {
  const [insights, setInsights] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast, showToast } = useToast();

  const streak = useMemo(() => calcStreak(records), [records]);
  const avgMood = useMemo(() => calcAvgMood(records), [records]);
  const avgSleep = useMemo(() => calcAvgSleep(records), [records]);

  const handleGenerate = useCallback(() => {
    setLoading(true);
    setInsights(null);
    setTimeout(() => {
      const generated = generateInsights(records);
      setInsights(generated.length > 0 ? generated : null);
      setLoading(false);
    }, 1200);
  }, [records]);

  if (records.length === 0) {
    return <EmptyState icon="✦" title="暂无数据" desc="记录心情后，AI洞察将为你生成个性化分析" />;
  }

  return (
    <>
      <div style={{ maxWidth: 560, margin: '0 auto', animation: 'fadeInUp 0.35s cubic-bezier(0.16,1,0.3,1)' }}>
        {/* Summary */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
          <SummaryTile label="连续记录" value={`${streak}天`} />
          <SummaryTile label="平均心情" value={avgMood > 0 ? avgMood.toFixed(1) : '—'} />
          <SummaryTile label="平均睡眠" value={avgSleep !== null ? `${avgSleep.toFixed(1)}h` : '—'} />
        </div>

        <div className="card" style={{ padding: 20 }}>
          <button
            onClick={handleGenerate} disabled={loading}
            style={{
              width: '100%', padding: '11px 20px', borderRadius: 12, fontSize: 13, fontWeight: 500,
              background: loading ? '#D4CFC8' : 'linear-gradient(135deg, #8B7EC8 0%, #7A6BB8 100%)',
              color: '#fff', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : '0 2px 12px rgba(139,126,200,0.3)',
              transition: 'all 0.2s ease', fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            {loading ? (
              <><svg className="spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ strokeLinecap: 'round' }}><circle cx="12" cy="12" r="10" strokeDasharray="30" strokeDashoffset="10" /></svg>分析中…</>
            ) : (
              '生成情绪洞察'
            )}
          </button>

          {loading && (
            <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#F0ECE4', flexShrink: 0, animation: 'pulse-soft 1.5s ease-in-out infinite' }} />
                  <div style={{ flex: 1, height: 8, borderRadius: 4, background: '#F0ECE4', animation: `pulse-soft 1.5s ease-in-out ${i * 0.2}s infinite` }} />
                </div>
              ))}
            </div>
          )}

          {insights && insights.length > 0 && (
            <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8, animation: 'fadeInUp 0.3s ease' }}>
              {insights.map((text, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, padding: '10px 12px', borderRadius: 10, background: '#F8F4EE', border: '1px solid #EDE8E0' }}>
                  <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>✦</span>
                  <p style={{ fontSize: 12, color: '#5A554D', lineHeight: 1.6, margin: 0 }}>{text}</p>
                </div>
              ))}
              <p style={{ fontSize: 10, color: '#B8B0A8', margin: '4px 0 0 0', fontStyle: 'italic' }}>
                * 基于你的真实数据计算生成
              </p>
            </div>
          )}
        </div>
      </div>
      {toast && toast.message && <Toast message={toast.message} type={toast.type} onClose={() => showToast('', toast.type)} />}
    </>
  );
}

function SummaryTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="card" style={{ padding: '12px 14px', textAlign: 'center' }}>
      <p style={{ fontSize: 10, color: '#9E9890', margin: 0 }}>{label}</p>
      <p style={{ fontSize: 20, fontWeight: 600, color: '#3D3935', margin: '3px 0 0 0', fontFamily: "'Space Mono', monospace" }}>{value}</p>
    </div>
  );
}
