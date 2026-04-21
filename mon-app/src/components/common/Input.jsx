export default function Input({ label, ...props }) {
  return (
    <div style={{ marginBottom: 12 }}>
      {label && <label style={{ display: 'block', marginBottom: 5 }}>{label}</label>}
      <input
        {...props}
        style={{
          width: '100%',
          padding: 10,
          borderRadius: 8,
          border: '1px solid #ccc'
        }}
      />
    </div>
  );
}