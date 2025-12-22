/**
 * @fileoverview Upload type definitions
 * Định nghĩa các kiểu dữ liệu cho upload
 */

/**
 * Upload response
 * @typedef {Object} UploadResponse
 * @property {boolean} success
 * @property {string} message
 * @property {UploadData} data
 */

/**
 * Upload data
 * @typedef {Object} UploadData
 * @property {string} url - URL của file đã upload
 * @property {string} publicId - Public ID trên Cloudinary
 * @property {string} [format] - Định dạng file
 * @property {number} [width] - Chiều rộng (nếu là ảnh)
 * @property {number} [height] - Chiều cao (nếu là ảnh)
 */

/**
 * Upload progress
 * @typedef {Object} UploadProgress
 * @property {number} loaded - Bytes đã upload
 * @property {number} total - Tổng bytes
 * @property {number} percentage - Phần trăm (0-100)
 */

/**
 * File validation result
 * @typedef {Object} FileValidationResult
 * @property {boolean} valid - File hợp lệ
 * @property {string} [error] - Lỗi nếu không hợp lệ
 */

export const UploadFolders = {
  CARS: 'cars',
  CATEGORIES: 'categories',
  USERS: 'users',
  GENERAL: 'general'
};

export const AllowedImageTypes = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp'
];

export const MaxFileSize = 10 * 1024 * 1024; // 10MB
