import { useState, useCallback, useMemo, useEffect } from 'react';
import type { EmotionRecord } from '../types';
import { useRecords } from '../hooks/useRecords';
import { useRecordForm } from '../hooks/useRecordForm';
import { getToday, formatDate, getMoodOption, truncateText } from '../utils/helpers';
import DayPicker from '../components/DayPicker';
import MoodSelector from '../components/MoodSelector';
import SleepInput from '../components/SleepInput';
import TagInput from '../components/TagInput';
import Toast from '../components/Toast';
import { useToast } from '../components/Toast';
import { MOOD_OPTIONS, PRESET_ACTIVITIES } from '../types';

// Energy/Stress slider component
function ScaleInput({ value, onChange, label, lowLabel, highLabel, color }: {
  value: number | null; onChange: (v: number | null) => void;
  label: string; lowLabel: string; highLabel: string; color: string;
}) {
  return (
    <div>
      <p style={{ color: '#7A756D', fontSize: 11, fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 8 }}>
        {label}
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <input
          type="range" min={1} max={10} step={1}
          value={value ?? 5}
          onChange={e => onChange(parseInt(e.target.value))}
          style={{ flex: 1 }}
        />
        <span className="font-mono" style={{ color, fontSize: 13, fontWeight: 600, minWidth: 20, textAlign: 'center' }}>
          {value ?? '—'}
        </span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
        <span style={{ fontSize: 9, color: '#C8C0B8' }}>{lowLabel}</span>
        <span style={{ fontSize: 9, color: '#C8C0B8' }}>{highLabel}</span>
      </div>
    </div>
  );
}

export default function LogPage() {
  const { records, addRecord } = useRecords();
  const { toast, showToast } = useToast();
  const today = getToday();
  const todayRecord = useMemo(() => records.find(r => r.date === today), [records, today]);

  const [date, setDate] = useState(today);
  const [mood, setMood] = useState<number>(3);
  const [sleepHours, setSleepHours] = useState<number | null>(null);
  const [energy, setEnergy] = useState<number | null>(null);
  const [stress, setStress] = useState<number | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [activities, setActivities] = useState<string[]>([]);
  const [content, setContent] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saveFlash, setSaveFlash] = useState(false);

  // Pre-fill from today's existing record only on mount
  useEffect(() => {
    if (todayRecord) {
      setDate(todayRecord.date);
      setMood(todayRecord.mood);
      setSleepHours(todayRecord.sleepHours);
      setEnergy(todayRecord.energy ?? null);
      setStress(todayRecord.stress ?? null);
      setTags([...todayRecord.tags]);
      setActivities([...todayRecord.activities]);
      setContent(todayRecord.content);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const addTag = useCallback(() => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) setTags(prev => [...prev, t]);
    setTagInput('');
  }, [tagInput, tags]);

  const toggleActivity = useCallback((key: string) => {
    setActivities(prev => prev.includes(key) ? prev.filter(a => a !== key) : [...prev, key]);
  }, []);

  const validate = useCallback((): boolean => {
    const errs: Record<string, string> = {};
    if (!date) errs.date = '请选择日期';
    if (!content.trim()) errs.content = '请输入随笔内容';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }, [date, content]);

  const handleSave = useCallback(() => {
    if (!validate()) { showToast('请完善必填项', 'error'); return; }
    setSaving(true);
    setTimeout(() => {
      addRecord({ date, mood, sleepHours, energy, stress, tags, activities, content: content.trim() });
      setSaving(false);
      setSaveFlash(true);
      showToast('保存成功', 'success');
      setTimeout(() => setSaveFlash(false), 600);
      // Reset form after save
      setDate(getToday()); setMood(3); setSleepHours(null); setEnergy(null); setStress(null);
      setTags([]); setActivities([]); setContent(''); setTagInput('');
    }, 400);
  }, [date, mood, sleepHours, energy, stress, tags, activities, content, validate, addRecord, showToast]);

  return (
    <div style={{ animation: 'fadeInUp 0.35s cubic-bezier(0.16,1,0.3,1)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 16, alignItems: 'start' }}>

        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="card" style={{ padding: 16 }}>
            <DayPicker value={date} onChange={setDate} error={errors.date} />
          </div>
          <div className="card" style={{ padding: 16 }}>
            <MoodSelector value={mood} onChange={setMood} error={errors.mood} />
          </div>
          <div className="card" style={{ padding: 16 }}>
            <SleepInput value={sleepHours} onChange={setSleepHours} />
          </div>
          <div className="card" style={{ padding: 16 }}>
            <ScaleInput value={energy} onChange={setEnergy} label="精力" lowLabel="疲惫" highLabel="充沛" color="#5A8A6E" />
          </div>
          <div className="card" style={{ padding: 16 }}>
            <ScaleInput value={stress} onChange={setStress} label="压力" lowLabel="放松" highLabel="紧张" color="#C4884A" />
          </div>
          <div className="card" style={{ padding: 16 }}>
            <p style={{ color: '#7A756D', fontSize: 11, fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 8 }}>
              今日活动
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {PRESET_ACTIVITIES.map(a => {
                const active = activities.includes(a.key);
                return (
                  <button key={a.key} type="button" onClick={() => toggleActivity(a.key)}
                    style={{
                      padding: '5px 10px', borderRadius: 20,
                      border: active ? `1.5px solid ${a.color}` : '1.5px solid #E8E2D8',
                      background: active ? '#F5F0FA' : '#FAFAF8',
                      color: active ? a.color : '#9E9890',
                      fontSize: 11, fontWeight: active ? 600 : 400,
                      cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                    }}
                  >
                    {a.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="card" style={{ padding: 16 }}>
            <TagInput tags={tags} tagInput={tagInput} onTagInput={setTagInput} onAddTag={addTag} onRemoveTag={t => setTags(prev => prev.filter(x => x !== t))} />
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10, position: 'sticky', top: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ color: '#7A756D', fontSize: 11, fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase', margin: 0 }}>随笔</p>
              <span style={{ fontSize: 11, color: '#B8B0A8', fontVariantNumeric: 'tabular-nums' }}>{content.length}/2000</span>
            </div>
            <textarea value={content} onChange={e => setContent(e.target.value)} rows={8}
              placeholder="写下今天发生的事，或者此刻的想法…"
              style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #E8E2D8', background: '#FAFAF8', fontSize: 13, color: '#3D3935', outline: 'none', fontFamily: 'inherit', resize: 'vertical', lineHeight: 1.7, boxSizing: 'border-box', transition: 'all 0.2s' }}
              onFocus={e => { e.currentTarget.style.borderColor = '#8B7EC8'; e.currentTarget.style.background = '#fff'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(139,126,200,0.1)'; }}
              onBlur={e => { e.currentTarget.style.borderColor = '#E8E2D8'; e.currentTarget.style.background = '#FAFAF8'; e.currentTarget.style.boxShadow = 'none'; }}
            />
            {errors.content && <p style={{ color: '#B8605A', fontSize: 11, margin: 0 }}>{errors.content}</p>}

            <button onClick={handleSave} disabled={saving}
              style={{
                width: '100%', padding: '10px 20px', borderRadius: 10, fontSize: 13, fontWeight: 500,
                background: saving ? '#D4CFC8' : saveFlash ? '#5A8A6E' : '#8B7EC8', color: '#fff',
                border: 'none', cursor: saving ? 'not-allowed' : 'pointer',
                boxShadow: saveFlash ? '0 2px 8px rgba(90,138,110,0.3)' : '0 2px 8px rgba(139,126,200,0.25)',
                transition: 'all 0.25s ease', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}
            >
              {saving ? (<><svg className="spin" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ strokeLinecap: 'round' }}><circle cx="12" cy="12" r="10" strokeDasharray="30" strokeDashoffset="10" /></svg>保存中…</>) : saveFlash ? '✓ 已保存' : '保存记录'}
            </button>

            {/* 今日记录预览 */}
            {todayRecord && (
              <div className="card" style={{ padding: 12, borderLeft: `3px solid ${getMoodOption(todayRecord.mood)?.bar ?? '#9E8A5C'}` }}>
                <p style={{ fontSize: 10, fontWeight: 600, color: '#8B7EC8', letterSpacing: '0.04em', textTransform: 'uppercase', margin: '0 0 8px 0' }}>今日记录预览</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 18 }}>{getMoodOption(todayRecord.mood)?.emoji}</span>
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 600, color: '#3D3935', margin: 0 }}>{formatDate(todayRecord.date)}</p>
                    <p style={{ fontSize: 10, color: getMoodOption(todayRecord.mood)?.color ?? '#9E8A5C', margin: 0 }}>{getMoodOption(todayRecord.mood)?.label}</p>
                  </div>
                </div>
                <p style={{ fontSize: 11, color: '#5A554D', margin: 0, lineHeight: 1.5 }}>{truncateText(todayRecord.content, 60)}</p>
                {todayRecord.tags.length > 0 && (
                  <div style={{ display: 'flex', gap: 4, marginTop: 6, flexWrap: 'wrap' }}>
                    {todayRecord.tags.slice(0, 2).map(t => <span key={t} style={{ padding: '1px 6px', borderRadius: 20, fontSize: 9, background: '#F3EFE8', color: '#7A756D', border: '1px solid #E8E2D8' }}>{t}</span>)}
                    {todayRecord.tags.length > 2 && <span style={{ fontSize: 9, color: '#B8B0A8' }}>+{todayRecord.tags.length - 2}</span>}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => showToast('', toast.type)} />}
    </div>
  );
}
