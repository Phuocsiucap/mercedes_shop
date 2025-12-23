import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import paymentService from '../services/paymentService';
import { useCart } from '../context/CartContext';

const VNPayReturnPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { clearAllData } = useCart();
  const [processing, setProcessing] = useState(true);
  const [paymentResult, setPaymentResult] = useState(null);

  useEffect(() => {
    processPaymentReturn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const processPaymentReturn = async () => {
    try {
      const params = {};
      searchParams.forEach((value, key) => {
        params[key] = value;
      });

      console.log('VNPay return params:', params);

      const response = await paymentService.processVNPayReturn(params);
      
      console.log('VNPay return response:', response);
      
      if (response.success) {
        const payment = response.payment || response.data?.payment || response.data;
        console.log('Payment data:', payment);
        
        // Enrich payment data with VNPay params if needed
        const enrichedPayment = {
          ...payment,
          // Get amount from VNPay params if not in payment (vnp_Amount is in smallest unit, divide by 100)
          amount: payment.amount || (params.vnp_Amount ? parseInt(params.vnp_Amount) / 100 : null),
          vnpayTransactionNo: payment.vnpayTransactionNo || params.vnp_TransactionNo,
          vnpayBankCode: payment.vnpayBankCode || params.vnp_BankCode,
          vnpayCardType: payment.vnpayCardType || params.vnp_CardType,
          vnpayResponseCode: payment.vnpayResponseCode || params.vnp_ResponseCode,
          orderId: payment.orderId || params.vnp_TxnRef
        };
        
        console.log('Enriched payment data:', enrichedPayment);
        setPaymentResult(enrichedPayment);
        
        if (enrichedPayment.status === 'SUCCESS' || enrichedPayment.vnpayResponseCode === '00') {
          // Clear cart on successful payment (including localStorage)
          console.log('Payment successful, clearing cart and localStorage...');
          clearAllData();
          console.log('Cart and localStorage cleared successfully');
          toast.success('Thanh toán thành công!');
        } else {
          console.log('Payment failed, not clearing cart');
          toast.error('Thanh toán thất bại!');
        }
      } else {
        const errorMsg = response.message || 'Có lỗi xảy ra khi xử lý thanh toán';
        toast.error(errorMsg);
        setPaymentResult({ 
          status: 'FAILED', 
          vnpayResponseCode: params.vnp_ResponseCode,
          orderId: params.vnp_TxnRef,
          amount: params.vnp_Amount ? parseInt(params.vnp_Amount) / 100 : null
        });
      }
    } catch (error) {
      console.error('Error processing payment return:', error);
      toast.error('Có lỗi xảy ra khi xử lý thanh toán');
      
      // Set error state with params from URL
      const params = {};
      searchParams.forEach((value, key) => {
        params[key] = value;
      });
      
      setPaymentResult({ 
        status: 'FAILED', 
        vnpayResponseCode: params.vnp_ResponseCode || '99',
        orderId: params.vnp_TxnRef,
        amount: params.vnp_Amount ? parseInt(params.vnp_Amount) / 100 : null
      });
    } finally {
      setProcessing(false);
    }
  };

  const getResponseMessage = (code) => {
    const messages = {
      '00': 'Giao dịch thành công',
      '07': 'Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).',
      '09': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng.',
      '10': 'Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần',
      '11': 'Giao dịch không thành công do: Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch.',
      '12': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa.',
      '13': 'Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP).',
      '24': 'Giao dịch không thành công do: Khách hàng hủy giao dịch',
      '51': 'Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.',
      '65': 'Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày.',
      '75': 'Ngân hàng thanh toán đang bảo trì.',
      '79': 'Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định.',
      '99': 'Các lỗi khác'
    };
    return messages[code] || 'Lỗi không xác định';
  };

  const isPaymentSuccess = (payment) => {
    // Check both status field and response code
    if (payment?.status === 'SUCCESS') return true;
    if (payment?.vnpayResponseCode === '00') return true;
    return false;
  };

  if (processing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang xử lý kết quả thanh toán...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {isPaymentSuccess(paymentResult) ? (
            <>
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Thanh toán thành công!</h2>
                <p className="text-gray-600">Cảm ơn bạn đã thanh toán. Đơn hàng của bạn đang được xử lý.</p>
              </div>

              <div className="border-t border-b py-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Mã giao dịch:</span>
                  <span className="font-semibold">{paymentResult.vnpayTransactionNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Mã đơn hàng:</span>
                  <span className="font-semibold">{paymentResult.orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Số tiền:</span>
                  <span className="font-semibold text-green-600">
                    {paymentResult.amount 
                      ? paymentService.formatCurrency(paymentResult.amount)
                      : 'N/A'}
                  </span>
                </div>
                {paymentResult.vnpayBankCode && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ngân hàng:</span>
                    <span className="font-semibold">{paymentResult.vnpayBankCode}</span>
                  </div>
                )}
                {paymentResult.vnpayCardType && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Loại thẻ:</span>
                    <span className="font-semibold">{paymentResult.vnpayCardType}</span>
                  </div>
                )}
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => navigate('/orders')}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Xem đơn hàng
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="flex-1 border border-gray-300 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Về trang chủ
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Thanh toán thất bại!</h2>
                <p className="text-gray-600 mb-4">
                  {getResponseMessage(paymentResult?.vnpayResponseCode)}
                </p>
              </div>

              <div className="border-t border-b py-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Mã đơn hàng:</span>
                  <span className="font-semibold">{paymentResult?.orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Mã lỗi:</span>
                  <span className="font-semibold text-red-600">{paymentResult?.vnpayResponseCode}</span>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => navigate('/checkout')}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Thử lại
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="flex-1 border border-gray-300 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Về trang chủ
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VNPayReturnPage;
