import axios from 'axios';

// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

// Create axios instance with default configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token management
const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

export const tokenManager = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (token) => localStorage.setItem(TOKEN_KEY, token),
  removeToken: () => localStorage.removeItem(TOKEN_KEY),
  getRefreshToken: () => localStorage.getItem(REFRESH_TOKEN_KEY),
  setRefreshToken: (token) => localStorage.setItem(REFRESH_TOKEN_KEY, token),
  removeRefreshToken: () => localStorage.removeItem(REFRESH_TOKEN_KEY),
  clearTokens: () => {
    // Xóa tokens chính
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    
    // Xóa các keys liên quan đến authentication
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('auth_user');
    
    // Xóa cart và app settings (có thể chứa thông tin nhạy cảm)
    localStorage.removeItem('cart_items');
    localStorage.removeItem('cart_timestamp');
    localStorage.removeItem('app_settings');
    
    // Xóa toàn bộ sessionStorage
    sessionStorage.clear();
  }
};

// Request interceptor to add authentication token
apiClient.interceptors.request.use(
  (config) => {
    const token = tokenManager.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and token refresh
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = tokenManager.getRefreshToken();
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken: refreshToken
          });

          const { token, refreshToken: newRefreshToken } = response.data.data;
          tokenManager.setToken(token);
          tokenManager.setRefreshToken(newRefreshToken);

          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        tokenManager.clearTokens();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Exponential backoff delay calculation
const calculateRetryDelay = (retryCount) => {
  return RETRY_DELAY * Math.pow(2, retryCount);
};

// Generic API request function with retry logic
const makeRequest = async (requestFn, retries = 0) => {
  try {
    const response = await requestFn();
    return response.data;
  } catch (error) {
    // Check if error is retryable (network errors, 5xx server errors)
    const isRetryable = !error.response || 
                       error.response.status >= 500 || 
                       error.code === 'NETWORK_ERROR' ||
                       error.code === 'ECONNABORTED';

    if (isRetryable && retries < MAX_RETRIES) {
      const delay = calculateRetryDelay(retries);
      await new Promise(resolve => setTimeout(resolve, delay));
      return makeRequest(requestFn, retries + 1);
    }

    // Transform error for consistent handling
    throw transformError(error);
  }
};

// Error transformation for consistent error handling
const transformError = (error) => {
  if (error.response) {
    // Server responded with error status
    const status = error.response.status;
    const data = error.response.data;

    // Map status codes to consistent error types
    const errorTypeMap = {
      400: 'VALIDATION_ERROR',
      401: 'AUTHENTICATION_ERROR',
      403: 'AUTHORIZATION_ERROR',
      404: 'NOT_FOUND_ERROR',
      422: 'VALIDATION_ERROR',
      429: 'RATE_LIMIT_ERROR',
      500: 'SERVER_ERROR',
      502: 'BAD_GATEWAY_ERROR',
      503: 'SERVICE_UNAVAILABLE_ERROR',
      504: 'GATEWAY_TIMEOUT_ERROR'
    };

    const errorType = errorTypeMap[status] || 'API_ERROR';
    const errorCode = data?.code || errorType;

    return {
      type: errorType,
      status: status,
      message: data?.message || getDefaultErrorMessage(status),
      code: errorCode,
      errors: data?.errors || [],
      data: data,
      timestamp: new Date().toISOString()
    };
  } else if (error.request) {
    // Network error
    return {
      type: 'NETWORK_ERROR',
      status: 0,
      message: 'Network error. Please check your connection.',
      code: 'NETWORK_ERROR',
      originalError: error,
      timestamp: new Date().toISOString()
    };
  } else {
    // Other error
    return {
      type: 'UNKNOWN_ERROR',
      status: 0,
      message: error.message || 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR',
      originalError: error,
      timestamp: new Date().toISOString()
    };
  }
};

// Get default error message for status codes
const getDefaultErrorMessage = (status) => {
  const messageMap = {
    400: 'Bad request',
    401: 'Authentication required',
    403: 'Access forbidden',
    404: 'Resource not found',
    422: 'Validation failed',
    429: 'Too many requests',
    500: 'Internal server error',
    502: 'Bad gateway',
    503: 'Service unavailable',
    504: 'Gateway timeout'
  };

  return messageMap[status] || 'An error occurred';
};

// Role validation utilities
export const roleValidator = {
  /**
   * Check if user has valid authentication token
   * @returns {boolean} True if user has valid token
   */
  isAuthenticated() {
    const token = tokenManager.getToken();
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp > currentTime;
    } catch (error) {
      tokenManager.clearTokens();
      return false;
    }
  },

  /**
   * Get current user from token
   * @returns {Object|null} User data from token or null if not authenticated
   */
  getCurrentUser() {
    const token = tokenManager.getToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        id: payload.sub,
        email: payload.email,
        fullName: payload.fullName,
        role: payload.role,
        exp: payload.exp
      };
    } catch (error) {
      console.error('Error parsing token:', error);
      return null;
    }
  },

  /**
   * Check if user has specific role
   * @param {string} role - Role to check
   * @returns {boolean} True if user has the role
   */
  hasRole(role) {
    const user = this.getCurrentUser();
    return user && user.role === role;
  },

  /**
   * Check if user is admin
   * @returns {boolean} True if user has ADMIN role
   */
  isAdmin() {
    return this.hasRole('ADMIN');
  },

  /**
   * Validate admin access (both authentication and role)
   * @throws {Error} If user is not authenticated or not admin
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
  }
};

// Response formatter for consistent API responses
export const responseFormatter = {
  /**
   * Format successful response
   * @param {any} data - Response data
   * @param {string} message - Success message
   * @returns {Object} Formatted response
   */
  success(data, message = 'Operation successful') {
    return {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    };
  },

  /**
   * Format error response
   * @param {string} message - Error message
   * @param {string} code - Error code
   * @param {any} details - Error details
   * @returns {Object} Formatted error response
   */
  error(message, code = 'UNKNOWN_ERROR', details = null) {
    return {
      success: false,
      message,
      error: {
        code,
        details
      },
      timestamp: new Date().toISOString()
    };
  },

  /**
   * Format validation error response
   * @param {Array} errors - Validation errors
   * @returns {Object} Formatted validation error response
   */
  validationError(errors) {
    return {
      success: false,
      message: 'Validation failed',
      error: {
        code: 'VALIDATION_ERROR',
        details: errors
      },
      timestamp: new Date().toISOString()
    };
  }
};

// Base API service class
export class ApiService {
  constructor(baseEndpoint = '') {
    this.baseEndpoint = baseEndpoint;
  }

  /**
   * Format response consistently
   * @param {any} response - Raw response
   * @returns {Object} Formatted response
   */
  _formatResponse(response) {
    // If response is already formatted, return as is
    if (response && typeof response === 'object' && 'success' in response) {
      return response;
    }

    // Format raw response data
    return responseFormatter.success(response);
  }

  /**
   * Handle request errors consistently
   * @param {Error} error - Request error
   * @throws {Object} Formatted error
   */
  _handleError(error) {
    // If error is already formatted, re-throw as is
    if (error.type) {
      throw error;
    }

    // Handle different error types
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;

      // Handle specific status codes
      switch (status) {
        case 401:
          throw {
            type: 'AUTHENTICATION_ERROR',
            status: 401,
            message: data?.message || 'Authentication required',
            code: 'AUTH_REQUIRED',
            data
          };
        case 403:
          throw {
            type: 'AUTHORIZATION_ERROR',
            status: 403,
            message: data?.message || 'Access forbidden',
            code: 'ACCESS_FORBIDDEN',
            data
          };
        case 404:
          throw {
            type: 'NOT_FOUND_ERROR',
            status: 404,
            message: data?.message || 'Resource not found',
            code: 'NOT_FOUND',
            data
          };
        case 422:
          throw {
            type: 'VALIDATION_ERROR',
            status: 422,
            message: data?.message || 'Validation failed',
            code: 'VALIDATION_ERROR',
            errors: data?.errors || [],
            data
          };
        default:
          throw {
            type: 'API_ERROR',
            status,
            message: data?.message || 'An error occurred',
            code: data?.code || 'API_ERROR',
            data
          };
      }
    }

    // Re-throw original error if not handled
    throw error;
  }

  // Standard HTTP methods

  /**
   * GET request
   * @param {string} endpoint - API endpoint
   * @param {Object} config - Request configuration
   * @returns {Promise<Object>} Formatted response
   */
  async get(endpoint = '', config = {}) {
    try {
      const response = await makeRequest(() => 
        apiClient.get(`${this.baseEndpoint}${endpoint}`, config)
      );
      return this._formatResponse(response);
    } catch (error) {
      this._handleError(error);
    }
  }

  /**
   * POST request
   * @param {string} endpoint - API endpoint
   * @param {any} data - Request data
   * @param {Object} config - Request configuration
   * @returns {Promise<Object>} Formatted response
   */
  async post(endpoint = '', data = {}, config = {}) {
    try {
      const response = await makeRequest(() => 
        apiClient.post(`${this.baseEndpoint}${endpoint}`, data, config)
      );
      return this._formatResponse(response);
    } catch (error) {
      this._handleError(error);
    }
  }

  /**
   * PUT request
   * @param {string} endpoint - API endpoint
   * @param {any} data - Request data
   * @param {Object} config - Request configuration
   * @returns {Promise<Object>} Formatted response
   */
  async put(endpoint = '', data = {}, config = {}) {
    try {
      const response = await makeRequest(() => 
        apiClient.put(`${this.baseEndpoint}${endpoint}`, data, config)
      );
      return this._formatResponse(response);
    } catch (error) {
      this._handleError(error);
    }
  }

  /**
   * PATCH request
   * @param {string} endpoint - API endpoint
   * @param {any} data - Request data
   * @param {Object} config - Request configuration
   * @returns {Promise<Object>} Formatted response
   */
  async patch(endpoint = '', data = {}, config = {}) {
    try {
      const response = await makeRequest(() => 
        apiClient.patch(`${this.baseEndpoint}${endpoint}`, data, config)
      );
      return this._formatResponse(response);
    } catch (error) {
      this._handleError(error);
    }
  }

  /**
   * DELETE request
   * @param {string} endpoint - API endpoint
   * @param {Object} config - Request configuration
   * @returns {Promise<Object>} Formatted response
   */
  async delete(endpoint = '', config = {}) {
    try {
      const response = await makeRequest(() => 
        apiClient.delete(`${this.baseEndpoint}${endpoint}`, config)
      );
      return this._formatResponse(response);
    } catch (error) {
      this._handleError(error);
    }
  }

  // Admin-specific HTTP methods with role validation

  /**
   * Admin GET request with role validation
   * @param {string} endpoint - API endpoint
   * @param {Object} config - Request configuration
   * @returns {Promise<Object>} Formatted response
   */
  async adminGet(endpoint = '', config = {}) {
    try {
      roleValidator.validateAdminAccess();
      return await this.get(endpoint, config);
    } catch (error) {
      this._handleError(error);
    }
  }

  /**
   * Admin POST request with role validation
   * @param {string} endpoint - API endpoint
   * @param {any} data - Request data
   * @param {Object} config - Request configuration
   * @returns {Promise<Object>} Formatted response
   */
  async adminPost(endpoint = '', data = {}, config = {}) {
    try {
      roleValidator.validateAdminAccess();
      return await this.post(endpoint, data, config);
    } catch (error) {
      this._handleError(error);
    }
  }

  /**
   * Admin PUT request with role validation
   * @param {string} endpoint - API endpoint
   * @param {any} data - Request data
   * @param {Object} config - Request configuration
   * @returns {Promise<Object>} Formatted response
   */
  async adminPut(endpoint = '', data = {}, config = {}) {
    try {
      roleValidator.validateAdminAccess();
      return await this.put(endpoint, data, config);
    } catch (error) {
      this._handleError(error);
    }
  }

  /**
   * Admin PATCH request with role validation
   * @param {string} endpoint - API endpoint
   * @param {any} data - Request data
   * @param {Object} config - Request configuration
   * @returns {Promise<Object>} Formatted response
   */
  async adminPatch(endpoint = '', data = {}, config = {}) {
    try {
      roleValidator.validateAdminAccess();
      return await this.patch(endpoint, data, config);
    } catch (error) {
      this._handleError(error);
    }
  }

  /**
   * Admin DELETE request with role validation
   * @param {string} endpoint - API endpoint
   * @param {Object} config - Request configuration
   * @returns {Promise<Object>} Formatted response
   */
  async adminDelete(endpoint = '', config = {}) {
    try {
      roleValidator.validateAdminAccess();
      return await this.delete(endpoint, config);
    } catch (error) {
      this._handleError(error);
    }
  }

  /**
   * Upload file
   * @param {string} endpoint - API endpoint
   * @param {File} file - File to upload
   * @param {Object} additionalData - Additional form data
   * @param {Function} onProgress - Progress callback
   * @returns {Promise<Object>} Formatted response
   */
  async upload(endpoint = '', file, additionalData = {}, onProgress = null) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      // Add additional data to form
      Object.keys(additionalData).forEach(key => {
        formData.append(key, additionalData[key]);
      });

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: onProgress
      };

      const response = await makeRequest(() => 
        apiClient.post(`${this.baseEndpoint}${endpoint}`, formData, config)
      );
      return this._formatResponse(response);
    } catch (error) {
      this._handleError(error);
    }
  }

  /**
   * Admin file upload with role validation
   * @param {string} endpoint - API endpoint
   * @param {File} file - File to upload
   * @param {Object} additionalData - Additional form data
   * @param {Function} onProgress - Progress callback
   * @returns {Promise<Object>} Formatted response
   */
  async adminUpload(endpoint = '', file, additionalData = {}, onProgress = null) {
    try {
      roleValidator.validateAdminAccess();
      return await this.upload(endpoint, file, additionalData, onProgress);
    } catch (error) {
      this._handleError(error);
    }
  }
}

// Export configured axios instance for direct use if needed
export { apiClient };

// Export default instance
export default new ApiService();