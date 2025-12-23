import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';
import { tokenManager } from '../services/api';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

/**
 * Hook để xử lý đăng nhập Google
 * Sử dụng Google Identity Services (GIS) - cách mới nhất
 */
const useGoogleAuth = () => {
  const { updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);

  // Load Google Identity Services script
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) {
      console.warn('VITE_GOOGLE_CLIENT_ID is not set');
      return;
    }

    // Check if script already loaded
    if (window.google?.accounts) {
      setIsGoogleLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setIsGoogleLoaded(true);
    };
    script.onerror = () => {
      setError('Failed to load Google Sign-In');
    };
    document.body.appendChild(script);

    return () => {
      // Cleanup if needed
    };
  }, []);

  /**
   * Decode JWT token từ Google để lấy thông tin user
   */
  const decodeGoogleToken = (credential) => {
    try {
      const base64Url = credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding Google token:', error);
      return null;
    }
  };

  /**
   * Xử lý response từ Google Sign-In
   */
  const handleGoogleResponse = useCallback(async (response) => {
    try {
      setLoading(true);
      setError(null);

      const { credential } = response;
      
      if (!credential) {
        throw new Error('No credential received from Google');
      }

      // Decode token để lấy thông tin user
      const googleUser = decodeGoogleToken(credential);
      
      if (!googleUser) {
        throw new Error('Failed to decode Google token');
      }

      // Gửi token và thông tin user đến backend
      const oauthData = {
        provider: 'GOOGLE',
        token: credential,
        email: googleUser.email,
        name: googleUser.name,
        providerId: googleUser.sub // Google user ID
      };

      const result = await authService.oauthLogin(oauthData);

      if (result.success && result.data) {
        const { token, id, fullName, email, role, phoneNumber, address, verified } = result.data;
        const user = { id, fullName, email, role, phoneNumber, address, verified };
        
        // Lưu token và user info
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        tokenManager.setToken(token);
        
        // Update auth context
        if (updateUser) {
          updateUser(user);
        }

        return { success: true, data: result.data };
      }

      throw new Error(result.message || 'Google login failed');
    } catch (err) {
      const errorMessage = err.message || 'Google login failed';
      setError(errorMessage);
      console.error('Google login error:', err);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [updateUser]);

  /**
   * Khởi tạo Google Sign-In button
   */
  const initializeGoogleButton = useCallback((buttonElement, options = {}) => {
    if (!isGoogleLoaded || !window.google?.accounts || !GOOGLE_CLIENT_ID) {
      return;
    }

    try {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      window.google.accounts.id.renderButton(buttonElement, {
        type: options.type || 'standard',
        theme: options.theme || 'outline',
        size: options.size || 'large',
        text: options.text || 'signin_with',
        shape: options.shape || 'rectangular',
        logo_alignment: options.logo_alignment || 'left',
        width: options.width || undefined,
      });
    } catch (err) {
      console.error('Error initializing Google button:', err);
      setError('Failed to initialize Google Sign-In');
    }
  }, [isGoogleLoaded, handleGoogleResponse]);

  /**
   * Trigger Google One Tap prompt
   */
  const promptOneTap = useCallback(() => {
    if (!isGoogleLoaded || !window.google?.accounts || !GOOGLE_CLIENT_ID) {
      return;
    }

    try {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
        auto_select: true,
      });

      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed()) {
          console.log('One Tap not displayed:', notification.getNotDisplayedReason());
        }
        if (notification.isSkippedMoment()) {
          console.log('One Tap skipped:', notification.getSkippedReason());
        }
      });
    } catch (err) {
      console.error('Error showing One Tap:', err);
    }
  }, [isGoogleLoaded, handleGoogleResponse]);

  /**
   * Login với Google popup (alternative method)
   */
  const loginWithGooglePopup = useCallback(async () => {
    if (!isGoogleLoaded || !window.google?.accounts || !GOOGLE_CLIENT_ID) {
      setError('Google Sign-In not available');
      return { success: false, message: 'Google Sign-In not available' };
    }

    return new Promise((resolve) => {
      try {
        setLoading(true);
        setError(null);

        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: 'email profile',
          callback: async (tokenResponse) => {
            if (tokenResponse.error) {
              setError(tokenResponse.error);
              setLoading(false);
              resolve({ success: false, message: tokenResponse.error });
              return;
            }

            try {
              // Lấy thông tin user từ Google API
              const userInfoResponse = await fetch(
                'https://www.googleapis.com/oauth2/v3/userinfo',
                {
                  headers: {
                    Authorization: `Bearer ${tokenResponse.access_token}`,
                  },
                }
              );

              const userInfo = await userInfoResponse.json();

              // Gửi đến backend
              const oauthData = {
                provider: 'GOOGLE',
                token: tokenResponse.access_token,
                email: userInfo.email,
                name: userInfo.name,
                providerId: userInfo.sub
              };

              const result = await authService.oauthLogin(oauthData);

              if (result.success && result.data) {
                const { token, id, fullName, email, role, phoneNumber, address, verified } = result.data;
                const user = { id, fullName, email, role, phoneNumber, address, verified };
                
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(user));
                tokenManager.setToken(token);
                
                if (updateUser) {
                  updateUser(user);
                }

                resolve({ success: true, data: result.data });
              } else {
                throw new Error(result.message || 'Google login failed');
              }
            } catch (err) {
              setError(err.message);
              resolve({ success: false, message: err.message });
            } finally {
              setLoading(false);
            }
          },
        });

        client.requestAccessToken();
      } catch (err) {
        setError(err.message);
        setLoading(false);
        resolve({ success: false, message: err.message });
      }
    });
  }, [isGoogleLoaded, updateUser]);

  return {
    loading,
    error,
    isGoogleLoaded,
    initializeGoogleButton,
    promptOneTap,
    loginWithGooglePopup,
    handleGoogleResponse,
  };
};

export default useGoogleAuth;
