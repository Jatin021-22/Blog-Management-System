import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api, { parseError } from '../api/client';
import PostForm from '../components/PostForm';
import SkeletonCard from '../components/SkeletonCard';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function EditPost() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [apiErrors, setApiErrors] = useState({});
  const [formError, setFormError] = useState('');

  useEffect(() => {
    api.get(`/posts/${id}`)
      .then((res) => setPost(res.data.data))
      .catch((err) => setLoadError(parseError(err).message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (values) => {
    setApiErrors({});
    setFormError('');
    try {
      await api.put(`/posts/${id}`, values);
      toast.success('Post updated');
      navigate(`/posts/${id}`);
    } catch (err) {
      const { message, fields } = parseError(err);
      setApiErrors(fields);
      setFormError(Object.keys(fields).length ? '' : message);
    }
  };

  if (loading) return <SkeletonCard />;

  if (loadError || !post) {
    return (
      <div className="empty glass">
        <h3>{loadError || 'Post not found'}</h3>
        <Link to="/dashboard" className="clay-btn">← Back</Link>
      </div>
    );
  }

  // The API also enforces this (403), but we hide the form for non-owners too.
  if (post.author_id !== user?.id) {
    return (
      <div className="empty glass">
        <h3>You can only edit your own posts</h3>
        <Link to={`/posts/${id}`} className="clay-btn">View post</Link>
      </div>
    );
  }

  return (
    <div className="form-card form-card--wide glass">
      <h1>Edit post</h1>
      <PostForm initial={post} submitLabel="Save changes" onSubmit={handleSubmit} onCancel={() => navigate(-1)} apiErrors={apiErrors} formError={formError} />
    </div>
  );
}
