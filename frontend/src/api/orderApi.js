import axiosInstance from './axios';

// Get user orders
export const getUserOrders = async () => {
  try {
    const response = await axiosInstance.get('/orders');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get all orders (admin only)
export const getAllOrders = async () => {
  try {
    const response = await axiosInstance.get('/orders/all');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get order by ID
export const getOrderById = async (id) => {
  try {
    const response = await axiosInstance.get(`/orders/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get orders by status (admin only)
export const getOrdersByStatus = async (status) => {
  try {
    const response = await axiosInstance.get(`/orders/status/${status}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Create new order
export const createOrder = async (orderData) => {
  try {
    const response = await axiosInstance.post('/orders', orderData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Update order status (admin only)
export const updateOrderStatus = async (id, status) => {
  try {
    const response = await axiosInstance.patch(`/orders/${id}/status`, null, {
      params: { status }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Cancel order
export const cancelOrder = async (id) => {
  try {
    const response = await axiosInstance.delete(`/orders/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
