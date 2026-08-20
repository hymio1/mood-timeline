interface TagInputProps {
  tags: string[];
  tagInput: string;
  onTagInput: (v: string) => void;
  onAddTag: () => void;
  onRemoveTag: (tag: string) => void;
}

export default function TagInput({ tags, tagInput, onTagInput, onAddTag, onRemoveTag }: TagInputProps) {
  return (
    <div>
      <p style={{ color: '#7A756D', fontSize: 11, fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 8 }}>
        标签
      </p>
      {/* Input row */}
      <input
        type="text"
        value={tagInput}
        onChange={e => onTagInput(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); onAddTag(); } }}
        placeholder="输入标签后回车添加"
        style={{
          width: '100%', padding: '9px 14px', borderRadius: 10,
          border: '1px solid #E8E2D8', background: '#FAFAF8',
          fontSize: 12, color: '#3D3935', outline: 'none',
          fontFamily: 'inherit', boxSizing: 'border-box',
          transition: 'all 0.2s',
        }}
        onFocus={e => { e.currentTarget.style.borderColor = '#8B7EC8'; e.currentTarget.style.background = '#fff'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(139,126,200,0.1)'; }}
        onBlur={e => { e.currentTarget.style.borderColor = '#E8E2D8'; e.currentTarget.style.background = '#FAFAF8'; e.currentTarget.style.boxShadow = 'none'; }}
      />
      {/* Tag chips */}
      {tags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
          {tags.map(tag => (
            <span
              key={tag}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                padding: '3px 8px 3px 10px', borderRadius: 20,
                fontSize: 11, fontWeight: 500,
                background: '#F3EFE8', color: '#6B6560',
                border: '1px solid #E8E2D8',
                animation: 'fadeInUp 0.2s ease',
                position: 'relative',
              }}
            >
              {tag}
              <button
                onClick={() => onRemoveTag(tag)}
                style={{
                  width: 14, height: 14, borderRadius: '50%',
                  border: 'none', background: 'transparent',
                  cursor: 'pointer', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  color: '#B8B0A8', fontSize: 11, lineHeight: 1,
                  padding: 0, transition: 'all 0.15s',
                  marginLeft: 1,
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background = '#E8E2D8';
                  (e.currentTarget as HTMLElement).style.color = '#7A756D';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                  (e.currentTarget as HTMLElement).style.color = '#B8B0A8';
                }}
              >×</button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
