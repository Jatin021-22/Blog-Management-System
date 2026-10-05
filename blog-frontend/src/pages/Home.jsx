import { useEffect, useState, useCallback } from 'react';
import api, { parseError } from '../api/client';
import PostCard from '../components/PostCard';
import SkeletonCard from '../components/SkeletonCard';
import Pagination from '../components/Pagination';
import ConfirmModal from '../components/ConfirmModal';
import { CATEGORIES } from '../components/PostForm';
import { useToast } from '../context/ToastContext';

const LIMIT = 9;

export default function Home() {
  const toast = useToast();
  const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/posts', { params: { page, limit: LIMIT, search, category } });
      setPosts(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      setError(parseError(err).message);
    } finally {
      setLoading(false);
    }
  }, [page, search, category]);

  useEffect(() => { load(); }, [load]);

  const submitSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const pickCategory = (c) => {
    setPage(1);
    setCategory(c === category ? '' : c);
  };

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
      <section className="hero glass">
        <h1>Stories, ideas &amp; notes</h1>
        <p>Read what the community is writing, or sign up and publish your own posts.</p>
        <form className="search" onSubmit={submitSearch} role="search">
          <label htmlFor="search" className="sr-only">Search posts</label>
          <input id="search" className="clay-input" placeholder="Search posts…" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
          <button type="submit" className="clay-btn clay-btn--primary">Search</button>
        </form>
      </section>

      <div className="chips" role="group" aria-label="Filter by category">
        <button className={`clay-chip ${category === '' ? 'clay-chip--active' : ''}`} onClick={() => pickCategory('')}>All</button>
        {CATEGORIES.map((c) => (
          <button key={c} className={`clay-chip ${category === c ? 'clay-chip--active' : ''}`} onClick={() => pickCategory(c)}>{c}</button>
        ))}
      </div>

      {error && (
        <div className="empty glass">
          <h3>Couldn't load posts</h3>
          <p className="muted">{error}</p>
          <button className="clay-btn" onClick={load}>Try again</button>
        </div>
      )}

      {!error && loading && (
        <div className="grid">{Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}</div>
      )}

      {!error && !loading && posts.length === 0 && (
        <div className="empty glass">
          <h3>No posts found</h3>
          <p className="muted">Try a different search or category.</p>
        </div>
      )}

      {!error && !loading && posts.length > 0 && (
        <>
          <div className="grid">
            {posts.map((p) => <PostCard key={p.id} post={p} onDelete={setToDelete} />)}
          </div>
          <Pagination page={pagination.page} totalPages={pagination.totalPages} onChange={setPage} />
        </>
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
