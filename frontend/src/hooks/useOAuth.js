import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';

const useOAuth = () => {
  const { loginWithOAuth } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Login với Google - sử dụng Google Identity Services
   */
  const loginWithGoogle = async () => {
    const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    
    if (!GOOGLE_CLIENT_ID) {
      const errorMsg = 'Google Client ID chưa được cấu hình';
      setError(errorMsg);
      return { success: false, message: errorMsg };
    }

    if (!window.google?.accounts) {
      const errorMsg = 'Google Sign-In chưa được tải';
      setError(errorMsg);
      return { success: false, message: errorMsg };
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

              // Gửi đến backend để xác thực
              const oauthData = {
                provider: 'GOOGLE',
                token: tokenResponse.access_token,
                email: userInfo.email,
                name: userInfo.name,
                providerId: userInfo.sub
              };

              const result = await authService.oauthLogin(oauthData);

              if (result.success && result.data) {
                // Sử dụng loginWithOAuth từ AuthContext để xử lý hậu kỳ
                loginWithOAuth(result.data, 'google');
                
                setLoading(false);
                resolve({ success: true, data: result.data });
              } else {
                throw new Error(result.message || 'Đăng nhập Google thất bại');
              }
            } catch (err) {
              setError(err.message);
              setLoading(false);
              resolve({ success: false, message: err.message });
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
  };

  /**
   * Login với GitHub - redirect to GitHub OAuth
   */
  const loginWithGitHub = async (returnUrl = '/') => {
    const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID;
    
    if (!GITHUB_CLIENT_ID) {
      const errorMsg = 'GitHub Client ID chưa được cấu hình';
      setError(errorMsg);
      return { success: false, message: errorMsg };
    }

    try {
      setLoading(true);
      setError(null);
      
      // Lưu return URL để redirect sau khi login thành công
      localStorage.setItem('oauth_return_url', returnUrl);
      
      // Redirect to GitHub OAuth
      const redirectUri = `${window.location.origin}/auth/github/callback`;
      const scope = 'user:email read:user';
      const state = Math.random().toString(36).substring(7); // CSRF protection
      localStorage.setItem('oauth_state', state);
      
      const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&state=${state}`;
      
      window.location.href = githubAuthUrl;
      
      return { success: true, message: 'Redirecting to GitHub...' };
    } catch (err) {
      setError(err.message || 'GitHub login failed');
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Xử lý callback từ GitHub OAuth
   */
  const handleGitHubCallback = async (code) => {
    try {
      setLoading(true);
      setError(null);

      // Gửi code đến backend để exchange lấy token
      const oauthData = {
        provider: 'GITHUB',
        code: code,
        email: '',
        name: '',
        providerId: ''
      };

      const result = await authService.oauthLogin(oauthData);

      if (result.success && result.data) {
        // Sử dụng loginWithOAuth từ AuthContext
        loginWithOAuth(result.data, 'github');
        
        return { success: true, data: result.data };
      }

      throw new Error(result.message || 'GitHub login failed');
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    loginWithGoogle,
    loginWithGitHub,
    handleGitHubCallback,
    loading,
    error
  };
};

export default useOAuth;
