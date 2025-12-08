import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateUserProfile, changePassword } from '../api/userApi';

const ProfilePage = () => {
  const { user, login } = useAuth(); // Assuming login updates the user state or we need a way to refresh user
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', content: '' });

  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    phoneNumber: user?.phoneNumber || '',
    address: user?.address || '',
  });

  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
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

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', content: '' });

    try {
      await updateUserProfile(formData);
      setMessage({ type: 'success', content: 'Cập nhật thông tin thành công!' });
      setIsEditing(false);
      // Optionally refresh user context here if needed
    } catch (error) {
      setMessage({ type: 'error', content: error.message || 'Có lỗi xảy ra' });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', content: 'Mật khẩu mới không khớp' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', content: '' });

    try {
      await changePassword(passwordData.oldPassword, passwordData.newPassword);
      setMessage({ type: 'success', content: 'Đổi mật khẩu thành công!' });
      setIsChangingPassword(false);
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      setMessage({ type: 'error', content: error.message || 'Có lỗi xảy ra' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">Hồ Sơ Của Tôi</h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Sidebar / User Card */}
            <div className="md:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-4xl font-bold mx-auto mb-4 shadow-lg">
                  {user.fullName?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <h2 className="text-xl font-bold text-gray-800">{user.fullName}</h2>
                <p className="text-gray-500 text-sm mb-4">{user.email}</p>
                <div className="inline-block px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-semibold">
                  {user.role === 'ADMIN' ? 'Quản trị viên' : 'Khách hàng thân thiết'}
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-6 mt-6">
                <h3 className="font-semibold text-gray-800 mb-4">Menu</h3>
                <ul className="space-y-2">
                  <li>
                    <button
                      onClick={() => { setIsEditing(false); setIsChangingPassword(false); }}
                      className={`w-full text-left px-4 py-2 rounded-lg transition ${!isEditing && !isChangingPassword ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                      Thông tin chung
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => { setIsEditing(true); setIsChangingPassword(false); }}
                      className={`w-full text-left px-4 py-2 rounded-lg transition ${isEditing ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                      Chỉnh sửa thông tin
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => { setIsChangingPassword(true); setIsEditing(false); }}
                      className={`w-full text-left px-4 py-2 rounded-lg transition ${isChangingPassword ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                      Đổi mật khẩu
                    </button>
                  </li>
                </ul>
              </div>
            </div>

            {/* Main Content */}
            <div className="md:col-span-2">
              <div className="bg-white rounded-2xl shadow-sm p-8">
                {message.content && (
                  <div className={`mb-6 px-4 py-3 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    {message.content}
                  </div>
                )}

                {!isEditing && !isChangingPassword && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Thông tin chung</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <p className="text-sm text-gray-500 mb-1">Họ và tên</p>
                        <p className="font-medium text-gray-800">{user.fullName}</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <p className="text-sm text-gray-500 mb-1">Email</p>
                        <p className="font-medium text-gray-800">{user.email}</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <p className="text-sm text-gray-500 mb-1">Số điện thoại</p>
                        <p className="font-medium text-gray-800">{user.phoneNumber || 'Chưa cập nhật'}</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <p className="text-sm text-gray-500 mb-1">Ngày tham gia</p>
                        <p className="font-medium text-gray-800">{new Date().toLocaleDateString('vi-VN')}</p>
                      </div>
                      <div className="sm:col-span-2 p-4 bg-gray-50 rounded-xl">
                        <p className="text-sm text-gray-500 mb-1">Địa chỉ</p>
                        <p className="font-medium text-gray-800">{user.address || 'Chưa cập nhật'}</p>
                      </div>
                    </div>
                  </div>
                )}

                {isEditing && (
                  <form onSubmit={handleUpdateProfile} className="space-y-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Chỉnh sửa thông tin</h2>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Họ và tên</label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Địa chỉ</label>
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        rows="3"
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      />
                    </div>

                    <div className="flex justify-end space-x-4 pt-4">
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="px-6 py-2.5 rounded-xl text-gray-700 font-medium hover:bg-gray-100 transition"
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition shadow-lg shadow-blue-600/30 disabled:opacity-50"
                      >
                        {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                      </button>
                    </div>
                  </form>
                )}

                {isChangingPassword && (
                  <form onSubmit={handleChangePassword} className="space-y-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Đổi mật khẩu</h2>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu hiện tại</label>
                      <input
                        type="password"
                        name="oldPassword"
                        value={passwordData.oldPassword}
                        onChange={handlePasswordChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu mới</label>
                      <input
                        type="password"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Xác nhận mật khẩu mới</label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      />
                    </div>

                    <div className="flex justify-end space-x-4 pt-4">
                      <button
                        type="button"
                        onClick={() => setIsChangingPassword(false)}
                        className="px-6 py-2.5 rounded-xl text-gray-700 font-medium hover:bg-gray-100 transition"
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition shadow-lg shadow-blue-600/30 disabled:opacity-50"
                      >
                        {loading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
