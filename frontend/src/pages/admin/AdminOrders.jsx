import { useState, useEffect } from 'react';
import axios from '../../api/axios';
import { FaEye, FaTrash, FaChevronLeft, FaChevronRight, FaSearch, FaFilter, FaTimes } from 'react-icons/fa';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filter, startDateFilter, endDateFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/orders');
      let data = [];
      if (response.data?.data?.content) data = response.data.data.content;
      else if (Array.isArray(response.data?.data)) data = response.data.data;
      else if (Array.isArray(response.data)) data = response.data;
      setOrders(data);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    // Xác nhận trước khi đổi
    if (!window.confirm(`Xác nhận chuyển trạng thái sang "${getStatusText(newStatus)}"?`)) return;

    try {
      await axios.patch(`/orders/${orderId}/status`, null, { params: { status: newStatus } });
      
      // Cập nhật danh sách bên ngoài
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      
      // Cập nhật ngay trong Modal nếu đang mở
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(prev => ({ ...prev, status: newStatus }));
      }
      
      alert('Đã cập nhật trạng thái!');
    } catch (err) {
      console.error('Error:', err);
      alert('Có lỗi xảy ra khi cập nhật trạng thái.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('CẢNH BÁO: Bạn có chắc chắn muốn xóa vĩnh viễn đơn hàng này?')) {
      try {
        await axios.delete(`/orders/${id}`);
        alert('Xóa đơn hàng thành công');
        
        // Xóa khỏi state danh sách
        setOrders(prev => prev.filter(o => o.id !== id));
        
        // Đóng modal nếu đang mở đúng đơn hàng đó
        if (selectedOrder?.id === id) {
            setShowDetail(false);
            setSelectedOrder(null);
        }
      } catch (err) {
        console.error(err);
        alert('Lỗi khi xóa đơn hàng');
      }
    }
  };

  const handleViewDetail = (order) => {
    setSelectedOrder(order);
    setShowDetail(true);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  // Style Badge (Màu pastel, chữ đậm)
  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200';
      case 'DELIVERING': return 'bg-blue-100 text-blue-700 hover:bg-blue-200';
      case 'COMPLETED': return 'bg-green-100 text-green-700 hover:bg-green-200';
      case 'CANCELLED': return 'bg-red-100 text-red-700 hover:bg-red-200';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      PENDING: 'Chờ Xác Nhận',
      DELIVERING: 'Đang Giao',
      COMPLETED: 'Hoàn Thành',
      CANCELLED: 'Hủy',
    };
    return statusMap[status] || status;
  };

  // --- LOGIC LỌC DỮ LIỆU ---
  const filteredOrders = orders.filter((order) => {
    if (filter && order.status !== filter) return false;
    if (startDateFilter || endDateFilter) {
      if (!order.orderDate) return false;
      const od = new Date(order.orderDate);
      const start = startDateFilter ? new Date(startDateFilter) : null;
      const end = endDateFilter ? new Date(endDateFilter) : null;
      if (start && od < start) return false;
      if (end && od > end) return false;
    }
    const q = searchTerm.trim().toLowerCase();
    if (!q) return true;
    return (
      order.id.toString().includes(q) ||
      (order.user?.fullName && order.user.fullName.toLowerCase().includes(q))
    );
  });

  const totalItems = filteredOrders.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Quản Lý Đơn Hàng</h1>
      </div>

      {/* Bộ lọc */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex flex-col gap-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Tìm theo ID hoặc tên khách..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
          <div className="relative min-w-[200px]">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="PENDING">Chờ Xác Nhận</option>
              <option value="DELIVERING">Đang Giao</option>
              <option value="COMPLETED">Hoàn Thành</option>
              <option value="CANCELLED">Hủy</option>
            </select>
            <FaFilter className="absolute left-3 top-3 text-gray-400" />
          </div>
        </div>
        <div className="flex flex-wrap items-end gap-4 border-t pt-4">
            <div><label className="block text-xs text-gray-500 mb-1">Từ ngày</label><input type="datetime-local" value={startDateFilter} onChange={(e) => setStartDateFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
            <div><label className="block text-xs text-gray-500 mb-1">Đến ngày</label><input type="datetime-local" value={endDateFilter} onChange={(e) => setEndDateFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
            <button onClick={() => { setSearchTerm(''); setStartDateFilter(''); setEndDateFilter(''); setFilter(''); }} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition">Xóa bộ lọc</button>
        </div>
      </div>

      {/* Bảng dữ liệu */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full whitespace-nowrap">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Ngày Đặt</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Khách Hàng</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Tổng Tiền</th>
                <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase">Trạng Thái</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Hành Động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                 <tr><td colSpan="6" className="text-center py-8">Đang tải...</td></tr>
              ) : paginatedOrders.length > 0 ? (
                paginatedOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">#{order.id.substring(0, 8)}...</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{new Date(order.orderDate).toLocaleDateString('vi-VN')}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{order.user?.fullName || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">{formatPrice(order.totalAmount)}</td>
                    
                    {/* CỘT TRẠNG THÁI (Select style Badge) */}
                    <td className="px-6 py-4 text-sm text-center">
                        <div className="relative inline-block w-full max-w-[140px]">
                            <select 
                                value={order.status} 
                                onChange={(e)=>handleStatusChange(order.id, e.target.value)}
                                className={`appearance-none w-full cursor-pointer text-xs font-bold py-1.5 px-3 rounded-full border-0 focus:ring-2 focus:ring-offset-1 focus:ring-blue-300 transition-colors duration-200 text-center ${getStatusColor(order.status)}`}
                                style={{ textAlignLast: 'center' }}
                            >
                                <option value="PENDING" className="bg-white text-gray-800">Chờ Xác Nhận</option>
                                <option value="DELIVERING" className="bg-white text-gray-800">Đang Giao</option>
                                <option value="COMPLETED" className="bg-white text-gray-800">Hoàn Thành</option>
                                <option value="CANCELLED" className="bg-white text-gray-800">Hủy</option>
                            </select>
                        </div>
                    </td>

                    <td className="px-6 py-4 text-sm text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                            onClick={() => handleViewDetail(order)} 
                            className="text-blue-600 hover:bg-blue-50 p-2 rounded transition"
                            title="Xem chi tiết"
                        >
                            <FaEye size={16} />
                        </button>
                        <button 
                            onClick={() => handleDelete(order.id)} 
                            className="text-red-600 hover:bg-red-50 p-2 rounded transition"
                            title="Xóa đơn hàng"
                        >
                            <FaTrash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="6" className="text-center py-8 text-gray-500">Không tìm thấy đơn hàng nào</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Phân trang */}
        <Pagination currentPage={currentPage} totalItems={totalItems} itemsPerPage={ITEMS_PER_PAGE} onPageChange={setCurrentPage} />
      </div>

      {/* --- MODAL CHI TIẾT (Đã cập nhật) --- */}
      {showDetail && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
             <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
                <h2 className="text-xl font-bold text-gray-800">Chi Tiết Đơn Hàng #{selectedOrder.id.substring(0, 8)}</h2>
                <button onClick={() => setShowDetail(false)} className="text-gray-400 hover:text-gray-600 text-2xl transition hover:rotate-90"><FaTimes /></button>
             </div>
             
             <div className="p-6 space-y-6">
                {/* Thông tin chung */}
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Khách hàng</p>
                        <p className="font-medium text-gray-900">{selectedOrder.user?.fullName}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Tổng tiền</p>
                        <p className="font-bold text-blue-600 text-lg">{formatPrice(selectedOrder.totalAmount)}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Ngày đặt</p>
                        <p className="text-gray-700">{new Date(selectedOrder.orderDate).toLocaleString('vi-VN')}</p>
                    </div>
                    
                    {/* --- CẬP NHẬT TRẠNG THÁI TRONG MODAL --- */}
                    <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Trạng thái (Bấm để đổi)</p>
                        <div className="relative inline-block w-full">
                            <select 
                                value={selectedOrder.status} 
                                onChange={(e)=>handleStatusChange(selectedOrder.id, e.target.value)}
                                className={`appearance-none w-full cursor-pointer text-sm font-bold py-2 px-4 rounded-full border-0 focus:ring-2 focus:ring-offset-1 focus:ring-blue-300 transition-colors duration-200 ${getStatusColor(selectedOrder.status)}`}
                                style={{ textAlignLast: 'left' }}
                            >
                                <option value="PENDING" className="bg-white text-gray-800">Chờ Xác Nhận</option>
                                <option value="DELIVERING" className="bg-white text-gray-800">Đang Giao</option>
                                <option value="COMPLETED" className="bg-white text-gray-800">Hoàn Thành</option>
                                <option value="CANCELLED" className="bg-white text-gray-800">Hủy</option>
                            </select>
                        </div>
                    </div>
                    
                    <div className="col-span-2">
                        <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Địa chỉ giao hàng</p>
                        <p className="font-medium text-gray-800 bg-gray-50 p-3 rounded-lg border border-gray-200">
                            {selectedOrder.deliveryAddress || 'Nhận tại showroom'}
                        </p>
                    </div>
                </div>

                {/* Danh sách sản phẩm */}
                <div className="border-t pt-4">
                    <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <span>📦</span> Danh sách sản phẩm
                    </h3>
                    <div className="space-y-3">
                        {selectedOrder.orderDetails?.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                                <div>
                                    <p className="font-semibold text-gray-800">{item.carName}</p>
                                    <p className="text-sm text-gray-500">Số lượng: {item.quantity}</p>
                                </div>
                                <p className="font-bold text-gray-900">{formatPrice(item.price)}</p>
                            </div>
                        ))}
                    </div>
                </div>
             </div>

             {/* Footer Actions trong Modal */}
             <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-lg flex justify-end gap-3">
                {/* Nút Xóa */}
                <button 
                    onClick={() => handleDelete(selectedOrder.id)} 
                    className="px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg font-medium transition flex items-center gap-2"
                >
                    <FaTrash size={14} /> Xóa Đơn Hàng
                </button>
                {/* Nút Đóng */}
                <button 
                    onClick={() => setShowDetail(false)} 
                    className="px-6 py-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition"
                >
                    Đóng
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

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
                <button
                    key={i}
                    onClick={() => onPageChange(i)}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg border text-sm font-medium transition ${
                        currentPage === i
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                >
                    {i}
                </button>
            );
        }
        return pageNumbers;
    };

    return (
        <div className="px-6 py-4 flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 bg-gray-50 gap-4">
            <div className="text-sm text-gray-500">
                Hiển thị <span className="font-medium">{Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}</span> đến{' '}
                <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalItems)}</span> của{' '}
                <span className="font-medium">{totalItems}</span> kết quả
            </div>
            <div className="flex items-center gap-2">
                <button
                    onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <FaChevronLeft size={12} />
                </button>
                {renderPageNumbers()}
                <button
                    onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <FaChevronRight size={12} />
                </button>
            </div>
        </div>
    );
};

export default AdminOrders;