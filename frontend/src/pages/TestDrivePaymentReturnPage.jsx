import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaCheckCircle, FaTimesCircle, FaCar, FaSpinner } from 'react-icons/fa';
import paymentService from '../services/paymentService';
import { toast } from 'react-toastify';

const TestDrivePaymentReturnPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [paymentResult, setPaymentResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    processPaymentReturn();
  }, []);

  const processPaymentReturn = async () => {
    try {
      setLoading(true);
      
      // Get all query params from VNPay
      const params = {};
      for (const [key, value] of searchParams.entries()) {
        params[key] = value;
      }

      console.log('VNPay return params:', params);

      // Process payment return
      const response = await paymentService.processVNPayReturn(params);
      
      console.log('Payment return response:', response);

      if (response.success) {
        setPaymentResult(response.payment);
        
        if (response.payment.status === 'SUCCESS') {
          toast.success('Thanh toán đặt cọc thành công!');
        } else {
          toast.error('Thanh toán thất bại!');
        }
      } else {
        throw new Error(response.message || 'Xử lý thanh toán thất bại');
      }
    } catch (err) {
      console.error('Error processing payment return:', err);
      setError(err.message || 'Có lỗi xảy ra khi xử lý thanh toán');
      toast.error('Có lỗi xảy ra khi xử lý thanh toán');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <FaSpinner className="animate-spin text-6xl text-blue-600 mx-auto mb-4" />
          <p className="text-xl text-gray-600">Đang xử lý thanh toán...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <FaTimesCircle className="text-6xl text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Lỗi xử lý thanh toán</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/test-drive')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition"
          >
            Quay lại trang lái thử
          </button>
        </div>
      </div>
    );
  }

  const isSuccess = paymentResult?.status === 'SUCCESS';

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className={`p-8 text-center ${isSuccess ? 'bg-green-50' : 'bg-red-50'}`}>
            {isSuccess ? (
              <>
                <FaCheckCircle className="text-6xl text-green-500 mx-auto mb-4" />
                <h1 className="text-3xl font-bold text-green-800 mb-2">
                  Thanh toán thành công!
                </h1>
                <p className="text-green-700">
                  Bạn đã thanh toán đặt cọc lái thử thành công
                </p>
              </>
            ) : (
              <>
                <FaTimesCircle className="text-6xl text-red-500 mx-auto mb-4" />
                <h1 className="text-3xl font-bold text-red-800 mb-2">
                  Thanh toán thất bại
                </h1>
                <p className="text-red-700">
                  Giao dịch không thành công. Vui lòng thử lại.
                </p>
              </>
            )}
          </div>

          {/* Payment Details */}
          <div className="p-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FaCar className="text-blue-600" />
              Thông tin thanh toán
            </h2>
            
            <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Mã giao dịch:</span>
                <span className="font-semibold text-gray-800">
                  {paymentResult?.transactionId || 'N/A'}
                </span>
              </div>
              
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Số tiền:</span>
                <span className="font-semibold text-gray-800">
                  {formatCurrency(paymentResult?.amount || 0)}
                </span>
              </div>
              
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Phương thức:</span>
                <span className="font-semibold text-gray-800">
                  {paymentResult?.paymentMethod || 'VNPay'}
                </span>
              </div>
              
              {paymentResult?.bankCode && (
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Ngân hàng:</span>
                  <span className="font-semibold text-gray-800">
                    {paymentResult.bankCode}
                  </span>
                </div>
              )}
              
              {paymentResult?.cardType && (
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Loại thẻ:</span>
                  <span className="font-semibold text-gray-800">
                    {paymentResult.cardType}
                  </span>
                </div>
              )}
              
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Trạng thái:</span>
                <span className={`font-semibold ${isSuccess ? 'text-green-600' : 'text-red-600'}`}>
                  {isSuccess ? 'Thành công' : 'Thất bại'}
                </span>
              </div>
              
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Thời gian:</span>
                <span className="font-semibold text-gray-800">
                  {formatDate(paymentResult?.createdAt)}
                </span>
              </div>
            </div>

            {isSuccess && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Lưu ý:</strong> Lịch lái thử của bạn đã được xác nhận. 
                  Vui lòng đến showroom đúng giờ đã đặt. Số tiền đặt cọc sẽ được hoàn lại sau khi hoàn thành lái thử.
                </p>
              </div>
            )}

            {!isSuccess && (
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  Nếu bạn gặp vấn đề với thanh toán, vui lòng liên hệ hotline: <strong>1900 xxxx</strong>
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="p-8 bg-gray-50 border-t border-gray-200">
            <div className="flex gap-4">
              <button
                onClick={() => navigate('/test-drive')}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition"
              >
                Xem lịch lái thử
              </button>
              <button
                onClick={() => navigate('/')}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 rounded-lg transition"
              >
                Về trang chủ
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestDrivePaymentReturnPage;
