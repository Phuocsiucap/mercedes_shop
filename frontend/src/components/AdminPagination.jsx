import { FaChevronLeft, FaChevronRight, FaAngleDoubleLeft, FaAngleDoubleRight } from 'react-icons/fa';

const AdminPagination = ({ 
  currentPage = 0, 
  totalPages = 0, 
  totalElements = 0,
  size = 10,
  onPageChange,
  onSizeChange,
  showSizeSelector = true,
  sizeOptions = [5, 10, 20, 50, 100]
}) => {
  if (totalPages <= 1) return null;

  const startItem = currentPage * size + 1;
  const endItem = Math.min((currentPage + 1) * size, totalElements);

  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(0, currentPage - delta); 
         i <= Math.min(totalPages - 1, currentPage + delta); 
         i++) {
      range.push(i);
    }

    if (range[0] > 0) {
      if (range[0] > 1) {
        rangeWithDots.push(0, '...');
      } else {
        rangeWithDots.push(0);
      }
    }

    rangeWithDots.push(...range);

    if (range[range.length - 1] < totalPages - 1) {
      if (range[range.length - 1] < totalPages - 2) {
        rangeWithDots.push('...', totalPages - 1);
      } else {
        rangeWithDots.push(totalPages - 1);
      }
    }

    return rangeWithDots;
  };

  return (
    <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
      <div className="flex items-center justify-between">
        {/* Info */}
        <div className="flex items-center text-sm text-gray-700">
          <span>
            Hiển thị <span className="font-medium">{startItem}</span> đến{' '}
            <span className="font-medium">{endItem}</span> trong{' '}
            <span className="font-medium">{totalElements}</span> kết quả
          </span>
          
          {showSizeSelector && (
            <div className="ml-4 flex items-center">
              <label className="mr-2 text-sm text-gray-600">Hiển thị:</label>
              <select
                value={size}
                onChange={(e) => onSizeChange && onSizeChange(parseInt(e.target.value))}
                className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {sizeOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="flex items-center space-x-1">
          {/* First Page */}
          <button
            onClick={() => onPageChange && onPageChange(0)}
            disabled={currentPage === 0}
            className={`p-2 rounded-lg ${
              currentPage === 0
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
            }`}
            title="Trang đầu"
          >
            <FaAngleDoubleLeft />
          </button>

          {/* Previous Page */}
          <button
            onClick={() => onPageChange && onPageChange(currentPage - 1)}
            disabled={currentPage === 0}
            className={`p-2 rounded-lg ${
              currentPage === 0
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
            }`}
            title="Trang trước"
          >
            <FaChevronLeft />
          </button>

          {/* Page Numbers */}
          {getVisiblePages().map((page, index) => (
            <button
              key={index}
              onClick={() => typeof page === 'number' && onPageChange && onPageChange(page)}
              disabled={page === '...'}
              className={`px-3 py-2 rounded-lg text-sm font-medium ${
                page === currentPage
                  ? 'bg-blue-600 text-white'
                  : page === '...'
                  ? 'text-gray-400 cursor-default'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              {typeof page === 'number' ? page + 1 : page}
            </button>
          ))}

          {/* Next Page */}
          <button
            onClick={() => onPageChange && onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages - 1}
            className={`p-2 rounded-lg ${
              currentPage >= totalPages - 1
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
            }`}
            title="Trang sau"
          >
            <FaChevronRight />
          </button>

          {/* Last Page */}
          <button
            onClick={() => onPageChange && onPageChange(totalPages - 1)}
            disabled={currentPage >= totalPages - 1}
            className={`p-2 rounded-lg ${
              currentPage >= totalPages - 1
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
            }`}
            title="Trang cuối"
          >
            <FaAngleDoubleRight />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminPagination;