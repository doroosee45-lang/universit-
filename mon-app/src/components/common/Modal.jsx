export default function Modal({ open, title, children, onClose }) {
  if (!open) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        background: '#fff',
        padding: 20,
        borderRadius: 10,
        minWidth: 300
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <h3>{title}</h3>
          <button onClick={onClose}>X</button>
        </div>

        <div style={{ marginTop: 10 }}>
          {children}
        </div>
      </div>
    </div>
  );
}