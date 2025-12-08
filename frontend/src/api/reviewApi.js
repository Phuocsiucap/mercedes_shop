import axiosInstance from './axios';

// Get all reviews by car ID
export const getReviewsByCarId = async (carId) => {
  try {
    const response = await axiosInstance.get(`/reviews/car/${carId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get all reviews (admin only)
export const getAllReviews = async () => {
  try {
    const response = await axiosInstance.get('/reviews');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get review by ID
export const getReviewById = async (id) => {
  try {
    const response = await axiosInstance.get(`/reviews/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Create new review
export const createReview = async (reviewData) => {
  try {
    const response = await axiosInstance.post('/reviews', reviewData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Update review
export const updateReview = async (id, reviewData) => {
  try {
    const response = await axiosInstance.put(`/reviews/${id}`, reviewData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Delete review
export const deleteReview = async (id) => {
  try {
    const response = await axiosInstance.delete(`/reviews/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
