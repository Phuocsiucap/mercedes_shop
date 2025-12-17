import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AdminCategories from './AdminCategories';
import AdminCars from './AdminCars';
import AdminOrders from './AdminOrders';
import AdminUsers from './AdminUsers';
import AdminHome from './AdminHome';
import AdminReports from './AdminReports';
import { FiLogOut, FiMenu } from 'react-icons/fi';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleLogout = () => {
    if (window.confirm('Bạn chắc chắn muốn đăng xuất?')) {
      logout();
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  // Trigger refresh when location changes
  useEffect(() => {
    setRefreshKey((prev) => prev + 1);
  }, [location]);

  const menuItems = [
    { path: '/admin', label: 'Tổng quan', icon: '📊' },
    { path: '/admin/reports', label: 'Báo cáo', icon: '📈' },
    { path: '/admin/categories', label: 'Danh mục', icon: '📁' },
    { path: '/admin/cars', label: 'Ô tô', icon: '🚗' },
    { path: '/admin/orders', label: 'Đơn hàng', icon: '📦' },
    { path: '/admin/users', label: 'Người dùng', icon: '👥' },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-gray-900 text-white transition-all duration-300 overflow-y-auto flex flex-col`}
      >
        {/* Logo */}
        <div className="p-6 flex items-center justify-between">
          {sidebarOpen && <h1 className="text-2xl font-bold">Mercedes</h1>}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hover:bg-gray-800 p-2 rounded"
          >
            <FiMenu className="text-xl" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-8 flex-1">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-4 px-6 py-3 transition-colors ${
                isActive(item.path)
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              <span className="text-2xl">{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* User Info & Logout (đặt ở cuối, xếp dọc) */}
        <div className="mt-auto border-t border-gray-800 p-4">
          <div className={`flex flex-col items-start gap-3 ${!sidebarOpen ? 'items-center' : ''}`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                {user?.fullName?.charAt(0).toUpperCase()}
              </div>
              {sidebarOpen && (
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate">{user?.fullName}</p>
                  <p className="text-xs text-gray-400">Admin</p>
                </div>
              )}
            </div>

            <button
              onClick={handleLogout}
              className={`w-full flex items-center gap-3 px-4 py-2.5 bg-red-600 hover:bg-red-700 rounded-lg transition-all duration-200 text-sm font-semibold shadow-sm ${
                !sidebarOpen ? 'justify-center' : ''
              }`}
            >
              <FiLogOut className="text-base" />
              {sidebarOpen && 'Đăng xuất'}
            </button>
          </div>
        </div>

        {/* Footer spacer (nếu cần) */}
        <div className="mt-auto p-4">
          {/* để trống hoặc thêm link nhỏ nếu muốn */}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white shadow-sm p-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">Xin chào, {user?.fullName}</span>
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center font-bold">
              {user?.fullName?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">
          <Routes>
            <Route path="/" element={<AdminHome key={refreshKey} />} />
            <Route path="/reports" element={<AdminReports />} />
            <Route path="/categories" element={<AdminCategories />} />
            <Route path="/cars" element={<AdminCars />} />
            <Route path="/orders" element={<AdminOrders />} />
            <Route path="/users" element={<AdminUsers />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
