import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import adminService from '../../services/adminService';
import { useApp } from '../../context/AppContext';

const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600"></div>
  </div>
);

const getStatusColorClass = (status) => {
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

const DashboardOverview = () => {
  const { formatCurrency, formatDate } = useApp();
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState({
    loading: false,
    data: null,
    error: null
  });
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setDashboard(prev => ({ ...prev, loading: true, error: null }));
      const response = await adminService.getDashboardStats();
      setDashboard(prev => ({ 
        ...prev, 
        loading: false, 
        data: response.data 
      }));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setDashboard(prev => ({ 
        ...prev, 
        loading: false, 
        error: error.message || 'Failed to load dashboard data' 
      }));
    }
  };

  const refresh = () => {
    fetchDashboardData();
  };

  const handleViewOrderDetail = (order) => {
    setSelectedOrder(order);
  };

  const handleGoToOrdersPage = (orderId) => {
    navigate(`/admin/orders?orderId=${orderId}`);
  };

  if (dashboard?.loading && !dashboard?.data) {
    return <LoadingSpinner />;
  }

  if (dashboard?.error && !dashboard?.data) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="text-red-600 text-lg">⚠️ Lỗi tải dữ liệu</div>
        <p className="text-gray-600">{dashboard.error}</p>
        <button
          onClick={refresh}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Thử lại
        </button>
      </div>
    );
  }

  const stats = dashboard?.data || {};

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Tổng Quan</h1>
        <button
          onClick={refresh}
          className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          disabled={dashboard?.loading}
        >
          {dashboard?.loading ? '🔄 Đang tải...' : '🔄 Làm mới'}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Tổng Người Dùng"
          value={stats.totalUsers}
          icon="👥"
          color="blue"
          growth={stats.usersGrowth}
        />
        <StatCard
          title="Tổng Ô Tô"
          value={stats.totalCars}
          icon="🚗"
          color="green"
        />
        <StatCard
          title="Tổng Đơn Hàng"
          value={stats.totalOrders}
          icon="📦"
          color="purple"
          growth={stats.ordersGrowth}
        />
        <StatCard
          title="Tổng Doanh Thu"
          value={formatCurrency(stats.totalRevenue)}
          icon="💰"
          color="red"
          growth={stats.revenueGrowth}
        />
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Đơn Hàng Gần Đây</h2>
          <button
            onClick={() => navigate('/admin/orders')}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Xem tất cả →
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã ĐH</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Khách Hàng</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sản Phẩm</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày Đặt</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tổng Tiền</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng Thái</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {stats.recentOrders && stats.recentOrders.length > 0 ? (
                stats.recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 text-sm font-medium text-blue-600">
                      #{order.id.slice(0, 8)}...
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      <div>
                        <p className="font-medium">{order.userName || 'N/A'}</p>
                        <p className="text-xs text-gray-400">{order.userEmail || ''}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        {order.orderDetails && order.orderDetails.length > 0 && order.orderDetails[0].carImage ? (
                          <img 
                            src={order.orderDetails[0].carImage} 
                            alt="" 
                            className="w-10 h-10 rounded object-cover"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        ) : (
                          <span className="text-lg">🚗</span>
                        )}
                        <div>
                          <p className="font-medium text-xs">
                            {order.orderDetails && order.orderDetails.length > 0 
                              ? order.orderDetails[0].carName 
                              : 'N/A'}
                          </p>
                          {order.totalItems > 1 && (
                            <p className="text-xs text-gray-400">+{order.totalItems - 1} sản phẩm khác</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {formatDate(order.orderDate)}
                    </td>
                    <td className="px-4 py-4 text-sm font-semibold text-gray-900">
                      {formatCurrency(order.totalAmount)}
                    </td>
                    <td className="px-4 py-4 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColorClass(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewOrderDetail(order)}
                          className="text-blue-600 hover:text-blue-800 text-xs font-medium px-2 py-1 bg-blue-50 rounded"
                        >
                          Chi tiết
                        </button>
                        <button
                          onClick={() => handleGoToOrdersPage(order.id)}
                          className="text-green-600 hover:text-green-800 text-xs font-medium px-2 py-1 bg-green-50 rounded"
                        >
                          Quản lý
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                    Chưa có đơn hàng nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Chi Tiết Đơn Hàng</h2>
                <p className="text-sm text-gray-500">Mã: #{selectedOrder.id}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-gray-600 text-3xl font-light"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Order Info Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-blue-600 text-xs font-medium">Khách Hàng</p>
                  <p className="font-bold text-gray-900 mt-1">{selectedOrder.userName || 'N/A'}</p>
                  <p className="text-xs text-gray-500">{selectedOrder.userEmail || ''}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-green-600 text-xs font-medium">Ngày Đặt</p>
                  <p className="font-bold text-gray-900 mt-1">{formatDate(selectedOrder.orderDate)}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-purple-600 text-xs font-medium">Tổng Tiền</p>
                  <p className="font-bold text-gray-900 mt-1">{formatCurrency(selectedOrder.totalAmount)}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-600 text-xs font-medium">Trạng Thái</p>
                  <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColorClass(selectedOrder.status)}`}>
                    {getStatusText(selectedOrder.status)}
                  </span>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-600 text-xs font-medium mb-1">📍 Địa Chỉ Giao Hàng</p>
                <p className="font-medium text-gray-900">{selectedOrder.deliveryAddress || 'Chưa cập nhật'}</p>
              </div>

              {/* Order Items */}
              <div>
                <p className="text-gray-800 font-bold mb-3">🛒 Sản Phẩm Đặt Mua ({selectedOrder.totalItems || 0} sản phẩm)</p>
                <div className="space-y-3">
                  {selectedOrder.orderDetails && selectedOrder.orderDetails.length > 0 ? (
                    selectedOrder.orderDetails.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg">
                        {item.carImage ? (
                          <img 
                            src={item.carImage} 
                            alt={item.carName}
                            className="w-20 h-20 rounded-lg object-cover border"
                            onError={(e) => { 
                              e.target.src = 'data:image/svg+xml;base64,' + btoa(`
                                <svg width="80" height="80" xmlns="http://www.w3.org/2000/svg">
                                  <rect width="100%" height="100%" fill="#f3f4f6"/>
                                  <text x="50%" y="50%" font-family="Arial" font-size="24" fill="#9ca3af" text-anchor="middle" dy=".3em">🚗</text>
                                </svg>
                              `);
                            }}
                          />
                        ) : (
                          <div className="w-20 h-20 rounded-lg bg-gray-200 flex items-center justify-center text-2xl">
                            🚗
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="font-bold text-gray-800">{item.carName || 'N/A'}</p>
                          <p className="text-sm text-gray-500">Số lượng: {item.quantity}</p>
                          <p className="text-sm text-gray-500">Đơn giá: {formatCurrency(item.unitPrice)}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-blue-600">{formatCurrency(item.subtotal)}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">Không có chi tiết sản phẩm</p>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-between items-center sticky bottom-0 bg-white">
              <button
                onClick={() => handleGoToOrdersPage(selectedOrder.id)}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-lg transition"
              >
                Đi đến Quản lý đơn hàng
              </button>
              <button
                onClick={() => setSelectedOrder(null)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold px-6 py-2 rounded-lg transition"
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

const StatCard = ({ title, value, icon, color, growth }) => {
  const colorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    purple: 'text-purple-600',
    red: 'text-red-600',
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm">{title}</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">{value}</p>
          {growth !== undefined && growth !== null && (
            <p className={`text-xs mt-1 ${growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {growth >= 0 ? '↑' : '↓'} {Math.abs(growth).toFixed(2)}%
            </p>
          )}
        </div>
        <div className={`text-4xl ${colorClasses[color]}`}>{icon}</div>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  return <DashboardOverview />;
};

export default AdminDashboard;
