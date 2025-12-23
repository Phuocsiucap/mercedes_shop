/**
 * @fileoverview Favorite type definitions
 * Định nghĩa các kiểu dữ liệu cho yêu thích
 */

/**
 * Favorite entity
 * @typedef {Object} Favorite
 * @property {string} id - Favorite ID
 * @property {string} userId - User ID
 * @property {string} carId - Car ID
 * @property {Object} car - Thông tin xe
 * @property {string} car.id - Car ID
 * @property {string} car.name - Tên xe
 * @property {number} car.price - Giá
 * @property {string} car.image - Ảnh
 * @property {string} car.categoryName - Danh mục
 * @property {string} addedAt - Ngày thêm
 */

/**
 * Add favorite request
 * @typedef {Object} AddFavoriteRequest
 * @property {string} carId - Car ID cần thêm
 */

/**
 * Check favorite response
 * @typedef {Object} CheckFavoriteResponse
 * @property {boolean} isFavorited - Đã yêu thích chưa
 * @property {string} [favoriteId] - Favorite ID nếu đã yêu thích
 */

/**
 * Favorite filter params
 * @typedef {Object} FavoriteFilterParams
 * @property {string} [categoryId] - Lọc theo danh mục
 * @property {number} [minPrice] - Giá tối thiểu
 * @property {number} [maxPrice] - Giá tối đa
 * @property {string} [search] - Tìm kiếm
 */

export const FavoriteTypes = {
  AddFavoriteRequest: {
    carId: ''
  }
};
