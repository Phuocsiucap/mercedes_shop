import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUserOrders, cancelOrder } from '../api/orderApi';
import { FaBoxOpen, FaTruck, FaCheckCircle, FaTimesCircle, FaMapMarkerAlt, FaCalendarAlt, FaMoneyBillWave, FaEye } from 'react-icons/fa';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await getUserOrders();
      
      // LOGIC AN TOÀN: Kiểm tra kỹ mọi trường hợp dữ liệu trả về
      let data = [];
      if (response?.data?.content) {
        data = response.data.content; // Trường hợp phân trang
      } else if (response?.data && Array.isArray(response.data)) {
        data = response.data; // Trường hợp mảng trực tiếp trong data
      } else if (Array.isArray(response)) {
        data = response; // Trường hợp mảng gốc
      }
      
      setOrders(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching orders:', err);
      // Nếu lỗi, set mảng rỗng để không crash, chỉ hiện thông báo
      setOrders([]);
      if (!loading) setError('Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này không?')) {
      try {
        await cancelOrder(orderId);
        alert('Đã hủy đơn hàng thành công');
        fetchOrders(); // Load lại danh sách
      } catch (err) {
        console.error('Error cancelling order:', err);
        alert(err.response?.data?.message || 'Không thể hủy đơn hàng');
      }
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price || 0);
  };

  // Helper an toàn để lấy ID
  const getSafeId = (id) => {
      if (!id) return '---';
      return String(id).substring(0, 8);
  };

  // Cấu hình hiển thị trạng thái (Màu sắc & Icon)
  const getStatusConfig = (status) => {
    switch (status) {
      case 'PENDING':
        return { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', text: 'Chờ Xác Nhận', icon: <FaBoxOpen /> };
      case 'DELIVERING':
        return { color: 'bg-blue-100 text-blue-800 border-blue-200', text: 'Đang Giao', icon: <FaTruck /> };
      case 'COMPLETED':
        return { color: 'bg-green-100 text-green-800 border-green-200', text: 'Hoàn Thành', icon: <FaCheckCircle /> };
      case 'CANCELLED':
        return { color: 'bg-red-100 text-red-800 border-red-200', text: 'Đã Hủy', icon: <FaTimesCircle /> };
      default:
        return { color: 'bg-gray-100 text-gray-800', text: status, icon: null };
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <FaBoxOpen className="text-blue-600" /> Đơn Hàng Của Tôi
            </h1>
            <p className="text-gray-600 mt-1 ml-1">Theo dõi và quản lý lịch sử mua hàng</p>
          </div>
          <Link to="/cars" className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-lg shadow transition">
             Mua Thêm Xe
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
            <span>⚠️</span> {error}
          </div>
        )}

        {/* Empty State (Giống hình ảnh bạn gửi) */}
        {!orders || orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-16 text-center border border-gray-100">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6 text-gray-400 text-4xl">
                <FaBoxOpen />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Bạn chưa có đơn hàng nào</h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              Khám phá các mẫu xe mới nhất và đặt hàng ngay hôm nay!
            </p>
            <Link
              to="/cars"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition shadow-sm"
            >
              Xem Danh Sách Xe
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {orders.map((order) => {
              // SAFE CHECK: Bỏ qua nếu order bị null để tránh crash
              if (!order) return null;
              
              const statusConfig = getStatusConfig(order.status);
              
              return (
                <div key={order.id || Math.random()} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition duration-300">
                  {/* Order Header */}
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-bold text-lg text-gray-800">
                            Đơn hàng #{getSafeId(order.id)}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${statusConfig.color}`}>
                          {statusConfig.icon} {statusConfig.text}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                            <FaCalendarAlt /> {order.orderDate ? new Date(order.orderDate).toLocaleDateString('vi-VN') : 'N/A'}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                       <p className="text-xs text-gray-500 font-semibold uppercase mb-0.5">Tổng thanh toán</p>
                       <p className="text-xl font-bold text-blue-600">{formatPrice(order.totalAmount)}</p>
                    </div>
                  </div>

                  {/* Order Body */}
                  <div className="p-6">
                    {/* List Items */}
                    <div className="space-y-4 mb-6">
                      {order.orderDetails && order.orderDetails.length > 0 ? (
                          order.orderDetails.map((detail) => (
                            <div key={detail.id || Math.random()} className="flex items-start gap-4">
                              <div className="w-20 h-20 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                                {detail.carImage ? (
                                  <img src={detail.carImage} alt={detail.carName} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-2xl">🚗</div>
                                )}
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-800 text-lg">{detail.carName || 'Xe đã bị xóa'}</h4>
                                <p className="text-sm text-gray-500">Số lượng: <span className="font-medium text-gray-900">{detail.quantity}</span></p>
                                <p className="text-sm text-blue-600 font-medium mt-1">{formatPrice(detail.unitPrice)}</p>
                              </div>
                            </div>
                          ))
                      ) : (
                          <p className="text-gray-400 italic">Không có thông tin sản phẩm</p>
                      )}
                    </div>

                    {/* Footer Info & Actions */}
                    <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4 pt-4 border-t border-gray-100">
                        <div className="flex items-start gap-2 text-sm text-gray-600 max-w-md">
                            <FaMapMarkerAlt className="mt-1 text-gray-400 flex-shrink-0" />
                            <div>
                                <span className="font-semibold text-gray-700">Địa chỉ nhận hàng:</span>
                                <p className="mt-1">{order.deliveryAddress || 'Chưa cập nhật'}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 w-full md:w-auto">
                            {order.status === 'PENDING' && (
                                <button
                                    onClick={() => handleCancelOrder(order.id)}
                                    className="flex-1 md:flex-none px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 font-medium transition text-sm flex items-center justify-center gap-1"
                                >
                                    <FaTimesCircle /> Hủy Đơn
                                </button>
                            )}
                            <Link
                                to={`/orders/${order.id}`} // Đảm bảo bạn có Route này hoặc dùng Modal
                                className="flex-1 md:flex-none px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition shadow-sm text-sm flex items-center justify-center gap-2"
                            >
                                <FaEye /> Xem Chi Tiết
                            </Link>
                        </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;