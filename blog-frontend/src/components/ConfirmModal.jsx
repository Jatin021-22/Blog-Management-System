import { useEffect } from 'react';

// Glass confirmation modal used before deleting a post.
export default function ConfirmModal({ title, message, confirmLabel = 'Delete', loading, onConfirm, onCancel }) {
  // Close on Escape key.
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onCancel();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel]);

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal glass" role="dialog" aria-modal="true" aria-labelledby="modal-title" onClick={(e) => e.stopPropagation()}>
        <h2 id="modal-title">{title}</h2>
        <p className="muted">{message}</p>
        <div className="modal__actions">
          <button className="clay-btn clay-btn--ghost" onClick={onCancel} disabled={loading}>Cancel</button>
          <button className="clay-btn clay-btn--danger" onClick={onConfirm} disabled={loading}>
            {loading ? 'Deleting…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
