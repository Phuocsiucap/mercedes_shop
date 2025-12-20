import { FaTimes, FaStar, FaCalendarAlt, FaCog, FaUsers, FaPalette } from 'react-icons/fa';

const CarDetailModal = ({ car, isOpen, onClose }) => {
  if (!isOpen || !car) return null;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
          <h2 className="text-2xl font-bold text-gray-800">Chi Tiết Xe: {car.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800 text-2xl font-bold p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <FaTimes />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Image */}
            <div>
              <img
                src={car.image || '/placeholder-car.jpg'}
                alt={car.name}
                className="w-full h-64 object-cover rounded-lg shadow-md"
                onError={(e) => {
                  e.target.src = '/placeholder-car.jpg';
                }}
              />
            </div>

            {/* Basic Info */}
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">Thông Tin Cơ Bản</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">Giá:</span>
                    <p className="font-semibold text-lg text-blue-600">{formatPrice(car.price)}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Danh mục:</span>
                    <p className="font-medium">{car.category?.name || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Rating */}
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">Đánh Giá</h3>
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FaStar
                        key={star}
                        className={`${
                          star <= (car.averageRating || 0)
                            ? 'text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-semibold">{car.averageRating?.toFixed(1) || '0.0'}</span>
                  <span className="text-gray-600">({car.reviewCount || 0} đánh giá)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Technical Specs */}
          <div className="mt-6 bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FaCog className="text-blue-600" />
              Thông Số Kỹ Thuật
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <FaCalendarAlt className="text-blue-500" />
                  <span className="text-sm text-gray-600">Năm sản xuất</span>
                </div>
                <p className="font-semibold">{car.manufactureYear || '-'}</p>
              </div>
              
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <FaPalette className="text-green-500" />
                  <span className="text-sm text-gray-600">Màu sắc</span>
                </div>
                <p className="font-semibold">{car.color || '-'}</p>
              </div>
              
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <FaCog className="text-red-500" />
                  <span className="text-sm text-gray-600">Động cơ</span>
                </div>
                <p className="font-semibold">{car.engine || '-'}</p>
              </div>
              
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <FaUsers className="text-purple-500" />
                  <span className="text-sm text-gray-600">Số chỗ ngồi</span>
                </div>
                <p className="font-semibold">{car.seats || '-'}</p>
              </div>
            </div>
            
            <div className="mt-4 bg-white p-3 rounded-lg shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <FaCog className="text-orange-500" />
                <span className="text-sm text-gray-600">Hộp số</span>
              </div>
              <p className="font-semibold">{car.transmission || '-'}</p>
            </div>
          </div>

          {/* Description */}
          {car.description && (
            <div className="mt-6 bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Mô Tả</h3>
              <p className="text-gray-700 leading-relaxed">{car.description}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-end sticky bottom-0 bg-white">
          <button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default CarDetailModal;