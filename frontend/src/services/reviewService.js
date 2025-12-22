import { ApiService } from './api.js';

/**
 * Review service - Quản lý đánh giá
 * @typedef {import('../types/review.types.js').Review} Review
 * @typedef {import('../types/review.types.js').CreateReviewRequest} CreateReviewRequest
 * @typedef {import('../types/review.types.js').UpdateReviewRequest} UpdateReviewRequest
 */
class ReviewService extends ApiService {
  constructor() {
    super('/reviews');
  }

  /**
   * Lấy đánh giá theo xe
   * @param {string} carId - Car ID
   * @returns {Promise<Object>} Danh sách đánh giá
   */
  async getReviewsByCarId(carId) {
    return await this.get(`/car/${carId}`);
  }

  /**
   * Lấy chi tiết đánh giá
   * @param {string} reviewId - Review ID
   * @returns {Promise<Object>} Chi tiết đánh giá
   */
  async getReviewById(reviewId) {
    return await this.get(`/${reviewId}`);
  }

  /**
   * Tạo đánh giá mới
   * @param {CreateReviewRequest} reviewData - Dữ liệu đánh giá
   * @returns {Promise<Object>} Đánh giá đã tạo
   */
  async createReview(reviewData) {
    return await this.post('', reviewData);
  }

  /**
   * Cập nhật đánh giá
   * @param {string} reviewId - Review ID
   * @param {UpdateReviewRequest} reviewData - Dữ liệu cập nhật
   * @returns {Promise<Object>} Đánh giá đã cập nhật
   */
  async updateReview(reviewId, reviewData) {
    return await this.put(`/${reviewId}`, reviewData);
  }

  /**
   * Xóa đánh giá
   * @param {string} reviewId - Review ID
   * @returns {Promise<Object>} Kết quả xóa
   */
  async deleteReview(reviewId) {
    return await this.delete(`/${reviewId}`);
  }

  // ==================== ADMIN METHODS ====================

  /**
   * [Admin] Lấy tất cả đánh giá
   * @param {Object} params - Tham số lọc
   * @returns {Promise<Object>} Danh sách đánh giá
   */
  async getAllReviews(params = {}) {
    const queryParams = {
      page: params.page || 0,
      size: params.size || 10
    };

    if (params.minRating) queryParams.minRating = params.minRating;
    if (params.maxRating) queryParams.maxRating = params.maxRating;

    return await this.get('', { params: queryParams });
  }

  /**
   * Tính thống kê đánh giá cho xe
   * @param {string} carId - Car ID
   * @returns {Promise<Object>} Thống kê
   */
  async getReviewStats(carId) {
    try {
      const response = await this.getReviewsByCarId(carId);
      const reviews = response.data || [];

      if (reviews.length === 0) {
        return {
          success: true,
          data: {
            totalReviews: 0,
            averageRating: 0,
            ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
          }
        };
      }

      const totalRating = reviews.reduce((sum, r) => sum + (r.rating || 0), 0);
      const averageRating = totalRating / reviews.length;

      const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      reviews.forEach(r => {
        const rating = Math.round(r.rating || 0);
        if (rating >= 1 && rating <= 5) {
          ratingDistribution[rating]++;
        }
      });

      return {
        success: true,
        data: {
          totalReviews: reviews.length,
          averageRating: Math.round(averageRating * 10) / 10,
          ratingDistribution
        }
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Kiểm tra user đã đánh giá xe chưa
   * @param {string} carId - Car ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Kết quả kiểm tra
   */
  async hasUserReviewed(carId, userId) {
    try {
      const response = await this.getReviewsByCarId(carId);
      const reviews = response.data || [];
      const userReview = reviews.find(r => r.userId === userId);

      return {
        success: true,
        data: {
          hasReviewed: !!userReview,
          review: userReview || null
        }
      };
    } catch (error) {
      throw error;
    }
  }
}

export default new ReviewService();
