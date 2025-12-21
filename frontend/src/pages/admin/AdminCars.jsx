import { useState, useEffect } from 'react';
import axios from '../../api/axios';
import { FaEdit, FaTrash, FaPlus, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const AdminCars = () => {
  const [cars, setCars] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '', categoryId: '', price: '', manufactureYear: '',
    color: '', engine: '', transmission: '', seats: '', image: '', description: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    const loadData = async () => {
        setLoading(true);
        try {
            const [carRes, catRes] = await Promise.all([axios.get('/cars'), axios.get('/categories')]);
            let carData = [];
            if (carRes.data?.data?.content) carData = carRes.data.data.content;
            else if (Array.isArray(carRes.data?.data)) carData = carRes.data.data;
            else if (Array.isArray(carRes.data)) carData = carRes.data;
            setCars(carData);
            const catData = Array.isArray(catRes.data?.data) ? catRes.data.data : (Array.isArray(catRes.data) ? catRes.data : []);
            setCategories(catData);
        } catch (error) { console.error(error); } 
        finally { setLoading(false); }
    };
    loadData();
  }, []);

  useEffect(() => { setCurrentPage(1); }, [searchTerm, categoryFilter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const payload = { ...formData, categoryId: formData.categoryId.toString(), price: parseFloat(formData.price), manufactureYear: parseInt(formData.manufactureYear), seats: parseInt(formData.seats) };
        if (editingId) await axios.put(`/cars/${editingId}`, payload);
        else await axios.post('/cars', payload);
        alert('Thành công');
        resetForm();
        const res = await axios.get('/cars');
        setCars(res.data?.data || res.data || []);
    } catch (err) { alert(err.response?.data?.message || 'Lỗi'); }
  };

  const handleDelete = async (id) => {
    if(window.confirm('Xóa xe này?')) {
        try { await axios.delete(`/cars/${id}`); alert('Đã xóa'); const res = await axios.get('/cars'); setCars(res.data?.data || res.data || []); } catch(e) { alert('Lỗi'); }
    }
  };

  const handleEdit = (car) => {
    setFormData({
        name: car.name, categoryId: car.categoryId, price: car.price, manufactureYear: car.manufactureYear,
        color: car.color, engine: car.engine, transmission: car.transmission, seats: car.seats, image: car.image, description: car.description
    });
    setEditingId(car.id);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({ name: '', categoryId: '', price: '', manufactureYear: '', color: '', engine: '', transmission: '', seats: '', image: '', description: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  const filteredCars = cars.filter(car => {
    if (categoryFilter !== 'ALL' && car.categoryId !== categoryFilter) return false;
    const q = searchTerm.trim().toLowerCase();
    if (!q) return true;
    return car.name.toLowerCase().includes(q);
  });

  const totalItems = filteredCars.length;
  const paginatedCars = filteredCars.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Quản Lý Ô Tô</h1>
        <button onClick={() => (showForm ? resetForm() : setShowForm(true))} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <FaPlus /> {showForm ? 'Hủy' : 'Thêm Xe'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6 animate-fade-in">
            <h2 className="text-lg font-bold mb-4">{editingId ? 'Cập Nhật' : 'Thêm Mới'}</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="Tên xe" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} className="border p-2 rounded" required />
                <select value={formData.categoryId} onChange={e=>setFormData({...formData, categoryId: e.target.value})} className="border p-2 rounded" required>
                    <option value="">Chọn danh mục</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <input type="number" placeholder="Giá" value={formData.price} onChange={e=>setFormData({...formData, price: e.target.value})} className="border p-2 rounded" required />
                <input type="number" placeholder="Năm SX" value={formData.manufactureYear} onChange={e=>setFormData({...formData, manufactureYear: e.target.value})} className="border p-2 rounded" />
                <input type="text" placeholder="Màu sắc" value={formData.color} onChange={e=>setFormData({...formData, color: e.target.value})} className="border p-2 rounded" />
                <input type="text" placeholder="Động cơ" value={formData.engine} onChange={e=>setFormData({...formData, engine: e.target.value})} className="border p-2 rounded" />
                <input type="text" placeholder="Hộp số" value={formData.transmission} onChange={e=>setFormData({...formData, transmission: e.target.value})} className="border p-2 rounded" />
                <input type="number" placeholder="Số chỗ" value={formData.seats} onChange={e=>setFormData({...formData, seats: e.target.value})} className="border p-2 rounded" />
                <input type="text" placeholder="Link ảnh" value={formData.image} onChange={e=>setFormData({...formData, image: e.target.value})} className="border p-2 rounded col-span-2" />
                <textarea placeholder="Mô tả" value={formData.description} onChange={e=>setFormData({...formData, description: e.target.value})} className="border p-2 rounded col-span-2" rows="2" />
                <div className="col-span-2 flex gap-2 justify-end">
                    <button type="button" onClick={resetForm} className="bg-gray-300 text-black px-6 py-2 rounded hover:bg-gray-400">Hủy</button>
                    <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">Lưu</button>
                </div>
            </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
        <div className="p-4 border-b flex gap-4">
            <input type="text" placeholder="Tìm tên xe..." value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} className="border p-2 rounded w-1/3" />
            <select value={categoryFilter} onChange={e=>setCategoryFilter(e.target.value)} className="border p-2 rounded">
                <option value="ALL">Tất cả danh mục</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead className="bg-gray-50 border-b">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Tên</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Danh mục</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Giá</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Năm</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Hành động</th>
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {paginatedCars.map(car => (
                        <tr key={car.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm font-medium">{car.name}</td>
                            <td className="px-6 py-4 text-sm text-blue-600">{categories.find(c => c.id === car.categoryId)?.name || '-'}</td>
                            <td className="px-6 py-4 text-sm font-semibold">{formatPrice(car.price)}</td>
                            <td className="px-6 py-4 text-sm">{car.manufactureYear}</td>
                            <td className="px-6 py-4 flex gap-2">
                                <button onClick={()=>handleEdit(car)} className="text-blue-600 hover:text-blue-800"><FaEdit /></button>
                                <button onClick={()=>handleDelete(car.id)} className="text-red-600 hover:text-red-800"><FaTrash /></button>
                            </td>
                        </tr>
                    ))}
                    {paginatedCars.length === 0 && <tr><td colSpan="5" className="text-center py-4">Không có dữ liệu</td></tr>}
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

export default AdminCars;