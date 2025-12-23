import api from './api';

/**
 * Upload Service - Handles image uploads to Cloudinary via backend
 */
class UploadService {
  constructor() {
    this.baseUrl = '/upload';
  }

  /**
   * Upload single image file
   * @param {File} file - File to upload
   * @param {string} folder - Folder name (cars, categories, etc.)
   * @param {function} onProgress - Progress callback (optional)
   * @returns {Promise<string>} - URL of uploaded image
   */
  async uploadImage(file, folder = 'general', onProgress = null) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };

    if (onProgress) {
      config.onUploadProgress = (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percentCompleted);
      };
    }

    const response = await api.post(`${this.baseUrl}/image`, formData, config);
    return response.data?.url;
  }

  /**
   * Upload multiple image files
   * @param {File[]} files - Array of files to upload
   * @param {string} folder - Folder name
   * @param {function} onProgress - Progress callback (optional)
   * @returns {Promise<string[]>} - Array of URLs
   */
  async uploadImages(files, folder = 'general', onProgress = null) {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    formData.append('folder', folder);

    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };

    if (onProgress) {
      config.onUploadProgress = (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percentCompleted);
      };
    }

    const response = await api.post(`${this.baseUrl}/images`, formData, config);
    return response.data?.urls || [];
  }

  /**
   * Upload image from URL
   * @param {string} imageUrl - URL of image to upload
   * @param {string} folder - Folder name
   * @returns {Promise<string>} - URL of uploaded image on Cloudinary
   */
  async uploadFromUrl(imageUrl, folder = 'general') {
    const response = await api.post(`${this.baseUrl}/from-url`, {
      url: imageUrl,
      folder,
    });
    return response.data?.url;
  }

  /**
   * Upload multiple images from URLs
   * @param {string[]} imageUrls - Array of image URLs
   * @param {string} folder - Folder name
   * @returns {Promise<string[]>} - Array of URLs on Cloudinary
   */
  async uploadFromUrls(imageUrls, folder = 'general') {
    const response = await api.post(`${this.baseUrl}/from-urls`, {
      urls: imageUrls,
      folder,
    });
    return response.data?.urls || [];
  }

  /**
   * Delete image by URL
   * @param {string} imageUrl - URL of image to delete
   * @returns {Promise<void>}
   */
  async deleteImage(imageUrl) {
    await api.delete(`${this.baseUrl}/image`, {
      data: { url: imageUrl },
    });
  }

  /**
   * Validate file before upload
   * @param {File} file - File to validate
   * @returns {{ valid: boolean, error?: string }}
   */
  validateFile(file) {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!file) {
      return { valid: false, error: 'Vui lòng chọn file' };
    }

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Chỉ chấp nhận file ảnh (JPG, PNG, GIF, WebP)' };
    }

    if (file.size > maxSize) {
      return { valid: false, error: 'File quá lớn. Kích thước tối đa là 10MB' };
    }

    return { valid: true };
  }

  /**
   * Validate multiple files
   * @param {File[]} files - Files to validate
   * @returns {{ valid: boolean, error?: string }}
   */
  validateFiles(files) {
    if (!files || files.length === 0) {
      return { valid: false, error: 'Vui lòng chọn ít nhất 1 file' };
    }

    for (const file of files) {
      const result = this.validateFile(file);
      if (!result.valid) {
        return result;
      }
    }

    return { valid: true };
  }
}

const uploadService = new UploadService();
export default uploadService;
