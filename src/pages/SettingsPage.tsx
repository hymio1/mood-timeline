import { useRef, useCallback, useState } from 'react';
import type { EmotionRecord } from '../types';
import { useRecords } from '../hooks/useRecords';
import { exportRecords, exportCSV, parseRecordsFromFile } from '../utils/helpers';
import Modal from '../components/Modal';
import { useToast } from '../components/Toast';
import Toast from '../components/Toast';

export default function SettingsPage({ records }: { records: EmotionRecord[] }) {
  const { importRecords } = useRecords();
  const { toast, showToast } = useToast();
  const [confirmClear, setConfirmClear] = useState(false);
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

  const handleClear = useCallback(() => {
    if (!confirmClear) { setConfirmClear(true); return; }
    localStorage.removeItem('mood_timeline_records');
    window.location.reload();
  }, [confirmClear]);

  return (
    <>
      <div style={{ animation: 'fadeInUp 0.35s cubic-bezier(0.16,1,0.3,1)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Section title="数据管理">
            <SettingRow icon="↓" iconBg="#EEF3FA" title="导出 JSON" desc="完整备份所有记录" action="导出" onAction={handleExportJSON} />
            <SettingRow icon="↓" iconBg="#EFF7F3" title="导出 CSV" desc="表格格式，可用 Excel 打开" action="导出" onAction={handleExportCSV} />
            <SettingRow icon="↑" iconBg="#F5F0FA" title="导入 JSON" desc="从备份恢复数据" action="选择文件" onAction={() => fileInputRef.current?.click()}>
              <input ref={fileInputRef} type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
            </SettingRow>
          </Section>

          <Section title="隐私">
            <div className="card" style={{ padding: 12, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>🔒</span>
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: '#3D3935', margin: '0 0 3px 0' }}>你的记录属于你自己</p>
                <p style={{ fontSize: 10, color: '#7A756D', margin: 0, lineHeight: 1.6 }}>
                  数据仅保存在浏览器本地 localStorage，不会上传到任何服务器。请定期导出备份。
                </p>
              </div>
            </div>
          </Section>

          <Section title="危险操作">
            <div className="card" style={{ padding: 12, display: 'flex', gap: 10, alignItems: 'flex-start', borderColor: '#F0D0CC' }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>⚠</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: '#B8605A', margin: '0 0 3px 0' }}>清除所有数据</p>
                <p style={{ fontSize: 10, color: '#9E9890', margin: '0 0 8px 0' }}>此操作不可撤销</p>
                <button onClick={handleClear} style={{
                  padding: '5px 12px', borderRadius: 7, border: confirmClear ? 'none' : '1px solid #E8C4C0',
                  background: confirmClear ? '#B8605A' : '#FDF5F3',
                  color: confirmClear ? '#fff' : '#B8605A',
                  fontSize: 10, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
                }}>
                  {confirmClear ? '确认清除（再点一次）' : '清除数据'}
                </button>
              </div>
            </div>
          </Section>
        </div>
      </div>

      <Modal open={errorModal.open} onClose={() => setErrorModal({ open: false, message: '' })} title="导入失败">
        <p style={{ fontSize: 12, color: '#5A554D', marginBottom: 12 }}>{errorModal.message}</p>
        <button onClick={() => setErrorModal({ open: false, message: '' })} style={{ width: '100%', padding: '7px 14px', borderRadius: 8, border: '1px solid #E8E2D8', background: '#F8F4EE', color: '#7A756D', cursor: 'pointer', fontSize: 11, fontWeight: 500, fontFamily: 'inherit' }}>知道了</button>
      </Modal>

      {toast && toast.message && <Toast message={toast.message} type={toast.type} onClose={() => showToast('', toast.type)} />}
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p style={{ fontSize: 10, fontWeight: 600, color: '#8B7EC8', letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0 0 6px 0' }}>{title}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>{children}</div>
    </div>
  );
}

function SettingRow({ icon, iconBg, title, desc, action, onAction, children }: {
  icon: string; iconBg: string; title: string; desc: string;
  action: string; onAction: () => void; children?: React.ReactNode;
}) {
  return (
    <div className="card" style={{ padding: 12, display: 'flex', gap: 10, alignItems: 'center' }}>
      <div style={{ width: 32, height: 32, borderRadius: 8, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: '#3D3935', margin: '0 0 2px 0' }}>{title}</p>
        <p style={{ fontSize: 10, color: '#9E9890', margin: 0 }}>{desc}</p>
      </div>
      <button onClick={onAction} style={{ padding: '5px 10px', borderRadius: 7, border: '1px solid #E8E2D8', background: '#fff', color: '#7A756D', fontSize: 10, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>{action}</button>
      {children}
    </div>
  );
}
