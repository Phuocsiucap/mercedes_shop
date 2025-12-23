import { useEffect, useRef } from 'react';
import { FcGoogle } from 'react-icons/fc';
import useGoogleAuth from '../../hooks/useGoogleAuth';

/**
 * Google Login Button Component
 * Sử dụng Google Identity Services
 */
const GoogleLoginButton = ({ 
  onSuccess, 
  onError, 
  useNativeButton = false,
  className = '',
  text = 'Đăng nhập với Google'
}) => {
  const buttonRef = useRef(null);
  const { 
    loading, 
    error, 
    isGoogleLoaded, 
    initializeGoogleButton,
    loginWithGooglePopup 
  } = useGoogleAuth();

  // Initialize native Google button
  useEffect(() => {
    if (useNativeButton && isGoogleLoaded && buttonRef.current) {
      initializeGoogleButton(buttonRef.current, {
        theme: 'outline',
        size: 'large',
        text: 'signin_with',
        shape: 'rectangular',
        width: buttonRef.current.offsetWidth || 300,
      });
    }
  }, [isGoogleLoaded, useNativeButton, initializeGoogleButton]);

  // Handle error callback
  useEffect(() => {
    if (error && onError) {
      onError(error);
    }
  }, [error, onError]);

  // Custom button click handler
  const handleClick = async () => {
    const result = await loginWithGooglePopup();
    
    if (result.success) {
      if (onSuccess) {
        onSuccess(result.data);
      }
    } else {
      if (onError) {
        onError(result.message);
      }
    }
  };

  // Render native Google button
  if (useNativeButton) {
    return (
      <div 
        ref={buttonRef} 
        className={`google-signin-button ${className}`}
        style={{ minHeight: '44px' }}
      />
    );
  }

  // Render custom styled button
  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading || !isGoogleLoaded}
      className={`
        w-full flex items-center justify-center gap-3 
        px-4 py-3 border border-gray-300 rounded-lg
        bg-white hover:bg-gray-50 
        text-gray-700 font-medium
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        ${className}
      `}
    >
      {loading ? (
        <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
      ) : (
        <FcGoogle className="w-5 h-5" />
      )}
      <span>{loading ? 'Đang xử lý...' : text}</span>
    </button>
  );
};

export default GoogleLoginButton;
