interface DayPickerProps {
  value: string;
  onChange: (v: string) => void;
  error?: string;
}

export default function DayPicker({ value, onChange, error }: DayPickerProps) {
  return (
    <div>
      <p style={{ color: '#7A756D', fontSize: 11, fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 8 }}>
        记录日期
      </p>
      <input
        type="date"
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          width: '100%', maxWidth: 200, padding: '10px 14px',
          borderRadius: 12, border: '1px solid #E8E2D8',
          background: '#FAFAF8', fontSize: 13, color: '#3D3935',
          outline: 'none', fontFamily: 'inherit', transition: 'all 0.2s',
          cursor: 'pointer',
        }}
        onFocus={e => { e.currentTarget.style.borderColor = '#8B7EC8'; e.currentTarget.style.background = '#fff'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(139,126,200,0.1)'; }}
        onBlur={e => { e.currentTarget.style.borderColor = '#E8E2D8'; e.currentTarget.style.background = '#FAFAF8'; e.currentTarget.style.boxShadow = 'none'; }}
      />
      {error && <p style={{ color: '#B8605A', fontSize: 11, marginTop: 4 }}>{error}</p>}
    </div>
  );
}
