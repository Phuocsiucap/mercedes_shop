import axiosInstance from './axios';

// Get all cars with pagination and filters
export const getAllCars = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/cars', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get featured cars
export const getFeaturedCars = async () => {
  try {
    const response = await axiosInstance.get('/cars/featured');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Search cars with filters
export const searchCars = async (filters = {}) => {
  try {
    const response = await axiosInstance.get('/cars/search', { params: filters });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get car by ID
export const getCarById = async (id) => {
  try {
    const response = await axiosInstance.get(`/cars/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Create new car (admin only)
export const createCar = async (carData) => {
  try {
    const response = await axiosInstance.post('/cars', carData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Update car (admin only)
export const updateCar = async (id, carData) => {
  try {
    const response = await axiosInstance.put(`/cars/${id}`, carData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Delete car (admin only)
export const deleteCar = async (id) => {
  try {
    const response = await axiosInstance.delete(`/cars/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
