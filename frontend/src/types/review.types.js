/**
 * @fileoverview Review type definitions
 * Định nghĩa các kiểu dữ liệu cho đánh giá
 */

/**
 * Review entity
 * @typedef {Object} Review
 * @property {string} id - Review ID
 * @property {string} carId - Car ID
 * @property {string} userId - User ID
 * @property {string} userName - Tên người đánh giá
 * @property {string} [userAvatar] - Avatar người đánh giá
 * @property {number} rating - Điểm đánh giá (1-5)
 * @property {string} [comment] - Nội dung đánh giá
 * @property {string} createdAt - Ngày tạo
 * @property {string} [updatedAt] - Ngày cập nhật
 */

/**
 * Create review request
 * @typedef {Object} CreateReviewRequest
 * @property {string} carId - Car ID
 * @property {number} rating - Điểm đánh giá (1-5)
 * @property {string} [comment] - Nội dung đánh giá
 */

/**
 * Update review request
 * @typedef {Object} UpdateReviewRequest
 * @property {number} [rating] - Điểm đánh giá mới
 * @property {string} [comment] - Nội dung mới
 */

/**
 * Review filter params
 * @typedef {Object} ReviewFilterParams
 * @property {string} [carId] - Lọc theo xe
 * @property {number} [minRating] - Điểm tối thiểu
 * @property {number} [maxRating] - Điểm tối đa
 * @property {number} [page] - Trang
 * @property {number} [size] - Số lượng/trang
 */

/**
 * Review statistics
 * @typedef {Object} ReviewStats
 * @property {number} totalReviews - Tổng số đánh giá
 * @property {number} averageRating - Điểm trung bình
 * @property {Object} ratingDistribution - Phân bố điểm
 */

export const ReviewTypes = {
  CreateReviewRequest: {
    carId: '',
    rating: 5,
    comment: ''
  },
  UpdateReviewRequest: {
    rating: 5,
    comment: ''
  }
};

export const RatingValues = [1, 2, 3, 4, 5];
