import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8000/api', 
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Cho phép gửi Cookie chứa Session ID sang PHP
});

// Interceptors: Tự động đính kèm CSRF Token vào Header mọi request
axiosInstance.interceptors.request.use(
  (config) => {
    const csrfToken = localStorage.getItem('csrf_token') || localStorage.getItem('csrf');
    if (csrfToken) {
      config.headers['X-CSRF-Token'] = csrfToken;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;