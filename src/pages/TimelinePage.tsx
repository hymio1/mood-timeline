import { useState, useCallback, useMemo } from 'react';
import type { EmotionRecord } from '../types';
import { useRecords } from '../hooks/useRecords';
import { formatDate, truncateText, getMoodOption, formatTimeAgo } from '../utils/helpers';
import DayPicker from '../components/DayPicker';
import MoodSelector from '../components/MoodSelector';
import SleepInput from '../components/SleepInput';
import TagInput from '../components/TagInput';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import Toast from '../components/Toast';
import { useToast } from '../components/Toast';
import { PRESET_ACTIVITIES } from '../types';

interface EditFormState {
  date: string; mood: number; sleepHours: number | null; energy: number | null; stress: number | null;
  tags: string[]; activities: string[]; content: string;
}

export default function TimelinePage({ records }: { records: EmotionRecord[] }) {
  const { updateRecord, deleteRecord } = useRecords();
  const { toast, showToast } = useToast();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditFormState>({ date: '', mood: 3, sleepHours: null, energy: null, stress: null, tags: [], activities: [], content: '' });
  const [tagInput, setTagInput] = useState('');
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');

  const grouped = useMemo(() => {
    const sorted = [...records].sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
    const groups: Record<string, EmotionRecord[]> = {};
    sorted.forEach(r => {
      const key = r.date;
      if (!groups[key]) groups[key] = [];
      groups[key].push(r);
    });
    return Object.entries(groups).map(([date, recs]) => ({ date, records: recs }));
  }, [records]);

  const openEdit = useCallback((r: EmotionRecord) => {
    setEditingId(r.id);
    setEditForm({ date: r.date, mood: r.mood, sleepHours: r.sleepHours, energy: r.energy, stress: r.stress, tags: [...r.tags], activities: [...r.activities], content: r.content });
    setTagInput('');
    setExpandedId(null);
  }, []);

  const handleSaveEdit = useCallback(() => {
    if (!editingId || !editForm.date || !editForm.content.trim()) { showToast('日期和内容不能为空', 'error'); return; }
    updateRecord(editingId, { ...editForm });
    setEditingId(null);
    showToast('记录已更新', 'success');
  }, [editingId, editForm, updateRecord, showToast]);

  const handleDelete = useCallback((id: string) => {
    deleteRecord(id);
    setDeleteConfirmId(null);
    setExpandedId(null);
    showToast('记录已删除', 'info');
  }, [deleteRecord, showToast]);

  const addEditTag = useCallback(() => {
    const t = tagInput.trim();
    if (t && !editForm.tags.includes(t)) setEditForm(prev => ({ ...prev, tags: [...prev.tags, t] }));
    setTagInput('');
  }, [tagInput, editForm.tags]);

  const toggleActivity = useCallback((key: string) => {
    setEditForm(prev => prev.activities.includes(key) ? { ...prev, activities: prev.activities.filter(a => a !== key) } : { ...prev, activities: [...prev.activities, key] });
  }, []);

  return (
    <>
      <div style={{ animation: 'fadeInUp 0.35s cubic-bezier(0.16,1,0.3,1)' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <p className="font-display" style={{ fontSize: 20, fontWeight: 500, color: '#3D3935', margin: 0 }}>情绪时间线</p>
            <p className="page-subtitle" style={{ marginTop: 2 }}>共 {records.length} 条记录</p>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            <button onClick={() => setViewMode('day')} style={viewBtnStyle(viewMode === 'day')}>日</button>
            <button onClick={() => setViewMode('week')} style={viewBtnStyle(viewMode === 'week')}>周</button>
          </div>
        </div>

        {records.length === 0 ? (
          <EmptyState icon="◷" title="还没有记录" desc="去记录页写下第一心情吧" />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {grouped.map(({ date, records: dayRecords }) => (
              <div key={date}>
                {/* Date header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <div style={{ width: 3, height: 16, borderRadius: 2, background: '#8B7EC8', flexShrink: 0 }} />
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#3D3935', margin: 0 }}>{formatDate(date)}</p>
                    <p style={{ fontSize: 10, color: '#B8B0A8', margin: 0 }}>{formatTimeAgo(date)}</p>
                  </div>
                  {dayRecords.length > 1 && (
                    <span style={{ fontSize: 10, color: '#B8B0A8', marginLeft: 'auto' }}>{dayRecords.length} 条记录</span>
                  )}
                </div>

                {/* Cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {dayRecords.map(r => {
                    const moodOpt = getMoodOption(r.mood);
                    const isExpanded = expandedId === r.id;
                    const isEditing = editingId === r.id;
                    return (
                      <div
                        key={r.id}
                        className="card"
                        style={{ borderLeft: `3px solid ${moodOpt?.bar ?? '#9E8A5C'}`, cursor: isEditing ? 'default' : 'pointer', transition: 'box-shadow 0.15s' }}
                        onMouseEnter={e => { if (!isEditing) (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(61,57,53,0.1)'; }}
                        onMouseLeave={e => { if (!isEditing) (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 16px rgba(61,57,53,0.06)'; }}
                        onClick={() => isExpanded && !isEditing ? setExpandedId(null) : setExpandedId(r.id)}
                      >
                        <div style={{ padding: '12px 14px' }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                            <div style={{ width: 36, height: 36, borderRadius: '50%', background: moodOpt?.bg ?? '#FAF8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0, border: `1px solid ${moodOpt ? moodOpt.bg + 'cc' : '#E8E2D8'}` }}>
                              {moodOpt?.emoji}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 3 }}>
                                <span style={{ fontSize: 9, fontWeight: 600, padding: '1px 7px', borderRadius: 20, background: moodOpt?.badge ?? '#FAF8F0', color: moodOpt?.color ?? '#9E8A5C', border: `1px solid ${moodOpt ? moodOpt.bg + 'cc' : '#E8E2D8'}` }}>
                                  {moodOpt?.label}
                                </span>
                                {r.sleepHours !== null && <span style={{ fontSize: 10, color: '#B8B0A8' }}>{r.sleepHours}h</span>}
                                {r.energy !== null && <span style={{ fontSize: 10, color: '#5A8A6E' }}>精力 {r.energy}/10</span>}
                                {r.stress !== null && <span style={{ fontSize: 10, color: '#C4884A' }}>压力 {r.stress}/10</span>}
                              </div>
                              <p style={{ fontSize: 12, color: '#5A554D', margin: 0, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                {truncateText(r.content, 100)}
                              </p>
                              {r.tags.length > 0 && (
                                <div style={{ display: 'flex', gap: 4, marginTop: 6, flexWrap: 'wrap' }}>
                                  {r.tags.slice(0, 3).map(t => <span key={t} style={{ padding: '1px 7px', borderRadius: 20, fontSize: 9, background: '#F3EFE8', color: '#7A756D', border: '1px solid #E8E2D8' }}>{t}</span>)}
                                </div>
                              )}
                            </div>
                            <span style={{ color: '#C8C0B8', fontSize: 9, flexShrink: 0, alignSelf: 'flex-end', marginBottom: 2, transition: 'transform 0.2s', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>▾</span>
                          </div>
                        </div>

                        {isExpanded && !isEditing && (
                          <div style={{ padding: '0 14px 12px', borderTop: '1px solid #F0ECE4', animation: 'fadeInUp 0.2s ease' }}>
                            <p style={{ fontSize: 12, color: '#5A554D', lineHeight: 1.7, marginTop: 10, whiteSpace: 'pre-wrap' }}>{r.content}</p>
                            {r.activities.length > 0 && (
                              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 8 }}>
                                {r.activities.map(a => {
                                  const preset = PRESET_ACTIVITIES.find(p => p.key === a);
                                  return preset ? <span key={a} style={{ padding: '2px 8px', borderRadius: 20, fontSize: 10, background: preset.color + '18', color: preset.color, border: `1px solid ${preset.color}30` }}>{preset.label}</span> : null;
                                })}
                              </div>
                            )}
                            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                              <button onClick={e => { e.stopPropagation(); openEdit(r); }} style={btnGhostSmall}>编辑</button>
                              <button onClick={e => { e.stopPropagation(); setDeleteConfirmId(r.id); }} style={btnDangerSmall}>删除</button>
                            </div>
                          </div>
                        )}

                        {isExpanded && isEditing && (
                          <EditForm record={r} editForm={editForm} setEditForm={setEditForm} tagInput={tagInput} setTagInput={setTagInput} addEditTag={addEditTag} toggleActivity={toggleActivity} onSave={handleSaveEdit} onCancel={() => setEditingId(null)} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal open={!!deleteConfirmId} onClose={() => setDeleteConfirmId(null)} title="确认删除">
        <p style={{ fontSize: 13, color: '#5A554D', marginBottom: 16, lineHeight: 1.6 }}>删除后无法恢复，确定要删除这条记录吗？</p>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={() => setDeleteConfirmId(null)} style={btnGhost}>取消</button>
          <button onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)} style={btnDanger}>删除</button>
        </div>
      </Modal>

      {toast && toast.message && <Toast message={toast.message} type={toast.type} onClose={() => showToast('', toast.type)} />}
    </>
  );
}

function EditForm({ record, editForm, setEditForm, tagInput, setTagInput, addEditTag, toggleActivity, onSave, onCancel }: {
  record: EmotionRecord; editForm: EditFormState; setEditForm: React.Dispatch<React.SetStateAction<EditFormState>>;
  tagInput: string; setTagInput: (v: string) => void; addEditTag: () => void;
  toggleActivity: (k: string) => void; onSave: () => void; onCancel: () => void;
}) {
  return (
    <div style={{ padding: '0 14px 14px', borderTop: '1px solid #F0ECE4', animation: 'fadeInUp 0.2s ease', display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
      <DayPicker value={editForm.date} onChange={v => setEditForm(p => ({ ...p, date: v }))} />
      <MoodSelector value={editForm.mood} onChange={v => setEditForm(p => ({ ...p, mood: v }))} />
      <SleepInput value={editForm.sleepHours} onChange={v => setEditForm(p => ({ ...p, sleepHours: v }))} />
      <TagInput tags={editForm.tags} tagInput={tagInput} onTagInput={setTagInput} onAddTag={addEditTag} onRemoveTag={t => setEditForm(p => ({ ...p, tags: p.tags.filter((x: string) => x !== t) }))} />
      <div>
        <p style={{ color: '#7A756D', fontSize: 10, fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 6 }}>活动</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {PRESET_ACTIVITIES.map(a => {
            const active = editForm.activities.includes(a.key);
            return (
              <button key={a.key} type="button" onClick={() => toggleActivity(a.key)}
                style={{ padding: '3px 8px', borderRadius: 20, border: active ? `1.5px solid ${a.color}` : '1.5px solid #E8E2D8', background: active ? '#F5F0FA' : '#FAFAF8', color: active ? a.color : '#9E9890', fontSize: 10, cursor: 'pointer', fontFamily: 'inherit' }}>
                {a.label}
              </button>
            );
          })}
        </div>
      </div>
      <textarea value={editForm.content} onChange={e => setEditForm(p => ({ ...p, content: e.target.value }))} rows={3}
        style={{ width: '100%', padding: '8px 10px', borderRadius: 10, border: '1px solid #E8E2D8', background: '#FAFAF8', fontSize: 12, color: '#3D3935', outline: 'none', fontFamily: 'inherit', resize: 'vertical', lineHeight: 1.5, boxSizing: 'border-box' }}
      />
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={onSave} style={btnPrimarySmall}>保存</button>
        <button onClick={onCancel} style={btnGhostSmall}>取消</button>
      </div>
    </div>
  );
}

const btnGhostSmall: React.CSSProperties = { fontSize: 11, padding: '5px 12px', borderRadius: 8, border: '1px solid #E8E2D8', background: '#F8F4EE', color: '#7A756D', cursor: 'pointer', fontFamily: 'inherit' };
const btnDangerSmall: React.CSSProperties = { fontSize: 11, padding: '5px 12px', borderRadius: 8, border: '1px solid #F0D0CC', background: '#FDF5F3', color: '#B8605A', cursor: 'pointer', fontFamily: 'inherit' };
const btnPrimarySmall: React.CSSProperties = { fontSize: 11, padding: '5px 14px', borderRadius: 8, border: 'none', background: '#8B7EC8', color: '#fff', cursor: 'pointer', fontWeight: 500, fontFamily: 'inherit' };
const btnGhost: React.CSSProperties = { padding: '7px 16px', borderRadius: 10, border: '1px solid #E8E2D8', background: '#F8F4EE', color: '#7A756D', cursor: 'pointer', fontSize: 12, fontWeight: 500, fontFamily: 'inherit' };
const btnDanger: React.CSSProperties = { padding: '7px 16px', borderRadius: 10, border: 'none', background: '#B8605A', color: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 500, fontFamily: 'inherit' };
function viewBtnStyle(active: boolean): React.CSSProperties {
  return { padding: '4px 10px', borderRadius: 6, border: active ? '1.5px solid #8B7EC8' : '1.5px solid #E8E2D8', background: active ? '#F5F0FA' : '#fff', color: active ? '#7C5CBF' : '#9E9890', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit', fontWeight: active ? 600 : 400 };
}
