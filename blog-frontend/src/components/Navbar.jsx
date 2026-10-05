import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="navbar glass">
      <Link to="/" className="navbar__brand">✦ Glass Blog</Link>
      <nav className="navbar__links">
        {isAuthenticated ? (
          <>
            <Link to="/dashboard" className="clay-btn clay-btn--ghost clay-btn--small">My Posts</Link>
            <Link to="/posts/new" className="clay-btn clay-btn--primary clay-btn--small">+ New Post</Link>
            <span className="navbar__user">
              <span className="clay-avatar" aria-hidden="true">{user?.name?.[0]?.toUpperCase() || '?'}</span>
              <span className="navbar__name">{user?.name}</span>
            </span>
            <button className="clay-btn clay-btn--small" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="clay-btn clay-btn--ghost clay-btn--small">Login</Link>
            <Link to="/register" className="clay-btn clay-btn--primary clay-btn--small">Sign up</Link>
          </>
        )}
      </nav>
    </header>
  );
}
