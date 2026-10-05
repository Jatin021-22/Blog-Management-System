import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { parseError } from '../api/client';

export default function Register() {
  const { register, isAuthenticated } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFieldErrors({});
    setFormError('');
    try {
      await register(form.name, form.email, form.password);
      toast.success('Account created!');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const { message, fields } = parseError(err);
      setFieldErrors(fields);
      setFormError(Object.keys(fields).length ? '' : message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-card glass">
      <h1>Create account</h1>
      <form onSubmit={handleSubmit} noValidate>
        {formError && <p className="form-error" role="alert">{formError}</p>}
        <div className="field">
          <label htmlFor="name">Name</label>
          <input id="name" autoComplete="name" className={`clay-input ${fieldErrors.name ? 'clay-input--error' : ''}`} value={form.name} onChange={set('name')} />
          {fieldErrors.name && <span className="field__error">{fieldErrors.name}</span>}
        </div>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" autoComplete="email" className={`clay-input ${fieldErrors.email ? 'clay-input--error' : ''}`} value={form.email} onChange={set('email')} />
          {fieldErrors.email && <span className="field__error">{fieldErrors.email}</span>}
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input id="password" type="password" autoComplete="new-password" className={`clay-input ${fieldErrors.password ? 'clay-input--error' : ''}`} value={form.password} onChange={set('password')} placeholder="At least 8 characters" />
          {fieldErrors.password && <span className="field__error">{fieldErrors.password}</span>}
        </div>
        <button type="submit" className="clay-btn clay-btn--primary" disabled={loading}>{loading ? 'Creating…' : 'Sign up'}</button>
      </form>
      <p className="muted" style={{ marginTop: '1rem' }}>Already registered? <Link to="/login">Log in</Link></p>
    </div>
  );
}
