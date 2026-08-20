import { useState, useRef, useEffect } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  onClose: () => void;
}

const TYPE_STYLES = {
  success: { bg: '#EFF7F3', border: '#C8DFD0', color: '#5A8A6E', icon: '✓' },
  error:   { bg: '#FDF0EF', border: '#E8C4C0', color: '#B8605A', icon: '!' },
  info:    { bg: '#EEF3FA', border: '#C4D4E8', color: '#5A7FA8', icon: 'i' },
};

export default function Toast({ message, type = 'info', duration = 3000, onClose }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [duration, onClose]);

  const s = TYPE_STYLES[type];

  return (
    <div
      className="animate-fade-in"
      style={{
        position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)',
        zIndex: 100, padding: '10px 18px', borderRadius: 12,
        border: `1px solid ${s.border}`,
        background: s.bg,
        color: s.color,
        fontSize: 12,
        fontWeight: 500,
        boxShadow: '0 4px 20px rgba(61,57,53,0.12)',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        minWidth: 160,
        justifyContent: 'center',
      }}
    >
      <span style={{ fontSize: 13 }}>{s.icon}</span>
      {message}
    </div>
  );
}

export function useToast() {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const timerRef = useRef<number | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast({ message, type });
    timerRef.current = window.setTimeout(() => setToast(null), 3000);
  };

  const hideToast = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast(null);
  };

  return { toast, showToast, hideToast };
}
