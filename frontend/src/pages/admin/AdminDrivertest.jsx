import { useState, useEffect } from 'react';
import * as drivertestApi from '../../api/drivertestApi';
import * as carApi from '../../api/carApi';
import * as userApi from '../../api/userApi';
import { FaEdit, FaTrash, FaPlus, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const AdminDrivertest = () => {
  const [drivertests, setDrivertests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ userId: '', carId: '', testDate: '', testLocation: '', fee: '' });
  
  const [cars, setCars] = useState([]);
  const [users, setUsers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  
  // Filters & Pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    const fetchData = async () => {
        setLoading(true);
        try {
            const [dtRes, carRes, userRes] = await Promise.all([
                drivertestApi.getAllDrivertests(),
                carApi.getAllCars(),
                userApi.getAllUsers()
            ]);
            setDrivertests(dtRes.data || []);
            setCars(carRes.data?.content || carRes.data || []);
            setUsers(userRes.data || []);
        } catch (e) { console.error(e); } 
        finally { setLoading(false); }
    };
    fetchData();
  }, []);

  // Reset pagination when filters change
  useEffect(() => { setCurrentPage(1); }, [searchTerm, statusFilter]);

  const handleSave = async () => {
    try {
        const payload = { 
            ...formData, 
            testDate: new Date(formData.testDate).toISOString(), 
            fee: parseFloat(formData.fee) 
        };
        if (editingId) await drivertestApi.updateDrivertest(editingId, payload);
        else await drivertestApi.createDrivertest(payload);
        alert('Thành công');
        setShowForm(false);
        // Refresh data
        const res = await drivertestApi.getAllDrivertests();
        setDrivertests(res.data || []);
    } catch (e) { alert('Lỗi: ' + e.message); }
  };

  const handleStatusChange = async (id, status) => {
    try {
        await drivertestApi.updateDrivertestStatus(id, status);
        // Optimistic update for better UX
        setDrivertests(prev => prev.map(dt => dt.id === id ? { ...dt, status } : dt));
    } catch(e) { alert('Lỗi cập nhật trạng thái'); }
  };

  const handleDelete = async (id) => {
    if(window.confirm('Xóa lịch này?')) {
        try { 
            await drivertestApi.deleteDrivertest(id); 
            setDrivertests(prev => prev.filter(dt => dt.id !== id));
        } catch(e) { alert('Lỗi xóa'); }
    }
  };

  const openEdit = (dt) => {
    setEditingId(dt.id);
    let dateStr = '';
    if(dt.testDate) {
        const d = new Date(dt.testDate);
        d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
        dateStr = d.toISOString().slice(0,16);
    }
    setFormData({ userId: dt.userId, carId: dt.carId, testDate: dateStr, testLocation: dt.testLocation, fee: dt.fee });
    setShowForm(true);
  };

  // --- STYLE BADGE COLORS ---
  const getStatusColor = (s) => {
      switch(s) {
          case 'PENDING': return 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200';
          case 'SCHEDULED': return 'bg-blue-100 text-blue-700 hover:bg-blue-200';
          case 'COMPLETED': return 'bg-green-100 text-green-700 hover:bg-green-200';
          case 'CANCELLED': return 'bg-red-100 text-red-700 hover:bg-red-200';
          default: return 'bg-gray-100 text-gray-700';
      }
  }

  // --- FILTER & PAGINATION LOGIC ---
  const filtered = drivertests.filter(dt => {
      if (statusFilter !== 'ALL' && dt.status !== statusFilter) return false;
      const q = searchTerm.toLowerCase();
      if (!q) return true;
      return (dt.userName?.toLowerCase().includes(q) || dt.carName?.toLowerCase().includes(q));
  });

  const totalItems = filtered.length;
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Quản Lý Lái Thử</h1>
        <button 
            onClick={() => { setEditingId(null); setFormData({userId:'', carId:'', testDate:'', testLocation:'', fee:''}); setShowForm(true); }} 
            className="bg-blue-600 text-white px-4 py-2 rounded flex gap-2 items-center hover:bg-blue-700 shadow-sm transition"
        >
            <FaPlus /> Thêm Mới
        </button>
      </div>

      <div className="bg-white rounded-lg shadow border overflow-hidden">
        {/* Filter Bar */}
        <div className="p-4 border-b flex gap-4 bg-gray-50">
            <input 
                type="text" 
                placeholder="Tìm khách hàng, xe..." 
                value={searchTerm} 
                onChange={e=>setSearchTerm(e.target.value)} 
                className="border p-2 rounded w-1/3 focus:ring-2 focus:ring-blue-500 outline-none bg-white" 
            />
            <select 
                value={statusFilter} 
                onChange={e=>setStatusFilter(e.target.value)} 
                className="border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="PENDING">Chờ xác nhận</option>
                <option value="SCHEDULED">Đã lên lịch</option>
                <option value="COMPLETED">Hoàn thành</option>
                <option value="CANCELLED">Hủy</option>
            </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
            <table className="w-full whitespace-nowrap">
                <thead className="bg-gray-50 border-b">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Khách Hàng</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Xe</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Ngày Lái</th>
                        <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase">Trạng Thái</th>
                        <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Hành Động</th>
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {loading ? (
                        <tr><td colSpan="5" className="text-center py-8 text-gray-500">Đang tải dữ liệu...</td></tr>
                    ) : paginated.length > 0 ? (
                        paginated.map(dt => (
                            <tr key={dt.id} className="hover:bg-gray-50 transition">
                                <td className="px-6 py-4 text-sm font-medium text-gray-900">{dt.userName}</td>
                                <td className="px-6 py-4 text-sm text-gray-700">{dt.carName}</td>
                                <td className="px-6 py-4 text-sm text-gray-600">{new Date(dt.testDate).toLocaleString('vi-VN')}</td>
                                
                                {/* Badge Status Select */}
                                <td className="px-6 py-4 text-sm text-center">
                                    <div className="relative inline-block w-full max-w-[140px]">
                                        <select 
                                            value={dt.status} 
                                            onChange={(e)=>handleStatusChange(dt.id, e.target.value)}
                                            className={`appearance-none w-full cursor-pointer text-xs font-bold py-1.5 px-3 rounded-full border-0 focus:ring-2 focus:ring-offset-1 focus:ring-blue-300 transition-colors duration-200 text-center ${getStatusColor(dt.status)}`}
                                            style={{ textAlignLast: 'center' }}
                                        >
                                            <option value="PENDING" className="bg-white text-gray-800">Chờ Xác Nhận</option>
                                            <option value="SCHEDULED" className="bg-white text-gray-800">Đã Lên Lịch</option>
                                            <option value="COMPLETED" className="bg-white text-gray-800">Hoàn Thành</option>
                                            <option value="CANCELLED" className="bg-white text-gray-800">Hủy</option>
                                        </select>
                                    </div>
                                </td>

                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button onClick={()=>openEdit(dt)} className="text-blue-600 hover:bg-blue-50 p-2 rounded transition" title="Sửa"><FaEdit /></button>
                                        <button onClick={()=>handleDelete(dt.id)} className="text-red-600 hover:bg-red-50 p-2 rounded transition" title="Xóa"><FaTrash /></button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr><td colSpan="5" className="text-center py-8 text-gray-500">Không có dữ liệu</td></tr>
                    )}
                </tbody>
            </table>
        </div>

        {/* Pagination Footer */}
        <Pagination currentPage={currentPage} totalItems={totalItems} itemsPerPage={ITEMS_PER_PAGE} onPageChange={setCurrentPage} />
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
                <h2 className="text-xl font-bold mb-4 text-gray-800">{editingId ? 'Sửa Lịch Lái Thử' : 'Thêm Lịch Mới'}</h2>
                <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 sm:col-span-1">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Khách hàng</label>
                        <select value={formData.userId} onChange={e=>setFormData({...formData, userId:e.target.value})} className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none">
                            <option value="">-- Chọn --</option>
                            {users.map(u => <option key={u.id} value={u.id}>{u.fullName}</option>)}
                        </select>
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Xe</label>
                        <select value={formData.carId} onChange={e=>setFormData({...formData, carId:e.target.value})} className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none">
                            <option value="">-- Chọn --</option>
                            {cars.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Ngày giờ</label>
                        <input type="datetime-local" value={formData.testDate} onChange={e=>setFormData({...formData, testDate:e.target.value})} className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Phí (VND)</label>
                        <input type="number" placeholder="0" value={formData.fee} onChange={e=>setFormData({...formData, fee:e.target.value})} className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div className="col-span-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Địa điểm</label>
                        <input type="text" placeholder="VD: Showroom A" value={formData.testLocation} onChange={e=>setFormData({...formData, testLocation:e.target.value})} className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                </div>
                <div className="flex justify-end gap-2 mt-6 border-t pt-4">
                    <button onClick={()=>setShowForm(false)} className="bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200 transition font-medium">Hủy</button>
                    <button onClick={handleSave} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition font-medium">Lưu</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

// Reusable Pagination Component
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

export default AdminDrivertest;