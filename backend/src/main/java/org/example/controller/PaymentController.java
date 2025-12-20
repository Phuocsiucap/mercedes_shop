package org.example.controller;

import jakarta.validation.Valid;
import org.example.dto.request.VNPayCallbackRequest;
import org.example.dto.request.VNPayPaymentRequest;
import org.example.dto.response.ApiResponse;
import org.example.dto.response.PaymentResponse;
import org.example.dto.response.VNPayPaymentResponse;
import org.example.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*", maxAge = 3600)
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    // Default return URL if not configured in application.properties
    @Value("${app.frontend.returnUrl:http://localhost:5173/payment/callback}")
    private String returnUrl;

    /**
     * Tạo yêu cầu thanh toán VNPay
     */
    @PostMapping("/vnpay/create")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<VNPayPaymentResponse>> createVNPayPayment(
            @Valid @RequestBody VNPayPaymentRequest request,
            jakarta.servlet.http.HttpServletRequest servletRequest) { // <--- Thêm tham số này

        // Truyền servletRequest vào service
        VNPayPaymentResponse response = paymentService.createVNPayPayment(request, returnUrl, servletRequest);
        if (response.getPaymentUrl() != null) {
            return ResponseEntity.ok(ApiResponse.success(response));
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(response.getMessage()));
        }
    }

    /**
     * Webhook/Callback để VNPay gọi lại (GET Method theo chuẩn Redirect của VNPay)
     * Endpoint này KHÔNG yêu cầu xác thực JWT
     */
    @GetMapping("/vnpay/callback")
    public ResponseEntity<?> vnPayCallback(
            @RequestParam(value = "vnp_Amount", required = false) String vnp_Amount,
            @RequestParam(value = "vnp_BankCode", required = false) String vnp_BankCode,
            @RequestParam(value = "vnp_BankTranNo", required = false) String vnp_BankTranNo,
            @RequestParam(value = "vnp_CardType", required = false) String vnp_CardType,
            @RequestParam(value = "vnp_OrderInfo", required = false) String vnp_OrderInfo,
            @RequestParam(value = "vnp_PayDate", required = false) String vnp_PayDate,
            @RequestParam(value = "vnp_ResponseCode", required = false) String vnp_ResponseCode,
            @RequestParam(value = "vnp_TmnCode", required = false) String vnp_TmnCode,
            @RequestParam(value = "vnp_TransactionNo", required = false) String vnp_TransactionNo,
            @RequestParam(value = "vnp_TxnRef", required = false) String vnp_TxnRef,
            @RequestParam(value = "vnp_SecureHash", required = false) String vnp_SecureHash,
            @RequestParam(value = "vnp_SecureHashType", required = false) String vnp_SecureHashType) {

        VNPayCallbackRequest request = new VNPayCallbackRequest(
                vnp_Amount, vnp_BankCode, vnp_BankTranNo, vnp_CardType, vnp_OrderInfo,
                vnp_PayDate, vnp_ResponseCode, vnp_TmnCode, vnp_TransactionNo,
                vnp_TxnRef, vnp_SecureHash, vnp_SecureHashType
        );

        boolean isValid = paymentService.verifyVNPayCallback(request);

        // Trả về kết quả cho Frontend hoặc VNPay (nếu là IPN)
        // Nếu Frontend gọi API này để verify:
        if (isValid) {
            // Lấy thông tin thanh toán đã cập nhật
            PaymentResponse payment = paymentService.getPaymentByOrderId(vnp_TxnRef);
            return ResponseEntity.ok(ApiResponse.success(payment));
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Xác minh thanh toán thất bại hoặc chữ ký không hợp lệ"));
        }
    }

    /**
     * Lấy lịch sử thanh toán của user
     */
    @GetMapping("/history")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> getPaymentHistory() {
        List<PaymentResponse> payments = paymentService.getPaymentHistory();
        return ResponseEntity.ok(ApiResponse.success(payments));
    }

    /**
     * Lấy chi tiết thanh toán
     */
    @GetMapping("/{paymentId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<PaymentResponse>> getPaymentById(
            @PathVariable String paymentId) {
        PaymentResponse payment = paymentService.getPaymentById(paymentId);
        return ResponseEntity.ok(ApiResponse.success(payment));
    }

    /**
     * Lấy danh sách thanh toán theo trạng thái (Admin only)
     */
    @GetMapping("/status/{status}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> getPaymentsByStatus(
            @PathVariable String status) {
        List<PaymentResponse> payments = paymentService.getPaymentsByStatus(status);
        return ResponseEntity.ok(ApiResponse.success(payments));
    }
}