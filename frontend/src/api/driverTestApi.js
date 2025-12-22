import axiosInstance from './axios';

const driverTestApi = {
  // Customer APIs
  createTestDrive: (data) => axiosInstance.post('/test-drive', data),
  
  getMyTestDrives: () => axiosInstance.get('/test-drive/my-bookings'),
  
  getTestDriveById: (id) => axiosInstance.get(`/test-drive/${id}`),
  
  cancelTestDrive: (id) => axiosInstance.delete(`/test-drive/${id}`),

  // Admin APIs
  getAllTestDrives: (params) => axiosInstance.get('/admin/test-drives', { params }),
  
  adminGetTestDriveById: (id) => axiosInstance.get(`/admin/test-drives/${id}`),
  
  adminCreateTestDrive: (data) => axiosInstance.post('/admin/test-drives', data),
  
  adminUpdateTestDrive: (id, data) => axiosInstance.put(`/admin/test-drives/${id}`, data),
  
  adminUpdateStatus: (id, status) => axiosInstance.put(`/admin/test-drives/${id}/status`, null, { params: { status } }),
  
  adminDeleteTestDrive: (id) => axiosInstance.delete(`/admin/test-drives/${id}`),
};

export default driverTestApi;
