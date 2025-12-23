import { useState, useEffect } from 'react';
import { FaTrash, FaStar, FaEye, FaSearch } from 'react-icons/fa';
import reviewService from '../../services/reviewService';
import { useApp } from '../../context/AppContext';

const AdminReviews = () => {
  const { addNotification } = useApp();
  
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [selectedReview, setSelectedReview] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [filters, setFilters] = useState({
    keyword: '',
    rating: '',
    carId: ''
  });

  useEffect(() => {
    fetchReviews();
  }, [page, filters]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await reviewService.getAllReviews({ page, size: 10 });
      
      let reviewData = response.data?.content || response.data || [];
      
      // Filter locally if needed
      if (filters.keyword) {
        reviewData = reviewData.filter(r => 
          r.content?.toLowerCase().includes(filters.keyword.toLowerCase()) ||
          r.userName?.toLowerCase().includes(filters.keyword.toLowerCase()) ||
          r.carName?.toLowerCase().includes(filters.keyword.toLowerCase())
        );
      }
      if (filters.rating) {
        reviewData = reviewData.filter(r => r.rating === parseInt(filters.rating));
      }
      
      setReviews(reviewData);
      setTotalPages(response.data?.totalPages || 1);
      setTotalElements(response.data?.totalElements || reviewData.length);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError(err.message || 'Không thể tải danh sách đánh giá');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) return;
    
    try {
      await reviewService.deleteReview(reviewId);
      addNotification({
        type: 'success',
        title: 'Thành công',
        message: 'Đã xóa đánh giá'
      });
      fetchReviews();
    } catch (err) {
      console.error('Error deleting review:', err);
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: err.message || 'Không thể xóa đánh giá'
      });
    }
  };

  const handleViewDetail = (review) => {
    setSelectedReview(review);
    setShowDetail(true);
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <FaStar
        key={i}
        className={i < rating ? 'text-yellow-400' : 'text-gray-300'}
      />
    ));
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const clearFilters = () => {
    setFilters({ keyword: '', rating: '', carId: '' });
    setPage(0);
  };

  if (loading && reviews.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Quản Lý Đánh Giá</h1>
        <div className="text-sm text-gray-600">
          Tổng: {totalElements} đánh giá
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Bộ lọc</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tìm kiếm
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Nội dung, người dùng, xe..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.keyword}
                onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Số sao
            </label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.rating}
              onChange={(e) => setFilters({ ...filters, rating: e.target.value })}
            >
              <option value="">Tất cả</option>
              <option value="5">5 sao</option>
              <option value="4">4 sao</option>
              <option value="3">3 sao</option>
              <option value="2">2 sao</option>
              <option value="1">1 sao</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition font-semibold"
            >
              Xóa bộ lọc
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Reviews Table */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100 border-b-2 border-gray-300">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">
                  Người đánh giá
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">
                  Xe
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">
                  Đánh giá
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">
                  Nội dung
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">
                  Ngày tạo
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {reviews.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    Chưa có đánh giá nào
                  </td>
                </tr>
              ) : (
                reviews.map((review) => (
                  <tr key={review.id} className="hover:bg-blue-50 transition">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-800">
                        {review.userName || 'Ẩn danh'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {review.userEmail || ''}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-800">
                        {review.carName || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        {renderStars(review.rating)}
                        <span className="ml-2 text-sm text-gray-600">
                          ({review.rating}/5)
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600 max-w-xs truncate">
                        {review.content || review.comment || 'Không có nội dung'}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(review.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewDetail(review)}
                          className="text-green-600 hover:text-green-800 hover:bg-green-100 p-2 rounded-lg transition"
                          title="Xem chi tiết"
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => handleDelete(review.id)}
                          className="text-red-600 hover:text-red-800 hover:bg-red-100 p-2 rounded-lg transition"
                          title="Xóa"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            ← Trước
          </button>
          <span className="px-4 py-2 text-gray-600">
            Trang {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Sau →
          </button>
        </div>
      )}

      {/* Detail Modal */}
      {showDetail && selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-lg w-full">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-800">Chi tiết đánh giá</h2>
              <button
                onClick={() => setShowDetail(false)}
                className="text-gray-600 hover:text-gray-800 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-gray-500">Người đánh giá</p>
                <p className="font-medium">{selectedReview.userName || 'Ẩn danh'}</p>
                {selectedReview.userEmail && (
                  <p className="text-sm text-gray-500">{selectedReview.userEmail}</p>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-500">Xe</p>
                <p className="font-medium">{selectedReview.carName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Đánh giá</p>
                <div className="flex items-center gap-1 mt-1">
                  {renderStars(selectedReview.rating)}
                  <span className="ml-2 font-medium">{selectedReview.rating}/5</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Nội dung</p>
                <p className="mt-1 text-gray-800 whitespace-pre-wrap">
                  {selectedReview.content || selectedReview.comment || 'Không có nội dung'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Ngày tạo</p>
                <p className="font-medium">{formatDate(selectedReview.createdAt)}</p>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => {
                  handleDelete(selectedReview.id);
                  setShowDetail(false);
                }}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition font-semibold"
              >
                Xóa đánh giá
              </button>
              <button
                onClick={() => setShowDetail(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition font-semibold"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReviews;
