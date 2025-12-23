import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import orderService from '../services/orderService'; // [SỬA 1] Import orderService thay vì userService
import { useApp } from '../context/AppContext';
import { FaBoxOpen, FaCalendarAlt, FaMapMarkerAlt, FaChevronRight } from 'react-icons/fa';

const OrdersPage = () => {
  const { formatCurrency } = useApp();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      // [SỬA 2] Gọi hàm getMyOrders từ orderService
      const response = await orderService.getMyOrders(); 
      
      // Sắp xếp: Mới nhất lên đầu
      const sortedOrders = (response.data || []).sort((a, b) => {
        return new Date(b.orderDate) - new Date(a.orderDate);
      });
      setOrders(sortedOrders);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Không thể tải danh sách đơn hàng.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này không?')) return;

    try {
      // [SỬA 3] Gọi hàm cancelOrder từ orderService (Hàm này đã dùng method DELETE đúng với backend)
      await orderService.cancelOrder(orderId);
      
      // Cập nhật giao diện: Đổi trạng thái đơn vừa hủy thành CANCELLED
      setOrders(prevOrders => prevOrders.map(order => 
        order.id === orderId ? { ...order, status: 'CANCELLED' } : order
      ));

      alert('Đã hủy đơn hàng thành công!');
    } catch (err) {
      console.error('Cancel error:', err);
      // Hiển thị lỗi chi tiết hơn nếu có
      const errorMessage = err.response?.data?.message || err.message || 'Hủy đơn thất bại. Vui lòng thử lại sau.';
      alert(errorMessage);
    }
  };

  const getStatusBadge = (status) => {
    const configs = {
      PENDING: { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', label: 'Chờ xác nhận', icon: '⏳' },
      DELIVERING: { color: 'bg-blue-100 text-blue-700 border-blue-200', label: 'Đang giao hàng', icon: '🚚' },
      COMPLETED: { color: 'bg-green-100 text-green-700 border-green-200', label: 'Giao thành công', icon: '✅' },
      CANCELLED: { color: 'bg-red-100 text-red-700 border-red-200', label: 'Đã hủy', icon: '✖️' },
    };
    const config = configs[status] || { color: 'bg-gray-100 text-gray-700', label: status, icon: '' };

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${config.color}`}>
        <span>{config.icon}</span> {config.label}
      </span>
    );
  };

  // Hàm xử lý lấy ảnh thông minh
  const getCarImage = (detail) => {
    if (detail.images && detail.images.length > 0) {
        return detail.images[0];
    }
    if (detail.car && detail.car.images && detail.car.images.length > 0) {
        return detail.car.images[0];
    }
    if (detail.carImage) {
        return detail.carImage;
    }
    return "https://placehold.co/100x100?text=No+Image";
  };

  const handleImageError = (e) => {
    e.target.src = 'data:image/svg+xml;base64,' + btoa(`
      <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f3f4f6"/>
        <text x="50%" y="50%" font-family="Arial" font-size="20" fill="#9ca3af" text-anchor="middle" dy=".3em">🚗</text>
      </svg>
    `);
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-500 font-medium">Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="container mx-auto max-w-5xl">
        <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-blue-600 rounded-lg shadow-lg shadow-blue-200">
                <FaBoxOpen className="text-white text-2xl" />
            </div>
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Lịch sử đơn hàng</h1>
                <p className="text-gray-500 text-sm">Quản lý các đơn hàng của bạn</p>
            </div>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6">{error}</div>}

        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-16 text-center border border-gray-100">
            <FaBoxOpen className="text-4xl text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-800">Chưa có đơn hàng nào</h2>
            <Link to="/cars" className="mt-6 inline-block bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700 transition">
              Mua sắm ngay
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                
                {/* Header */}
                <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100 flex flex-wrap justify-between items-center gap-4">
                  <div className="flex items-center gap-6">
                    <div>
                        <span className="text-xs text-gray-500 font-semibold uppercase">Mã đơn</span>
                        <p className="text-sm font-bold text-gray-800">#{order.id.substring(0, 8).toUpperCase()}</p>
                    </div>
                    <div className="w-px h-8 bg-gray-200 hidden sm:block"></div>
                    <div>
                        <span className="text-xs text-gray-500 font-semibold uppercase flex items-center gap-1">
                            <FaCalendarAlt size={10} /> Ngày đặt
                        </span>
                        <p className="text-sm font-medium text-gray-700">
                           {new Date(order.orderDate).toLocaleDateString('vi-VN', {
                             year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit'
                           })}
                        </p>
                    </div>
                  </div>
                  {getStatusBadge(order.status)}
                </div>

                {/* Body */}
                <div className="p-6">
                  <div className="space-y-4">
                    {order.orderDetails && order.orderDetails.map((detail, index) => (
                      <div key={index} className="flex gap-4 items-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden border flex-shrink-0">
                          <img 
                            src={getCarImage(detail)} 
                            alt={detail.carName} 
                            className="w-full h-full object-cover" 
                            onError={handleImageError} 
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-800 line-clamp-1">{detail.carName}</h4>
                          <p className="text-sm text-gray-500">Số lượng: x{detail.quantity}</p>
                        </div>
                        <p className="font-bold text-blue-600 whitespace-nowrap">{formatCurrency(detail.subtotal)}</p>
                      </div>
                    ))}
                  </div>

                  <div className="h-px bg-gray-100 my-4"></div>

                  <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                    <div className="flex gap-2 text-sm text-gray-600">
                        <FaMapMarkerAlt className="text-red-500 mt-1 flex-shrink-0" />
                        <span className="line-clamp-2">{order.deliveryAddress || "Chưa có địa chỉ"}</span>
                    </div>

                    <div className="flex flex-col items-end gap-3 w-full md:w-auto">
                        <div className="text-xl">
                            <span className="text-gray-600 text-sm font-medium mr-2">Tổng tiền:</span>
                            <span className="font-bold text-red-600">{formatCurrency(order.totalAmount)}</span>
                        </div>

                        <div className="flex gap-3 w-full sm:w-auto">
                            {order.status === 'PENDING' && (
                                <button
                                    onClick={() => handleCancelOrder(order.id)}
                                    className="px-4 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 font-medium text-sm transition w-full sm:w-auto"
                                >
                                    Hủy đơn
                                </button>
                            )}
                            
                            <Link
                                to={`/orders/${order.id}`}
                                className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition flex items-center justify-center gap-2 w-full sm:w-auto shadow-md shadow-blue-200"
                            >
                                Xem chi tiết <FaChevronRight size={10} />
                            </Link>
                        </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;