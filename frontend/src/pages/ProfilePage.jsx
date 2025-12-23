import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import userService from '../services/userService';
import authService from '../services/authService';
// Import Icons
import { 
  FaUser, FaEdit, FaLock, FaCamera, FaEnvelope, 
  FaPhone, FaMapMarkerAlt, FaCalendarAlt, FaSave, FaTimes 
} from 'react-icons/fa';

const ProfilePage = () => {
  // [QUAN TRỌNG] Lấy thêm hàm refreshUser từ AuthContext
  const { user, refreshUser } = useAuth();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', content: '' });

  // State cho form
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    address: '',
  });

  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Cập nhật formData khi có user
  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        phoneNumber: user.phoneNumber || '',
        address: user.address || '',
      });
    }
  }, [user]);

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const clearMessage = () => setTimeout(() => setMessage({ type: '', content: '' }), 3000);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', content: '' });

    try {
      const response = await userService.updateProfile(formData);
      if (response.success) {
        
        // [QUAN TRỌNG] Gọi hàm này để tải lại thông tin user mới nhất
        if (refreshUser) {
           await refreshUser(); 
        }

        setMessage({ type: 'success', content: 'Cập nhật hồ sơ thành công!' });
        setActiveTab('overview'); // Quay về trang tổng quan
        clearMessage();
      } else {
        throw new Error(response.message || 'Cập nhật thất bại');
      }
    } catch (error) {
      setMessage({ type: 'error', content: error.message || 'Có lỗi xảy ra' });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', content: 'Mật khẩu xác nhận không khớp' });
      return;
    }

    setLoading(true);
    try {
      const response = await authService.changePassword({
        currentPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword
      });
      
      if (response.success) {
        setMessage({ type: 'success', content: 'Đổi mật khẩu thành công!' });
        setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
        clearMessage();
      } else {
        throw new Error(response.message || 'Đổi mật khẩu thất bại');
      }
    } catch (error) {
      setMessage({ type: 'error', content: error.message || 'Có lỗi xảy ra' });
    } finally {
      setLoading(false);
    }
  };

  // Component con: Menu Item
  const MenuItem = ({ id, icon: Icon, label }) => (
    <button
      onClick={() => { setActiveTab(id); setMessage({ type: '', content: '' }); }}
      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
        activeTab === id 
          ? 'bg-blue-600 text-white shadow-md shadow-blue-200' 
          : 'text-gray-600 hover:bg-white hover:text-blue-600 hover:shadow-sm'
      }`}
    >
      <Icon className={activeTab === id ? 'text-white' : 'text-gray-400'} />
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="container mx-auto max-w-6xl">
        
        {/* Header Breadcrumb */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Cài đặt tài khoản</h1>
          <p className="text-gray-500 text-sm">Quản lý thông tin cá nhân và bảo mật</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* --- LEFT SIDEBAR --- */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Profile Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative group">
              {/* Cover Image */}
              <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700 relative">
                 <div className="absolute inset-0 bg-black opacity-10"></div>
              </div>

              <div className="px-6 pb-6 relative">
                {/* Avatar */}
                <div className="relative -mt-12 mb-4 flex justify-center">
                  <div className="w-24 h-24 rounded-full border-4 border-white bg-white shadow-md flex items-center justify-center text-3xl font-bold text-blue-600 overflow-hidden">
                    {user.avatar ? (
                        <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                        user.fullName?.charAt(0)?.toUpperCase() || 'U'
                    )}
                  </div>
                  {/* Camera Icon (Placeholder for upload) */}
                  <button className="absolute bottom-0 right-[35%] bg-gray-800 text-white p-2 rounded-full hover:bg-black transition shadow-sm border border-white">
                     <FaCamera size={12} />
                  </button>
                </div>

                <div className="text-center">
                  <h2 className="text-xl font-bold text-gray-800">{user.fullName}</h2>
                  <p className="text-gray-500 text-sm mb-2">{user.email}</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
                    {user.role === 'ADMIN' ? 'Admin Administrator' : 'Member'}
                  </span>
                </div>
              </div>
            </div>

            {/* Navigation Menu */}
            <div className="bg-gray-50/50 rounded-2xl p-2 space-y-1">
              <MenuItem id="overview" icon={FaUser} label="Tổng quan hồ sơ" />
              <MenuItem id="edit" icon={FaEdit} label="Chỉnh sửa thông tin" />
              <MenuItem id="password" icon={FaLock} label="Đổi mật khẩu" />
            </div>
          </div>

          {/* --- RIGHT CONTENT --- */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 min-h-[500px]">
              
              {/* Alert Messages */}
              {message.content && (
                <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 animate-fade-in ${
                  message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${message.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  {message.content}
                </div>
              )}

              {/* --- TAB: OVERVIEW --- */}
              {activeTab === 'overview' && (
                <div className="space-y-8 animate-fade-in-up">
                  <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                    <h2 className="text-xl font-bold text-gray-800">Thông tin cá nhân</h2>
                    <button onClick={() => setActiveTab('edit')} className="text-blue-600 hover:text-blue-800 text-sm font-medium">Chỉnh sửa</button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition duration-200">
                      <div className="flex items-center gap-3 mb-2">
                         <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><FaUser /></div>
                         <span className="text-sm text-gray-500 font-medium">Họ và tên</span>
                      </div>
                      <p className="text-gray-800 font-semibold pl-11">{user.fullName}</p>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition duration-200">
                      <div className="flex items-center gap-3 mb-2">
                         <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg"><FaEnvelope /></div>
                         <span className="text-sm text-gray-500 font-medium">Email</span>
                      </div>
                      <p className="text-gray-800 font-semibold pl-11">{user.email}</p>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition duration-200">
                      <div className="flex items-center gap-3 mb-2">
                         <div className="p-2 bg-green-100 text-green-600 rounded-lg"><FaPhone /></div>
                         <span className="text-sm text-gray-500 font-medium">Số điện thoại</span>
                      </div>
                      <p className="text-gray-800 font-semibold pl-11">{user.phoneNumber || 'Chưa cập nhật'}</p>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition duration-200">
                      <div className="flex items-center gap-3 mb-2">
                         <div className="p-2 bg-orange-100 text-orange-600 rounded-lg"><FaCalendarAlt /></div>
                         <span className="text-sm text-gray-500 font-medium">Ngày tham gia</span>
                      </div>
                      <p className="text-gray-800 font-semibold pl-11">{new Date().toLocaleDateString('vi-VN')}</p>
                    </div>

                    <div className="md:col-span-2 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition duration-200">
                      <div className="flex items-center gap-3 mb-2">
                         <div className="p-2 bg-red-100 text-red-600 rounded-lg"><FaMapMarkerAlt /></div>
                         <span className="text-sm text-gray-500 font-medium">Địa chỉ</span>
                      </div>
                      <p className="text-gray-800 font-semibold pl-11">{user.address || 'Chưa cập nhật địa chỉ giao hàng'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* --- TAB: EDIT PROFILE --- */}
              {activeTab === 'edit' && (
                <div className="animate-fade-in-up">
                  <div className="border-b border-gray-100 pb-4 mb-6">
                    <h2 className="text-xl font-bold text-gray-800">Chỉnh sửa thông tin</h2>
                    <p className="text-sm text-gray-500 mt-1">Cập nhật thông tin cá nhân của bạn</p>
                  </div>

                  <form onSubmit={handleUpdateProfile} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Họ và tên</label>
                          <div className="relative">
                            <input 
                              type="text" name="fullName" value={formData.fullName} onChange={handleInputChange}
                              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition outline-none" 
                            />
                            <FaUser className="absolute left-3 top-3.5 text-gray-400" />
                          </div>
                       </div>
                       
                       <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
                          <div className="relative">
                            <input 
                              type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange}
                              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition outline-none" 
                            />
                            <FaPhone className="absolute left-3 top-3.5 text-gray-400" />
                          </div>
                       </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Địa chỉ</label>
                      <div className="relative">
                        <textarea 
                          name="address" value={formData.address} onChange={handleInputChange} rows="3"
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition outline-none resize-none"
                        ></textarea>
                        <FaMapMarkerAlt className="absolute left-3 top-3.5 text-gray-400" />
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-50">
                      <button 
                        type="button" 
                        onClick={() => setActiveTab('overview')}
                        className="px-6 py-2.5 rounded-xl text-gray-600 font-medium hover:bg-gray-100 transition flex items-center gap-2"
                      >
                        <FaTimes /> Hủy
                      </button>
                      <button 
                        type="submit" 
                        disabled={loading}
                        className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition shadow-lg shadow-blue-200 flex items-center gap-2 disabled:opacity-70"
                      >
                        {loading ? 'Đang lưu...' : <><FaSave /> Lưu thay đổi</>}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* --- TAB: CHANGE PASSWORD --- */}
              {activeTab === 'password' && (
                <div className="animate-fade-in-up">
                  <div className="border-b border-gray-100 pb-4 mb-6">
                    <h2 className="text-xl font-bold text-gray-800">Đổi mật khẩu</h2>
                    <p className="text-sm text-gray-500 mt-1">Vui lòng sử dụng mật khẩu mạnh để bảo vệ tài khoản</p>
                  </div>

                  <form onSubmit={handleChangePassword} className="space-y-5 max-w-lg">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu hiện tại</label>
                      <input 
                        type="password" name="oldPassword" value={passwordData.oldPassword} onChange={handlePasswordChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition outline-none"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu mới</label>
                      <input 
                        type="password" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Xác nhận mật khẩu mới</label>
                      <input 
                        type="password" name="confirmPassword" value={passwordData.confirmPassword} onChange={handlePasswordChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition outline-none"
                      />
                    </div>

                    <div className="pt-4">
                      <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full sm:w-auto px-8 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition shadow-lg shadow-blue-200 disabled:opacity-70"
                      >
                        {loading ? 'Đang xử lý...' : 'Cập nhật mật khẩu'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;