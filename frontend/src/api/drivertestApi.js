import axiosInstance from './axios';

// API endpoints prefix
const BASE_URL = '/drivertests';

// Get all driver tests
export const getAllDrivertests = async () => {
  try {
    const response = await axiosInstance.get(BASE_URL);
    return response.data; // Trả về ApiResponse object: { success, message, data: [...] }
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get driver test by ID
export const getDrivertestById = async (id) => {
  try {
    const response = await axiosInstance.get(`${BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Create new driver test
export const createDrivertest = async (drivertestData) => {
  try {
    const response = await axiosInstance.post(BASE_URL, drivertestData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Update driver test
export const updateDrivertest = async (id, drivertestData) => {
  try {
    const response = await axiosInstance.put(`${BASE_URL}/${id}`, drivertestData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Update driver test status (admin only)
export const updateDrivertestStatus = async (id, status) => {
  try {
    // Backend dùng @RequestParam nên truyền params
    const response = await axiosInstance.patch(`${BASE_URL}/${id}/status`, null, {
      params: { status }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Delete driver test
export const deleteDrivertest = async (id) => {
  try {
    const response = await axiosInstance.delete(`${BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get driver tests by status
export const getDrivertestsByStatus = async (status) => {
  try {
    const response = await axiosInstance.get(`${BASE_URL}/status/${status}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get driver tests by user
export const getDrivertestsByUser = async (userId) => {
  try {
    const response = await axiosInstance.get(`${BASE_URL}/user/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};