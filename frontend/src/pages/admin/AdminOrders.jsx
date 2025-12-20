import { useState, useEffect } from 'react';
import axios from '../../api/axios';
import { FaEye, FaEdit, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import AdminFilter from '../../components/AdminFilter';
import AdminPagination from '../../components/AdminPagination';
import { useAdminFilter } from '../../hooks/useAdminFilter';
import { exportToExcel, exportConfigs } from '../../utils/exportUtils';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [pagination, setPagination] = useState({
    totalElements: 0,
    totalPages: 0,
    currentPage: 0,
    size: 10
  });

  // Filter hook
  const {
    filters,
    searchTerm,
    sortBy,
    sortDir,
    page,
    size,
    handleFilterChange,
    handleSearch,
    handleSort,
    handlePageChange,
    handleSizeChange,
    queryParams
  } = useAdminFilter();

  useEffect(() => {
    fetchOrders();
  }, [queryParams]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams(queryParams);
      const response = await axios.get(`/admin/orders?${params.toString()}`);
      
      if (response.data?.data?.content) {
        setOrders(response.data.data.content);
        setPagination({
          totalElements: response.data.data.totalElements,
          totalPages: response.data.data.totalPages,
          currentPage: response.data.data.number,
          size: response.data.data.size
        });
      } else {
        setOrders([]);
        setPagination({ totalElements: 0, totalPages: 0, currentPage: 0, size: 10 });
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setOrders([]);
      setPagination({ totalElements: 0, totalPages: 0, currentPage: 0, size: 10 });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await axios.patch(`/orders/${orderId}/status`, null, { params: { status: newStatus } });
      alert('Cập nhật trạng thái thành công');
      fetchOrders();
      setShowDetail(false);
    } catch (err) {
      console.error('Error:', err);
      alert('Có lỗi xảy ra');
    }
  };

  const handleViewDetail = (order) => {
    setSelectedOrder(order);
    setShowDetail(true);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
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

  // Filter configuration
  const filterConfig = [
    {
      key: 'status',
      label: 'Trạng thái',
      type: 'select',
      options: [
        { value: 'PENDING', label: 'Chờ Xác Nhận' },
        { value: 'DELIVERING', label: 'Đang Giao' },
        { value: 'COMPLETED', label: 'Hoàn Thành' },
        { value: 'CANCELLED', label: 'Hủy' }
      ]
    },
    {
      key: 'totalAmount',
      label: 'Tổng tiền (VND)',
      type: 'range'
    },
    {
      key: 'paymentMethod',
      label: 'Phương thức thanh toán',
      type: 'select',
      options: [
        { value: 'COD', label: 'Thanh toán khi nhận hàng' },
        { value: 'BANK_TRANSFER', label: 'Chuyển khoản' },
        { value: 'CREDIT_CARD', label: 'Thẻ tín dụng' }
      ]
    }
  ];

  const handleExport = () => {
    exportToExcel(orders, exportConfigs.orders.filename, exportConfigs.orders.headers);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Quản Lý Đơn Hàng</h1>
      </div>

      {/* Filter Component */}
      <AdminFilter
        filters={filterConfig}
        onFilterChange={handleFilterChange}
        onSearch={handleSearch}
        searchPlaceholder="Tìm kiếm theo tên khách hàng, email, địa chỉ..."
        showDateRange={true}
        showExport={true}
        onExport={handleExport}
      />

      {/* Table */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {loading ? (
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
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-blue-50 transition">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      #{order.id}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(order.orderDate).toLocaleDateString('vi-VN')}
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
            {orders.length === 0 && (
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
                    {new Date(selectedOrder.orderDate).toLocaleDateString('vi-VN')}
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

      {/* Pagination */}
      <AdminPagination
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        totalElements={pagination.totalElements}
        size={pagination.size}
        onPageChange={handlePageChange}
        onSizeChange={handleSizeChange}
      />
    </div>
  );
};

export default AdminOrders;
