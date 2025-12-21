import { useState, useEffect } from 'react';
import axios from '../../api/axios';
import { FaEdit, FaTrash, FaPlus, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => { fetchCategories(); }, []);
  useEffect(() => { setCurrentPage(1); }, [searchTerm]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/categories');
      const data = response.data?.data || response.data || [];
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return setError('Tên không được trống');
    try {
      if (editingId) await axios.put(`/categories/${editingId}`, formData);
      else await axios.post('/categories', formData);
      alert('Thành công');
      resetForm();
      fetchCategories();
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi xảy ra');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Xóa danh mục này?')) {
      try { await axios.delete(`/categories/${id}`); fetchCategories(); } catch { alert('Lỗi khi xóa'); }
    }
  };

  const handleEdit = (cat) => {
    setFormData({ name: cat.name, description: cat.description });
    setEditingId(cat.id);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({ name: '', description: '' });
    setEditingId(null);
    setShowForm(false);
    setError(null);
  };

  const filtered = categories.filter(c => c.name.toLowerCase().includes(searchTerm.trim().toLowerCase()));
  const totalItems = filtered.length;
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Quản Lý Danh Mục</h1>
        <button onClick={() => (showForm ? resetForm() : setShowForm(true))} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          <FaPlus /> {showForm ? 'Hủy' : 'Thêm Danh Mục'}
        </button>
      </div>

      {error && <div className="bg-red-50 text-red-700 px-4 py-2 rounded">{error}</div>}

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6 animate-fade-in">
            <h2 className="text-lg font-bold mb-4">{editingId ? 'Cập Nhật' : 'Thêm Mới'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input type="text" placeholder="Tên danh mục" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 border rounded" required />
                <textarea placeholder="Mô tả" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2 border rounded" rows="3" />
                <div className="flex gap-2 justify-end">
                    <button type="button" onClick={resetForm} className="bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400">Hủy</button>
                    <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">Lưu</button>
                </div>
            </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 border-b">
            <input type="text" placeholder="Tìm kiếm danh mục..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full md:w-1/3 px-4 py-2 border rounded" />
        </div>
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead className="bg-gray-50 border-b">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Tên</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Mô tả</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Hành động</th>
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {paginated.map(cat => (
                        <tr key={cat.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm font-medium">{cat.name}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{cat.description}</td>
                            <td className="px-6 py-4 flex gap-2">
                                <button onClick={() => handleEdit(cat)} className="text-blue-600 hover:text-blue-800"><FaEdit /></button>
                                <button onClick={() => handleDelete(cat.id)} className="text-red-600 hover:text-red-800"><FaTrash /></button>
                            </td>
                        </tr>
                    ))}
                    {paginated.length === 0 && <tr><td colSpan="3" className="text-center py-4 text-gray-500">Không có dữ liệu</td></tr>}
                </tbody>
            </table>
        </div>
        
        {/* Pagination */}
        <Pagination currentPage={currentPage} totalItems={totalItems} itemsPerPage={ITEMS_PER_PAGE} onPageChange={setCurrentPage} />
      </div>
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

export default AdminCategories;