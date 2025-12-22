import { useState, useEffect } from 'react';
import { FaEye, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import adminService from '../../services/adminService';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';

const AdminOrders = () => {
  const { formatCurrency, formatDate, addNotification } = useApp();
  
  const [orders, setOrders] = useState({
    content: [],
    totalElements: 0,
    totalPages: 0,
    number: 0,
    size: 10,
    loading: false,
    error: null
  });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [sortBy, setSortBy] = useState('orderDate');
  const [sortDir, setSortDir] = useState('DESC');

  useEffect(() => {
    fetchOrders();
  }, [filters, page, size, sortBy, sortDir]);

  const fetchOrders = async () => {
    try {
      setOrders(prev => ({ ...prev, loading: true, error: null }));
      const params = { ...filters, page, size, sortBy, sortDir };
      const response = await adminService.getAllOrders(params);
      setOrders(prev => ({
        ...prev,
        loading: false,
        content: response.data?.content || [],
        totalElements: response.data?.totalElements || 0,
        totalPages: response.data?.totalPages || 0,
        number: response.data?.number || 0,
        size: response.data?.size || 10
      }));
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to load orders'
      }));
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await adminService.updateOrderStatus(orderId, newStatus);
      addNotification({
        type: 'success',
        title: 'Thành công',
        message: 'Cập nhật trạng thái thành công'
      });
      setShowDetail(false);
      fetchOrders();
    } catch (err) {
      console.error('Error:', err);
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: err.message || 'Có lỗi xảy ra'
      });
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPage(0);
  };

  const handleSearch = (searchTerm) => {
    setFilters({ ...filters, keyword: searchTerm });
    setPage(0);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDir(sortDir === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(field);
      setSortDir('ASC');
    }
    setPage(0);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleSizeChange = (newSize) => {
    setSize(newSize);
    setPage(0);
  };

  const handleViewDetail = (order) => {
    setSelectedOrder(order);
    setShowDetail(true);
  };

  const formatPrice = (price) => {
    return formatCurrency(price);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'DELIVERING':
        return 'bg-blue-100 text-blue-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      PENDING: 'Chờ Xác Nhận',
      DELIVERING: 'Đang Giao',
      COMPLETED: 'Hoàn Thành',
      CANCELLED: 'Hủy',
    };
    return statusMap[status] || status;
  };

  const getSortIcon = (field) => {
    if (sortBy !== field) return <FaSort className="opacity-50" />;
    return sortDir === 'ASC' ? <FaSortUp /> : <FaSortDown />;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Quản Lý Đơn Hàng</h1>
      </div>

      {/* Filter Component - Simplified */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex gap-4 items-center">
          <input
            type="text"
            placeholder="Tìm kiếm đơn hàng..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => handleSearch(e.target.value)}
          />
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => handleFilterChange({ status: e.target.value })}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="PENDING">Chờ Xác Nhận</option>
            <option value="DELIVERING">Đang Giao</option>
            <option value="COMPLETED">Hoàn Thành</option>
            <option value="CANCELLED">Hủy</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {orders?.loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b-2 border-gray-300">
                <tr>
                  <th 
                    className="px-6 py-4 text-left text-sm font-semibold text-gray-800 cursor-pointer hover:bg-gray-200 transition"
                    onClick={() => handleSort('id')}
                  >
                    <div className="flex items-center gap-2">
                      ID {getSortIcon('id')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-4 text-left text-sm font-semibold text-gray-800 cursor-pointer hover:bg-gray-200 transition"
                    onClick={() => handleSort('orderDate')}
                  >
                    <div className="flex items-center gap-2">
                      Ngày Đặt {getSortIcon('orderDate')}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">
                    Khách Hàng
                  </th>
                  <th 
                    className="px-6 py-4 text-left text-sm font-semibold text-gray-800 cursor-pointer hover:bg-gray-200 transition"
                    onClick={() => handleSort('totalAmount')}
                  >
                    <div className="flex items-center gap-2">
                      Tổng Tiền {getSortIcon('totalAmount')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-4 text-left text-sm font-semibold text-gray-800 cursor-pointer hover:bg-gray-200 transition"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center gap-2">
                      Trạng Thái {getSortIcon('status')}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">
                    Thông Tin
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">
                    Hành Động
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {/* Backend trả về Page<AdminOrderResponse> với structure:
                    {
                      content: [...],
                      totalElements: number,
                      totalPages: number,
                      number: number (current page),
                      size: number
                    }
                */}
                {(orders?.content || []).map((order) => (
                  <tr key={order.id} className="hover:bg-blue-50 transition">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      #{order.id}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(order.orderDate)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {order.userName || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      {formatPrice(order.totalAmount)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">
                            {order.totalItems || 0} sản phẩm
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {order.daysSinceOrder} ngày trước
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => handleViewDetail(order)}
                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-100 p-2 rounded-lg transition flex items-center gap-1 font-semibold"
                      >
                        <FaEye /> Chi Tiết
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(orders?.content || []).length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg">Không có đơn hàng nào</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetail && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-lg font-bold text-gray-800">Chi Tiết Đơn Hàng #{selectedOrder.id}</h2>
              <button
                onClick={() => setShowDetail(false)}
                className="text-gray-600 hover:text-gray-800 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Order Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-600 text-sm">Ngày Đặt</p>
                  <p className="font-semibold text-gray-900">
                    {formatDate(selectedOrder.orderDate)}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-600 text-sm">Tổng Tiền</p>
                  <p className="font-semibold text-gray-900">
                    {formatPrice(selectedOrder.totalAmount)}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-600 text-sm">Khách Hàng</p>
                  <p className="font-semibold text-gray-900">
                    {selectedOrder.userName}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-600 text-sm">Trạng Thái</p>
                  <p className={`font-semibold inline-block px-3 py-1 rounded-full text-sm ${getStatusColor(selectedOrder.status)}`}>
                    {getStatusText(selectedOrder.status)}
                  </p>
                </div>
              </div>

              {/* Address */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-600 text-sm">Địa Chỉ Giao</p>
                <p className="font-semibold text-gray-900">
                  {selectedOrder.deliveryAddress || 'Chưa cập nhật'}
                </p>
              </div>

              {/* Items */}
              <div>
                <p className="text-gray-600 text-sm mb-2 font-semibold">Chi Tiết Đơn Hàng</p>
                <div className="space-y-2">
                  {selectedOrder.orderDetails && selectedOrder.orderDetails.length > 0 ? (
                    selectedOrder.orderDetails.map((item, idx) => (
                      <div key={idx} className="bg-gray-50 p-3 rounded-lg">
                        <p className="font-semibold text-gray-800">{item.carName || 'N/A'}</p>
                        <p className="text-sm text-gray-600">
                          Số lượng: {item.quantity} - Giá: {formatPrice(item.unitPrice)} - Tổng: {formatPrice(item.subtotal)}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">Chưa có chi tiết đơn hàng</p>
                  )}
                </div>
              </div>

              {/* Status Change */}
              {selectedOrder.status !== 'COMPLETED' && selectedOrder.status !== 'CANCELLED' && (
                <div className="border-t border-gray-200 pt-4">
                  <p className="text-sm font-semibold text-gray-800 mb-2">Cập Nhật Trạng Thái</p>
                  <select
                    defaultValue={selectedOrder.status}
                    onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="PENDING">Chờ Xác Nhận</option>
                    <option value="DELIVERING">Đang Giao</option>
                    <option value="COMPLETED">Hoàn Thành</option>
                    <option value="CANCELLED">Hủy</option>
                  </select>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end sticky bottom-0 bg-white">
              <button
                onClick={() => setShowDetail(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pagination - Simplified */}
      {orders.totalPages > 1 && (
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">
              Hiển thị {orders.content.length} / {orders.totalElements} kết quả
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(Math.max(0, page - 1))}
                disabled={page === 0}
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
              >
                Trước
              </button>
              <span className="px-3 py-1 bg-blue-600 text-white rounded">
                {page + 1} / {orders.totalPages}
              </span>
              <button
                onClick={() => handlePageChange(Math.min(orders.totalPages - 1, page + 1))}
                disabled={page >= orders.totalPages - 1}
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
              >
                Sau
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
