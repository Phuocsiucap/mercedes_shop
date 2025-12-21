import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createOrder } from '../api/orderApi';
import { createVNPayPayment } from '../api/paymentApi';
import { FaTrash, FaShoppingCart, FaArrowLeft, FaMapMarkerAlt, FaCreditCard, FaMoneyBillWave, FaShieldAlt } from 'react-icons/fa';

const CartPage = () => {
  const { items, totalAmount, updateQuantity, removeItem, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('direct'); // 'direct' or 'vnpay'

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity < 1) {
      if (window.confirm('Bạn có muốn xóa sản phẩm này khỏi giỏ hàng?')) {
        removeItem(itemId);
      }
    } else {
      updateQuantity(itemId, newQuantity);
    }
  };

  const handleRemoveItem = (itemId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      removeItem(itemId);
    }
  };

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/cart' } } });
      return;
    }

    if (!deliveryAddress.trim()) {
      setError('Vui lòng nhập địa chỉ giao hàng');
      return;
    }

    if (items.length === 0) {
      setError('Giỏ hàng trống');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const orderData = {
        deliveryAddress: deliveryAddress,
        items: items.map((item) => ({
          carId: item.id,
          quantity: item.quantity,
        })),
      };

      const response = await createOrder(orderData);

      if (response.success) {
        if (paymentMethod === 'vnpay') {
          try {
            const paymentResponse = await createVNPayPayment({
              orderId: response.data.id,
              amount: totalAmount,
              orderInfo: `Thanh toan don hang #${response.data.id}`,
              returnUrl: window.location.origin + '/payment',
            });

            if (paymentResponse.data && paymentResponse.data.paymentUrl) {
              window.location.href = paymentResponse.data.paymentUrl;
              return;
            }
          } catch (paymentErr) {
            console.error('Error creating VNPay payment:', paymentErr);
            setError('Lỗi khi tạo yêu cầu thanh toán VNPay');
            return;
          }
        }

        clearCart();
        alert('Đặt hàng thành công!');
        navigate('/orders');
      }
    } catch (err) {
      console.error('Error creating order:', err);
      setError(err.message || 'Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-12">
            <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-500 text-5xl">
              <FaShoppingCart />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Giỏ hàng trống</h2>
            <p className="text-gray-500 mb-8">Bạn chưa thêm sản phẩm nào vào giỏ hàng.</p>
            <Link
              to="/cars"
              className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              <FaArrowLeft className="mr-2" /> Tiếp tục mua sắm
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center gap-3 mb-8">
          <FaShoppingCart className="text-3xl text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-800">Giỏ Hàng Của Bạn</h1>
          <span className="text-gray-500 font-medium ml-2">({items.length} sản phẩm)</span>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-8 shadow-sm flex items-center">
            <span className="mr-2">⚠️</span> {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {items.map((item) => (
                <div key={item.id} className="p-6 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition duration-200">
                  <div className="flex flex-col sm:flex-row gap-6">
                    {/* Image */}
                    <Link to={`/cars/${item.id}`} className="block flex-shrink-0">
                      <div className="w-full sm:w-32 h-32 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover hover:scale-105 transition duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-4xl">🚗</div>
                        )}
                      </div>
                    </Link>

                    {/* Content */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <Link to={`/cars/${item.id}`} className="text-lg font-bold text-gray-800 hover:text-blue-600 transition line-clamp-1">
                            {item.name}
                          </Link>
                          <button 
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-gray-400 hover:text-red-500 transition p-1"
                            title="Xóa sản phẩm"
                          >
                            <FaTrash />
                          </button>
                        </div>
                        <p className="text-sm text-gray-500 mb-1">Màu sắc: <span className="font-medium text-gray-700">{item.color || 'Tiêu chuẩn'}</span></p>
                        <p className="text-blue-600 font-bold text-lg">{formatPrice(item.price)}</p>
                      </div>

                      <div className="flex justify-between items-center mt-4 sm:mt-0">
                        <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                          <button 
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            className="px-3 py-1 hover:bg-gray-100 text-gray-600 font-bold transition"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 1)}
                            className="w-12 text-center text-sm border-x border-gray-300 py-1 outline-none"
                          />
                          <button 
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            className="px-3 py-1 hover:bg-gray-100 text-gray-600 font-bold transition"
                          >
                            +
                          </button>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Thành tiền</p>
                          <p className="text-lg font-bold text-gray-900">{formatPrice(item.price * item.quantity)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <Link to="/cars" className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition">
              <FaArrowLeft className="mr-2" /> Mua thêm sản phẩm khác
            </Link>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-800 mb-6 pb-4 border-b border-gray-100">Thông Tin Thanh Toán</h2>

              {/* Address Input */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <FaMapMarkerAlt className="mr-2 text-blue-500" /> Địa chỉ nhận hàng <span className="text-red-500 ml-1">*</span>
                </label>
                <textarea
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
                  placeholder="Số nhà, tên đường, phường/xã, quận/huyện..."
                />
              </div>

              {/* Payment Methods */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <FaCreditCard className="mr-2 text-blue-500" /> Phương thức thanh toán
                </label>
                <div className="space-y-3">
                  <label 
                    className={`flex items-start p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'direct' ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="direct"
                      checked={paymentMethod === 'direct'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mt-1 w-4 h-4 text-blue-600"
                    />
                    <div className="ml-3">
                      <span className="block font-bold text-gray-800 flex items-center gap-2"><FaMoneyBillWave className="text-green-600"/> Tiền mặt (COD)</span>
                      <span className="text-xs text-gray-500 mt-1">Thanh toán khi nhận hàng</span>
                    </div>
                  </label>

                  <label 
                    className={`flex items-start p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'vnpay' ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="vnpay"
                      checked={paymentMethod === 'vnpay'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mt-1 w-4 h-4 text-blue-600"
                    />
                    <div className="ml-3">
                      <span className="block font-bold text-gray-800 flex items-center gap-2"><FaShieldAlt className="text-blue-600"/> VNPAY QR</span>
                      <span className="text-xs text-gray-500 mt-1">Thanh toán an toàn qua cổng VNPAY</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Totals */}
              <div className="space-y-3 mb-6 pt-4 border-t border-gray-100">
                <div className="flex justify-between text-gray-600 text-sm">
                  <span>Tạm tính:</span>
                  <span>{formatPrice(totalAmount)}</span>
                </div>
                <div className="flex justify-between text-gray-600 text-sm">
                  <span>Phí vận chuyển:</span>
                  <span className="text-green-600 font-medium">Miễn phí</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                  <span className="font-bold text-gray-800">Tổng cộng:</span>
                  <span className="font-bold text-blue-600 text-2xl">{formatPrice(totalAmount)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                disabled={isSubmitting}
                className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition transform hover:-translate-y-0.5 active:translate-y-0 ${
                  isSubmitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
                }`}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang xử lý...
                  </div>
                ) : (
                  'Xác Nhận Đặt Hàng'
                )}
              </button>
              
              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
                <FaShieldAlt /> Bảo mật thanh toán 100%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;