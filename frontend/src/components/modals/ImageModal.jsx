import { FaTimes, FaExpand, FaCompress } from 'react-icons/fa';
import { useState } from 'react';

/**
 * ImageModal Component
 * Modal for displaying images with zoom and navigation capabilities
 * 
 * @param {boolean} isOpen - Whether the modal is visible
 * @param {function} onClose - Function to call when modal is closed
 * @param {string} src - Image source URL
 * @param {string} alt - Image alt text
 * @param {string} title - Image title/caption
 * @param {Array} images - Array of image objects for navigation (optional)
 * @param {number} currentIndex - Current image index for navigation (optional)
 * @param {function} onNavigate - Function to call when navigating images (optional)
 */
const ImageModal = ({
  isOpen,
  onClose,
  src,
  alt = '',
  title = '',
  images = [],
  currentIndex = 0,
  onNavigate
}) => {
  const [isZoomed, setIsZoomed] = useState(false);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handlePrevious = () => {
    if (onNavigate && images.length > 1) {
      const newIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1;
      onNavigate(newIndex);
    }
  };

  const handleNext = () => {
    if (onNavigate && images.length > 1) {
      const newIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0;
      onNavigate(newIndex);
    }
  };

  const handleKeyDown = (e) => {
    switch (e.key) {
      case 'Escape':
        onClose();
        break;
      case 'ArrowLeft':
        handlePrevious();
        break;
      case 'ArrowRight':
        handleNext();
        break;
      default:
        break;
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Header Controls */}
      <div className="absolute top-4 right-4 flex gap-2 z-10">
        <button
          onClick={() => setIsZoomed(!isZoomed)}
          className="p-2 bg-black bg-opacity-50 text-white rounded-lg hover:bg-opacity-70 transition"
          aria-label={isZoomed ? 'Thu nhỏ' : 'Phóng to'}
        >
          {isZoomed ? <FaCompress /> : <FaExpand />}
        </button>
        <button
          onClick={onClose}
          className="p-2 bg-black bg-opacity-50 text-white rounded-lg hover:bg-opacity-70 transition"
          aria-label="Đóng"
        >
          <FaTimes />
        </button>
      </div>

      {/* Navigation arrows */}
      {images.length > 1 && onNavigate && (
        <>
          <button
            onClick={handlePrevious}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 p-3 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition z-10"
            aria-label="Ảnh trước"
          >
            ←
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition z-10"
            aria-label="Ảnh tiếp theo"
          >
            →
          </button>
        </>
      )}

      {/* Image Container */}
      <div className={`relative max-w-full max-h-full p-4 ${isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'}`}>
        <img
          src={src}
          alt={alt}
          className={`max-w-full max-h-full object-contain transition-transform duration-300 ${
            isZoomed ? 'scale-150' : 'scale-100'
          }`}
          onClick={() => setIsZoomed(!isZoomed)}
          onError={(e) => {
            e.target.src = 'data:image/svg+xml;base64,' + btoa(`
              <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
                <rect width="100%" height="100%" fill="#f3f4f6"/>
                <text x="50%" y="50%" font-family="Arial" font-size="48" fill="#9ca3af" text-anchor="middle" dy=".3em">🚗</text>
              </svg>
            `);
          }}
        />
        
        {/* Image Info */}
        {title && (
          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-4 text-center">
            <p className="text-sm">{title}</p>
            {images.length > 1 && (
              <p className="text-xs text-gray-300 mt-1">
                {currentIndex + 1} / {images.length}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Thumbnail Navigation */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 max-w-full overflow-x-auto p-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => onNavigate && onNavigate(index)}
              className={`flex-shrink-0 w-12 h-12 rounded border-2 overflow-hidden transition ${
                index === currentIndex 
                  ? 'border-white' 
                  : 'border-transparent opacity-60 hover:opacity-80'
              }`}
            >
              <img
                src={image.src || image}
                alt={image.alt || `Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml;base64,' + btoa(`
                    <svg width="48" height="48" xmlns="http://www.w3.org/2000/svg">
                      <rect width="100%" height="100%" fill="#f3f4f6"/>
                      <text x="50%" y="50%" font-family="Arial" font-size="12" fill="#9ca3af" text-anchor="middle" dy=".3em">🚗</text>
                    </svg>
                  `);
                }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageModal;