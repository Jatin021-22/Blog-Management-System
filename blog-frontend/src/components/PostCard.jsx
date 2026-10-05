import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const formatDate = (iso) =>
  new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

export default function PostCard({ post, onDelete }) {
  const { user } = useAuth();
  // Edit/Delete buttons are only shown to the post owner.
  const isOwner = user && user.id === post.author_id;
  const excerpt = post.content.length > 130 ? `${post.content.slice(0, 130)}…` : post.content;

  return (
    <article className="post-card glass">
      <div><span className="badge">{post.category}</span></div>
      <h3><Link to={`/posts/${post.id}`}>{post.title}</Link></h3>
      <p>{excerpt}</p>
      <div className="post-card__meta">
        <span className="clay-avatar" style={{ width: 28, height: 28, fontSize: '0.8rem' }} aria-hidden="true">
          {post.author_name?.[0]?.toUpperCase()}
        </span>
        <span>{post.author_name} · {formatDate(post.created_at)}</span>
      </div>
      {isOwner && (
        <div className="post-card__actions">
          <Link to={`/posts/${post.id}/edit`} className="clay-btn clay-btn--small">Edit</Link>
          <button className="clay-btn clay-btn--danger clay-btn--small" onClick={() => onDelete(post)}>Delete</button>
        </div>
      )}
    </article>
  );
}
