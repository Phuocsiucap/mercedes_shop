import { ApiService } from './api.js';

/**
 * Driver Test service - Quản lý lái thử
 * @typedef {import('../types/driverTest.types.js').TestDrive} TestDrive
 * @typedef {import('../types/driverTest.types.js').CreateTestDriveRequest} CreateTestDriveRequest
 * @typedef {import('../types/driverTest.types.js').UpdateTestDriveRequest} UpdateTestDriveRequest
 * @typedef {import('../types/driverTest.types.js').TestDriveFilterParams} TestDriveFilterParams
 */
class DriverTestService extends ApiService {
  constructor() {
    super('/test-drive');
  }

  // ==================== CUSTOMER METHODS ====================

  /**
   * Đăng ký lái thử
   * @param {CreateTestDriveRequest} data - Dữ liệu đăng ký
   * @returns {Promise<Object>} Lịch lái thử đã tạo
   */
  async createTestDrive(data) {
    return await this.post('', data);
  }

  /**
   * Lấy danh sách lái thử của user
   * @returns {Promise<Object>} Danh sách lái thử
   */
  async getMyTestDrives() {
    return await this.get('/my-bookings');
  }

  /**
   * Lấy chi tiết lái thử
   * @param {string} id - Test drive ID
   * @returns {Promise<Object>} Chi tiết lái thử
   */
  async getTestDriveById(id) {
    return await this.get(`/${id}`);
  }

  /**
   * Hủy lịch lái thử
   * @param {string} id - Test drive ID
   * @returns {Promise<Object>} Kết quả hủy
   */
  async cancelTestDrive(id) {
    return await this.delete(`/${id}`);
  }

  // ==================== ADMIN METHODS ====================

  /**
   * [Admin] Lấy tất cả lịch lái thử
   * @param {TestDriveFilterParams} params - Tham số lọc
   * @returns {Promise<Object>} Danh sách lái thử
   */
  async getAllTestDrives(params = {}) {
    const queryParams = {
      page: params.page || 0,
      size: params.size || 10,
      sortBy: params.sortBy || 'createdAt',
      sortDir: params.sortDir || 'desc'
    };

    if (params.keyword) queryParams.keyword = params.keyword;
    if (params.status) queryParams.status = params.status;
    if (params.fromDate) queryParams.fromDate = params.fromDate;
    if (params.toDate) queryParams.toDate = params.toDate;

    // Sử dụng endpoint admin
    const adminApi = new ApiService('/admin/test-drives');
    return await adminApi.get('', { params: queryParams });
  }

  /**
   * [Admin] Lấy chi tiết lái thử
   * @param {string} id - Test drive ID
   * @returns {Promise<Object>} Chi tiết lái thử
   */
  async adminGetTestDriveById(id) {
    const adminApi = new ApiService('/admin/test-drives');
    return await adminApi.get(`/${id}`);
  }

  /**
   * [Admin] Tạo lịch lái thử
   * @param {CreateTestDriveRequest} data - Dữ liệu
   * @returns {Promise<Object>} Lịch lái thử đã tạo
   */
  async adminCreateTestDrive(data) {
    const adminApi = new ApiService('/admin/test-drives');
    return await adminApi.post('', data);
  }

  /**
   * [Admin] Cập nhật lịch lái thử
   * @param {string} id - Test drive ID
   * @param {UpdateTestDriveRequest} data - Dữ liệu cập nhật
   * @returns {Promise<Object>} Lịch lái thử đã cập nhật
   */
  async adminUpdateTestDrive(id, data) {
    const adminApi = new ApiService('/admin/test-drives');
    return await adminApi.put(`/${id}`, data);
  }

  /**
   * [Admin] Cập nhật trạng thái
   * @param {string} id - Test drive ID
   * @param {string} status - Trạng thái mới
   * @returns {Promise<Object>} Kết quả cập nhật
   */
  async adminUpdateStatus(id, status) {
    const adminApi = new ApiService('/admin/test-drives');
    return await adminApi.put(`/${id}/status`, null, {
      params: { status }
    });
  }

  /**
   * [Admin] Xóa lịch lái thử
   * @param {string} id - Test drive ID
   * @returns {Promise<Object>} Kết quả xóa
   */
  async adminDeleteTestDrive(id) {
    const adminApi = new ApiService('/admin/test-drives');
    return await adminApi.delete(`/${id}`);
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Lấy thống kê lái thử của user
   * @returns {Promise<Object>} Thống kê
   */
  async getMyTestDriveStats() {
    try {
      const response = await this.getMyTestDrives();
      const testDrives = response.data || [];

      const stats = {
        total: testDrives.length,
        pending: 0,
        confirmed: 0,
        completed: 0,
        cancelled: 0
      };

      testDrives.forEach(td => {
        const status = td.status?.toLowerCase();
        if (stats[status] !== undefined) {
          stats[status]++;
        }
      });

      return {
        success: true,
        data: stats
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Kiểm tra xe có lịch lái thử chưa
   * @param {string} carId - Car ID
   * @returns {Promise<Object>} Kết quả kiểm tra
   */
  async hasTestDriveForCar(carId) {
    try {
      const response = await this.getMyTestDrives();
      const testDrives = response.data || [];

      const existing = testDrives.find(td => 
        td.carId === carId && 
        ['PENDING', 'CONFIRMED'].includes(td.status)
      );

      return {
        success: true,
        data: {
          hasTestDrive: !!existing,
          testDrive: existing || null
        }
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Lấy lịch lái thử sắp tới
   * @returns {Promise<Object>} Danh sách lịch sắp tới
   */
  async getUpcomingTestDrives() {
    try {
      const response = await this.getMyTestDrives();
      const testDrives = response.data || [];

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const upcoming = testDrives.filter(td => {
        if (td.status === 'CANCELLED' || td.status === 'COMPLETED') {
          return false;
        }
        const testDate = new Date(td.testDate);
        return testDate >= today;
      }).sort((a, b) => new Date(a.testDate) - new Date(b.testDate));

      return {
        success: true,
        data: upcoming
      };
    } catch (error) {
      throw error;
    }
  }
}

export default new DriverTestService();
