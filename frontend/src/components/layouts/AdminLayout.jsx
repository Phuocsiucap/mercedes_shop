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
    // 1. Thay đổi 'min-h-screen' thành 'h-screen' và thêm 'overflow-hidden'
    // Điều này giúp toàn bộ khung ứng dụng không bị cuộn, chỉ khớp với chiều cao màn hình
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        // 2. Xóa 'md:h-auto' để sidebar luôn full chiều cao
        // Sidebar vẫn giữ 'fixed' trên mobile và 'relative' trên desktop
        } bg-gray-900 text-white transition-all duration-300 flex flex-col fixed md:relative h-full z-50`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-700 flex-shrink-0">
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

        {/* Thêm overflow-y-auto cho nav để nếu menu quá dài thì menu sẽ cuộn riêng */}
        <nav className="flex-1 py-4 overflow-y-auto custom-scrollbar">
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
          <div className="p-4 border-t border-gray-700 text-center text-gray-500 text-sm flex-shrink-0">
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
      {/* 3. Thêm 'overflow-y-auto' và 'h-full' */}
      {/* Điều này tạo thanh cuộn riêng cho nội dung chính, giữ Sidebar đứng yên */}
      <main className="flex-1 p-6 overflow-y-auto h-full bg-gray-100 md:ml-0 relative w-full">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;