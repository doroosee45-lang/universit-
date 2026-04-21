export default function Pagination({ page, totalPages, onPageChange }) {
  return (
    <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
      <button disabled={page === 1} onClick={() => onPageChange(page - 1)}>
        Prev
      </button>

      <span>Page {page} / {totalPages}</span>

      <button disabled={page === totalPages} onClick={() => onPageChange(page + 1)}>
        Next
      </button>
    </div>
  );
}