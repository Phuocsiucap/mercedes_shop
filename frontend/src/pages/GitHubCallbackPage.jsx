
import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';

/**
 * GitHub OAuth Callback Page
 * Xử lý redirect từ GitHub sau khi user authorize
 */
const GitHubCallbackPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loginWithOAuth } = useAuth();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const isProcessing = useRef(false); // Prevent double call in Strict Mode

  useEffect(() => {
    const handleCallback = async () => {
      // Prevent double execution in React Strict Mode
      if (isProcessing.current) return;
      isProcessing.current = true;

      const code = searchParams.get('code');
      const errorParam = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      // Check for errors from GitHub
      if (errorParam) {
        setError(errorDescription || errorParam);
        setLoading(false);
        return;
      }

      // Check for code
      if (!code) {
        setError('Không nhận được mã xác thực từ GitHub');
        setLoading(false);
        return;
      }

      try {
        // Gửi code đến backend để exchange và verify
        const redirectUri = `${window.location.origin}/auth/github/callback`;
        
        const result = await authService.oauthLogin({
          provider: 'GITHUB',
          code: code,
          redirectUri: redirectUri,
          email: '',
          name: '',
          providerId: ''
        });

        if (result.success && result.data) {
          // Sử dụng loginWithOAuth từ AuthContext với method 'github'
          loginWithOAuth(result.data, 'github');
          
          // Redirect về trang chủ hoặc trang trước đó
          const returnUrl = localStorage.getItem('oauth_return_url') || '/';
          localStorage.removeItem('oauth_return_url');
          localStorage.removeItem('oauth_state');
          navigate(returnUrl, { replace: true });
        } else {
          throw new Error(result.message || 'Đăng nhập GitHub thất bại');
        }
      } catch (err) {
        console.error('GitHub callback error:', err);
        setError(err.message || 'Đăng nhập GitHub thất bại');
        setLoading(false);
      }
    };

    handleCallback();
  }, [searchParams, loginWithOAuth, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Đang xử lý đăng nhập GitHub...</h2>
          <p className="text-gray-500 mt-2">Vui lòng đợi trong giây lát</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Đăng nhập thất bại</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition"
            >
              Quay lại đăng nhập
            </button>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-lg transition"
            >
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default GitHubCallbackPage;
