import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api, { parseError } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import ConfirmModal from '../components/ConfirmModal';
import SkeletonCard from '../components/SkeletonCard';
import { formatDate } from '../components/PostCard';

export default function PostDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api.get(`/posts/${id}`)
      .then((res) => !cancelled && setPost(res.data.data))
      .catch((err) => !cancelled && setError(parseError(err).message))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [id]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/posts/${id}`);
      toast.success('Post deleted');
      navigate('/dashboard');
    } catch (err) {
      toast.error(parseError(err).message);
      setDeleting(false);
    }
  };

  if (loading) return <SkeletonCard />;

  if (error || !post) {
    return (
      <div className="empty glass">
        <h3>{error || 'Post not found'}</h3>
        <Link to="/" className="clay-btn">← Back to posts</Link>
      </div>
    );
  }

  const isOwner = user && user.id === post.author_id;

  return (
    <article className="article glass">
      <Link to="/" className="muted">← All posts</Link>
      <h1>{post.title}</h1>
      <div className="post-card__meta">
        <span className="badge">{post.category}</span>
        <span>{post.author_name} · {formatDate(post.created_at)}</span>
      </div>
      <div className="article__body">{post.content}</div>

      {isOwner && (
        <div className="article__actions">
          <Link to={`/posts/${post.id}/edit`} className="clay-btn">Edit</Link>
          <button className="clay-btn clay-btn--danger" onClick={() => setConfirming(true)}>Delete</button>
        </div>
      )}

      {confirming && (
        <ConfirmModal
          title="Delete this post?"
          message="This action cannot be undone."
          loading={deleting}
          onConfirm={handleDelete}
          onCancel={() => setConfirming(false)}
        />
      )}
    </article>
  );
}
