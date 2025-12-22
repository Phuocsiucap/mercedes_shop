import { ApiService } from './api.js';

/**
 * Category service - Quản lý danh mục
 * @typedef {import('../types/category.types.js').Category} Category
 * @typedef {import('../types/category.types.js').CreateCategoryRequest} CreateCategoryRequest
 * @typedef {import('../types/category.types.js').UpdateCategoryRequest} UpdateCategoryRequest
 */
class CategoryService extends ApiService {
  constructor() {
    super('/categories');
  }

  /**
   * Lấy tất cả danh mục
   * @returns {Promise<Object>} Danh sách danh mục
   */
  async getAllCategories() {
    return await this.get('');
  }

  /**
   * Lấy chi tiết danh mục
   * @param {string} categoryId - Category ID
   * @returns {Promise<Object>} Chi tiết danh mục
   */
  async getCategoryById(categoryId) {
    return await this.get(`/${categoryId}`);
  }

  // ==================== ADMIN METHODS ====================

  /**
   * [Admin] Tạo danh mục mới
   * @param {CreateCategoryRequest} categoryData - Dữ liệu danh mục
   * @returns {Promise<Object>} Danh mục đã tạo
   */
  async createCategory(categoryData) {
    return await this.post('', categoryData);
  }

  /**
   * [Admin] Cập nhật danh mục
   * @param {string} categoryId - Category ID
   * @param {UpdateCategoryRequest} categoryData - Dữ liệu cập nhật
   * @returns {Promise<Object>} Danh mục đã cập nhật
   */
  async updateCategory(categoryId, categoryData) {
    return await this.put(`/${categoryId}`, categoryData);
  }

  /**
   * [Admin] Xóa danh mục
   * @param {string} categoryId - Category ID
   * @returns {Promise<Object>} Kết quả xóa
   */
  async deleteCategory(categoryId) {
    return await this.delete(`/${categoryId}`);
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Lấy danh mục có xe
   * @returns {Promise<Object>} Danh sách danh mục có xe
   */
  async getCategoriesWithCars() {
    try {
      const response = await this.getAllCategories();
      const categories = response.data || [];

      const categoriesWithCars = categories.filter(c => 
        c.carCount && c.carCount > 0
      );

      return {
        success: true,
        data: categoriesWithCars
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Tìm kiếm danh mục
   * @param {string} keyword - Từ khóa
   * @returns {Promise<Object>} Kết quả tìm kiếm
   */
  async searchCategories(keyword) {
    try {
      const response = await this.getAllCategories();
      const categories = response.data || [];

      if (!keyword) {
        return response;
      }

      const keywordLower = keyword.toLowerCase();
      const filtered = categories.filter(c => 
        c.name?.toLowerCase().includes(keywordLower) ||
        c.description?.toLowerCase().includes(keywordLower)
      );

      return {
        success: true,
        data: filtered
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Lấy thống kê danh mục
   * @returns {Promise<Object>} Thống kê
   */
  async getCategoryStats() {
    try {
      const response = await this.getAllCategories();
      const categories = response.data || [];

      const totalCars = categories.reduce((sum, c) => sum + (c.carCount || 0), 0);

      return {
        success: true,
        data: {
          totalCategories: categories.length,
          totalCars,
          categoriesWithCars: categories.filter(c => c.carCount > 0).length,
          emptyCategoriesCount: categories.filter(c => !c.carCount || c.carCount === 0).length
        }
      };
    } catch (error) {
      throw error;
    }
  }
}

export default new CategoryService();
