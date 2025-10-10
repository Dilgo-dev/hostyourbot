import axios from 'axios';

const AUTH_API_URL = import.meta.env.VITE_AUTH_API_URL || 'http://localhost:3001';
const K8S_API_URL = import.meta.env.VITE_K8S_API_URL || 'http://localhost:3003';
const LOGS_API_URL = import.meta.env.VITE_LOGS_API_URL || 'http://localhost:3002';

export const authApi = axios.create({
  baseURL: AUTH_API_URL,
  timeout: 30000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const k8sApi = axios.create({
  baseURL: K8S_API_URL,
  timeout: 30000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const logsApi = axios.create({
  baseURL: LOGS_API_URL,
  timeout: 30000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

authApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const publicPaths = ['/login', '/register', '/forgot-password', '/reset-password', '/'];
      const currentPath = window.location.pathname;

      if (!publicPaths.includes(currentPath)) {
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

k8sApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const publicPaths = ['/login', '/register', '/forgot-password', '/reset-password', '/'];
      const currentPath = window.location.pathname;

      if (!publicPaths.includes(currentPath)) {
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

logsApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const publicPaths = ['/login', '/register', '/forgot-password', '/reset-password', '/'];
      const currentPath = window.location.pathname;

      if (!publicPaths.includes(currentPath)) {
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
