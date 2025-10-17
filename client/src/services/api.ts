import axios from 'axios';

type ApiConfig = {
  raw: string;
  origin: string;
};

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');

const createApiConfig = (value: string | undefined, fallback: string): ApiConfig => {
  const rawValue = value && value.trim().length > 0 ? value.trim() : fallback;
  const normalized = trimTrailingSlash(rawValue);
  try {
    const parsed = new URL(normalized);
    return { raw: normalized, origin: parsed.origin };
  } catch {
    return { raw: normalized, origin: normalized };
  }
};

const resolveUrl = (base: string, path: string) => {
  try {
    return new URL(path, base).toString();
  } catch {
    const normalizedBase = trimTrailingSlash(base);
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${normalizedBase}${normalizedPath}`;
  }
};

const authConfig = createApiConfig(
  import.meta.env.VITE_AUTH_API_URL ?? import.meta.env.VITE_API_URL,
  'http://localhost:3001'
);
const k8sConfig = createApiConfig(import.meta.env.VITE_K8S_API_URL, 'http://localhost:3003');
const logsConfig = createApiConfig(import.meta.env.VITE_LOGS_API_URL, 'http://localhost:3002');
const builderConfig = createApiConfig(import.meta.env.VITE_BUILDER_API_URL, 'http://localhost:3004');

export const resolveAuthUrl = (path: string) => resolveUrl(authConfig.raw, path);
export const resolveK8sUrl = (path: string) => resolveUrl(k8sConfig.raw, path);
export const resolveLogsUrl = (path: string) => resolveUrl(logsConfig.raw, path);
export const resolveBuilderUrl = (path: string) => resolveUrl(builderConfig.raw, path);

export const authApi = axios.create({
  baseURL: authConfig.origin,
  timeout: 30000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const k8sApi = axios.create({
  baseURL: k8sConfig.origin,
  timeout: 30000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const logsApi = axios.create({
  baseURL: logsConfig.origin,
  timeout: 30000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const builderApi = axios.create({
  baseURL: builderConfig.origin,
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

builderApi.interceptors.response.use(
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
