import { ApiService } from './api.js';

class PaymentService extends ApiService {
  constructor() {
    super('/payments');
  }

  /**
   * Tạo thanh toán (alias cho createVNPayPayment)
   * @param {Object} paymentData - Dữ liệu thanh toán
   * @returns {Promise<Object>} URL thanh toán
   */
  async createPayment(paymentData) {
    return await this.createVNPayPayment(paymentData);
  }

  /**
   * Tạo thanh toán cho lịch lái thử
   * @param {Object} paymentData - Dữ liệu thanh toán
   * @returns {Promise<Object>} URL thanh toán
   */
  async createTestDrivePayment(paymentData) {
    return await this.post('/vnpay/test-drive', paymentData);
  }

  /**
   * Tạo URL thanh toán VNPay
   * @param {Object} paymentData - Dữ liệu thanh toán
   * @returns {Promise<Object>} URL thanh toán
   */
  async createVNPayPayment(paymentData) {
    return await this.post('/vnpay/create', paymentData);
  }

  /**
   * Xử lý kết quả trả về từ VNPay
   * @param {Object} params - Query parameters từ VNPay
   * @returns {Promise<Object>} Kết quả thanh toán
   */
  async processVNPayReturn(params) {
    const queryString = new URLSearchParams(params).toString();
    return await this.get(`/vnpay/return?${queryString}`);
  }

  /**
   * Lấy thông tin thanh toán theo ID
   * @param {string} paymentId - Payment ID
   * @returns {Promise<Object>} Thông tin thanh toán
   */
  async getPaymentById(paymentId) {
    return await this.get(`/${paymentId}`);
  }

  /**
   * Lấy thông tin thanh toán theo Order ID
   * @param {string} orderId - Order ID
   * @returns {Promise<Object>} Thông tin thanh toán
   */
  async getPaymentByOrderId(orderId) {
    return await this.get(`/order/${orderId}`);
  }

  /**
   * Lấy danh sách thanh toán của user
   * @returns {Promise<Object>} Danh sách thanh toán
   */
  async getMyPayments() {
    return await this.get('/my-payments');
  }

  // ==================== ADMIN METHODS ====================

  /**
   * [Admin] Lấy tất cả giao dịch
   * @param {Object} params - Tham số phân trang và sắp xếp
   * @returns {Promise<Object>} Danh sách giao dịch
   */
  async getAllPayments(params = {}) {
    const queryParams = {
      page: params.page || 0,
      size: params.size || 100,
      sortBy: params.sortBy || 'createdAt',
      sortDir: params.sortDir || 'desc'
    };
    
    try {
      // Use adminGet for admin endpoints
      return await this.adminGet('/admin/all', { params: queryParams });
    } catch (error) {
      console.error('Error in getAllPayments:', error);
      throw error;
    }
  }

  /**
   * [Admin] Lấy giao dịch theo trạng thái
   * @param {string} status - Trạng thái
   * @param {Object} params - Tham số phân trang
   * @returns {Promise<Object>} Danh sách giao dịch
   */
  async getPaymentsByStatus(status, params = {}) {
    const queryParams = {
      page: params.page || 0,
      size: params.size || 10
    };
    return await this.adminGet(`/admin/status/${status}`, { params: queryParams });
  }

  /**
   * [Admin] Lấy giao dịch theo phương thức thanh toán
   * @param {string} method - Phương thức thanh toán
   * @param {Object} params - Tham số phân trang
   * @returns {Promise<Object>} Danh sách giao dịch
   */
  async getPaymentsByMethod(method, params = {}) {
    const queryParams = {
      page: params.page || 0,
      size: params.size || 10
    };
    return await this.adminGet(`/admin/method/${method}`, { params: queryParams });
  }

  /**
   * [Admin] Lấy giao dịch theo khoảng thời gian
   * @param {string} startDate - Ngày bắt đầu (ISO format)
   * @param {string} endDate - Ngày kết thúc (ISO format)
   * @param {Object} params - Tham số phân trang
   * @returns {Promise<Object>} Danh sách giao dịch
   */
  async getPaymentsByDateRange(startDate, endDate, params = {}) {
    const queryParams = {
      startDate,
      endDate,
      page: params.page || 0,
      size: params.size || 10
    };
    return await this.adminGet('/admin/date-range', { params: queryParams });
  }

  /**
   * [Admin] Lấy thống kê giao dịch
   * @returns {Promise<Object>} Thống kê
   */
  async getPaymentStatistics() {
    return await this.adminGet('/admin/statistics');
  }

  /**
   * [Admin] Lấy thống kê giao dịch theo khoảng thời gian
   * @param {string} startDate - Ngày bắt đầu (ISO format)
   * @param {string} endDate - Ngày kết thúc (ISO format)
   * @returns {Promise<Object>} Thống kê
   */
  async getPaymentStatisticsByDateRange(startDate, endDate) {
    const queryParams = { startDate, endDate };
    return await this.adminGet('/admin/statistics/date-range', { params: queryParams });
  }

  /**
   * [Admin] Cập nhật trạng thái giao dịch
   * @param {string} paymentId - Payment ID
   * @param {string} status - Trạng thái mới (PENDING, SUCCESS, FAILED, CANCELLED)
   * @returns {Promise<Object>} Payment đã cập nhật
   */
  async updatePaymentStatus(paymentId, status) {
    return await this.adminPut(`/admin/${paymentId}/status?status=${status}`);
  }

  /**
   * Format số tiền VND
   * @param {number} amount - Số tiền
   * @returns {string} Số tiền đã format
   */
  formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  }

  /**
   * Lấy tên trạng thái thanh toán
   * @param {string} status - Mã trạng thái
   * @returns {string} Tên trạng thái
   */
  getStatusLabel(status) {
    const statusMap = {
      'PENDING': 'Đang chờ',
      'SUCCESS': 'Thành công',
      'FAILED': 'Thất bại',
      'CANCELLED': 'Đã hủy'
    };
    return statusMap[status] || status;
  }

  /**
   * Lấy màu cho trạng thái
   * @param {string} status - Mã trạng thái
   * @returns {string} Class màu
   */
  getStatusColor(status) {
    const colorMap = {
      'PENDING': 'text-yellow-600 bg-yellow-100',
      'SUCCESS': 'text-green-600 bg-green-100',
      'FAILED': 'text-red-600 bg-red-100',
      'CANCELLED': 'text-gray-600 bg-gray-100'
    };
    return colorMap[status] || 'text-gray-600 bg-gray-100';
  }

  /**
   * Lấy tên phương thức thanh toán
   * @param {string} method - Mã phương thức
   * @returns {string} Tên phương thức
   */
  getMethodLabel(method) {
    const methodMap = {
      'VNPAY': 'VNPay',
      'COD': 'Thanh toán khi nhận hàng',
      'BANK_TRANSFER': 'Chuyển khoản ngân hàng'
    };
    return methodMap[method] || method;
  }
}

export default new PaymentService();
