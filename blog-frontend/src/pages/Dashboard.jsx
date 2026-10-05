import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api, { parseError } from '../api/client';
import PostCard from '../components/PostCard';
import SkeletonCard from '../components/SkeletonCard';
import ConfirmModal from '../components/ConfirmModal';
import { useToast } from '../context/ToastContext';

// "My Posts": only the logged-in user's posts (GET /posts/mine).
export default function Dashboard() {
  const toast = useToast();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/posts/mine');
      setPosts(res.data.data);
    } catch (err) {
      setError(parseError(err).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/posts/${toDelete.id}`);
      toast.success('Post deleted');
      setToDelete(null);
      load();
    } catch (err) {
      toast.error(parseError(err).message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="page-head">
        <h1>My Posts</h1>
        <Link to="/posts/new" className="clay-btn clay-btn--primary">+ New Post</Link>
      </div>

      {error && (
        <div className="empty glass">
          <h3>Couldn't load your posts</h3>
          <p className="muted">{error}</p>
          <button className="clay-btn" onClick={load}>Try again</button>
        </div>
      )}

      {!error && loading && <div className="grid">{Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}</div>}

      {!error && !loading && posts.length === 0 && (
        <div className="empty glass">
          <h3>You haven't written anything yet</h3>
          <p className="muted">Your posts will show up here.</p>
          <Link to="/posts/new" className="clay-btn clay-btn--primary">Write your first post</Link>
        </div>
      )}

      {!error && !loading && posts.length > 0 && (
        <div className="grid">
          {posts.map((p) => <PostCard key={p.id} post={p} onDelete={setToDelete} />)}
        </div>
      )}

      {toDelete && (
        <ConfirmModal
          title="Delete this post?"
          message={`"${toDelete.title}" will be permanently removed.`}
          loading={deleting}
          onConfirm={confirmDelete}
          onCancel={() => setToDelete(null)}
        />
      )}
    </>
  );
}
