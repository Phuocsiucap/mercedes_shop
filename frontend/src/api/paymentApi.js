import axiosInstance from './axios';

// Create VNPay payment URL
export const createVNPayPayment = async (paymentData) => {
  try {
    const response = await axiosInstance.post('/payments/vnpay/create', paymentData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Verify VNPay payment callback
export const verifyVNPayPayment = async (params) => {
  try {
    const response = await axiosInstance.post('/payments/vnpay/verify', params);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get payment history
export const getPaymentHistory = async () => {
  try {
    const response = await axiosInstance.get('/payments/history');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get payment by ID
export const getPaymentById = async (paymentId) => {
  try {
    const response = await axiosInstance.get(`/payments/${paymentId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Create payment for test drive
export const createTestDrivePayment = async (testDriveId, amount) => {
  try {
    const response = await axiosInstance.post('/payments/testdrive', {
      testDriveId,
      amount,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Create payment for deposit
export const createDepositPayment = async (carId, depositAmount) => {
  try {
    const response = await axiosInstance.post('/payments/deposit', {
      carId,
      depositAmount,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
