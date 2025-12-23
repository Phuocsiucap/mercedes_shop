import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
// Đảm bảo đã cài: npm install react-icons
import { FaCarSide, FaShoppingCart, FaUser, FaCaretDown } from 'react-icons/fa'; 

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { items } = useCart();
  
  // State để quản lý việc ẩn/hiện menu
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // Ref để xử lý click ra ngoài thì đóng menu (tùy chọn, giúp trải nghiệm tốt hơn)
  const dropdownRef = useRef(null);

  const handleLogout = async () => {
    try {
      await logout();
      setIsDropdownOpen(false); // Đóng menu sau khi logout
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Đóng menu khi click ra ngoài khu vực menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const cartItemCount = items.reduce((total, item) => total + item.quantity, 0);

  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'U';
  };

  const displayName = user?.fullName || user?.email || 'Guest';

  return (
    <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          
          {/* --- LOGO --- */}
          <Link to="/" className="flex items-center gap-2 group">
            <FaCarSide className="text-red-500 text-2xl" /> 
            <span className="text-xl font-bold text-gray-800 tracking-tight group-hover:text-black">
              Mercedes Shop
            </span>
          </Link>
          
          {/* --- MENU CHÍNH --- */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-sm font-medium text-gray-600 hover:text-black transition-colors">
              Trang chủ
            </Link>
            <Link to="/cars" className="text-sm font-medium text-gray-600 hover:text-black transition-colors">
              Danh sách xe
            </Link>
            <Link to="/favorites" className="text-sm font-medium text-gray-600 hover:text-black transition-colors">
              Yêu thích
            </Link>
            <Link to="/orders" className="text-sm font-medium text-gray-600 hover:text-black transition-colors">
              Đơn hàng
            </Link>
          </div>

          {/* --- BÊN PHẢI: CART & USER --- */}
          <div className="flex items-center space-x-6">
            
            {/* Giỏ hàng */}
            <Link to="/cart" className="relative text-gray-500 hover:text-gray-800 transition-colors">
              <FaShoppingCart size={20} />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center border border-white">
                  {cartItemCount}
                </span>
              )}
            </Link>
            
            {/* User Dropdown Area */}
            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                {/* Nút bấm để mở menu */}
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-3 focus:outline-none transition-opacity hover:opacity-80"
                >
                  {/* Avatar */}
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium shadow-sm">
                    {getInitials(displayName)}
                  </div>
                  
                  {/* Tên & Mũi tên */}
                  <span className="hidden md:flex items-center gap-1 text-sm font-medium text-gray-700">
                    {displayName}
                    <FaCaretDown className={`text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </span>
                </button>

                {/* Dropdown Menu - Chỉ hiện khi isDropdownOpen = true */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 border border-gray-100 z-50 animate-fadeIn">
                    <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-xs text-gray-500">Đăng nhập là</p>
                        <p className="text-sm font-semibold text-gray-800 truncate">{displayName}</p>
                    </div>

                    {user?.role === 'ADMIN' && (
                       <Link 
                         to="/admin" 
                         className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                         onClick={() => setIsDropdownOpen(false)}
                       >
                         Quản trị (Admin)
                       </Link>
                    )}
                    
                    <Link 
                      to="/profile" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      Hồ sơ cá nhân
                    </Link>

                    <button 
                      onClick={handleLogout} 
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // Chưa đăng nhập
              <div className="flex items-center space-x-4 text-sm font-medium">
                <Link to="/login" className="text-gray-600 hover:text-black">
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-full transition-colors"
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;