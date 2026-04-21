export default function Select({ options = [], value, onChange }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      style={{
        padding: 10,
        borderRadius: 8,
        border: '1px solid #ccc',
        width: '100%'
      }}
    >
      {options.map((opt, i) => (
        <option key={i} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}