import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { parseError } from '../api/client';

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
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
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate(location.state?.from || '/dashboard', { replace: true });
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
      <h1>Log in</h1>
      <form onSubmit={handleSubmit} noValidate>
        {formError && <p className="form-error" role="alert">{formError}</p>}
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" autoComplete="email" className={`clay-input ${fieldErrors.email ? 'clay-input--error' : ''}`} value={form.email} onChange={set('email')} />
          {fieldErrors.email && <span className="field__error">{fieldErrors.email}</span>}
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input id="password" type="password" autoComplete="current-password" className={`clay-input ${fieldErrors.password ? 'clay-input--error' : ''}`} value={form.password} onChange={set('password')} />
          {fieldErrors.password && <span className="field__error">{fieldErrors.password}</span>}
        </div>
        <button type="submit" className="clay-btn clay-btn--primary" disabled={loading}>{loading ? 'Logging in…' : 'Log in'}</button>
      </form>
      <p className="muted" style={{ marginTop: '1rem' }}>No account? <Link to="/register">Sign up</Link></p>
    </div>
  );
}
