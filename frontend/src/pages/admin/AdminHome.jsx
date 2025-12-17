import { useState, useEffect } from 'react';
import axios from '../../api/axios';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';

const AdminHome = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCars: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // helper để xác định số lượng từ nhiều dạng response khác nhau
  const extractCount = (res) => {
    if (!res) return 0;
    const d = res.data;
    if (!d) return 0;
    if (Array.isArray(d)) return d.length;
    if (Array.isArray(d.data)) return d.data.length;
    if (d.data && Array.isArray(d.data.content)) return d.data.content.length;
    if (Array.isArray(d.content)) return d.content.length;
    if (typeof d.total === 'number') return d.total;
    if (typeof d.totalItems === 'number') return d.totalItems;
    if (typeof d.count === 'number') return d.count;
    return 0;
  };

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [users, cars, orders] = await Promise.all([
        axios.get('/users'),
        axios.get('/cars'),
        axios.get('/orders'),
      ]);

      const carsCount = extractCount(cars);
      const ordersData = orders.data?.data || (Array.isArray(orders.data) ? orders.data : []);
      const usersData = users.data?.data || (Array.isArray(users.data) ? users.data : []);

      const totalRevenue = (ordersData || []).reduce(
        (sum, order) => sum + Number(order?.totalAmount ?? 0),
        0
      );

      setStats({
        totalUsers: usersData.length || 0,
        totalCars: carsCount || 0,
        totalOrders: ordersData.length || 0,
        totalRevenue: totalRevenue,
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
      setStats({
        totalUsers: 0,
        totalCars: 0,
        totalOrders: 0,
        totalRevenue: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  // polling ngắn để dashboard tự cập nhật khi có thay đổi ở admin khác
  useEffect(() => {
    fetchStats();
    const intervalId = setInterval(() => {
      fetchStats();
    }, 5000); // refresh mỗi 5 giây (tùy chỉnh nếu cần)
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    fetchRecentOrders();
  }, []);

  const fetchRecentOrders = async () => {
    try {
      const response = await axios.get('/orders');
      setRecentOrders((response.data.data || (Array.isArray(response.data) ? response.data : [])).slice(0, 5));
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    const val = Number(price) || 0;
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(val);
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

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Tổng Người Dùng</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{stats.totalUsers}</p>
            </div>
            <div className="text-4xl text-blue-600">👥</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Tổng Ô Tô</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{stats.totalCars}</p>
            </div>
            <div className="text-4xl text-green-600">🚗</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Tổng Đơn Hàng</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{stats.totalOrders}</p>
            </div>
            <div className="text-4xl text-purple-600">📦</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Tổng Doanh Thu</p>
              <p className="text-2xl font-bold text-gray-800 mt-2">
                {formatPrice(stats.totalRevenue)}
              </p>
            </div>
            <div className="text-4xl text-red-600">💰</div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Đơn Hàng Gần Đây</h2>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Ngày Đặt
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Tổng Tiền
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Trạng Thái
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      #{order.id}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(order.orderDate).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      {formatPrice(order.totalAmount)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminHome;
