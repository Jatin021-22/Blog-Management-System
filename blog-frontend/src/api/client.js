import axios from 'axios';

// One Axios instance for the whole app.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Request interceptor: attach the JWT to every request automatically.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// AuthContext registers a function here so a 401 can log the user out.
let onUnauthorized = null;
export const setUnauthorizedHandler = (fn) => {
  onUnauthorized = fn;
};

// Response interceptor: if the server says 401 for a logged-in user (expired/invalid token), log out.
// Login/register 401s are normal "wrong password" errors, so they are ignored here.
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const url = error.config?.url || '';
    const isAuthCall = url.includes('/auth/');
    if (error.response?.status === 401 && !isAuthCall && localStorage.getItem('token') && onUnauthorized) {
      onUnauthorized();
    }
    return Promise.reject(error);
  }
);

// Turn an API error into a readable message plus per-field errors.
export function parseError(error) {
  const data = error.response?.data;
  const fields = {};
  (data?.errors || []).forEach((e) => {
    if (e.field && !fields[e.field]) fields[e.field] = e.message;
  });
  return {
    message: data?.message || (error.request ? 'Cannot reach the server' : 'Something went wrong'),
    fields,
  };
}

export default api;
