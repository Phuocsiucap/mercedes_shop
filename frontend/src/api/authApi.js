import axiosInstance from './axios';

// Login
export const login = async (emailOrPhone, password) => {
  try {
    const response = await axiosInstance.post('/auth/login', {
      emailOrPhone,
      password,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Register
export const register = async (userData) => {
  try {
    const response = await axiosInstance.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get current user
export const getCurrentUser = async () => {
  try {
    const response = await axiosInstance.get('/auth/me');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Logout
export const logout = async () => {
  try {
    const response = await axiosInstance.post('/auth/logout');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Refresh token
export const refreshToken = async () => {
  try {
    const response = await axiosInstance.post('/auth/refresh');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
