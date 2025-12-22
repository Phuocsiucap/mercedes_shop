import { useState } from 'react';
import { 
  FaHome, FaCar, FaUsers, FaShoppingCart, 
  FaChartBar, FaList, FaBars, FaTimes, FaCalendarAlt 
} from 'react-icons/fa';

/**
 * AdminLayout Component
 * Provides a consistent layout for admin pages with sidebar navigation
 * Responsive design that collapses on mobile devices
 */
const AdminLayout = ({ children, activeTab, onTabChange }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const menuItems = [
    { id: 'home', label: 'Tổng Quan', icon: FaHome },
    { id: 'cars', label: 'Quản Lý Xe', icon: FaCar },
    { id: 'users', label: 'Người Dùng', icon: FaUsers },
    { id: 'orders', label: 'Đơn Hàng', icon: FaShoppingCart },
    { id: 'categories', label: 'Danh Mục', icon: FaList },
    { id: 'test-drives', label: 'Lịch Lái Thử', icon: FaCalendarAlt },
    { id: 'reports', label: 'Báo Cáo', icon: FaChartBar },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-gray-900 text-white transition-all duration-300 flex flex-col fixed md:relative h-full md:h-auto z-50 md:z-auto`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          {sidebarOpen && (
            <h2 className="text-xl font-bold text-blue-400">Admin Panel</h2>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-700 transition"
            aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {sidebarOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        <nav className="flex-1 py-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange && onTabChange(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 transition-all ${
                  activeTab === item.id
                    ? 'bg-blue-600 text-white border-l-4 border-blue-400'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
                title={!sidebarOpen ? item.label : ''}
              >
                <Icon className="text-lg flex-shrink-0" />
                {sidebarOpen && <span className="font-medium">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {sidebarOpen && (
          <div className="p-4 border-t border-gray-700 text-center text-gray-500 text-sm">
            Mercedes Shop Admin
          </div>
        )}
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-auto md:ml-0">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;