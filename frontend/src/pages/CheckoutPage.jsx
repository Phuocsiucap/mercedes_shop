import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import cartService from '../services/cartService';
import paymentService from '../services/paymentService';
import { toast } from 'react-toastify';

const CheckoutPage = () => {
  const { items, totalAmount, clearCart } = useCart();
  const { user } = useAuth();
  const { formatCurrency } = useApp();
  const navigate = useNavigate();

  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const formatPrice = (price) => {
    return formatCurrency(price);
  };

  // Calculate actual payment amount (1% deposit if >= 1 billion)
  const getActualPaymentAmount = () => {
    if (totalAmount >= 1_000_000_000) {
      return Math.max(5000, Math.round(totalAmount * 0.01));
    }
    return totalAmount;
  };

  const isDepositPayment = totalAmount >= 1_000_000_000;
  const actualPaymentAmount = getActualPaymentAmount();

  const handleSubmitOrder = async () => {
    if (!deliveryAddress.trim()) {
      setError('Vui lòng nhập địa chỉ giao hàng');
      toast.error('Vui lòng nhập địa chỉ giao hàng');
      return;
    }

    if (items.length === 0) {
      setError('Giỏ hàng trống');
      toast.error('Giỏ hàng trống');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const orderData = {
        deliveryAddress: deliveryAddress,
        paymentMethod: paymentMethod,
        items: items.map((item) => ({
          carId: item.id,
          quantity: item.quantity,
        })),
      };

      // Create order first
      const orderResponse = await cartService.createOrder(orderData);

      if (orderResponse.success) {
        const orderId = orderResponse.data.id;

        // If payment method is VNPay, create payment URL
        if (paymentMethod === 'VNPAY') {
          // Ensure amount is an integer (VND doesn't have decimal)
          const amountInVND = Math.round(totalAmount);
          
          // Calculate actual payment amount (1% deposit if >= 1 billion)
          let actualPaymentAmount = amountInVND;
          if (amountInVND >= 1_000_000_000) {
            actualPaymentAmount = Math.max(5000, Math.round(amountInVND * 0.01));
          }
          
          if (actualPaymentAmount < 5000) {
            throw new Error('Số tiền thanh toán phải từ 5,000 VND trở lên');
          }
          
          const paymentRequest = {
            orderId: orderId.toString(),
            amount: amountInVND, // Send full amount, backend will calculate deposit
            orderInfo: `Thanh toan don hang #${orderId}`,
            returnUrl: `${window.location.origin}/vnpay-return`,
            locale: 'vn'
          };

          console.log('Creating VNPay payment with request:', paymentRequest);

          const paymentResponse = await paymentService.createPayment(paymentRequest);
          
          console.log('VNPay payment response:', paymentResponse);
          
          // Check if response has paymentUrl (could be in data or directly in response)
          const paymentUrl = paymentResponse.paymentUrl || paymentResponse.data?.paymentUrl;
          
          if (paymentResponse.success && paymentUrl) {
            // Redirect to VNPay
            window.location.href = paymentUrl;
          } else {
            throw new Error(paymentResponse.message || 'Không thể tạo link thanh toán VNPay');
          }
        } else {
          // COD payment - just clear cart and redirect
          clearCart();
          toast.success('Đặt hàng thành công!');
          navigate('/orders');
        }
      }
    } catch (err) {
      console.error('Error creating order:', err);
      const errorMessage = err.message || 'Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-6">🛒</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Giỏ hàng trống
            </h2>
            <p className="text-gray-600 mb-8">
              Vui lòng thêm sản phẩm vào giỏ hàng trước khi thanh toán
            </p>
            <Link
              to="/cars"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition"
            >
              Tiếp tục mua sắm
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center text-sm text-gray-600">
          <Link to="/cart" className="hover:text-blue-600">Giỏ hàng</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900 font-medium">Thanh toán</span>
        </div>

        <h1 className="text-3xl font-bold text-gray-800 mb-8">Thanh Toán</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Info */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Thông tin khách hàng
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Họ và tên
                  </label>
                  <input
                    type="text"
                    value={user?.fullName || ''}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Địa chỉ giao hàng
              </h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Địa chỉ <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập địa chỉ giao hàng đầy đủ (số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố)..."
                  required
                />
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Phương thức thanh toán
              </h2>
              <div className="space-y-3">
                {/* VNPay */}
                <label className="flex items-start p-4 border-2 rounded-lg cursor-pointer hover:border-blue-500 transition">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="VNPAY"
                    checked={paymentMethod === 'VNPAY'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mt-1 mr-3"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-800">VNPay</span>
                      <img 
                        src="https://vnpay.vn/s1/statics.vnpay.vn/2023/9/06ncktiwd6dc1694418196384.png" 
                        alt="VNPay" 
                        className="h-8"
                      />
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Thanh toán qua cổng VNPay (ATM, Visa, MasterCard, QR Code)
                    </p>
                  </div>
                </label>

                {/* COD */}
                <label className="flex items-start p-4 border-2 rounded-lg cursor-pointer hover:border-blue-500 transition">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="COD"
                    checked={paymentMethod === 'COD'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mt-1 mr-3"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-800">Thanh toán khi nhận hàng (COD)</span>
                      <span className="text-2xl">💵</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Thanh toán bằng tiền mặt khi nhận hàng
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-800 mb-6">
                Đơn hàng của bạn
              </h2>

              {/* Cart Items Summary */}
              <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3 pb-3 border-b">
                    <img
                      src={item.image || '/placeholder-car.jpg'}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-sm text-gray-800 line-clamp-2">
                        {item.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        SL: {item.quantity}
                      </p>
                      <p className="text-sm font-semibold text-blue-600">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Summary */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Tạm tính:</span>
                  <span className="font-semibold">{formatPrice(totalAmount)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Phí vận chuyển:</span>
                  <span className="font-semibold">Liên hệ</span>
                </div>
                
                {/* Show deposit info if order >= 1 billion */}
                {isDepositPayment && paymentMethod === 'VNPAY' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
                    <div className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-blue-800">Đơn hàng giá trị cao</p>
                        <p className="text-xs text-blue-700 mt-1">
                          Do giới hạn của VNPay, bạn chỉ cần thanh toán trước 1% giá trị đơn hàng (đặt cọc). 
                          Phần còn lại sẽ thanh toán khi nhận hàng.
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-between text-sm pt-2 border-t border-blue-200">
                      <span className="text-blue-700 font-medium">Số tiền đặt cọc (1%):</span>
                      <span className="text-blue-900 font-bold">{formatPrice(actualPaymentAmount)}</span>
                    </div>
                  </div>
                )}
                
                <div className="border-t pt-3 flex justify-between text-lg">
                  <span className="font-bold text-gray-800">
                    {isDepositPayment && paymentMethod === 'VNPAY' ? 'Thanh toán ngay:' : 'Tổng cộng:'}
                  </span>
                  <span className="font-bold text-blue-600">
                    {isDepositPayment && paymentMethod === 'VNPAY' 
                      ? formatPrice(actualPaymentAmount) 
                      : formatPrice(totalAmount)}
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmitOrder}
                disabled={isSubmitting}
                className={`w-full font-semibold py-3 rounded-lg transition mb-3 ${
                  isSubmitting
                    ? 'bg-blue-400 cursor-not-allowed text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Đang xử lý...
                  </div>
                ) : (
                  paymentMethod === 'VNPAY' 
                    ? (isDepositPayment 
                        ? `Đặt cọc ${formatPrice(actualPaymentAmount)} qua VNPay` 
                        : 'Thanh toán VNPay')
                    : 'Đặt hàng'
                )}
              </button>

              <Link
                to="/cart"
                className="block w-full text-center bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 rounded-lg transition"
              >
                Quay lại giỏ hàng
              </Link>

              {/* Security Note */}
              <div className="mt-6 text-xs text-gray-600 bg-gray-50 p-3 rounded-lg">
                <p className="flex items-center gap-2 mb-2">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-semibold">Thanh toán an toàn</span>
                </p>
                <p>Thông tin của bạn được bảo mật và mã hóa</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
