import { useState, useEffect } from 'react';
import axios from '../../api/axios';
import { FaEdit, FaTrash, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const [newRole, setNewRole] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('/users');
        setUsers(response.data?.data || []);
      } catch (err) { console.error(err); } 
      finally { setLoading(false); }
    };
    fetchUsers();
  }, []);

  useEffect(() => { setCurrentPage(1); }, [searchTerm, roleFilter]);

  const handleUpdateRole = async () => {
    try {
      await axios.put(`/users/${selectedUser.id}/role`, { role: newRole });
      alert('Cập nhật thành công');
      setShowEdit(false);
      const res = await axios.get('/users');
      setUsers(res.data?.data || []);
    } catch (err) { alert('Lỗi cập nhật'); }
  };

  const handleDelete = async (id) => {
    if(window.confirm('Xóa user này?')) {
        try { await axios.delete(`/users/${id}`); const res = await axios.get('/users'); setUsers(res.data?.data || []); } catch { alert('Lỗi xóa'); }
    }
  };

  const filteredUsers = users.filter(user => {
    if (roleFilter !== 'ALL' && user.role !== roleFilter) return false;
    const q = searchTerm.trim().toLowerCase();
    if (!q) return true;
    return (user.fullName && user.fullName.toLowerCase().includes(q)) || (user.email && user.email.toLowerCase().includes(q));
  });

  const totalItems = filteredUsers.length;
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Quản Lý Người Dùng</h1>
      
      <div className="flex gap-4">
        <input type="text" placeholder="Tìm tên, email..." value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} className="border p-2 rounded w-1/3" />
        <select value={roleFilter} onChange={e=>setRoleFilter(e.target.value)} className="border p-2 rounded">
            <option value="ALL">Tất cả vai trò</option>
            <option value="USER">Khách hàng</option>
            <option value="ADMIN">Quản trị viên</option>
        </select>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
        <table className="w-full">
            <thead className="bg-gray-50 border-b">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Tên</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">SĐT</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Vai trò</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Hành động</th>
                </tr>
            </thead>
            <tbody className="divide-y">
                {paginatedUsers.map(user => (
                    <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium">{user.fullName}</td>
                        <td className="px-6 py-4 text-sm">{user.email}</td>
                        <td className="px-6 py-4 text-sm">{user.phoneNumber || '-'}</td>
                        <td className="px-6 py-4 text-sm">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${user.role === 'ADMIN' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                                {user.role}
                            </span>
                        </td>
                        <td className="px-6 py-4 flex gap-2">
                            <button onClick={() => { setSelectedUser(user); setNewRole(user.role); setShowEdit(true); }} className="text-blue-600 hover:text-blue-800"><FaEdit /></button>
                            <button onClick={() => handleDelete(user.id)} className="text-red-600 hover:text-red-800"><FaTrash /></button>
                        </td>
                    </tr>
                ))}
                {paginatedUsers.length === 0 && <tr><td colSpan="5" className="text-center py-4">Không có dữ liệu</td></tr>}
            </tbody>
        </table>

        {/* Pagination */}
        <Pagination currentPage={currentPage} totalItems={totalItems} itemsPerPage={ITEMS_PER_PAGE} onPageChange={setCurrentPage} />
      </div>

      {showEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white p-6 rounded-lg w-96 shadow-lg">
                <h3 className="font-bold text-lg mb-4">Cập nhật vai trò</h3>
                <p className="mb-2">User: <b>{selectedUser?.fullName}</b></p>
                <select value={newRole} onChange={e=>setNewRole(e.target.value)} className="w-full border p-2 rounded mb-4">
                    <option value="USER">USER</option>
                    <option value="ADMIN">ADMIN</option>
                </select>
                <div className="flex justify-end gap-2">
                    <button onClick={()=>setShowEdit(false)} className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400">Hủy</button>
                    <button onClick={handleUpdateRole} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Lưu</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

// --- SUB-COMPONENT: Pagination ---
const Pagination = ({ currentPage, totalItems, itemsPerPage, onPageChange }) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    if (totalPages <= 1) return null;

    const renderPageNumbers = () => {
        const pageNumbers = [];
        const maxVisibleButtons = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisibleButtons / 2));
        let endPage = Math.min(totalPages, startPage + maxVisibleButtons - 1);

        if (endPage - startPage + 1 < maxVisibleButtons) {
            startPage = Math.max(1, endPage - maxVisibleButtons + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(
                <button key={i} onClick={() => onPageChange(i)} className={`w-8 h-8 flex items-center justify-center rounded-lg border text-sm font-medium transition ${currentPage === i ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}>{i}</button>
            );
        }
        return pageNumbers;
    };

    return (
        <div className="px-6 py-4 flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 bg-gray-50 gap-4">
            <div className="text-sm text-gray-500">Hiển thị <span className="font-medium">{Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}</span> đến <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalItems)}</span> của <span className="font-medium">{totalItems}</span></div>
            <div className="flex items-center gap-2">
                <button onClick={() => onPageChange(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50"><FaChevronLeft size={12} /></button>
                {renderPageNumbers()}
                <button onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50"><FaChevronRight size={12} /></button>
            </div>
        </div>
    );
};

export default AdminUsers;