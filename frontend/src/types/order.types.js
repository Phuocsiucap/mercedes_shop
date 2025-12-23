/**
 * @fileoverview Order type definitions
 * Định nghĩa các kiểu dữ liệu cho đơn hàng
 */

/**
 * Order entity
 * @typedef {Object} Order
 * @property {string} id - Order ID
 * @property {string} userId - User ID
 * @property {string} userFullName - Tên khách hàng
 * @property {string} userEmail - Email khách hàng
 * @property {string} userPhone - SĐT khách hàng
 * @property {OrderDetail[]} orderDetails - Chi tiết đơn hàng
 * @property {number} totalAmount - Tổng tiền
 * @property {string} status - Trạng thái
 * @property {string} deliveryAddress - Địa chỉ giao hàng
 * @property {string} paymentMethod - Phương thức thanh toán
 * @property {string} [notes] - Ghi chú
 * @property {string} createdAt - Ngày tạo
 * @property {string} [updatedAt] - Ngày cập nhật
 */

/**
 * Order detail
 * @typedef {Object} OrderDetail
 * @property {string} id - Detail ID
 * @property {string} orderId - Order ID
 * @property {string} carId - Car ID
 * @property {string} carName - Tên xe
 * @property {string} [carImage] - Ảnh xe
 * @property {number} quantity - Số lượng
 * @property {number} price - Đơn giá
 * @property {number} totalPrice - Thành tiền
 */

/**
 * Create order request
 * @typedef {Object} CreateOrderRequest
 * @property {string} [deliveryAddress] - Địa chỉ giao hàng
 * @property {string} [paymentMethod] - Phương thức thanh toán
 * @property {string} [notes] - Ghi chú
 */

/**
 * Update order status request
 * @typedef {Object} UpdateOrderStatusRequest
 * @property {string} status - Trạng thái mới
 */

/**
 * Order filter params
 * @typedef {Object} OrderFilterParams
 * @property {string} [status] - Lọc theo trạng thái
 * @property {string} [fromDate] - Từ ngày
 * @property {string} [toDate] - Đến ngày
 * @property {number} [page] - Trang
 * @property {number} [size] - Số lượng/trang
 * @property {string} [sortBy] - Sắp xếp theo
 * @property {string} [sortDir] - Hướng sắp xếp
 */

export const OrderStatus = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  PROCESSING: 'PROCESSING',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED'
};

export const OrderStatusDisplay = {
  PENDING: 'Chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
  PROCESSING: 'Đang xử lý',
  SHIPPED: 'Đang giao',
  DELIVERED: 'Hoàn thành',
  CANCELLED: 'Đã hủy'
};

export const PaymentMethods = {
  COD: 'COD',
  BANK_TRANSFER: 'BANK_TRANSFER',
  CREDIT_CARD: 'CREDIT_CARD'
};
