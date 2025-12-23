import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FaEye, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import adminService from '../../services/adminService';
import { paymentService } from '../../services';
import { useApp } from '../../context/AppContext';

const AdminOrders = () => {
  const { formatCurrency, formatDate, addNotification } = useApp();
  const [searchParams] = useSearchParams();
  
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
  const [orderPayment, setOrderPayment] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [sortBy, setSortBy] = useState('orderDate');
  const [sortDir, setSortDir] = useState('DESC');

  useEffect(() => {
    fetchOrders();
  }, [filters, page, size, sortBy, sortDir]);

  // Check if there's an orderId in URL params to auto-open detail
  useEffect(() => {
    const orderId = searchParams.get('orderId');
    if (orderId && orders.content.length > 0) {
      const order = orders.content.find(o => o.id === orderId);
      if (order) {
        handleViewDetail(order);
      }
    }
  }, [searchParams, orders.content]);

  const fetchOrders = async () => {
    try {
      setOrders(prev => ({ ...prev, loading: true, error: null }));
      const response = await adminService.getAllOrders({ page, size, sortBy, sortDir: sortDir.toLowerCase(), ...filters });
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

  const fetchOrderPayment = async (orderId) => {
    try {
      const response = await paymentService.getPaymentByOrderId(orderId);
      if (response.success) {
        setOrderPayment(response.data);
      } else {
        setOrderPayment(null);
      }
    } catch (error) {
      console.error('Error fetching payment:', error);
      setOrderPayment(null);
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

  const handleViewDetail = async (order) => {
    setSelectedOrder(order);
    setOrderPayment(null);
    setShowDetail(true);
    // Fetch payment info for this order
    await fetchOrderPayment(order.id);
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
      CANCELLED: 'Đã Hủy',
    };
    return statusMap[status] || status;
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'SUCCESS':
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusText = (status) => {
    const statusMap = {
      SUCCESS: 'Đã Thanh Toán',
      COMPLETED: 'Đã Thanh Toán',
      PENDING: 'Chờ Thanh Toán',
      FAILED: 'Thất Bại',
    };
    return statusMap[status] || status || 'Chưa có';
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

      {/* Filter */}
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
            <option value="CANCELLED">Đã Hủy</option>
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
                    className="px-4 py-4 text-left text-sm font-semibold text-gray-800 cursor-pointer hover:bg-gray-200 transition"
                    onClick={() => handleSort('id')}
                  >
                    <div className="flex items-center gap-2">
                      Mã ĐH {getSortIcon('id')}
                    </div>
                  </th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-800">
                    Sản Phẩm
                  </th>
                  <th 
                    className="px-4 py-4 text-left text-sm font-semibold text-gray-800 cursor-pointer hover:bg-gray-200 transition"
                    onClick={() => handleSort('orderDate')}
                  >
                    <div className="flex items-center gap-2">
                      Ngày Đặt {getSortIcon('orderDate')}
                    </div>
                  </th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-800">
                    Khách Hàng
                  </th>
                  <th 
                    className="px-4 py-4 text-left text-sm font-semibold text-gray-800 cursor-pointer hover:bg-gray-200 transition"
                    onClick={() => handleSort('totalAmount')}
                  >
                    <div className="flex items-center gap-2">
                      Tổng Tiền {getSortIcon('totalAmount')}
                    </div>
                  </th>
                  <th 
                    className="px-4 py-4 text-left text-sm font-semibold text-gray-800 cursor-pointer hover:bg-gray-200 transition"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center gap-2">
                      Trạng Thái {getSortIcon('status')}
                    </div>
                  </th>
                  <th className="px-4 py-4 text-center text-sm font-semibold text-gray-800">
                    Thao Tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {(orders?.content || []).map((order) => (
                  <tr key={order.id} className="hover:bg-blue-50 transition">
                    <td className="px-4 py-4 text-sm font-medium text-blue-600">
                      #{order.id.slice(0, 8)}...
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      <div className="flex items-center gap-3">
                        {order.orderDetails && order.orderDetails.length > 0 && order.orderDetails[0].carImage ? (
                          <img 
                            src={order.orderDetails[0].carImage} 
                            alt="" 
                            className="w-12 h-12 rounded-lg object-cover border"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-xl">
                            🚗
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-800 text-sm">
                            {order.orderDetails && order.orderDetails.length > 0 
                              ? order.orderDetails[0].carName 
                              : 'N/A'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {order.totalItems || 0} sản phẩm
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {formatDate(order.orderDate)}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      <p className="font-medium">{order.userName || 'N/A'}</p>
                    </td>
                    <td className="px-4 py-4 text-sm font-bold text-gray-900">
                      {formatCurrency(order.totalAmount)}
                    </td>
                    <td className="px-4 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-center">
                      <button
                        onClick={() => handleViewDetail(order)}
                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-100 p-2 rounded-lg transition flex items-center gap-1 font-semibold mx-auto"
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

      {/* Detail Modal - Larger Size */}
      {showDetail && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Chi Tiết Đơn Hàng</h2>
                <p className="text-sm text-gray-500">Mã đơn hàng: <span className="font-mono text-blue-600">{selectedOrder.id}</span></p>
              </div>
              <button
                onClick={() => setShowDetail(false)}
                className="text-gray-400 hover:text-gray-600 text-3xl font-light"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Order Info Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-blue-600 text-xs font-medium">👤 Khách Hàng</p>
                  <p className="font-bold text-gray-900 mt-1">{selectedOrder.userName || 'N/A'}</p>
                  <p className="text-xs text-gray-500">{selectedOrder.userEmail || ''}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-green-600 text-xs font-medium">📅 Ngày Đặt</p>
                  <p className="font-bold text-gray-900 mt-1">{formatDate(selectedOrder.orderDate)}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-purple-600 text-xs font-medium">💰 Tổng Tiền</p>
                  <p className="font-bold text-gray-900 mt-1 text-lg">{formatCurrency(selectedOrder.totalAmount)}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-600 text-xs font-medium">📦 Trạng Thái Đơn</p>
                  <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedOrder.status)}`}>
                    {getStatusText(selectedOrder.status)}
                  </span>
                </div>
              </div>

              {/* Payment Info */}
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <p className="text-yellow-700 text-sm font-bold mb-2">💳 Thông Tin Thanh Toán</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Mã Thanh Toán</p>
                    <p className="font-mono text-sm font-medium text-gray-800">
                      {orderPayment?.id ? `#${orderPayment.id.slice(0, 12)}...` : 'Chưa có'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Phương Thức</p>
                    <p className="font-medium text-gray-800">
                      {orderPayment?.paymentMethod || selectedOrder.paymentMethod || 'COD'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Số Tiền</p>
                    <p className="font-medium text-gray-800">
                      {orderPayment?.amount ? formatCurrency(orderPayment.amount) : formatCurrency(selectedOrder.totalAmount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Trạng Thái TT</p>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${getPaymentStatusColor(orderPayment?.status)}`}>
                      {getPaymentStatusText(orderPayment?.status)}
                    </span>
                  </div>
                </div>
                {orderPayment?.transactionNo && (
                  <div className="mt-3 pt-3 border-t border-yellow-200">
                    <p className="text-xs text-gray-500">Mã Giao Dịch VNPay</p>
                    <p className="font-mono text-sm font-medium text-gray-800">{orderPayment.transactionNo}</p>
                  </div>
                )}
              </div>

              {/* Delivery Address */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-600 text-xs font-medium mb-1">📍 Địa Chỉ Giao Hàng</p>
                <p className="font-medium text-gray-900">{selectedOrder.deliveryAddress || 'Chưa cập nhật'}</p>
              </div>

              {/* Order Items with Images */}
              <div>
                <p className="text-gray-800 font-bold mb-3">🛒 Chi Tiết Sản Phẩm ({selectedOrder.totalItems || selectedOrder.orderDetails?.length || 0} sản phẩm)</p>
                <div className="space-y-4">
                  {selectedOrder.orderDetails && selectedOrder.orderDetails.length > 0 ? (
                    selectedOrder.orderDetails.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-4 bg-white border border-gray-200 p-4 rounded-xl shadow-sm">
                        {item.carImage ? (
                          <img 
                            src={item.carImage} 
                            alt={item.carName}
                            className="w-24 h-24 rounded-lg object-cover border"
                            onError={(e) => { 
                              e.target.src = 'data:image/svg+xml;base64,' + btoa(`
                                <svg width="96" height="96" xmlns="http://www.w3.org/2000/svg">
                                  <rect width="100%" height="100%" fill="#f3f4f6"/>
                                  <text x="50%" y="50%" font-family="Arial" font-size="32" fill="#9ca3af" text-anchor="middle" dy=".3em">🚗</text>
                                </svg>
                              `);
                            }}
                          />
                        ) : (
                          <div className="w-24 h-24 rounded-lg bg-gray-100 flex items-center justify-center text-3xl border">
                            🚗
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="font-bold text-gray-800 text-lg">{item.carName || 'N/A'}</p>
                          <div className="flex gap-4 mt-2 text-sm text-gray-500">
                            <span>Số lượng: <strong className="text-gray-800">{item.quantity}</strong></span>
                            <span>Đơn giá: <strong className="text-gray-800">{formatCurrency(item.unitPrice)}</strong></span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Thành tiền</p>
                          <p className="font-bold text-blue-600 text-xl">{formatCurrency(item.subtotal)}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-8 bg-gray-50 rounded-lg">Không có chi tiết sản phẩm</p>
                  )}
                </div>
              </div>

              {/* Status Change */}
              {selectedOrder.status !== 'COMPLETED' && selectedOrder.status !== 'CANCELLED' && (
                <div className="border-t border-gray-200 pt-4">
                  <p className="text-sm font-bold text-gray-800 mb-2">⚙️ Cập Nhật Trạng Thái Đơn Hàng</p>
                  <select
                    defaultValue={selectedOrder.status}
                    onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-lg"
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
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition text-lg"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      {orders.totalPages > 1 && (
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">
              Hiển thị {orders.content.length} / {orders.totalElements} đơn hàng
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(Math.max(0, page - 1))}
                disabled={page === 0}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-300 transition"
              >
                ← Trước
              </button>
              <span className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium">
                {page + 1} / {orders.totalPages}
              </span>
              <button
                onClick={() => handlePageChange(Math.min(orders.totalPages - 1, page + 1))}
                disabled={page >= orders.totalPages - 1}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-300 transition"
              >
                Sau →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
