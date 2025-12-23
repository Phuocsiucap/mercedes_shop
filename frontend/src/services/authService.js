import { ApiService, tokenManager } from './api.js';

/**
 * Authentication service for handling user authentication and authorization operations
 * Focuses solely on authentication domain responsibilities
 * Uses the standardized API service template for consistent error handling
 */
class AuthService extends ApiService {
  constructor() {
    super('/auth');
  }

  /**
   * Login user with email and password
   * @param {Object} credentials - Login credentials
   * @param {string} credentials.email - User email
   * @param {string} credentials.password - User password
   * @returns {Promise<Object>} Authentication response with user data and tokens
   */
  async login(credentials) {
    try {
      const response = await this.post('/login', credentials);
      
      if (response.success && response.data) {
        const { token, refreshToken } = response.data;
        
        // Store tokens using token manager
        tokenManager.setToken(token);
        if (refreshToken) {
          tokenManager.setRefreshToken(refreshToken);
        }
        
        return response;
      }
      
      throw new Error(response.message || 'Login failed');
    } catch (error) {
      // Clear any existing tokens on login failure
      tokenManager.clearTokens();
      throw error;
    }
  }

  /**
   * Register new user
   * @param {Object} userData - User registration data
   * @param {string} userData.fullName - User's full name
   * @param {string} userData.email - User email
   * @param {string} userData.password - User password
   * @param {string} userData.phoneNumber - User phone number
   * @param {string} userData.address - User address
   * @returns {Promise<Object>} Registration response with user data and tokens
   */
  async register(userData) {
    try {
      const response = await this.post('/register', userData);
      
      if (response.success && response.data) {
        const { token, refreshToken } = response.data;
        
        // Store tokens using token manager
        tokenManager.setToken(token);
        if (refreshToken) {
          tokenManager.setRefreshToken(refreshToken);
        }
        
        return response;
      }
      
      throw new Error(response.message || 'Registration failed');
    } catch (error) {
      // Clear any existing tokens on registration failure
      tokenManager.clearTokens();
      throw error;
    }
  }

  /**
   * Refresh authentication token
   * @returns {Promise<Object>} New authentication tokens
   */
  async refreshToken() {
    try {
      const response = await this.post('/refresh');
      
      if (response.success && response.data) {
        const { token, refreshToken } = response.data;
        
        // Update stored tokens
        tokenManager.setToken(token);
        if (refreshToken) {
          tokenManager.setRefreshToken(refreshToken);
        }
        
        return response;
      }
      
      throw new Error(response.message || 'Token refresh failed');
    } catch (error) {
      // Clear tokens if refresh fails
      tokenManager.clearTokens();
      throw error;
    }
  }

  /**
   * OAuth login (Google, Facebook, etc.)
   * @param {Object} oauthData - OAuth authentication data
   * @param {string} oauthData.provider - OAuth provider (google, facebook)
   * @param {string} oauthData.token - OAuth access token
   * @param {string} oauthData.email - User email from OAuth provider
   * @param {string} oauthData.fullName - User name from OAuth provider
   * @returns {Promise<Object>} Authentication response
   */
  async oauthLogin(oauthData) {
    try {
      const response = await this.post('/oauth', oauthData);
      
      if (response.success && response.data) {
        const { token, refreshToken } = response.data;
        
        // Store tokens using token manager
        tokenManager.setToken(token);
        if (refreshToken) {
          tokenManager.setRefreshToken(refreshToken);
        }
        
        return response;
      }
      
      throw new Error(response.message || 'OAuth login failed');
    } catch (error) {
      // Clear any existing tokens on OAuth failure
      tokenManager.clearTokens();
      throw error;
    }
  }

  /**
   * Logout user
   * @returns {Promise<Object>} Logout response
   */
  async logout() {
    try {
      const response = await this.post('/logout');
      return response;
    } catch (error) {
      // Log error but don't throw - we still want to clear local tokens
      console.error('Logout API call failed:', error);
    } finally {
      // Always clear tokens on logout, regardless of API response
      tokenManager.clearTokens();
    }
  }

  /**
   * Check if user is currently authenticated
   * @returns {boolean} True if user has valid token
   */
  isAuthenticated() {
    const token = tokenManager.getToken();
    if (!token) return false;

    try {
      // Enhanced token validation - check if it's not expired and properly formatted
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      
      // Validate required token fields - only check sub and exp, not role
      // Role is stored in user data in localStorage, not in JWT token
      if (!payload.sub || !payload.exp) {
        tokenManager.clearTokens();
        return false;
      }
      
      return payload.exp > currentTime;
    } catch (error) {
      // If token parsing fails, consider it invalid
      tokenManager.clearTokens();
      return false;
    }
  }

  /**
   * Get current user from token with improved role information parsing
   * @returns {Object|null} User data from token or null if not authenticated
   */
  getCurrentUser() {
    const token = tokenManager.getToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      
      // Validate required fields before returning user data
      // Note: role is not stored in JWT token, it's in user data from localStorage
      if (!payload.sub) {
        console.error('Invalid token: missing required fields');
        tokenManager.clearTokens();
        return null;
      }
      
      return {
        id: payload.sub,
        email: payload.email || null,
        fullName: payload.fullName || null,
        // role is not available in JWT token
        exp: payload.exp,
        iat: payload.iat || null
      };
    } catch (error) {
      console.error('Error parsing token:', error);
      tokenManager.clearTokens();
      return null;
    }
  }

  /**
   * Check if user has specific role
   * @param {string} role - Role to check (e.g., 'ADMIN', 'USER')
   * @returns {boolean} True if user has the specified role
   */
  hasRole(role) {
    // This method is deprecated since role is not stored in JWT token
    // Use user data from localStorage instead
    console.warn('authService.hasRole() is deprecated. Use user data from AuthContext instead.');
    return false;
  }

  /**
   * Check if user is admin
   * @returns {boolean} True if user has ADMIN role
   */
  isAdmin() {
    // This method is deprecated since role is not stored in JWT token
    // Use user data from AuthContext instead
    console.warn('authService.isAdmin() is deprecated. Use user data from AuthContext instead.');
    return false;
  }

  /**
   * Validate admin access (both authentication and role)
   * @throws {Error} If user is not authenticated or not admin
   * @returns {boolean} True if user has admin access
   */
  validateAdminAccess() {
    if (!this.isAuthenticated()) {
      throw {
        type: 'AUTHENTICATION_ERROR',
        status: 401,
        message: 'Authentication required',
        code: 'AUTH_REQUIRED'
      };
    }

    if (!this.isAdmin()) {
      throw {
        type: 'AUTHORIZATION_ERROR',
        status: 403,
        message: 'Admin access required',
        code: 'ADMIN_ACCESS_REQUIRED'
      };
    }

    return true;
  }

  /**
   * Clear authentication data
   */
  clearAuth() {
    tokenManager.clearTokens();
  }
}

// Export singleton instance
export default new AuthService();