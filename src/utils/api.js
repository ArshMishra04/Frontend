import axios from 'axios';

const API_BASE = 'http://localhost:8000'; // Change to your backend URL (e.g., production deploy)
const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Auto-add auth token (from Login/Register)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle errors gracefully (ties into Built #9)
api.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error('API Error:', err.response?.data?.message || 'Something went wrong');
    // Optional: Add a toast here (npm i react-hot-toast later)
    if (err.response?.status === 401) localStorage.removeItem('token'); // Redirect to login
    return Promise.reject(err);
  }
);

export default api;