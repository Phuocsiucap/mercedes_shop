package org.example.service;

import jakarta.servlet.http.HttpServletRequest; // Import HttpServletRequest
import lombok.extern.slf4j.Slf4j;
import org.example.dto.request.VNPayCallbackRequest;
import org.example.dto.request.VNPayPaymentRequest;
import org.example.dto.response.PaymentResponse;
import org.example.dto.response.VNPayPaymentResponse;
import org.example.entity.Payment;
import org.example.entity.User;
import org.example.exception.ResourceNotFoundException;
import org.example.repository.PaymentRepository;
import org.example.repository.UserRepository;
import org.example.security.UserPrincipal;
import org.example.util.VNPayUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Slf4j
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private VNPayUtil vnPayUtil;

    /**
     * Tạo yêu cầu thanh toán VNPay
     * Cần thêm HttpServletRequest để lấy IP khách hàng
     */
    @Transactional
    public VNPayPaymentResponse createVNPayPayment(VNPayPaymentRequest request, String returnUrl, HttpServletRequest servletRequest) {
        try {
            User currentUser = getCurrentUser();

            Payment payment = new Payment();
            payment.setUser(currentUser);
            payment.setOrderId(request.getOrderId());
            payment.setAmount(request.getAmount());
            payment.setOrderInfo(request.getOrderInfo());
            payment.setStatus(Payment.PaymentStatus.PENDING);
            payment.setPaymentMethod("VNPAY");

            if (request.getOrderId().startsWith("TESTDRIVE_")) {
                payment.setPaymentType(Payment.PaymentType.TESTDRIVE);
            } else if (request.getOrderId().startsWith("DEPOSIT_")) {
                payment.setPaymentType(Payment.PaymentType.DEPOSIT);
            } else {
                payment.setPaymentType(Payment.PaymentType.ORDER);
            }

            payment.setCreatedDate(LocalDateTime.now());
            payment.setUpdatedDate(LocalDateTime.now());

            paymentRepository.save(payment);

            // Tạo URL thanh toán (truyền thêm servletRequest)
            String paymentUrl = vnPayUtil.createPaymentUrl(
                    request.getOrderId(),
                    request.getAmount().longValue(),
                    request.getOrderInfo(),
                    returnUrl,
                    servletRequest // Truyền request để lấy IP
            );

            if (paymentUrl == null || paymentUrl.isEmpty()) {
                return VNPayPaymentResponse.error("Lỗi tạo URL thanh toán");
            }

            return VNPayPaymentResponse.success(paymentUrl, request.getOrderId());
        } catch (Exception e) {
            log.error("Lỗi khi tạo yêu cầu thanh toán: ", e);
            return VNPayPaymentResponse.error("Lỗi khi tạo yêu cầu thanh toán: " + e.getMessage());
        }
    }

    /**
     * Xác minh thanh toán callback từ VNPay
     */
    @Transactional
    public boolean verifyVNPayCallback(VNPayCallbackRequest callbackRequest) {
        try {
            Map<String, String> params = new HashMap<>();

            putIfNotNull(params, "vnp_Amount", callbackRequest.getVnp_Amount());
            putIfNotNull(params, "vnp_BankCode", callbackRequest.getVnp_BankCode());
            putIfNotNull(params, "vnp_BankTranNo", callbackRequest.getVnp_BankTranNo());
            putIfNotNull(params, "vnp_CardType", callbackRequest.getVnp_CardType());
            putIfNotNull(params, "vnp_OrderInfo", callbackRequest.getVnp_OrderInfo());
            putIfNotNull(params, "vnp_PayDate", callbackRequest.getVnp_PayDate());
            putIfNotNull(params, "vnp_ResponseCode", callbackRequest.getVnp_ResponseCode());
            putIfNotNull(params, "vnp_TmnCode", callbackRequest.getVnp_TmnCode());
            putIfNotNull(params, "vnp_TransactionNo", callbackRequest.getVnp_TransactionNo());
            putIfNotNull(params, "vnp_TxnRef", callbackRequest.getVnp_TxnRef());

            boolean isValid = vnPayUtil.verifySecureHash(params, callbackRequest.getVnp_SecureHash());

            if (!isValid) {
                log.warn("Chữ ký không hợp lệ cho đơn hàng: {}", callbackRequest.getVnp_TxnRef());
                return false;
            }

            Optional<Payment> paymentOpt = paymentRepository.findByOrderId(callbackRequest.getVnp_TxnRef());

            if (paymentOpt.isPresent()) {
                Payment payment = paymentOpt.get();

                // Check Idempotency
                if (payment.getStatus() == Payment.PaymentStatus.SUCCESS) {
                    return true;
                }

                // SECURITY CHECK: Kiểm tra số tiền VNPay trả về có khớp DB không
                // vnp_Amount là String (VD: "1000000" = 10,000 VND)
                long vnpAmount = Long.parseLong(callbackRequest.getVnp_Amount());
                long dbAmount = payment.getAmount().multiply(new BigDecimal(100)).longValue();

                if (vnpAmount != dbAmount) {
                    log.error("Cảnh báo: Số tiền thanh toán không khớp! VNPay: {}, DB: {}", vnpAmount, dbAmount);
                    payment.setStatus(Payment.PaymentStatus.FAILED);
                    payment.setResponseCode("INVALID_AMOUNT");
                    paymentRepository.save(payment);
                    return false;
                }

                payment.setTransactionNo(callbackRequest.getVnp_TransactionNo());
                payment.setBankCode(callbackRequest.getVnp_BankCode());
                payment.setBankTranNo(callbackRequest.getVnp_BankTranNo());
                payment.setResponseCode(callbackRequest.getVnp_ResponseCode());
                payment.setUpdatedDate(LocalDateTime.now());

                if ("00".equals(callbackRequest.getVnp_ResponseCode())) {
                    payment.setStatus(Payment.PaymentStatus.SUCCESS);
                    payment.setPaymentDate(parsePaymentDate(callbackRequest.getVnp_PayDate()));
                    log.info("Thanh toán thành công cho đơn hàng: {}", payment.getOrderId());
                } else if ("24".equals(callbackRequest.getVnp_ResponseCode())) {
                    payment.setStatus(Payment.PaymentStatus.CANCELLED);
                    log.info("Người dùng hủy thanh toán đơn hàng: {}", payment.getOrderId());
                } else {
                    payment.setStatus(Payment.PaymentStatus.FAILED);
                    log.info("Thanh toán thất bại (Code: {}) cho đơn hàng: {}", callbackRequest.getVnp_ResponseCode(), payment.getOrderId());
                }

                paymentRepository.save(payment);
                return true;
            } else {
                log.warn("Không tìm thấy đơn hàng trong hệ thống: {}", callbackRequest.getVnp_TxnRef());
                return false;
            }

        } catch (Exception e) {
            log.error("Lỗi xác minh callback VNPay: ", e);
            return false;
        }
    }

    private void putIfNotNull(Map<String, String> map, String key, String value) {
        if (value != null && !value.isEmpty()) {
            map.put(key, value);
        }
    }

    public List<PaymentResponse> getPaymentHistory() {
        User currentUser = getCurrentUser();
        // Gọi hàm đúng với Repository: findByUser_Id...
        List<Payment> payments = paymentRepository.findByUser_IdOrderByCreatedDateDesc(currentUser.getId());
        return mapToPaymentResponses(payments);
    }

    public PaymentResponse getPaymentById(String paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bản ghi thanh toán"));
        return mapToPaymentResponse(payment);
    }

    public PaymentResponse getPaymentByOrderId(String orderId) {
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bản ghi thanh toán cho đơn hàng: " + orderId));
        return mapToPaymentResponse(payment);
    }

    public List<PaymentResponse> getPaymentsByStatus(String status) {
        try {
            Payment.PaymentStatus paymentStatus = Payment.PaymentStatus.valueOf(status.toUpperCase());
            List<Payment> payments = paymentRepository.findByStatus(paymentStatus);
            return mapToPaymentResponses(payments);
        } catch (IllegalArgumentException e) {
            throw new ResourceNotFoundException("Trạng thái thanh toán không hợp lệ: " + status);
        }
    }

    public List<PaymentResponse> getPaymentsByType(String type) {
        try {
            Payment.PaymentType paymentType = Payment.PaymentType.valueOf(type.toUpperCase());
            List<Payment> payments = paymentRepository.findByPaymentType(paymentType);
            return mapToPaymentResponses(payments);
        } catch (IllegalArgumentException e) {
            throw new ResourceNotFoundException("Loại thanh toán không hợp lệ: " + type);
        }
    }

    private PaymentResponse mapToPaymentResponse(Payment payment) {
        if (payment == null) return null;

        PaymentResponse response = new PaymentResponse();
        response.setId(payment.getId());
        response.setOrderId(payment.getOrderId());
        response.setAmount(payment.getAmount());

        if (payment.getPaymentType() != null) {
            response.setPaymentType(payment.getPaymentType().toString());
        }
        if (payment.getStatus() != null) {
            response.setStatus(payment.getStatus().toString());
        }

        response.setPaymentMethod(payment.getPaymentMethod());
        response.setTransactionNo(payment.getTransactionNo());
        response.setBankCode(payment.getBankCode());
        response.setBankTranNo(payment.getBankTranNo());
        response.setOrderInfo(payment.getOrderInfo());
        response.setPaymentDate(payment.getPaymentDate());
        response.setCreatedDate(payment.getCreatedDate());
        response.setUpdatedDate(payment.getUpdatedDate());
        response.setResponseCode(payment.getResponseCode());

        return response;
    }

    private List<PaymentResponse> mapToPaymentResponses(List<Payment> payments) {
        if (payments == null) return Collections.emptyList();
        return payments.stream()
                .map(this::mapToPaymentResponse)
                .collect(Collectors.toList());
    }

    private LocalDateTime parsePaymentDate(String paymentDateStr) {
        try {
            if (paymentDateStr == null || paymentDateStr.isEmpty()) {
                return null;
            }
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
            return LocalDateTime.parse(paymentDateStr, formatter);
        } catch (Exception e) {
            log.warn("Không thể parse ngày thanh toán: {}. Sử dụng thời gian hiện tại.", paymentDateStr);
            return LocalDateTime.now();
        }
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new RuntimeException("Người dùng chưa được xác thực");
        }

        Object principal = authentication.getPrincipal();
        String userId;

        if (principal instanceof UserPrincipal) {
            userId = ((UserPrincipal) principal).getId();
        } else if (principal instanceof String) {
            throw new RuntimeException("Loại Principal không được hỗ trợ: " + principal.getClass());
        } else {
            throw new RuntimeException("Không xác định được người dùng hiện tại");
        }

        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với ID: " + userId));
    }
}