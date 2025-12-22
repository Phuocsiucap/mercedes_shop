import { useState, useRef } from 'react';
import { FaUpload, FaLink, FaTimes, FaSpinner } from 'react-icons/fa';
import uploadService from '../../services/uploadService';

/**
 * ImageUploader Component
 * Supports both file upload and URL upload to Cloudinary
 * 
 * @param {Object} props
 * @param {string[]} props.images - Current images array
 * @param {function} props.onImagesChange - Callback when images change
 * @param {string} props.folder - Cloudinary folder name
 * @param {boolean} props.multiple - Allow multiple images
 * @param {number} props.maxImages - Maximum number of images allowed
 */
const ImageUploader = ({ 
  images = [], 
  onImagesChange, 
  folder = 'general',
  multiple = true,
  maxImages = 10 
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [urlInput, setUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef(null);

  // Handle file selection
  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Check max images limit
    if (images.length + files.length > maxImages) {
      setError(`Chỉ được upload tối đa ${maxImages} ảnh`);
      return;
    }

    // Validate files
    const validation = uploadService.validateFiles(files);
    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    setError(null);
    setUploading(true);
    setUploadProgress(0);

    try {
      const urls = await uploadService.uploadImages(files, folder, (progress) => {
        setUploadProgress(progress);
      });
      
      onImagesChange([...images, ...urls]);
    } catch (err) {
      setError(err.message || 'Upload thất bại');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Handle URL upload
  const handleUrlUpload = async () => {
    const url = urlInput.trim();
    if (!url) {
      setError('Vui lòng nhập URL ảnh');
      return;
    }

    // Check max images limit
    if (images.length >= maxImages) {
      setError(`Chỉ được upload tối đa ${maxImages} ảnh`);
      return;
    }

    // Basic URL validation
    try {
      new URL(url);
    } catch {
      setError('URL không hợp lệ');
      return;
    }

    setError(null);
    setUploading(true);

    try {
      const cloudinaryUrl = await uploadService.uploadFromUrl(url, folder);
      onImagesChange([...images, cloudinaryUrl]);
      setUrlInput('');
      setShowUrlInput(false);
    } catch (err) {
      setError(err.message || 'Upload từ URL thất bại');
    } finally {
      setUploading(false);
    }
  };

  // Handle image removal
  const handleRemoveImage = async (index) => {
    const imageUrl = images[index];
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);

    // Try to delete from Cloudinary (don't block on failure)
    try {
      await uploadService.deleteImage(imageUrl);
    } catch (err) {
      console.warn('Failed to delete image from Cloudinary:', err);
    }
  };

  // Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    );
    
    if (files.length > 0) {
      // Simulate file input change
      const dataTransfer = new DataTransfer();
      files.forEach(file => dataTransfer.items.add(file));
      if (fileInputRef.current) {
        fileInputRef.current.files = dataTransfer.files;
        handleFileSelect({ target: { files: dataTransfer.files } });
      }
    }
  };

  return (
    <div className="space-y-3">
      {/* Current Images Preview */}
      {images.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {images.map((url, index) => (
            <div key={index} className="relative group">
              <img
                src={url}
                alt={`Ảnh ${index + 1}`}
                className="w-24 h-24 object-cover rounded-lg border-2 border-gray-200"
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml;base64,' + btoa(`
                    <svg width="96" height="96" xmlns="http://www.w3.org/2000/svg">
                      <rect width="100%" height="100%" fill="#f3f4f6"/>
                      <text x="50%" y="50%" font-family="Arial" font-size="10" fill="#9ca3af" text-anchor="middle" dy=".3em">Lỗi ảnh</text>
                    </svg>
                  `);
                }}
              />
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                title="Xóa ảnh"
              >
                <FaTimes />
              </button>
              {index === 0 && (
                <span className="absolute bottom-0 left-0 right-0 bg-blue-600 text-white text-xs text-center py-0.5 rounded-b-lg">
                  Ảnh chính
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload Area */}
      {images.length < maxImages && (
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors cursor-pointer"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => !uploading && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple={multiple}
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />
          
          {uploading ? (
            <div className="space-y-2">
              <FaSpinner className="mx-auto text-3xl text-blue-600 animate-spin" />
              <p className="text-sm text-gray-600">Đang upload... {uploadProgress}%</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <FaUpload className="mx-auto text-3xl text-gray-400" />
              <p className="text-sm text-gray-600">
                Kéo thả ảnh vào đây hoặc click để chọn
              </p>
              <p className="text-xs text-gray-400">
                Hỗ trợ: JPG, PNG, GIF, WebP (tối đa 10MB)
              </p>
            </div>
          )}
        </div>
      )}

      {/* URL Upload Toggle */}
      {images.length < maxImages && (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowUrlInput(!showUrlInput)}
            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
            disabled={uploading}
          >
            <FaLink /> {showUrlInput ? 'Ẩn' : 'Thêm từ URL'}
          </button>
        </div>
      )}

      {/* URL Input */}
      {showUrlInput && images.length < maxImages && (
        <div className="flex gap-2">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="Nhập URL ảnh (https://...)"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={uploading}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleUrlUpload();
              }
            }}
          />
          <button
            type="button"
            onClick={handleUrlUpload}
            disabled={uploading || !urlInput.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {uploading ? <FaSpinner className="animate-spin" /> : 'Thêm'}
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
          {error}
        </p>
      )}

      {/* Image Count */}
      <p className="text-xs text-gray-500">
        {images.length}/{maxImages} ảnh
      </p>
    </div>
  );
};

export default ImageUploader;
