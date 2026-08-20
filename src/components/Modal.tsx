interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function Modal({ open, onClose, title, children }: ModalProps) {
  if (!open) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div
        className="animate-fade-in"
        onClick={onClose}
        style={{ position: 'absolute', inset: 0, background: 'rgba(61,57,53,0.3)', backdropFilter: 'blur(4px)' }}
      />
      <div
        className="animate-fade-in"
        style={{
          position: 'relative',
          background: '#fff',
          borderRadius: 20,
          boxShadow: '0 8px 40px rgba(61,57,53,0.12)',
          width: '100%',
          maxWidth: 420,
          border: '1px solid #EDE8E0',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #F0ECE4' }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: '#3D3935', margin: 0 }}>{title}</h2>
          <button
            onClick={onClose}
            aria-label="关闭"
            style={{
              width: 28, height: 28, borderRadius: '50%', border: 'none', background: '#F5F0EA',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#9E9890', fontSize: 14, transition: 'all 0.15s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#EDE8E0'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#F5F0EA'; }}
          >
            ✕
          </button>
        </div>
        <div style={{ padding: 20 }}>{children}</div>
      </div>
    </div>
  );
}
