import React, { useState } from 'react';
import { toast } from 'react-toastify';
import paymentService from '../services/paymentService';

const VNPayPayment = ({ orderId, amount, orderInfo, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);

  const handleVNPayPayment = async () => {
    try {
      setLoading(true);
      
      const paymentData = {
        orderId,
        amount,
        orderInfo: orderInfo || `Thanh toán đơn hàng ${orderId}`,
        returnUrl: `${window.location.origin}/payment/vnpay-return`,
        locale: 'vn'
      };

      const response = await paymentService.createVNPayPayment(paymentData);
      
      if (response.success && response.data.paymentUrl) {
        // Redirect to VNPay payment page
        window.location.href = response.data.paymentUrl;
      } else {
        toast.error('Không thể tạo liên kết thanh toán');
      }
    } catch (error) {
      console.error('Error creating VNPay payment:', error);
      toast.error(error.message || 'Có lỗi xảy ra khi tạo thanh toán');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold">Thanh toán VNPay</h3>
        <img 
          src="https://vnpay.vn/s1/statics.vnpay.vn/2023/9/06ncktiwd6dc1694418196384.png" 
          alt="VNPay" 
          className="h-8"
        />
      </div>

      <div className="space-y-4 mb-6">
        <div className="flex justify-between">
          <span className="text-gray-600">Mã đơn hàng:</span>
          <span className="font-semibold">{orderId}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Số tiền:</span>
          <span className="font-semibold text-lg text-red-600">
            {paymentService.formatCurrency(amount)}
          </span>
        </div>
        <div className="border-t pt-4">
          <p className="text-sm text-gray-500">
            Bạn sẽ được chuyển đến trang thanh toán VNPay để hoàn tất giao dịch
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleVNPayPayment}
          disabled={loading}
          className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Đang xử lý...
            </span>
          ) : (
            'Thanh toán ngay'
          )}
        </button>
        {onCancel && (
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            Hủy
          </button>
        )}
      </div>

      <div className="mt-4 text-xs text-gray-500 text-center">
        <p>Giao dịch được bảo mật bởi VNPay</p>
      </div>
    </div>
  );
};

export default VNPayPayment;
