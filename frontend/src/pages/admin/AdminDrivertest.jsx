import { useState, useEffect } from 'react';
import * as drivertestApi from '../../api/drivertestApi';
import * as carApi from '../../api/carApi'; // Giả sử bạn đã có carApi tương tự
import * as userApi from '../../api/userApi';
import { FaEye, FaEdit, FaTrash, FaPlus } from 'react-icons/fa';

const AdminDrivertest = () => {
  const [drivertests, setDrivertests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDrivertest, setSelectedDrivertest] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showForm, setShowForm] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    userId: '',
    carId: '',
    testDate: '',
    testLocation: '',
    fee: '',
  });
  
  const [cars, setCars] = useState([]);
  const [users, setUsers] = useState([]);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchDrivertests();
    fetchCars();
    fetchUsers();
  }, []);

  const fetchDrivertests = async () => {
    try {
      setLoading(true);
      const response = await drivertestApi.getAllDrivertests();
      
      // Backend trả về ApiResponse: { success: true, data: [...] }
      // Kiểm tra cấu trúc trả về để set state cho đúng
      if (response && response.data) {
          setDrivertests(response.data);
      } else if (Array.isArray(response)) {
          setDrivertests(response);
      } else {
          setDrivertests([]);
      }
    } catch (err) {
      console.error('Error fetching drivertests:', err);
      setDrivertests([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCars = async () => {
    try {
      const response = await carApi.getAllCars();
      // Xử lý tương tự với Car Response
      if (response?.data?.content) {
         setCars(response.data.content); // Nếu có phân trang
      } else if (response?.data) {
         setCars(response.data);
      } else if (Array.isArray(response)) {
         setCars(response);
      }
    } catch (err) {
      console.error('Error fetching cars:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await userApi.getAllUsers();
      let data = [];
      if (Array.isArray(response?.data)) {
        data = response.data;
      } else if (Array.isArray(response)) {
        data = response;
      }
      setUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const handleAddNew = () => {
    setEditingId(null);
    setFormData({
      userId: '',
      carId: '',
      testDate: '',
      testLocation: '',
      fee: '',
    });
    setShowForm(true);
  };

  const handleEdit = (drivertest) => {
    setEditingId(drivertest.id);
    // Convert API date string to input datetime-local format (YYYY-MM-DDThh:mm)
    let formattedDate = '';
    if (drivertest.testDate) {
        const date = new Date(drivertest.testDate);
        // Cần chỉnh múi giờ cho input local nếu cần, ở đây lấy ISO cắt chuỗi cho đơn giản
        // Lưu ý: toISOString() trả về UTC. Nếu muốn hiển thị giờ địa phương cần xử lý thêm.
        // Cách đơn giản để map vào input datetime-local:
        date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
        formattedDate = date.toISOString().slice(0, 16);
    }

    setFormData({
      userId: drivertest.userId || '',
      carId: drivertest.carId || '',
      testDate: formattedDate,
      testLocation: drivertest.testLocation || '',
      fee: drivertest.fee || 0,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    try {
      if (!formData.userId || !formData.carId || !formData.testDate || !formData.testLocation || !formData.fee) {
        alert('Vui lòng điền đầy đủ thông tin bắt buộc');
        return;
      }

      // Backend dùng LocalDateTime, gửi ISO string là an toàn nhất
      const payload = {
        userId: formData.userId,
        carId: formData.carId,
        testDate: new Date(formData.testDate).toISOString(), 
        testLocation: formData.testLocation,
        fee: parseFloat(formData.fee)
      };

      if (editingId) {
        await drivertestApi.updateDrivertest(editingId, payload);
        alert('Cập nhật thành công');
      } else {
        await drivertestApi.createDrivertest(payload);
        alert('Thêm mới thành công');
      }

      setShowForm(false);
      fetchDrivertests();
    } catch (err) {
      console.error('Error saving:', err);
      // Hiển thị message lỗi từ backend nếu có
      const msg = err.message || 'Không thể lưu';
      alert('Lỗi: ' + msg);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa yêu cầu lái thử này?')) {
      try {
        await drivertestApi.deleteDrivertest(id);
        alert('Xóa thành công');
        fetchDrivertests();
      } catch (err) {
        console.error('Error deleting:', err);
        alert('Lỗi khi xóa');
      }
    }
  };

  const handleViewDetail = (drivertest) => {
    setSelectedDrivertest(drivertest);
    setShowDetail(true);
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await drivertestApi.updateDrivertestStatus(id, newStatus);
      alert('Cập nhật trạng thái thành công');
      fetchDrivertests();
      
      // Update modal nếu đang mở
      if (selectedDrivertest?.id === id) {
        setSelectedDrivertest(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      console.error('Error:', err);
      alert('Lỗi khi cập nhật trạng thái');
    }
  };

  // Helper colors
  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'SCHEDULED': return 'bg-blue-100 text-blue-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      PENDING: 'Chờ Xác Nhận',
      SCHEDULED: 'Đã Lên Lịch',
      COMPLETED: 'Hoàn Thành',
      CANCELLED: 'Hủy',
    };
    return statusMap[status] || status;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price || 0);
  };

  const formatDate = (dateString) => {
      if(!dateString) return 'N/A';
      return new Date(dateString).toLocaleString('vi-VN', {
          year: 'numeric', month: '2-digit', day: '2-digit',
          hour: '2-digit', minute: '2-digit'
      });
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Quản Lý Lái Thử</h1>
        <button
          onClick={handleAddNew}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm"
        >
          <FaPlus /> Thêm Mới
        </button>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full whitespace-nowrap">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Khách Hàng</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Xe</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Ngày Lái</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Địa Điểm</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Phí</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Trạng Thái</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Hành Động</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {drivertests.length > 0 ? (
                  drivertests.map((dt) => (
                    <tr key={dt.id} className="hover:bg-gray-50 transition duration-150">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">#{dt.id.substring(0, 8)}...</td>
                      <td className="px-6 py-4 text-sm text-gray-700 font-medium">{dt.userName}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{dt.carName || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{formatDate(dt.testDate)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 truncate max-w-xs" title={dt.testLocation}>{dt.testLocation || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 font-medium">{formatPrice(dt.fee)}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(dt.status)}`}>
                          {getStatusText(dt.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-right">
                        <div className="flex items-center justify-end gap-2">
                            <button onClick={() => handleViewDetail(dt)} className="text-blue-600 hover:text-blue-900 p-1 bg-blue-50 rounded" title="Chi tiết">
                                <FaEye />
                            </button>
                            <button onClick={() => handleEdit(dt)} className="text-green-600 hover:text-green-900 p-1 bg-green-50 rounded" title="Sửa">
                                <FaEdit />
                            </button>
                            <button onClick={() => handleDelete(dt.id)} className="text-red-600 hover:text-red-900 p-1 bg-red-50 rounded" title="Xóa">
                                <FaTrash />
                            </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center text-gray-500 text-sm">
                       Chưa có dữ liệu lịch lái thử
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetail && selectedDrivertest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-fadeIn">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-gray-800">Chi Tiết Lái Thử</h2>
              <button onClick={() => setShowDetail(false)} className="text-gray-400 hover:text-gray-600 text-2xl font-light">&times;</button>
            </div>

            <div className="p-6 space-y-6">
              {/* Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-500 uppercase mb-1">Khách Hàng</p>
                  <p className="text-base font-semibold text-gray-800">{selectedDrivertest.userName}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-500 uppercase mb-1">Xe Yêu Cầu</p>
                  <p className="text-base font-semibold text-gray-800">{selectedDrivertest.carName}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-500 uppercase mb-1">Thời Gian</p>
                  <p className="text-base font-semibold text-gray-800">{formatDate(selectedDrivertest.testDate)}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-500 uppercase mb-1">Phí Dịch Vụ</p>
                  <p className="text-base font-semibold text-blue-600">{formatPrice(selectedDrivertest.fee)}</p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-500 uppercase mb-1">Địa Điểm</p>
                  <p className="text-base font-semibold text-gray-800">{selectedDrivertest.testLocation}</p>
              </div>

              {/* Status Update Section */}
              <div className="border-t border-gray-100 pt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Cập nhật trạng thái</label>
                <div className="flex gap-4 items-center">
                    <select
                        value={selectedDrivertest.status}
                        onChange={(e) => handleStatusChange(selectedDrivertest.id, e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    >
                        <option value="PENDING">Chờ Xác Nhận</option>
                        <option value="SCHEDULED">Đã Lên Lịch</option>
                        <option value="COMPLETED">Hoàn Thành</option>
                        <option value="CANCELLED">Hủy</option>
                    </select>
                    <span className={`px-4 py-2 rounded-lg text-sm font-bold ${getStatusColor(selectedDrivertest.status)}`}>
                        {getStatusText(selectedDrivertest.status)}
                    </span>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-xl flex justify-end gap-3">
              <button
                onClick={() => { handleEdit(selectedDrivertest); setShowDetail(false); }}
                className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition shadow-sm"
              >
                Chỉnh Sửa
              </button>
              <button
                onClick={() => setShowDetail(false)}
                className="px-5 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition shadow-sm"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-gray-800">
                {editingId ? 'Chỉnh Sửa Thông Tin' : 'Thêm Mới Lịch Lái Thử'}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Khách Hàng <span className="text-red-500">*</span></label>
                <select
                  value={formData.userId}
                  onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                >
                  <option value="">-- Chọn khách hàng --</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>{user.fullName} ({user.email})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Xe <span className="text-red-500">*</span></label>
                <select
                  value={formData.carId}
                  onChange={(e) => setFormData({ ...formData, carId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                >
                  <option value="">-- Chọn xe --</option>
                  {cars.map((car) => (
                    <option key={car.id} value={car.id}>{car.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ngày giờ <span className="text-red-500">*</span></label>
                <input
                  type="datetime-local"
                  value={formData.testDate}
                  onChange={(e) => setFormData({ ...formData, testDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Địa điểm <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={formData.testLocation}
                  onChange={(e) => setFormData({ ...formData, testLocation: e.target.value })}
                  placeholder="VD: Showroom Mercedes Hà Nội"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phí (VND) <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  value={formData.fee}
                  onChange={(e) => setFormData({ ...formData, fee: e.target.value })}
                  min="0"
                  step="1000"
                  placeholder="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-xl flex justify-end gap-3">
              <button
                onClick={handleSave}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-sm transition"
              >
                Lưu Thông Tin
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="px-6 py-2.5 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 rounded-lg font-medium shadow-sm transition"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDrivertest;