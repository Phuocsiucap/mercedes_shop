import { useState } from 'react';
import axios from '../api/axios';

const useOAuth = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const loginWithGoogle = () => {
        return new Promise((resolve, reject) => {
            setLoading(true);
            setError(null);

            // Google OAuth configuration
            const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID';
            const redirectUri = `${window.location.origin}/auth/callback`;
            const scope = 'profile email';

            const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
                `client_id=${clientId}&` +
                `redirect_uri=${redirectUri}&` +
                `response_type=token&` +
                `scope=${scope}&` +
                `prompt=select_account`;

            // Open popup window
            const width = 500;
            const height = 600;
            const left = window.screen.width / 2 - width / 2;
            const top = window.screen.height / 2 - height / 2;

            const popup = window.open(
                authUrl,
                'Google Login',
                `width=${width},height=${height},left=${left},top=${top}`
            );

            // Listen for OAuth callback
            const handleMessage = async (event) => {
                if (event.origin !== window.location.origin) return;

                if (event.data.type === 'OAUTH_SUCCESS') {
                    window.removeEventListener('message', handleMessage);
                    popup?.close();

                    try {
                        // Send OAuth data to backend
                        const response = await axios.post('/auth/oauth', {
                            provider: 'GOOGLE',
                            token: event.data.token,
                            email: event.data.email,
                            name: event.data.name,
                            providerId: event.data.providerId
                        });

                        setLoading(false);
                        resolve(response.data);
                    } catch (err) {
                        setLoading(false);
                        setError(err.response?.data?.message || 'OAuth authentication failed');
                        reject(err);
                    }
                } else if (event.data.type === 'OAUTH_ERROR') {
                    window.removeEventListener('message', handleMessage);
                    popup?.close();
                    setLoading(false);
                    setError(event.data.error || 'OAuth authentication failed');
                    reject(new Error(event.data.error));
                }
            };

            window.addEventListener('message', handleMessage);

            // Check if popup was closed
            const checkPopup = setInterval(() => {
                if (popup?.closed) {
                    clearInterval(checkPopup);
                    window.removeEventListener('message', handleMessage);
                    setLoading(false);
                    if (!error) {
                        setError('Authentication cancelled');
                        reject(new Error('Authentication cancelled'));
                    }
                }
            }, 1000);
        });
    };

    const loginWithGitHub = () => {
        return new Promise((resolve, reject) => {
            setLoading(true);
            setError(null);

            // GitHub OAuth configuration
            const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID || 'YOUR_GITHUB_CLIENT_ID';
            const redirectUri = `${window.location.origin}/auth/callback`;
            const scope = 'user:email';

            const authUrl = `https://github.com/login/oauth/authorize?` +
                `client_id=${clientId}&` +
                `redirect_uri=${redirectUri}&` +
                `scope=${scope}`;

            // Similar popup logic as Google
            const width = 500;
            const height = 600;
            const left = window.screen.width / 2 - width / 2;
            const top = window.screen.height / 2 - height / 2;

            const popup = window.open(
                authUrl,
                'GitHub Login',
                `width=${width},height=${height},left=${left},top=${top}`
            );

            const handleMessage = async (event) => {
                if (event.origin !== window.location.origin) return;

                if (event.data.type === 'OAUTH_SUCCESS') {
                    window.removeEventListener('message', handleMessage);
                    popup?.close();

                    try {
                        const response = await axios.post('/auth/oauth', {
                            provider: 'GITHUB',
                            code: event.data.code,
                            email: event.data.email,
                            name: event.data.name,
                            providerId: event.data.providerId
                        });

                        setLoading(false);
                        resolve(response.data);
                    } catch (err) {
                        setLoading(false);
                        setError(err.response?.data?.message || 'OAuth authentication failed');
                        reject(err);
                    }
                } else if (event.data.type === 'OAUTH_ERROR') {
                    window.removeEventListener('message', handleMessage);
                    popup?.close();
                    setLoading(false);
                    setError(event.data.error || 'OAuth authentication failed');
                    reject(new Error(event.data.error));
                }
            };

            window.addEventListener('message', handleMessage);

            const checkPopup = setInterval(() => {
                if (popup?.closed) {
                    clearInterval(checkPopup);
                    window.removeEventListener('message', handleMessage);
                    setLoading(false);
                    if (!error) {
                        setError('Authentication cancelled');
                        reject(new Error('Authentication cancelled'));
                    }
                }
            }, 1000);
        });
    };

    return {
        loginWithGoogle,
        loginWithGitHub,
        loading,
        error
    };
};

export default useOAuth;
