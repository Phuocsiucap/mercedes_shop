/**
 * @fileoverview Cart type definitions
 * Định nghĩa các kiểu dữ liệu cho giỏ hàng
 */

/**
 * Cart entity
 * @typedef {Object} Cart
 * @property {string} id - Cart ID
 * @property {string} userId - User ID
 * @property {CartItem[]} items - Danh sách sản phẩm
 * @property {number} totalItems - Tổng số lượng
 * @property {number} totalPrice - Tổng tiền
 * @property {string} updatedAt - Ngày cập nhật
 */

/**
 * Cart item
 * @typedef {Object} CartItem
 * @property {string} id - Cart item ID
 * @property {string} carId - Car ID
 * @property {Object} car - Thông tin xe
 * @property {string} car.id - Car ID
 * @property {string} car.name - Tên xe
 * @property {number} car.price - Giá
 * @property {string} car.image - Ảnh
 * @property {string} car.categoryName - Danh mục
 * @property {number} quantity - Số lượng
 * @property {number} price - Đơn giá
 * @property {number} totalPrice - Thành tiền
 * @property {string} addedAt - Ngày thêm
 */

/**
 * Add to cart request
 * @typedef {Object} AddToCartRequest
 * @property {string} carId - Car ID
 * @property {number} [quantity=1] - Số lượng
 */

/**
 * Update cart item request
 * @typedef {Object} UpdateCartItemRequest
 * @property {number} quantity - Số lượng mới
 */

/**
 * Checkout request
 * @typedef {Object} CheckoutRequest
 * @property {string} deliveryAddress - Địa chỉ giao hàng
 * @property {string} paymentMethod - Phương thức thanh toán
 * @property {string} [notes] - Ghi chú
 */

/**
 * Cart summary
 * @typedef {Object} CartSummary
 * @property {number} totalItems - Tổng số lượng
 * @property {number} totalPrice - Tổng tiền
 * @property {number} itemCount - Số loại sản phẩm
 * @property {boolean} isEmpty - Giỏ hàng trống
 */

export const CartTypes = {
  AddToCartRequest: {
    carId: '',
    quantity: 1
  },
  UpdateCartItemRequest: {
    quantity: 1
  },
  CheckoutRequest: {
    deliveryAddress: '',
    paymentMethod: 'COD',
    notes: ''
  }
};
