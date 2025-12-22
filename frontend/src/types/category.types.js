/**
 * @fileoverview Category type definitions
 * Định nghĩa các kiểu dữ liệu cho danh mục
 */

/**
 * Category entity
 * @typedef {Object} Category
 * @property {string} id - Category ID
 * @property {string} name - Tên danh mục
 * @property {string} [description] - Mô tả
 * @property {string} [image] - Ảnh danh mục
 * @property {number} [carCount] - Số lượng xe
 * @property {string} createdAt - Ngày tạo
 * @property {string} [updatedAt] - Ngày cập nhật
 */

/**
 * Create category request
 * @typedef {Object} CreateCategoryRequest
 * @property {string} name - Tên danh mục
 * @property {string} [description] - Mô tả
 * @property {string} [image] - URL ảnh
 */

/**
 * Update category request
 * @typedef {Object} UpdateCategoryRequest
 * @property {string} [name] - Tên mới
 * @property {string} [description] - Mô tả mới
 * @property {string} [image] - URL ảnh mới
 */

export const CategoryTypes = {
  CreateCategoryRequest: {
    name: '',
    description: '',
    image: ''
  },
  UpdateCategoryRequest: {
    name: '',
    description: '',
    image: ''
  }
};
