import { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import adminService from '../../services/adminService';
import { useAuth } from '../../context/AuthContext';
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
  const [newRole, setNewRole] = useState('');
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDir, setSortDir] = useState('DESC');

  useEffect(() => {
    fetchUsers();
  }, [filters, page, size, sortBy, sortDir]);

  const fetchUsers = async () => {
    try {
      setUsers(prev => ({ ...prev, loading: true, error: null }));
      const params = { ...filters, page, size, sortBy, sortDir };
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

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPage(0);
  };

  const handleSearch = (searchTerm) => {
    setFilters({ ...filters, keyword: searchTerm });
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

  const handleSizeChange = (newSize) => {
    setSize(newSize);
    setPage(0);
  };

  const handleEditRole = (user) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setShowEdit(true);
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Quản Lý Người Dùng</h1>
      </div>

      {/* Filter Component - Simplified */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex gap-4 items-center">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, email, số điện thoại..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => handleSearch(e.target.value)}
          />
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => handleFilterChange({ role: e.target.value })}
          >
            <option value="">Tất cả vai trò</option>
            <option value="USER">Khách hàng</option>
            <option value="ADMIN">Quản trị viên</option>
          </select>
        </div>
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
                      Tên {getSortIcon('fullName')}
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Hành Động
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {/* Backend trả về Page<AdminUserResponse> với structure:
                    {
                      content: [...],
                      totalElements: number,
                      totalPages: number,
                      number: number (current page),
                      size: number
                    }
                */}
                {(users?.content || []).map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {user.fullName}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {user.phoneNumber || '-'}
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
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditRole(user)}
                          className="text-blue-600 hover:text-blue-700"
                          title="Chỉnh sửa vai trò"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="text-red-600 hover:text-red-700"
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
              <div className="text-center py-8 text-gray-600">
                Không có người dùng nào
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEdit && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-800">Cập Nhật Vai Trò</h2>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">Người dùng</p>
                <p className="font-semibold text-gray-900">{selectedUser.fullName}</p>
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

      {/* Pagination - Simplified */}
      {users.totalPages > 1 && (
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">
              Hiển thị {users.content.length} / {users.totalElements} kết quả
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(Math.max(0, page - 1))}
                disabled={page === 0}
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
              >
                Trước
              </button>
              <span className="px-3 py-1 bg-blue-600 text-white rounded">
                {page + 1} / {users.totalPages}
              </span>
              <button
                onClick={() => handlePageChange(Math.min(users.totalPages - 1, page + 1))}
                disabled={page >= users.totalPages - 1}
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
              >
                Sau
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
