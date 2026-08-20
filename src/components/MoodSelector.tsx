import { MOOD_OPTIONS } from '../types';

interface MoodSelectorProps {
  value: number;
  onChange: (v: number) => void;
  error?: string;
}

const MOOD_EMOJI_MAP: Record<number, string> = { 1: '😞', 2: '😟', 3: '😐', 4: '😊', 5: '😍' };

export default function MoodSelector({ value, onChange, error }: MoodSelectorProps) {
  return (
    <div>
      <p style={{ color: '#7A756D', fontSize: 11, fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 10 }}>
        今天的心情
      </p>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {MOOD_OPTIONS.map(opt => {
          const selected = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              title={opt.label}
              style={{
                width: selected ? 72 : 60,
                height: selected ? 72 : 60,
                borderRadius: '50%',
                border: selected ? `2.5px solid ${opt.color}` : '2px solid #E8E2D8',
                background: selected ? opt.bg : '#FAFAF8',
                cursor: 'pointer',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                gap: 1,
                transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
                boxShadow: selected ? `0 4px 16px ${opt.color}30, 0 0 0 4px ${opt.bg}` : 'none',
                transform: selected ? 'scale(1.12)' : 'scale(1)',
                padding: 0,
              }}
            >
              <span style={{ fontSize: selected ? 26 : 22, lineHeight: 1, marginTop: selected ? -2 : 0 }}>
                {MOOD_EMOJI_MAP[opt.value]}
              </span>
              <span style={{
                fontSize: 9, fontWeight: selected ? 600 : 400,
                color: selected ? opt.color : '#B8B0A8',
                marginTop: 1,
              }}>
                {opt.label}
              </span>
            </button>
          );
        })}
      </div>
      {error && <p style={{ color: '#B8605A', fontSize: 11, marginTop: 8 }}>{error}</p>}
    </div>
  );
}
