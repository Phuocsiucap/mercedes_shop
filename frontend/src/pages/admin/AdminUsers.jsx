import { useState, useEffect } from 'react';
import axios from '../../api/axios';
import { FaEdit, FaTrash, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import AdminFilter from '../../components/AdminFilter';
import AdminPagination from '../../components/AdminPagination';
import { useAdminFilter } from '../../hooks/useAdminFilter';
import { exportToExcel, exportConfigs } from '../../utils/exportUtils';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const [newRole, setNewRole] = useState('');
  const [pagination, setPagination] = useState({
    totalElements: 0,
    totalPages: 0,
    currentPage: 0,
    size: 10
  });

  // Filter hook
  const {
    filters,
    searchTerm,
    sortBy,
    sortDir,
    page,
    size,
    handleFilterChange,
    handleSearch,
    handleSort,
    handlePageChange,
    handleSizeChange,
    queryParams
  } = useAdminFilter();

  useEffect(() => {
    fetchUsers();
  }, [queryParams]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams(queryParams);
      const response = await axios.get(`/admin/users?${params.toString()}`);
      
      if (response.data?.data?.content) {
        setUsers(response.data.data.content);
        setPagination({
          totalElements: response.data.data.totalElements,
          totalPages: response.data.data.totalPages,
          currentPage: response.data.data.number,
          size: response.data.data.size
        });
      } else {
        setUsers([]);
        setPagination({ totalElements: 0, totalPages: 0, currentPage: 0, size: 10 });
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setUsers([]);
      setPagination({ totalElements: 0, totalPages: 0, currentPage: 0, size: 10 });
    } finally {
      setLoading(false);
    }
  };

  const handleEditRole = (user) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setShowEdit(true);
  };

  const handleUpdateRole = async () => {
    if (!newRole) {
      alert('Vui lòng chọn vai trò');
      return;
    }

    try {
      await axios.put(`/users/${selectedUser.id}/role`, { role: newRole });
      alert('Cập nhật vai trò thành công');
      setShowEdit(false);
      fetchUsers();
    } catch (err) {
      console.error('Error:', err);
      alert('Có lỗi xảy ra');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn chắc chắn muốn xóa người dùng này?')) {
      try {
        await axios.delete(`/users/${id}`);
        alert('Xóa thành công');
        fetchUsers();
      } catch (err) {
        console.error('Error:', err);
        alert('Có lỗi xảy ra khi xóa');
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

  // Filter configuration
  const filterConfig = [
    {
      key: 'role',
      label: 'Vai trò',
      type: 'select',
      options: [
        { value: 'USER', label: 'Khách hàng' },
        { value: 'ADMIN', label: 'Quản trị viên' }
      ]
    },
    {
      key: 'status',
      label: 'Trạng thái',
      type: 'select',
      options: [
        { value: 'ACTIVE', label: 'Hoạt động' },
        { value: 'INACTIVE', label: 'Không hoạt động' },
        { value: 'BANNED', label: 'Bị cấm' }
      ]
    }
  ];

  const handleExport = () => {
    exportToExcel(users, exportConfigs.users.filename, exportConfigs.users.headers);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Quản Lý Người Dùng</h1>
      </div>

      {/* Filter Component */}
      <AdminFilter
        filters={filterConfig}
        onFilterChange={handleFilterChange}
        onSearch={handleSearch}
        searchPlaceholder="Tìm kiếm theo tên, email, số điện thoại..."
        showDateRange={true}
        showExport={true}
        onExport={handleExport}
      />

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
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
                {users.map((user) => (
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
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : '-'}
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
            {users.length === 0 && (
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

      {/* Pagination */}
      <AdminPagination
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        totalElements={pagination.totalElements}
        size={pagination.size}
        onPageChange={handlePageChange}
        onSizeChange={handleSizeChange}
      />
    </div>
  );
};

export default AdminUsers;
