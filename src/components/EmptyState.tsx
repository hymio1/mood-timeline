export default function EmptyState({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 24px', textAlign: 'center' }}>
      <div style={{ fontSize: 40, marginBottom: 16, opacity: 0.8 }}>{icon}</div>
      <h3 style={{ fontSize: 15, fontWeight: 600, color: '#5A554D', margin: '0 0 6px 0' }}>{title}</h3>
      <p style={{ fontSize: 13, color: '#A8A098', margin: 0, maxWidth: 220, lineHeight: 1.6 }}>{desc}</p>
    </div>
  );
}
