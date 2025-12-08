import axiosInstance from './axios';

// Get user favorites
export const getUserFavorites = async () => {
  try {
    const response = await axiosInstance.get('/favorites');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Add car to favorites
export const addFavorite = async (carId) => {
  try {
    const response = await axiosInstance.post(`/favorites/car/${carId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Remove favorite by ID
export const removeFavorite = async (favoriteId) => {
  try {
    const response = await axiosInstance.delete(`/favorites/${favoriteId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Remove favorite by car ID
export const removeFavoriteByCarId = async (carId) => {
  try {
    const response = await axiosInstance.delete(`/favorites/car/${carId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Check if car is favorited
export const isCarFavorited = async (carId) => {
  try {
    const response = await axiosInstance.get(`/favorites/car/${carId}/check`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
