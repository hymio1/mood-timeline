interface SleepInputProps {
  value: number | null;
  onChange: (v: number | null) => void;
}

const SLEEP_OPTIONS: { label: string; value: number | null; active: boolean }[] = [
  { label: '<6h',  value: 1,  active: false },
  { label: '6-8h', value: 2,  active: false },
  { label: '>8h',  value: 3,  active: false },
  { label: '不记录', value: null, active: false },
];

export default function SleepInput({ value, onChange }: SleepInputProps) {
  const isActive = (v: number | null) => value === v;

  return (
    <div>
      <p style={{ color: '#7A756D', fontSize: 11, fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 10 }}>
        睡眠时长 <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 'normal', color: '#B8B0A8', fontSize: 11 }}>（可选）</span>
      </p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {SLEEP_OPTIONS.map(opt => {
          const selected = isActive(opt.value);
          return (
            <button
              key={opt.label}
              type="button"
              onClick={() => onChange(opt.value)}
              style={{
                padding: '7px 16px',
                borderRadius: 10,
                border: selected ? '1.5px solid #8B7EC8' : '1.5px solid #E8E2D8',
                background: selected ? '#F5F0FA' : '#FAFAF8',
                color: selected ? '#7C5CBF' : '#9E9890',
                fontSize: 12,
                fontWeight: selected ? 600 : 400,
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => { if (!selected) (e.currentTarget as HTMLElement).style.background = '#F8F4EE'; }}
              onMouseLeave={e => { if (!selected) (e.currentTarget as HTMLElement).style.background = '#FAFAF8'; }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
