import { useState, useEffect, useCallback } from 'react';
import { FaEdit, FaTrash, FaSort, FaSortUp, FaSortDown, FaSearch, FaTimes, FaUser } from 'react-icons/fa';
import adminService from '../../services/adminService';
import { useApp } from '../../context/AppContext';

const AdminUsers = () => {
  const { formatDate, addNotification } = useApp();
  
  const [users, setUsers] = useState({
    content: [],
    totalElements: 0,
    totalPages: 0,
    number: 0,
    size: 10,
    loading: false,
    error: null
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [newRole, setNewRole] = useState('');
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDir, setSortDir] = useState('DESC');
  
  // Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [searchTerm, roleFilter, page, size, sortBy, sortDir]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== searchTerm) {
        setSearchTerm(searchInput);
        setPage(0);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const fetchUsers = async () => {
    try {
      setUsers(prev => ({ ...prev, loading: true, error: null }));
      setIsSearching(!!searchTerm);
      
      const params = { 
        page, 
        size, 
        sortBy, 
        sortDir,
        ...(searchTerm && { keyword: searchTerm }),
        ...(roleFilter && { role: roleFilter })
      };
      
      const response = await adminService.getAllUsers(params);
      setUsers(prev => ({
        ...prev,
        loading: false,
        content: response.data?.content || [],
        totalElements: response.data?.totalElements || 0,
        totalPages: response.data?.totalPages || 0,
        number: response.data?.number || 0,
        size: response.data?.size || 10
      }));
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to load users'
      }));
    }
  };

  const handleSearchInputChange = (e) => {
    setSearchInput(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchTerm(searchInput);
    setPage(0);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setSearchTerm('');
    setPage(0);
  };

  const handleRoleFilterChange = (e) => {
    setRoleFilter(e.target.value);
    setPage(0);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDir(sortDir === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(field);
      setSortDir('ASC');
    }
    setPage(0);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleEditRole = (user) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setShowEdit(true);
  };

  const handleViewDetail = (user) => {
    setSelectedUser(user);
    setShowDetail(true);
  };

  const handleUpdateRole = async () => {
    if (!newRole) {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: 'Vui lòng chọn vai trò'
      });
      return;
    }

    try {
      await adminService.updateUserRole(selectedUser.id, newRole);
      addNotification({
        type: 'success',
        title: 'Thành công',
        message: 'Cập nhật vai trò thành công'
      });
      setShowEdit(false);
      fetchUsers();
    } catch (err) {
      console.error('Error:', err);
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: err.message || 'Có lỗi xảy ra'
      });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn chắc chắn muốn xóa người dùng này?')) {
      try {
        await adminService.deleteUser(id);
        addNotification({
          type: 'success',
          title: 'Thành công',
          message: 'Xóa người dùng thành công'
        });
        fetchUsers();
      } catch (err) {
        console.error('Error:', err);
        addNotification({
          type: 'error',
          title: 'Lỗi',
          message: err.message || 'Có lỗi xảy ra khi xóa'
        });
      }
    }
  };

  const getRoleBadge = (role) => {
    if (role === 'ADMIN') {
      return 'bg-red-100 text-red-800';
    }
    return 'bg-blue-100 text-blue-800';
  };

  const getRoleText = (role) => {
    return role === 'ADMIN' ? 'Quản trị viên' : 'Khách hàng';
  };

  const getSortIcon = (field) => {
    if (sortBy !== field) return <FaSort className="opacity-50" />;
    return sortDir === 'ASC' ? <FaSortUp /> : <FaSortDown />;
  };

  // Highlight search term in text
  const highlightText = (text, term) => {
    if (!term || !text) return text;
    const regex = new RegExp(`(${term})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) => 
      regex.test(part) ? <mark key={i} className="bg-yellow-200 px-0.5 rounded">{part}</mark> : part
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Quản Lý Người Dùng</h1>
        <span className="text-sm text-gray-500">
          Tổng: {users.totalElements} người dùng
        </span>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              value={searchInput}
              onChange={handleSearchInputChange}
              placeholder="Tìm kiếm theo tên, email, số điện thoại..."
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchInput && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                <FaTimes />
              </button>
            )}
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={handleRoleFilterChange}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[160px]"
          >
            <option value="">Tất cả vai trò</option>
            <option value="USER">Khách hàng</option>
            <option value="ADMIN">Quản trị viên</option>
          </select>

          {/* Search Button */}
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
          >
            <FaSearch /> Tìm kiếm
          </button>
        </form>

        {/* Search Results Info */}
        {(searchTerm || roleFilter) && (
          <div className="mt-3 flex items-center gap-2 text-sm">
            <span className="text-gray-600">
              {users.loading ? 'Đang tìm kiếm...' : `Tìm thấy ${users.totalElements} kết quả`}
            </span>
            {searchTerm && (
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs flex items-center gap-1">
                Từ khóa: "{searchTerm}"
                <button onClick={handleClearSearch} className="hover:text-blue-600">
                  <FaTimes size={10} />
                </button>
              </span>
            )}
            {roleFilter && (
              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs flex items-center gap-1">
                Vai trò: {getRoleText(roleFilter)}
                <button onClick={() => setRoleFilter('')} className="hover:text-purple-600">
                  <FaTimes size={10} />
                </button>
              </span>
            )}
            {(searchTerm || roleFilter) && (
              <button
                onClick={() => { handleClearSearch(); setRoleFilter(''); }}
                className="text-red-600 hover:text-red-700 text-xs underline"
              >
                Xóa tất cả bộ lọc
              </button>
            )}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {users.loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 transition"
                    onClick={() => handleSort('fullName')}
                  >
                    <div className="flex items-center gap-2">
                      Người Dùng {getSortIcon('fullName')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 transition"
                    onClick={() => handleSort('email')}
                  >
                    <div className="flex items-center gap-2">
                      Email {getSortIcon('email')}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Số Điện Thoại
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 transition"
                    onClick={() => handleSort('role')}
                  >
                    <div className="flex items-center gap-2">
                      Vai Trò {getSortIcon('role')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 transition"
                    onClick={() => handleSort('createdAt')}
                  >
                    <div className="flex items-center gap-2">
                      Ngày Tạo {getSortIcon('createdAt')}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Thống Kê
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    Hành Động
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {(users?.content || []).map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                          {user.fullName?.charAt(0)?.toUpperCase() || <FaUser />}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {searchTerm ? highlightText(user.fullName, searchTerm) : user.fullName}
                          </p>
                          <p className="text-xs text-gray-500">ID: {user.id?.slice(0, 8)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {searchTerm ? highlightText(user.email, searchTerm) : user.email}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {searchTerm ? highlightText(user.phoneNumber || '-', searchTerm) : (user.phoneNumber || '-')}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadge(user.role)}`}>
                        {getRoleText(user.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {user.createdAt ? formatDate(user.createdAt) : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="flex gap-2">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                          {user.totalOrders || 0} đơn
                        </span>
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                          {user.totalReviews || 0} đánh giá
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => handleViewDetail(user)}
                          className="text-green-600 hover:text-green-700 hover:bg-green-50 p-2 rounded transition"
                          title="Xem chi tiết"
                        >
                          <FaUser />
                        </button>
                        <button
                          onClick={() => handleEditRole(user)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-2 rounded transition"
                          title="Chỉnh sửa vai trò"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2 rounded transition"
                          title="Xóa người dùng"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(users?.content || []).length === 0 && (
              <div className="text-center py-12 text-gray-500">
                {searchTerm || roleFilter ? (
                  <div>
                    <p className="text-lg mb-2">Không tìm thấy người dùng phù hợp</p>
                    <p className="text-sm">Thử thay đổi từ khóa hoặc bộ lọc</p>
                    <button
                      onClick={() => { handleClearSearch(); setRoleFilter(''); }}
                      className="mt-3 text-blue-600 hover:text-blue-700 underline"
                    >
                      Xóa bộ lọc
                    </button>
                  </div>
                ) : (
                  <p className="text-lg">Không có người dùng nào</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      {showDetail && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-800">Thông Tin Người Dùng</h2>
              <button
                onClick={() => setShowDetail(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-2xl font-bold">
                  {selectedUser.fullName?.charAt(0)?.toUpperCase() || <FaUser />}
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-900">{selectedUser.fullName}</p>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadge(selectedUser.role)}`}>
                    {getRoleText(selectedUser.role)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="font-medium text-gray-900 text-sm break-all">{selectedUser.email}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Số điện thoại</p>
                  <p className="font-medium text-gray-900 text-sm">{selectedUser.phoneNumber || 'Chưa cập nhật'}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Ngày tạo</p>
                  <p className="font-medium text-gray-900 text-sm">{formatDate(selectedUser.createdAt)}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">ID</p>
                  <p className="font-mono text-gray-900 text-xs break-all">{selectedUser.id}</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-1 bg-blue-50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-blue-600">{selectedUser.totalOrders || 0}</p>
                  <p className="text-xs text-gray-600">Đơn hàng</p>
                </div>
                <div className="flex-1 bg-yellow-50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-yellow-600">{selectedUser.totalReviews || 0}</p>
                  <p className="text-xs text-gray-600">Đánh giá</p>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-2 justify-end">
              <button
                onClick={() => { setShowDetail(false); handleEditRole(selectedUser); }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
              >
                Chỉnh sửa vai trò
              </button>
              <button
                onClick={() => setShowDetail(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Role Modal */}
      {showEdit && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-800">Cập Nhật Vai Trò</h2>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                  {selectedUser.fullName?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{selectedUser.fullName}</p>
                  <p className="text-sm text-gray-500">{selectedUser.email}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vai Trò
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="USER">Khách hàng</option>
                  <option value="ADMIN">Quản trị viên</option>
                </select>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-2 justify-end">
              <button
                onClick={() => setShowEdit(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-lg transition"
              >
                Hủy
              </button>
              <button
                onClick={handleUpdateRole}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
              >
                Cập Nhật
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      {users.totalPages > 1 && (
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">
              Hiển thị {users.content.length} / {users.totalElements} người dùng
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(Math.max(0, page - 1))}
                disabled={page === 0}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-300 transition"
              >
                ← Trước
              </button>
              <span className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium">
                {page + 1} / {users.totalPages}
              </span>
              <button
                onClick={() => handlePageChange(Math.min(users.totalPages - 1, page + 1))}
                disabled={page >= users.totalPages - 1}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-300 transition"
              >
                Sau →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
