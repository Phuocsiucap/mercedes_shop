import { ApiService } from './api.js';

/**
 * Order service - Quản lý đơn hàng
 * @typedef {import('../types/order.types.js').Order} Order
 * @typedef {import('../types/order.types.js').CreateOrderRequest} CreateOrderRequest
 * @typedef {import('../types/order.types.js').OrderFilterParams} OrderFilterParams
 */
class OrderService extends ApiService {
  constructor() {
    super('/orders');
  }

  /**
   * Lấy danh sách đơn hàng của user
   * @returns {Promise<Object>} Danh sách đơn hàng
   */
  async getMyOrders() {
    return await this.get('');
  }

  /**
   * Lấy chi tiết đơn hàng
   * @param {string} orderId - Order ID
   * @returns {Promise<Object>} Chi tiết đơn hàng
   */
  async getOrderById(orderId) {
    return await this.get(`/${orderId}`);
  }

  /**
   * Tạo đơn hàng mới
   * @param {CreateOrderRequest} orderData - Dữ liệu đơn hàng
   * @returns {Promise<Object>} Đơn hàng đã tạo
   */
  async createOrder(orderData) {
    return await this.post('', orderData);
  }

  /**
   * Hủy đơn hàng
   * @param {string} orderId - Order ID
   * @returns {Promise<Object>} Kết quả hủy
   */
  async cancelOrder(orderId) {
    return await this.delete(`/${orderId}`);
  }

  /**
   * Lấy đơn hàng theo trạng thái
   * @param {string} status - Trạng thái
   * @returns {Promise<Object>} Danh sách đơn hàng
   */
  async getOrdersByStatus(status) {
    return await this.get(`/status/${status}`);
  }

  // ==================== ADMIN METHODS ====================

  /**
   * [Admin] Lấy tất cả đơn hàng
   * @param {OrderFilterParams} params - Tham số lọc
   * @returns {Promise<Object>} Danh sách đơn hàng
   */
  async getAllOrders(params = {}) {
    const queryParams = {
      page: params.page || 0,
      size: params.size || 10,
      sortBy: params.sortBy || 'createdAt',
      sortDir: params.sortDir || 'desc'
    };

    if (params.status) queryParams.status = params.status;
    if (params.fromDate) queryParams.fromDate = params.fromDate;
    if (params.toDate) queryParams.toDate = params.toDate;

    return await this.get('/all', { params: queryParams });
  }

  /**
   * [Admin] Cập nhật trạng thái đơn hàng
   * @param {string} orderId - Order ID
   * @param {string} status - Trạng thái mới
   * @returns {Promise<Object>} Đơn hàng đã cập nhật
   */
  async updateOrderStatus(orderId, status) {
    return await this.patch(`/${orderId}/status`, null, {
      params: { status }
    });
  }

  /**
   * Tính tổng tiền đơn hàng
   * @param {Array} items - Danh sách sản phẩm
   * @returns {number} Tổng tiền
   */
  calculateTotal(items) {
    if (!items || !Array.isArray(items)) return 0;
    return items.reduce((sum, item) => {
      return sum + (item.price || 0) * (item.quantity || 1);
    }, 0);
  }

  /**
   * Lấy thống kê đơn hàng của user
   * @returns {Promise<Object>} Thống kê
   */
  async getOrderStats() {
    try {
      const response = await this.getMyOrders();
      const orders = response.data || [];

      const stats = {
        total: orders.length,
        pending: 0,
        confirmed: 0,
        processing: 0,
        shipped: 0,
        delivered: 0,
        cancelled: 0,
        totalSpent: 0
      };

      orders.forEach(order => {
        const status = order.status?.toLowerCase();
        if (stats[status] !== undefined) {
          stats[status]++;
        }
        if (order.status !== 'CANCELLED') {
          stats.totalSpent += order.totalAmount || 0;
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
}

export default new OrderService();
