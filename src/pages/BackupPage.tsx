import { useRef, useCallback, useState } from 'react';
import type { EmotionRecord } from '../types';
import { useRecords } from '../hooks/useRecords';
import { exportRecords, exportCSV, parseRecordsFromFile } from '../utils/helpers';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import Toast from '../components/Toast';
import { useToast } from '../components/Toast';

export default function BackupPage({ records }: { records: EmotionRecord[] }) {
  const { importRecords } = useRecords();
  const { toast, showToast } = useToast();
  const [errorModal, setErrorModal] = useState<{ open: boolean; message: string }>({ open: false, message: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportJSON = useCallback(() => { exportRecords(records); showToast('已导出 JSON 备份', 'success'); }, [records, showToast]);
  const handleExportCSV = useCallback(() => { exportCSV(records); showToast('已导出 CSV 文件', 'success'); }, [records, showToast]);
  const handleImport = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    parseRecordsFromFile(file)
      .then(imported => { importRecords(imported); showToast(`成功导入 ${imported.length} 条记录`, 'success'); if (fileInputRef.current) fileInputRef.current.value = ''; })
      .catch(err => { const msg = err instanceof Error ? err.message : '文件格式错误'; setErrorModal({ open: true, message: msg }); });
  }, [importRecords, showToast]);

  return (
    <>
      <div style={{ animation: 'fadeInUp 0.35s cubic-bezier(0.16,1,0.3,1)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <BackupCard icon="↓" iconBg="#EEF3FA" title="导出 JSON" desc="完整备份，含所有记录数据" actionLabel="导出 JSON" onAction={handleExportJSON} />
          <BackupCard icon="↓" iconBg="#EFF7F3" title="导出 CSV" desc="表格格式，可用 Excel 打开" actionLabel="导出 CSV" onAction={handleExportCSV} />
          <BackupCard icon="↑" iconBg="#F5F0FA" title="导入 JSON" desc="从备份恢复，重复记录自动跳过" actionLabel="选择文件" onAction={() => fileInputRef.current?.click()}>
            <input ref={fileInputRef} type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
          </BackupCard>
          <BackupCard icon="🗑" iconBg="#FDF0EF" title="清除数据" desc="删除所有本地记录，不可恢复" actionLabel="清除" onAction={() => setErrorModal({ open: true, message: '确定要清除所有数据吗？此操作不可撤销。' })} danger />
        </div>

        {records.length === 0 && <EmptyState icon="◈" title="暂无数据" desc="导出和导入功能需要在有记录后才能使用" />}

        <div className="card" style={{ padding: 14, marginTop: 10, background: '#F8F4EE' }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <span style={{ fontSize: 16, flexShrink: 0 }}>🔒</span>
            <div>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#3D3935', margin: '0 0 4px 0' }}>你的记录属于你自己</p>
              <p style={{ fontSize: 11, color: '#7A756D', margin: 0, lineHeight: 1.6 }}>
                当前数据保存在浏览器本地 localStorage，不会上传到任何服务器。
                请定期导出备份，以防浏览器数据被清除。不要在未授权的情况下分享私人记录。
              </p>
            </div>
          </div>
        </div>
      </div>

      <Modal open={errorModal.open} onClose={() => setErrorModal({ open: false, message: '' })} title="确认">
        <p style={{ fontSize: 13, color: '#5A554D', marginBottom: 14, lineHeight: 1.6 }}>{errorModal.message}</p>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={() => setErrorModal({ open: false, message: '' })} style={btnGhost}>取消</button>
          {errorModal.message.includes('清除') ? (
            <button onClick={() => { localStorage.removeItem('mood_timeline_records'); window.location.reload(); }} style={btnDanger}>确认清除</button>
          ) : (
            <button onClick={() => setErrorModal({ open: false, message: '' })} style={btnDanger}>知道了</button>
          )}
        </div>
      </Modal>

      {toast && toast.message && <Toast message={toast.message} type={toast.type} onClose={() => showToast('', toast.type)} />}
    </>
  );
}

function BackupCard({ icon, iconBg, title, desc, actionLabel, onAction, children, danger }: {
  icon: string; iconBg: string; title: string; desc: string;
  actionLabel: string; onAction: () => void; children?: React.ReactNode; danger?: boolean;
}) {
  return (
    <div className="card" style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 8, borderColor: danger ? '#F0D0CC' : undefined }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>{icon}</div>
        <div>
          <p style={{ fontSize: 11, fontWeight: 600, color: '#3D3935', margin: '0 0 2px 0' }}>{title}</p>
          <p style={{ fontSize: 10, color: '#9E9890', margin: 0 }}>{desc}</p>
        </div>
      </div>
      <button onClick={onAction} style={{
        padding: '5px 12px', borderRadius: 7, border: danger ? '1px solid #F0D0CC' : '1px solid #E8E2D8',
        background: danger ? '#FDF5F3' : '#fff', color: danger ? '#B8605A' : '#7A756D',
        fontSize: 10, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', alignSelf: 'flex-start',
      }}>{actionLabel}</button>
      {children}
    </div>
  );
}

const btnGhost: React.CSSProperties = { padding: '6px 14px', borderRadius: 8, border: '1px solid #E8E2D8', background: '#F8F4EE', color: '#7A756D', cursor: 'pointer', fontSize: 11, fontWeight: 500, fontFamily: 'inherit' };
const btnDanger: React.CSSProperties = { padding: '6px 14px', borderRadius: 8, border: 'none', background: '#B8605A', color: '#fff', cursor: 'pointer', fontSize: 11, fontWeight: 500, fontFamily: 'inherit' };
