import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { verifyVNPayPayment } from '../api/paymentApi';
import { FaCheckCircle, FaTimesCircle, FaClock, FaArrowLeft } from 'react-icons/fa';

const PaymentPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [paymentStatus, setPaymentStatus] = useState('processing');
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    verifyPayment();
  }, [isAuthenticated]);

  const verifyPayment = async () => {
    try {
      setLoading(true);
      
      // Collect all VNPay callback parameters
      const params = {
        vnp_Amount: searchParams.get('vnp_Amount'),
        vnp_BankCode: searchParams.get('vnp_BankCode'),
        vnp_BankTranNo: searchParams.get('vnp_BankTranNo'),
        vnp_CardType: searchParams.get('vnp_CardType'),
        vnp_OrderInfo: searchParams.get('vnp_OrderInfo'),
        vnp_PayDate: searchParams.get('vnp_PayDate'),
        vnp_ResponseCode: searchParams.get('vnp_ResponseCode'),
        vnp_TmnCode: searchParams.get('vnp_TmnCode'),
        vnp_TransactionNo: searchParams.get('vnp_TransactionNo'),
        vnp_TxnRef: searchParams.get('vnp_TxnRef'),
        vnp_SecureHash: searchParams.get('vnp_SecureHash'),
        vnp_SecureHashType: searchParams.get('vnp_SecureHashType'),
      };

      const response = await verifyVNPayPayment(params);

      if (response.success && params.vnp_ResponseCode === '00') {
        setPaymentStatus('success');
        setPaymentDetails({
          orderId: params.vnp_TxnRef,
          amount: (parseInt(params.vnp_Amount) / 100).toLocaleString('vi-VN'),
          transactionNo: params.vnp_TransactionNo,
          bankCode: params.vnp_BankCode,
          payDate: formatPayDate(params.vnp_PayDate),
          orderInfo: params.vnp_OrderInfo,
        });
      } else {
        setPaymentStatus('failed');
        setError(params.vnp_ResponseCode === '24' ? 'Người dùng hủy giao dịch' : 'Thanh toán không thành công');
      }
    } catch (err) {
      console.error('Error verifying payment:', err);
      setPaymentStatus('error');
      setError(err.message || 'Có lỗi xảy ra khi xác minh thanh toán');
    } finally {
      setLoading(false);
    }
  };

  const formatPayDate = (dateStr) => {
    if (!dateStr || dateStr.length !== 14) return 'N/A';
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);
    const hour = dateStr.substring(8, 10);
    const minute = dateStr.substring(10, 12);
    const second = dateStr.substring(12, 14);
    return `${day}/${month}/${year} ${hour}:${minute}:${second}`;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-6 bg-blue-100 rounded-full">
              <svg
                className="animate-spin h-8 w-8 text-blue-600"
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
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Đang xác minh thanh toán</h2>
            <p className="text-gray-600">Vui lòng chờ trong giây lát...</p>
          </div>
        </div>
      </div>
    );
  }

  if (paymentStatus === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
            {/* Success Header */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 p-8 text-center">
              <FaCheckCircle className="text-5xl text-white mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-white">Thanh toán thành công!</h1>
            </div>

            {/* Payment Details */}
            <div className="p-8 space-y-6">
              <div className="space-y-3">
                <DetailRow label="Mã đơn hàng" value={paymentDetails?.orderId} />
                <DetailRow label="Số tiền" value={`₫ ${paymentDetails?.amount}`} highlight />
                <DetailRow label="Mã giao dịch" value={paymentDetails?.transactionNo} />
                <DetailRow label="Ngân hàng" value={paymentDetails?.bankCode || 'VNPay'} />
                <DetailRow label="Thời gian thanh toán" value={paymentDetails?.payDate} />
              </div>

              {paymentDetails?.orderInfo && (
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <p className="text-sm text-gray-600 mb-1">Nội dung giao dịch:</p>
                  <p className="text-sm font-medium text-gray-800">{paymentDetails.orderInfo}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2 pt-4">
                <button
                  onClick={() => navigate('/orders')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition"
                >
                  Xem đơn hàng của tôi
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-lg transition"
                >
                  <FaArrowLeft className="text-sm" />
                  Quay lại trang chủ
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (paymentStatus === 'failed') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
            {/* Failed Header */}
            <div className="bg-gradient-to-r from-red-500 to-red-600 p-8 text-center">
              <FaTimesCircle className="text-5xl text-white mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-white">Thanh toán thất bại</h1>
            </div>

            {/* Error Details */}
            <div className="p-8 space-y-6">
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <p className="text-sm text-red-600 font-medium">{error}</p>
              </div>

              <div className="space-y-2 text-gray-600 text-sm">
                <p>Giao dịch của bạn không được xử lý thành công. Vui lòng:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Kiểm tra thông tin thanh toán</li>
                  <li>Đảm bảo có đủ số tiền trong tài khoản</li>
                  <li>Thử lại hoặc liên hệ ngân hàng</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-4">
                <button
                  onClick={() => navigate('/cart')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition"
                >
                  Quay lại giỏ hàng
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-lg transition"
                >
                  <FaArrowLeft className="text-sm" />
                  Quay lại trang chủ
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
          {/* Error Header */}
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 p-8 text-center">
            <FaClock className="text-5xl text-white mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white">Lỗi xử lý</h1>
          </div>

          {/* Error Details */}
          <div className="p-8 space-y-6">
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <p className="text-sm text-yellow-700 font-medium">{error}</p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-4">
              <button
                onClick={() => navigate('/cart')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition"
              >
                Quay lại giỏ hàng
              </button>
              <button
                onClick={() => navigate('/')}
                className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-lg transition"
              >
                <FaArrowLeft className="text-sm" />
                Quay lại trang chủ
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DetailRow = ({ label, value, highlight = false }) => (
  <div className="flex justify-between items-start py-2 border-b border-gray-200">
    <span className="text-sm text-gray-600">{label}:</span>
    <span className={`text-sm font-medium text-right ${highlight ? 'text-green-600 font-bold text-base' : 'text-gray-800'}`}>
      {value}
    </span>
  </div>
);

export default PaymentPage;
