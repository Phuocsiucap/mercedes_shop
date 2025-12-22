import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (storedToken && storedUser) {
        try {
          // Use authService to check if user is authenticated
          if (authService.isAuthenticated()) {
            const userData = JSON.parse(storedUser);
            setUser(userData);
            setIsAuthenticated(true);
            setToken(storedToken);
          } else {
            // Token is invalid, clear it
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setToken(null);
            setUser(null);
            setIsAuthenticated(false);
          }
        } catch (err) {
          console.error('Failed to initialize auth:', err);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
          setIsAuthenticated(false);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Automatic token refresh
  useEffect(() => {
    if (!token) return;

    const refreshInterval = setInterval(async () => {
      try {
        const response = await authService.refreshToken();
        if (response.success && response.data?.token) {
          localStorage.setItem('token', response.data.token);
          setToken(response.data.token);
        }
      } catch (err) {
        console.error('Token refresh failed:', err);
        // If refresh fails, logout user
        await logout();
      }
    }, 15 * 60 * 1000); // Refresh every 15 minutes

    return () => clearInterval(refreshInterval);
  }, [token]);

  const login = useCallback(async (emailOrPhone, password) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authService.login({ 
        emailOrPhone, 
        password 
      });
      
      if (response.success && response.data) {
        const { token, id, fullName, email, role, phoneNumber, address, verified } = response.data;
        const user = { id, fullName, email, role, phoneNumber, address, verified };
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        setToken(token);
        setUser(user);
        setIsAuthenticated(true);
        return { success: true, data: response.data };
      }
      
      throw new Error(response.message || 'Login failed');
    } catch (err) {
      const errorMessage = err.message || 'Login failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (userData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authService.register(userData);
      
      if (response.success && response.data) {
        const { token, user } = response.data;
        localStorage.setItem('token', token);
        setToken(token);
        setUser(user);
        setIsAuthenticated(true);
        return { success: true, data: response.data };
      }
      
      throw new Error(response.message || 'Registration failed');
    } catch (err) {
      const errorMessage = err.message || 'Registration failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Xóa toàn bộ dữ liệu authentication
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      
      // Xóa toàn bộ localStorage để đảm bảo không còn dữ liệu nào
      const keysToKeep = []; // Không giữ lại key nào
      const allKeys = Object.keys(localStorage);
      allKeys.forEach(key => {
        if (!keysToKeep.includes(key)) {
          localStorage.removeItem(key);
        }
      });
      
      // Xóa toàn bộ sessionStorage
      sessionStorage.clear();
      
      // Xóa cookies
      document.cookie.split(";").forEach((c) => {
        const eqPos = c.indexOf("=");
        const name = eqPos > -1 ? c.substr(0, eqPos).trim() : c.trim();
        if (name) {
          // Xóa cookie cho domain hiện tại
          document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
          // Xóa cookie cho subdomain
          document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=" + window.location.hostname;
          // Xóa cookie cho parent domain
          const hostParts = window.location.hostname.split('.');
          if (hostParts.length > 1) {
            document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=." + hostParts.slice(-2).join('.');
          }
        }
      });
      
      // Reset state
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
      
      // Xóa cache của browser
      if ('caches' in window) {
        try {
          const cacheNames = await caches.keys();
          await Promise.all(
            cacheNames.map(cacheName => caches.delete(cacheName))
          );
        } catch (cacheError) {
          console.warn('Failed to clear browser caches:', cacheError);
        }
      }
      
      // Xóa IndexedDB (nếu có)
      if ('indexedDB' in window) {
        try {
          // Thường các app sử dụng IndexedDB với tên cụ thể
          // Có thể cần customize tùy theo app
          const databases = ['app_cache', 'user_data', 'cart_data'];
          databases.forEach(dbName => {
            const deleteReq = indexedDB.deleteDatabase(dbName);
            deleteReq.onerror = () => console.warn(`Failed to delete IndexedDB: ${dbName}`);
          });
        } catch (idbError) {
          console.warn('Failed to clear IndexedDB:', idbError);
        }
      }
      
      // Force reload trang để đảm bảo xóa hết cache và reset state
      setTimeout(() => {
        window.location.href = '/login';
      }, 100);
    }
  }, []);

  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = {
    user,
    token,
    isAuthenticated,
    loading,
    error,
    login,
    register,
    logout,
    updateUser,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
