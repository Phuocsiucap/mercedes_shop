import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AppContext = createContext(null);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

const APP_SETTINGS_KEY = 'app_settings';

const defaultSettings = {
  theme: 'light',
  language: 'vi',
  currency: 'VND',
  notifications: {
    email: true,
    push: true,
    sms: false,
  },
  preferences: {
    itemsPerPage: 12,
    defaultView: 'grid',
    autoSave: true,
  },
};

export const AppProvider = ({ children }) => {
  const [settings, setSettings] = useState(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const storedSettings = localStorage.getItem(APP_SETTINGS_KEY);
      if (storedSettings) {
        const parsedSettings = JSON.parse(storedSettings);
        setSettings({ ...defaultSettings, ...parsedSettings });
      }
    } catch (err) {
      console.error('Failed to load app settings from localStorage:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Persist settings to localStorage whenever they change
  useEffect(() => {
    if (!loading) {
      try {
        localStorage.setItem(APP_SETTINGS_KEY, JSON.stringify(settings));
      } catch (err) {
        console.error('Failed to save app settings to localStorage:', err);
      }
    }
  }, [settings, loading]);

  const updateSettings = useCallback((newSettings) => {
    setSettings((prevSettings) => ({
      ...prevSettings,
      ...newSettings,
    }));
  }, []);

  const updateTheme = useCallback((theme) => {
    setSettings((prevSettings) => ({
      ...prevSettings,
      theme,
    }));
    
    // Apply theme to document
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const updateLanguage = useCallback((language) => {
    setSettings((prevSettings) => ({
      ...prevSettings,
      language,
    }));
  }, []);

  const updateNotificationSettings = useCallback((notificationSettings) => {
    setSettings((prevSettings) => ({
      ...prevSettings,
      notifications: {
        ...prevSettings.notifications,
        ...notificationSettings,
      },
    }));
  }, []);

  const updatePreferences = useCallback((preferences) => {
    setSettings((prevSettings) => ({
      ...prevSettings,
      preferences: {
        ...prevSettings.preferences,
        ...preferences,
      },
    }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(defaultSettings);
  }, []);

  // Notification management
  const addNotification = useCallback((notification) => {
    const id = Date.now().toString();
    const newNotification = {
      id,
      timestamp: new Date().toISOString(),
      ...notification,
    };
    
    setNotifications((prev) => [newNotification, ...prev]);
    
    // Auto-remove notification after 5 seconds if it's not persistent
    if (!notification.persistent) {
      setTimeout(() => {
        removeNotification(id);
      }, 5000);
    }
    
    return id;
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Utility functions
  const formatCurrency = useCallback((amount) => {
    const { currency, language } = settings;
    
    if (currency === 'VND') {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
      }).format(amount);
    }
    
    return new Intl.NumberFormat(language === 'vi' ? 'vi-VN' : 'en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  }, [settings]);

  const formatDate = useCallback((date) => {
    const { language } = settings;
    const locale = language === 'vi' ? 'vi-VN' : 'en-US';
    
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(date));
  }, [settings]);

  const value = {
    settings,
    loading,
    notifications,
    updateSettings,
    updateTheme,
    updateLanguage,
    updateNotificationSettings,
    updatePreferences,
    resetSettings,
    addNotification,
    removeNotification,
    clearNotifications,
    formatCurrency,
    formatDate,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};