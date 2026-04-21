import { useState } from 'react';

export default function SearchInput({ onSearch }) {
  const [value, setValue] = useState('');

  return (
    <input
      type="text"
      value={value}
      placeholder="Rechercher..."
      onChange={(e) => {
        setValue(e.target.value);
        onSearch?.(e.target.value);
      }}
      style={{
        padding: 10,
        border: '1px solid #ccc',
        borderRadius: 8,
        width: '100%'
      }}
    />
  );
}