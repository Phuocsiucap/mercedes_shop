package org.example.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VNPayPaymentResponse {

    private String paymentUrl;

    private String orderId;

    private String message;

    public static VNPayPaymentResponse success(String paymentUrl, String orderId) {
        return new VNPayPaymentResponse(paymentUrl, orderId, "Tạo yêu cầu thanh toán thành công");
    }

    public static VNPayPaymentResponse error(String message) {
        return new VNPayPaymentResponse(null, null, message);
    }
}