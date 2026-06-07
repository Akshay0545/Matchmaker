import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 || err.response?.status === 403) {
      localStorage.removeItem('tdc_token');
      localStorage.removeItem('tdc_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
