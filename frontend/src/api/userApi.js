import axiosInstance from './axios';

// Get all users (admin only)
export const getAllUsers = async () => {
  try {
    const response = await axiosInstance.get('/users');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get user by ID
export const getUserById = async (id) => {
  try {
    const response = await axiosInstance.get(`/users/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get current user profile
export const getCurrentUser = async () => {
  try {
    const response = await axiosInstance.get('/auth/me');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Update user profile
export const updateUserProfile = async (userData) => {
  try {
    const response = await axiosInstance.put('/users/profile', userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Update user role (admin only)
export const updateUserRole = async (id, role) => {
  try {
    const response = await axiosInstance.put(`/users/${id}/role`, { role });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Delete user (admin only)
export const deleteUser = async (id) => {
  try {
    const response = await axiosInstance.delete(`/users/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Change password
export const changePassword = async (oldPassword, newPassword) => {
  try {
    const response = await axiosInstance.post('/users/change-password', {
      oldPassword,
      newPassword,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
