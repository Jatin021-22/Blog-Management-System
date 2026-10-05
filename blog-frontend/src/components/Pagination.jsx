export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  return (
    <nav className="pagination" aria-label="Pagination">
      <button className="clay-btn clay-btn--small" disabled={page <= 1} onClick={() => onChange(page - 1)}>← Prev</button>
      <span className="muted">Page {page} of {totalPages}</span>
      <button className="clay-btn clay-btn--small" disabled={page >= totalPages} onClick={() => onChange(page + 1)}>Next →</button>
    </nav>
  );
}
