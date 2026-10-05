import { useState } from 'react';

export const CATEGORIES = ['Technology', 'Programming', 'Education', 'Career', 'Lifestyle', 'General'];

// Shared form used by both Create and Edit pages.
// `onSubmit` receives the form values and should throw an Axios error if the API rejects them.
export default function PostForm({ initial, submitLabel, onSubmit, onCancel, apiErrors = {}, formError = '' }) {
  const [values, setValues] = useState({
    title: initial?.title || '',
    content: initial?.content || '',
    category: initial?.category || 'General',
  });
  const [saving, setSaving] = useState(false);

  const set = (field) => (e) => setValues((v) => ({ ...v, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSubmit(values);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      {formError && <p className="form-error" role="alert">{formError}</p>}

      <div className="field">
        <label htmlFor="title">Title</label>
        <input id="title" className={`clay-input ${apiErrors.title ? 'clay-input--error' : ''}`} value={values.title} onChange={set('title')} placeholder="An interesting title" />
        {apiErrors.title && <span className="field__error">{apiErrors.title}</span>}
      </div>

      <div className="field">
        <label htmlFor="category">Category</label>
        <select id="category" className="clay-input" value={values.category} onChange={set('category')}>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="field">
        <label htmlFor="content">Content</label>
        <textarea id="content" className={`clay-input ${apiErrors.content ? 'clay-input--error' : ''}`} value={values.content} onChange={set('content')} placeholder="Write your post…" />
        {apiErrors.content && <span className="field__error">{apiErrors.content}</span>}
      </div>

      <div className="form-actions">
        <button type="submit" className="clay-btn clay-btn--primary" disabled={saving}>{saving ? 'Saving…' : submitLabel}</button>
        <button type="button" className="clay-btn clay-btn--ghost" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}
