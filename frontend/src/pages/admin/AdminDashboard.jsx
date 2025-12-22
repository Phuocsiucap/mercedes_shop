import { useState, useEffect } from 'react';
import adminService from '../../services/adminService';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';

const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600"></div>
  </div>
);

/**
 * Get status color class for order status
 */
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

/**
 * Dashboard Overview Component
 * Displays summary statistics and recent orders
 * Uses new adminService for data management
 */
const DashboardOverview = () => {
  const { formatCurrency, formatDate } = useApp();
  const [dashboard, setDashboard] = useState({
    loading: false,
    data: null,
    error: null
  });

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
        <h2 className="text-xl font-bold text-gray-800 mb-4">Đơn Hàng Gần Đây</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Khách Hàng</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày Đặt</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tổng Tiền</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng Thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {stats.recentOrders && stats.recentOrders.length > 0 ? (
                stats.recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">#{order.id.slice(0, 8)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{order.userName}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(order.orderDate)}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      {formatCurrency(order.totalAmount)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColorClass(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    Chưa có đơn hàng nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

/**
 * Reusable stat card component
 */
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

/**
 * Main AdminDashboard Component with AdminLayout
 */
const AdminDashboard = () => {
  return <DashboardOverview />;
};

export default AdminDashboard;