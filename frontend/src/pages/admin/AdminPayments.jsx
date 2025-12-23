import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import paymentService from '../../services/paymentService';

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchPayments();
  }, [currentPage, statusFilter]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      console.log('Fetching payments...');
      
      // Fetch with larger page size to get all payments
      const response = await paymentService.getAllPayments({
        page: 0,
        size: 1000, // Get more records
        sortBy: 'createdAt',
        sortDir: 'desc'
      });
      
      console.log('Payments response:', response);
      
      // Handle different response structures
      let allPayments = [];
      if (response.success && response.data) {
        allPayments = Array.isArray(response.data) ? response.data : [];
      } else if (response.data) {
        allPayments = Array.isArray(response.data) ? response.data : [];
      } else if (Array.isArray(response)) {
        allPayments = response;
      }
      
      console.log('All payments count:', allPayments.length);
      console.log('All payments:', allPayments);
      
      let filteredPayments = [...allPayments];
      
      // Filter by status
      if (statusFilter !== 'ALL') {
        filteredPayments = filteredPayments.filter(p => p.status === statusFilter);
      }
      
      // Filter by search term
      if (searchTerm) {
        filteredPayments = filteredPayments.filter(p => 
          p.orderId?.toString().includes(searchTerm) ||
          p.transactionId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.userId?.toString().includes(searchTerm)
        );
      }
      
      console.log('Filtered payments count:', filteredPayments.length);
      
      // Pagination
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedPayments = filteredPayments.slice(startIndex, endIndex);
      
      setPayments(paginatedPayments);
      setTotalPages(Math.ceil(filteredPayments.length / itemsPerPage));
    } catch (error) {
      console.error('Error fetching payments:', error);
      console.error('Error details:', JSON.stringify({
        message: error.message,
        type: error.type,
        status: error.status,
        code: error.code,
        response: error.response,
        stack: error.stack
      }, null, 2));
      
      const errorMessage = error.message || error.type || 'Lỗi không xác định';
      toast.error('Không thể tải danh sách thanh toán: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchPayments();
  };

  const handleViewDetail = (payment) => {
    setSelectedPayment(payment);
    setShowDetailModal(true);
  };

  const handleUpdateStatus = async (paymentId, newStatus) => {
    if (!window.confirm(`Bạn có chắc muốn cập nhật trạng thái thành "${newStatus}"?`)) {
      return;
    }

    try {
      const response = await paymentService.updatePaymentStatus(paymentId, newStatus);
      
      if (response.success) {
        toast.success('Cập nhật trạng thái thành công!');
        fetchPayments(); // Reload data
        if (showDetailModal) {
          setShowDetailModal(false);
        }
      } else {
        toast.error(response.message || 'Không thể cập nhật trạng thái');
      }
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast.error('Có lỗi xảy ra khi cập nhật trạng thái');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      SUCCESS: { bg: 'bg-green-100', text: 'text-green-800', label: 'Thành công' },
      PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Đang xử lý' },
      FAILED: { bg: 'bg-red-100', text: 'text-red-800', label: 'Thất bại' },
      CANCELLED: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Đã hủy' }
    };
    
    const config = statusConfig[status] || statusConfig.PENDING;
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const getPaymentMethodBadge = (method) => {
    const methodConfig = {
      VNPAY: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'VNPay' },
      COD: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'COD' },
      BANK_TRANSFER: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Chuyển khoản' }
    };
    
    const config = methodConfig[method] || { bg: 'bg-gray-100', text: 'text-gray-800', label: method };
    
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Quản lý thanh toán</h1>
        <p className="text-gray-600">Theo dõi và quản lý tất cả giao dịch thanh toán</p>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tìm kiếm
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Tìm theo Order ID, Transaction ID, User ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleSearch}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Tìm kiếm
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trạng thái
            </label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="ALL">Tất cả</option>
              <option value="SUCCESS">Thành công</option>
              <option value="PENDING">Đang xử lý</option>
              <option value="FAILED">Thất bại</option>
              <option value="CANCELLED">Đã hủy</option>
            </select>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Số tiền
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phương thức
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày tạo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                    Không tìm thấy giao dịch nào
                  </td>
                </tr>
              ) : (
                payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{payment.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      #{payment.orderId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      #{payment.userId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {formatCurrency(payment.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {getPaymentMethodBadge(payment.paymentMethod)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {getStatusBadge(payment.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDateTime(payment.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleViewDetail(payment)}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Chi tiết
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
            <div className="text-sm text-gray-700">
              Trang <span className="font-medium">{currentPage}</span> / <span className="font-medium">{totalPages}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Trước
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Chi tiết thanh toán</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Payment Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Thông tin thanh toán</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Payment ID</p>
                    <p className="font-medium">#{selectedPayment.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Order ID</p>
                    <p className="font-medium">#{selectedPayment.orderId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">User ID</p>
                    <p className="font-medium">#{selectedPayment.userId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Số tiền</p>
                    <p className="font-semibold text-lg text-blue-600">
                      {formatCurrency(selectedPayment.amount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phương thức thanh toán</p>
                    <p className="mt-1">{getPaymentMethodBadge(selectedPayment.paymentMethod)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Trạng thái</p>
                    <p className="mt-1">{getStatusBadge(selectedPayment.status)}</p>
                  </div>
                </div>
              </div>

              {/* Transaction Info */}
              {selectedPayment.transactionId && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Thông tin giao dịch</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Transaction ID</p>
                      <p className="font-mono text-sm">{selectedPayment.transactionId}</p>
                    </div>
                    {selectedPayment.bankCode && (
                      <div>
                        <p className="text-sm text-gray-500">Ngân hàng</p>
                        <p className="font-medium">{selectedPayment.bankCode}</p>
                      </div>
                    )}
                    {selectedPayment.cardType && (
                      <div>
                        <p className="text-sm text-gray-500">Loại thẻ</p>
                        <p className="font-medium">{selectedPayment.cardType}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Thời gian</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Ngày tạo</p>
                    <p className="font-medium">{formatDateTime(selectedPayment.createdAt)}</p>
                  </div>
                  {selectedPayment.updatedAt && (
                    <div>
                      <p className="text-sm text-gray-500">Cập nhật lần cuối</p>
                      <p className="font-medium">{formatDateTime(selectedPayment.updatedAt)}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Response Data */}
              {selectedPayment.responseData && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Dữ liệu phản hồi</h3>
                  <div className="bg-gray-50 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                      {JSON.stringify(JSON.parse(selectedPayment.responseData), null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {/* Update Status */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Cập nhật trạng thái</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleUpdateStatus(selectedPayment.id, 'PENDING')}
                    disabled={selectedPayment.status === 'PENDING'}
                    className="flex-1 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Đang chờ
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedPayment.id, 'SUCCESS')}
                    disabled={selectedPayment.status === 'SUCCESS'}
                    className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Thành công
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedPayment.id, 'FAILED')}
                    disabled={selectedPayment.status === 'FAILED'}
                    className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Thất bại
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedPayment.id, 'CANCELLED')}
                    disabled={selectedPayment.status === 'CANCELLED'}
                    className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Đã hủy
                  </button>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200">
              <button
                onClick={() => setShowDetailModal(false)}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
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

export default AdminPayments;