import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { parseError } from '../api/client';
import PostForm from '../components/PostForm';
import { useToast } from '../context/ToastContext';

export default function CreatePost() {
  const navigate = useNavigate();
  const toast = useToast();
  const [apiErrors, setApiErrors] = useState({});
  const [formError, setFormError] = useState('');

  const handleSubmit = async (values) => {
    setApiErrors({});
    setFormError('');
    try {
      const res = await api.post('/posts', values);
      toast.success('Post published');
      navigate(`/posts/${res.data.data.id}`);
    } catch (err) {
      const { message, fields } = parseError(err);
      setApiErrors(fields);
      setFormError(Object.keys(fields).length ? '' : message);
    }
  };

  return (
    <div className="form-card form-card--wide glass">
      <h1>New post</h1>
      <PostForm submitLabel="Publish" onSubmit={handleSubmit} onCancel={() => navigate(-1)} apiErrors={apiErrors} formError={formError} />
    </div>
  );
}
