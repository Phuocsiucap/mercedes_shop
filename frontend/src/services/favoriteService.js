import { ApiService } from './api.js';

/**
 * Favorite service - Quản lý yêu thích
 * @typedef {import('../types/favorite.types.js').Favorite} Favorite
 * @typedef {import('../types/favorite.types.js').AddFavoriteRequest} AddFavoriteRequest
 */
class FavoriteService extends ApiService {
  constructor() {
    super('/favorites');
  }

  /**
   * Lấy danh sách yêu thích của user
   * @returns {Promise<Object>} Danh sách yêu thích
   */
  async getMyFavorites() {
    return await this.get('');
  }

  /**
   * Thêm xe vào yêu thích
   * @param {string} carId - Car ID
   * @returns {Promise<Object>} Favorite đã thêm
   */
  async addFavorite(carId) {
    return await this.post(`/car/${carId}`);
  }

  /**
   * Xóa khỏi yêu thích theo favorite ID
   * @param {string} favoriteId - Favorite ID
   * @returns {Promise<Object>} Kết quả xóa
   */
  async removeFavorite(favoriteId) {
    return await this.delete(`/${favoriteId}`);
  }

  /**
   * Xóa khỏi yêu thích theo car ID
   * @param {string} carId - Car ID
   * @returns {Promise<Object>} Kết quả xóa
   */
  async removeFavoriteByCarId(carId) {
    return await this.delete(`/car/${carId}`);
  }

  /**
   * Kiểm tra xe đã được yêu thích chưa
   * @param {string} carId - Car ID
   * @returns {Promise<Object>} Kết quả kiểm tra
   */
  async checkFavorite(carId) {
    return await this.get(`/car/${carId}/check`);
  }

  /**
   * Toggle trạng thái yêu thích
   * @param {string} carId - Car ID
   * @returns {Promise<Object>} Kết quả toggle
   */
  async toggleFavorite(carId) {
    try {
      const checkResponse = await this.checkFavorite(carId);
      const isFavorited = checkResponse.data;

      if (isFavorited) {
        await this.removeFavoriteByCarId(carId);
        return {
          success: true,
          data: { isFavorited: false },
          message: 'Đã xóa khỏi yêu thích'
        };
      } else {
        await this.addFavorite(carId);
        return {
          success: true,
          data: { isFavorited: true },
          message: 'Đã thêm vào yêu thích'
        };
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Lấy số lượng yêu thích
   * @returns {Promise<Object>} Số lượng
   */
  async getFavoriteCount() {
    try {
      const response = await this.getMyFavorites();
      const favorites = response.data || [];

      return {
        success: true,
        data: favorites.length
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Tìm kiếm trong danh sách yêu thích
   * @param {Object} params - Tham số tìm kiếm
   * @returns {Promise<Object>} Kết quả tìm kiếm
   */
  async searchFavorites(params = {}) {
    try {
      const response = await this.getMyFavorites();
      let favorites = response.data || [];

      // Lọc theo category
      if (params.categoryId) {
        favorites = favorites.filter(f => 
          f.car?.categoryId === params.categoryId
        );
      }

      // Lọc theo giá
      if (params.minPrice !== undefined) {
        favorites = favorites.filter(f => 
          (f.car?.price || 0) >= params.minPrice
        );
      }

      if (params.maxPrice !== undefined) {
        favorites = favorites.filter(f => 
          (f.car?.price || 0) <= params.maxPrice
        );
      }

      // Tìm kiếm theo tên
      if (params.search) {
        const searchLower = params.search.toLowerCase();
        favorites = favorites.filter(f => 
          f.car?.name?.toLowerCase().includes(searchLower)
        );
      }

      return {
        success: true,
        data: favorites,
        message: `Tìm thấy ${favorites.length} kết quả`
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Xóa nhiều yêu thích
   * @param {string[]} carIds - Danh sách Car ID
   * @returns {Promise<Object>} Kết quả xóa
   */
  async removeMultipleFavorites(carIds) {
    try {
      const promises = carIds.map(carId => this.removeFavoriteByCarId(carId));
      await Promise.all(promises);

      return {
        success: true,
        message: `Đã xóa ${carIds.length} xe khỏi yêu thích`
      };
    } catch (error) {
      throw error;
    }
  }
}

export default new FavoriteService();
