import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="empty glass">
      <h1 style={{ fontSize: '4rem', margin: 0 }}>404</h1>
      <h3>This page drifted away</h3>
      <p className="muted">The page you're looking for doesn't exist.</p>
      <Link to="/" className="clay-btn clay-btn--primary">Back home</Link>
    </div>
  );
}
