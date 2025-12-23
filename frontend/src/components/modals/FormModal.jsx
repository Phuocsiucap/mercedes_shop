import { FaTimes } from 'react-icons/fa';

/**
 * FormModal Component
 * Reusable modal for forms with consistent styling and behavior
 * 
 * @param {boolean} isOpen - Whether the modal is visible
 * @param {function} onClose - Function to call when modal is closed
 * @param {string} title - Modal title
 * @param {ReactNode} children - Form content
 * @param {string} size - Modal size: 'sm', 'md', 'lg', 'xl' (default: 'md')
 * @param {boolean} closeOnBackdrop - Whether to close on backdrop click (default: true)
 */
const FormModal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  closeOnBackdrop = true
}) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl'
  };

  const handleBackdropClick = (e) => {
    if (closeOnBackdrop && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
    >
      <div className={`bg-white rounded-lg shadow-xl w-full transform transition-all ${sizeClasses[size]}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-800">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition p-1"
            aria-label="Đóng"
          >
            <FaTimes />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default FormModal;