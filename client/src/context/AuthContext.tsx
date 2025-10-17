import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authService, type User } from '../services/authService';
import { authApi } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  register: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<{ requires2FA?: boolean; tempToken?: string }>;
  verify2FA: (tempToken: string, code: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initAuth = async () => {
      const publicPaths = ['/login', '/register', '/forgot-password', '/reset-password'];
      const isPublicPage = publicPaths.some(path => window.location.pathname.startsWith(path));

      const savedUser = localStorage.getItem('user');

      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (err) {
          console.error('Failed to parse saved user:', err);
        }
      }

      if (!isPublicPage || savedUser) {
        try {
          const { user: currentUser } = await authService.getCurrentUser();
          setUser(currentUser);
          localStorage.setItem('user', JSON.stringify(currentUser));
        } catch (err) {
          if (savedUser) {
            localStorage.removeItem('user');
          }
          setUser(null);
        }
      }

      setLoading(false);
    };

    initAuth();
  }, []);

  const register = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      const response = await authService.register(email, password);
      setUser(response.user);
      localStorage.setItem('user', JSON.stringify(response.user));
    } catch (err: any) {
      const message = err.response?.data?.error || 'Registration failed';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      const response = await authService.login(email, password);

      if (response.requires2FA && response.tempToken) {
        return { requires2FA: true, tempToken: response.tempToken };
      }

      setUser(response.user);
      localStorage.setItem('user', JSON.stringify(response.user));
      return {};
    } catch (err: any) {
      const message = err.response?.data?.error || 'Login failed';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      localStorage.removeItem('user');
    }
  };

  const clearError = () => setError(null);

  const refreshUser = async () => {
    try {
      const { user: currentUser } = await authService.getCurrentUser();
      setUser(currentUser);
      localStorage.setItem('user', JSON.stringify(currentUser));
    } catch (err) {
      console.error('Failed to refresh user:', err);
    }
  };

  const verify2FA = async (tempToken: string, code: string) => {
    try {
      setError(null);
      setLoading(true);

      const response = await authApi.post('/api/auth/2fa/verify', { tempToken, code });
      setUser(response.data.user);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    } catch (err: any) {
      const message = err?.response?.data?.error || err.message || 'Verification failed';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        register,
        login,
        verify2FA,
        logout,
        clearError,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
