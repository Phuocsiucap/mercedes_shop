import { useState, useEffect } from 'react';
import { FaEye, FaEdit, FaTrash, FaPlus, FaSort, FaSortUp, FaSortDown, FaCar, FaCalendarAlt } from 'react-icons/fa';
import adminService from '../../services/adminService';
import { useApp } from '../../context/AppContext';

const AdminTestDrive = () => {
  const { formatDate, addNotification } = useApp();
  
  const [testDrives, setTestDrives] = useState({
    content: [],
    totalElements: 0,
    totalPages: 0,
    number: 0,
    size: 10,
    loading: false,
    error: null
  });
  const [selectedTestDrive, setSelectedTestDrive] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDir, setSortDir] = useState('DESC');
  const [cars, setCars] = useState([]);
  const [users, setUsers] = useState([]);

  const [formData, setFormData] = useState({
    carId: '', location: '', testDriveTime: '', notes: '', fee: 0,
    userId: '', customerName: '', customerPhone: '', customerEmail: ''
  });

  useEffect(() => { fetchTestDrives(); fetchCars(); fetchUsers(); }, [filters, page, size, sortBy, sortDir]);

  const fetchTestDrives = async () => {
    try {
      setTestDrives(prev => ({ ...prev, loading: true, error: null }));
      const params = { ...filters, page, size, sortBy, sortDir: sortDir.toLowerCase() };
      const response = await adminService.getAllTestDrives(params);
      setTestDrives(prev => ({
        ...prev, loading: false,
        content: response.data?.content || [],
        totalElements: response.data?.totalElements || 0,
        totalPages: response.data?.totalPages || 0,
        number: response.data?.number || 0,
        size: response.data?.size || 10
      }));
    } catch (error) {
      setTestDrives(prev => ({ ...prev, loading: false, error: error.message }));
    }
  };

  const fetchCars = async () => {
    try {
      const response = await adminService.getAllCars({ size: 100 });
      setCars(response.data?.content || []);
    } catch (error) { console.error('Error fetching cars:', error); }
  };

  const fetchUsers = async () => {
    try {
      const response = await adminService.getAllUsers({ size: 100 });
      setUsers(response.data?.content || []);
    } catch (error) { console.error('Error fetching users:', error); }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await adminService.updateTestDriveStatus(id, newStatus);
      addNotification({ type: 'success', title: 'Thành công', message: 'Cập nhật trạng thái thành công' });
      setShowDetail(false);
      fetchTestDrives();
    } catch (err) {
      addNotification({ type: 'error', title: 'Lỗi', message: err.message || 'Có lỗi xảy ra' });
    }
  };

  const handleDelete = async () => {
    try {
      await adminService.deleteTestDrive(selectedTestDrive.id);
      addNotification({ type: 'success', title: 'Thành công', message: 'Xóa lịch lái thử thành công' });
      setShowConfirmDelete(false);
      setSelectedTestDrive(null);
      fetchTestDrives();
    } catch (err) {
      addNotification({ type: 'error', title: 'Lỗi', message: err.message || 'Có lỗi xảy ra' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedTestDrive) {
        await adminService.updateTestDrive(selectedTestDrive.id, formData);
        addNotification({ type: 'success', title: 'Thành công', message: 'Cập nhật lịch lái thử thành công' });
      } else {
        await adminService.createTestDrive(formData);
        addNotification({ type: 'success', title: 'Thành công', message: 'Thêm lịch lái thử thành công' });
      }
      setShowForm(false);
      resetForm();
      fetchTestDrives();
    } catch (err) {
      addNotification({ type: 'error', title: 'Lỗi', message: err.message || 'Có lỗi xảy ra' });
    }
  };

  const resetForm = () => {
    setFormData({ carId: '', location: '', testDriveTime: '', notes: '', fee: 0, userId: '', customerName: '', customerPhone: '', customerEmail: '' });
    setSelectedTestDrive(null);
  };

  const openEditForm = (testDrive) => {
    setSelectedTestDrive(testDrive);
    setFormData({
      carId: testDrive.carId || '', location: testDrive.location || '',
      testDriveTime: testDrive.testDriveTime ? testDrive.testDriveTime.slice(0, 16) : '',
      notes: testDrive.notes || '', fee: testDrive.fee || 0,
      userId: testDrive.userId || '', customerName: testDrive.customerName || '',
      customerPhone: testDrive.customerPhone || '', customerEmail: testDrive.customerEmail || ''
    });
    setShowForm(true);
  };

  const handleSort = (field) => {
    if (sortBy === field) { setSortDir(sortDir === 'ASC' ? 'DESC' : 'ASC'); }
    else { setSortBy(field); setSortDir('ASC'); }
    setPage(0);
  };

  const getStatusColor = (status) => {
    const colors = { PENDING: 'bg-yellow-100 text-yellow-800', CONFIRMED: 'bg-blue-100 text-blue-800', COMPLETED: 'bg-green-100 text-green-800', CANCELLED: 'bg-red-100 text-red-800' };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status) => {
    const texts = { PENDING: 'Chờ xác nhận', CONFIRMED: 'Đã xác nhận', COMPLETED: 'Hoàn thành', CANCELLED: 'Đã hủy' };
    return texts[status] || status;
  };

  const getSortIcon = (field) => {
    if (sortBy !== field) return <FaSort className="opacity-50" />;
    return sortDir === 'ASC' ? <FaSortUp /> : <FaSortDown />;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Quản Lý Lịch Lái Thử</h1>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
          <FaPlus /> Thêm Lịch Mới
        </button>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex gap-4 items-center">
          <input type="text" placeholder="Tìm kiếm..." className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => { setFilters({ ...filters, keyword: e.target.value }); setPage(0); }} />
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => { setFilters({ ...filters, status: e.target.value }); setPage(0); }}>
            <option value="">Tất cả trạng thái</option>
            <option value="PENDING">Chờ xác nhận</option>
            <option value="CONFIRMED">Đã xác nhận</option>
            <option value="COMPLETED">Hoàn thành</option>
            <option value="CANCELLED">Đã hủy</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {testDrives.loading ? (
          <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b-2 border-gray-300">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800 cursor-pointer hover:bg-gray-200" onClick={() => handleSort('id')}>
                    <div className="flex items-center gap-2">ID {getSortIcon('id')}</div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Khách Hàng</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Xe</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800 cursor-pointer hover:bg-gray-200" onClick={() => handleSort('testDriveTime')}>
                    <div className="flex items-center gap-2">Thời Gian {getSortIcon('testDriveTime')}</div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Địa Điểm</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800 cursor-pointer hover:bg-gray-200" onClick={() => handleSort('status')}>
                    <div className="flex items-center gap-2">Trạng Thái {getSortIcon('status')}</div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Hành Động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {(testDrives.content || []).map((item) => (
                  <tr key={item.id} className="hover:bg-blue-50 transition">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">#{item.id?.slice(-6)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div>{item.customerName || 'N/A'}</div>
                      <div className="text-xs text-gray-400">{item.customerPhone}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{item.carName || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{formatDate(item.testDriveTime)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{item.location}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(item.status)}`}>{getStatusText(item.status)}</span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        <button onClick={() => { setSelectedTestDrive(item); setShowDetail(true); }} className="text-blue-600 hover:text-blue-800 p-2"><FaEye /></button>
                        <button onClick={() => openEditForm(item)} className="text-green-600 hover:text-green-800 p-2"><FaEdit /></button>
                        <button onClick={() => { setSelectedTestDrive(item); setShowConfirmDelete(true); }} className="text-red-600 hover:text-red-800 p-2"><FaTrash /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(testDrives.content || []).length === 0 && <div className="text-center py-12 text-gray-500"><FaCalendarAlt className="mx-auto text-4xl mb-2" /><p>Không có lịch lái thử nào</p></div>}
          </div>
        )}
      </div>

      {/* Pagination */}
      {testDrives.totalPages > 1 && (
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Hiển thị {testDrives.content.length} / {testDrives.totalElements} kết quả</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} className="px-3 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50">Trước</button>
              <span className="px-3 py-1 bg-blue-600 text-white rounded">{page + 1} / {testDrives.totalPages}</span>
              <button onClick={() => setPage(Math.min(testDrives.totalPages - 1, page + 1))} disabled={page >= testDrives.totalPages - 1} className="px-3 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50">Sau</button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetail && selectedTestDrive && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-lg font-bold text-gray-800">Chi Tiết Lịch Lái Thử</h2>
              <button onClick={() => setShowDetail(false)} className="text-gray-600 hover:text-gray-800 text-2xl font-bold">×</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg"><p className="text-gray-600 text-sm">Khách Hàng</p><p className="font-semibold">{selectedTestDrive.customerName}</p></div>
                <div className="bg-gray-50 p-4 rounded-lg"><p className="text-gray-600 text-sm">Số Điện Thoại</p><p className="font-semibold">{selectedTestDrive.customerPhone || 'N/A'}</p></div>
                <div className="bg-gray-50 p-4 rounded-lg"><p className="text-gray-600 text-sm">Email</p><p className="font-semibold">{selectedTestDrive.customerEmail || 'N/A'}</p></div>
                <div className="bg-gray-50 p-4 rounded-lg"><p className="text-gray-600 text-sm">Xe</p><p className="font-semibold">{selectedTestDrive.carName}</p></div>
                <div className="bg-gray-50 p-4 rounded-lg"><p className="text-gray-600 text-sm">Thời Gian</p><p className="font-semibold">{formatDate(selectedTestDrive.testDriveTime)}</p></div>
                <div className="bg-gray-50 p-4 rounded-lg"><p className="text-gray-600 text-sm">Địa Điểm</p><p className="font-semibold">{selectedTestDrive.location}</p></div>
                <div className="bg-gray-50 p-4 rounded-lg"><p className="text-gray-600 text-sm">Trạng Thái</p><p className={`font-semibold inline-block px-3 py-1 rounded-full text-sm ${getStatusColor(selectedTestDrive.status)}`}>{getStatusText(selectedTestDrive.status)}</p></div>
                <div className="bg-gray-50 p-4 rounded-lg"><p className="text-gray-600 text-sm">Phí</p><p className="font-semibold">{selectedTestDrive.fee?.toLocaleString() || 0} VNĐ</p></div>
              </div>
              {selectedTestDrive.notes && <div className="bg-gray-50 p-4 rounded-lg"><p className="text-gray-600 text-sm">Ghi Chú</p><p className="font-semibold">{selectedTestDrive.notes}</p></div>}
              {selectedTestDrive.status !== 'COMPLETED' && selectedTestDrive.status !== 'CANCELLED' && (
                <div className="border-t border-gray-200 pt-4">
                  <p className="text-sm font-semibold text-gray-800 mb-2">Cập Nhật Trạng Thái</p>
                  <select defaultValue={selectedTestDrive.status} onChange={(e) => handleStatusChange(selectedTestDrive.id, e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                    <option value="PENDING">Chờ xác nhận</option>
                    <option value="CONFIRMED">Đã xác nhận</option>
                    <option value="COMPLETED">Hoàn thành</option>
                    <option value="CANCELLED">Đã hủy</option>
                  </select>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end sticky bottom-0 bg-white">
              <button onClick={() => setShowDetail(false)} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg">Đóng</button>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-lg font-bold text-gray-800">{selectedTestDrive ? 'Cập Nhật Lịch Lái Thử' : 'Thêm Lịch Lái Thử Mới'}</h2>
              <button onClick={() => { setShowForm(false); resetForm(); }} className="text-gray-600 hover:text-gray-800 text-2xl font-bold">×</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Chọn Xe *</label>
                  <select value={formData.carId} onChange={(e) => { const car = cars.find(c => c.id === e.target.value); setFormData({ ...formData, carId: e.target.value, carName: car?.name || '' }); }} className="w-full px-4 py-2 border border-gray-300 rounded-lg" required>
                    <option value="">-- Chọn xe --</option>
                    {cars.map(car => <option key={car.id} value={car.id}>{car.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Chọn Khách Hàng</label>
                  <select value={formData.userId} onChange={(e) => { const user = users.find(u => u.id === e.target.value); setFormData({ ...formData, userId: e.target.value, customerName: user?.fullName || '', customerPhone: user?.phoneNumber || '', customerEmail: user?.email || '' }); }} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                    <option value="">-- Nhập thủ công --</option>
                    {users.map(user => <option key={user.id} value={user.id}>{user.fullName} - {user.email}</option>)}
                  </select>
                </div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Tên Khách Hàng *</label><input type="text" value={formData.customerName} onChange={(e) => setFormData({ ...formData, customerName: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" required /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Số Điện Thoại</label><input type="text" value={formData.customerPhone} onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><input type="email" value={formData.customerEmail} onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Thời Gian Lái Thử *</label><input type="datetime-local" value={formData.testDriveTime} onChange={(e) => setFormData({ ...formData, testDriveTime: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" required min={new Date().toISOString().slice(0, 16)} /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Địa Điểm *</label><input type="text" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" required placeholder="VD: Showroom Quận 1" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Phí (VNĐ)</label><input type="number" value={formData.fee} onChange={(e) => setFormData({ ...formData, fee: parseFloat(e.target.value) || 0 })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" min="0" /></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Ghi Chú</label><textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" rows="3" placeholder="Ghi chú thêm..."></textarea></div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={() => { setShowForm(false); resetForm(); }} className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Hủy</button>
                <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">{selectedTestDrive ? 'Cập Nhật' : 'Thêm Mới'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {showConfirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Xác Nhận Xóa</h3>
            <p className="text-gray-600 mb-6">Bạn có chắc chắn muốn xóa lịch lái thử này? Hành động này không thể hoàn tác.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowConfirmDelete(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Hủy</button>
              <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Xóa</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTestDrive;
