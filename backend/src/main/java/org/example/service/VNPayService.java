package org.example.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.config.VNPayConfig;
import org.example.dto.VNPayPaymentRequest;
import org.example.entity.Payment;
import org.example.repository.PaymentRepository;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class VNPayService {

    private final VNPayConfig vnPayConfig;
    private final PaymentRepository paymentRepository;
    private final org.example.repository.DriverTestRepository driverTestRepository;

    public String createPaymentUrl(VNPayPaymentRequest request, String userId, String userEmail) {
        try {
            log.info("Creating VNPay payment - OrderId: {}, Amount: {}, UserId: {}", 
                    request.getOrderId(), request.getAmount(), userId);
            
            // Create payment record
            Payment payment = new Payment();
            payment.setOrderId(request.getOrderId());
            payment.setUserId(userId);
            payment.setUserEmail(userEmail);
            payment.setAmount(request.getAmount());
            payment.setCurrency("VND");
            payment.setPaymentMethod("VNPAY");
            payment.setStatus("PENDING");
            payment.setVnpayOrderInfo(request.getOrderInfo());
            payment.setCreatedAt(LocalDateTime.now());
            payment.setUpdatedAt(LocalDateTime.now());
            
            Payment savedPayment = paymentRepository.save(payment);
            
            // Build VNPay parameters
            Map<String, String> vnpParams = new HashMap<>();
            vnpParams.put("vnp_Version", vnPayConfig.getVersion());
            vnpParams.put("vnp_Command", vnPayConfig.getCommand());
            vnpParams.put("vnp_TmnCode", vnPayConfig.getTmnCode());
            
            // VNPay requires amount in smallest unit (VND * 100) and must be >= 5000 VND
            // VNPay maximum amount is under 1 billion VND
            // If order amount >= 1 billion, only charge 1% as deposit
            long amountInVND = Math.round(request.getAmount());
            long actualPaymentAmount = amountInVND;
            boolean isDeposit = false;
            
            if (amountInVND >= 1_000_000_000) {
                // For orders >= 1 billion VND, charge 1% as deposit
                actualPaymentAmount = Math.max(5000, Math.round(amountInVND * 0.01));
                isDeposit = true;
                log.info("Order amount {} VND >= 1 billion, charging 1% deposit: {} VND", 
                        amountInVND, actualPaymentAmount);
            }
            
            if (actualPaymentAmount < 5000) {
                throw new RuntimeException("Số tiền thanh toán phải từ 5,000 VND trở lên");
            }
            
            if (actualPaymentAmount >= 1_000_000_000) {
                throw new RuntimeException("Số tiền thanh toán không được vượt quá 1 tỷ đồng");
            }
            
            long amountInSmallestUnit = actualPaymentAmount * 100;
            vnpParams.put("vnp_Amount", String.valueOf(amountInSmallestUnit));
            
            // Update payment record with actual payment amount
            payment.setAmount(Double.valueOf(actualPaymentAmount));
            if (isDeposit) {
                payment.setVnpayOrderInfo(request.getOrderInfo() + " (Dat coc 1%)");
            }
            paymentRepository.save(payment);
            
            vnpParams.put("vnp_CurrCode", "VND");
            vnpParams.put("vnp_TxnRef", savedPayment.getId()); // Use payment ID as transaction reference
            vnpParams.put("vnp_OrderInfo", request.getOrderInfo());
            vnpParams.put("vnp_OrderType", vnPayConfig.getOrderType());
            vnpParams.put("vnp_Locale", request.getLocale() != null ? request.getLocale() : "vn");
            
            // Use returnUrl from request if provided, otherwise use config
            String returnUrl = request.getReturnUrl();
            if (returnUrl == null || returnUrl.isEmpty()) {
                returnUrl = vnPayConfig.getReturnUrl();
            }
            
            // For sandbox testing, ensure returnUrl is properly formatted
            // VNPay sandbox accepts localhost URLs
            log.info("Using return URL: {}", returnUrl);
            vnpParams.put("vnp_ReturnUrl", returnUrl);
            
            vnpParams.put("vnp_IpAddr", "127.0.0.1");
            
            Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
            SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
            String vnpCreateDate = formatter.format(cld.getTime());
            vnpParams.put("vnp_CreateDate", vnpCreateDate);
            
            cld.add(Calendar.MINUTE, 15);
            String vnpExpireDate = formatter.format(cld.getTime());
            vnpParams.put("vnp_ExpireDate", vnpExpireDate);
            
            // Build query string
            List<String> fieldNames = new ArrayList<>(vnpParams.keySet());
            Collections.sort(fieldNames);
            StringBuilder hashData = new StringBuilder();
            StringBuilder query = new StringBuilder();
            
            Iterator<String> itr = fieldNames.iterator();
            while (itr.hasNext()) {
                String fieldName = itr.next();
                String fieldValue = vnpParams.get(fieldName);
                if ((fieldValue != null) && (fieldValue.length() > 0)) {
                    // Build hash data
                    hashData.append(fieldName);
                    hashData.append('=');
                    hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                    // Build query
                    query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII.toString()));
                    query.append('=');
                    query.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                    if (itr.hasNext()) {
                        query.append('&');
                        hashData.append('&');
                    }
                }
            }
            
            String queryUrl = query.toString();
            String vnpSecureHash = hmacSHA512(vnPayConfig.getHashSecret(), hashData.toString());
            queryUrl += "&vnp_SecureHash=" + vnpSecureHash;
            String paymentUrl = vnPayConfig.getVnpayUrl() + "?" + queryUrl;
            
            log.info("Created VNPay payment URL for order: {}, payment: {}", request.getOrderId(), savedPayment.getId());
            return paymentUrl;
            
        } catch (Exception e) {
            log.error("Error creating VNPay payment URL", e);
            throw new RuntimeException("Failed to create payment URL: " + e.getMessage());
        }
    }

    public Payment processVNPayReturn(Map<String, String> vnpParams) {
        try {
            log.info("Processing VNPay return with params: {}", vnpParams);
            
            String vnpSecureHash = vnpParams.get("vnp_SecureHash");
            
            // Create a copy for signature verification
            Map<String, String> paramsForVerify = new HashMap<>(vnpParams);
            paramsForVerify.remove("vnp_SecureHashType");
            paramsForVerify.remove("vnp_SecureHash");
            
            // Verify signature
            String signValue = hashAllFields(paramsForVerify);
            
            log.info("Received hash: {}", vnpSecureHash);
            log.info("Calculated hash: {}", signValue);
            
            if (!signValue.equals(vnpSecureHash)) {
                log.error("Invalid VNPay signature. Expected: {}, Got: {}", signValue, vnpSecureHash);
                throw new RuntimeException("Invalid payment signature");
            }
            
            String paymentId = vnpParams.get("vnp_TxnRef");
            String responseCode = vnpParams.get("vnp_ResponseCode");
            String transactionNo = vnpParams.get("vnp_TransactionNo");
            String bankCode = vnpParams.get("vnp_BankCode");
            String cardType = vnpParams.get("vnp_CardType");
            
            log.info("Looking for payment with ID: {}", paymentId);
            
            Payment payment = paymentRepository.findById(paymentId)
                    .orElseThrow(() -> new RuntimeException("Payment not found with ID: " + paymentId));
            
            payment.setVnpayResponseCode(responseCode);
            payment.setVnpayTransactionNo(transactionNo);
            payment.setVnpayBankCode(bankCode);
            payment.setVnpayCardType(cardType);
            payment.setTransactionId(transactionNo);
            payment.setUpdatedAt(LocalDateTime.now());
            
            if ("00".equals(responseCode)) {
                payment.setStatus("SUCCESS");
                payment.setPaymentDate(LocalDateTime.now());
                log.info("Payment successful: {}", paymentId);
                
                // Update test drive booking if this is a test drive payment
                updateTestDriveBooking(payment.getOrderId(), paymentId, "SUCCESS");
            } else {
                payment.setStatus("FAILED");
                log.warn("Payment failed: {}, response code: {}", paymentId, responseCode);
                
                // Update test drive booking if this is a test drive payment
                updateTestDriveBooking(payment.getOrderId(), paymentId, "FAILED");
            }
            
            Payment savedPayment = paymentRepository.save(payment);
            log.info("Payment updated successfully: {}", savedPayment);
            
            return savedPayment;
            
        } catch (Exception e) {
            log.error("Error processing VNPay return", e);
            throw new RuntimeException("Failed to process payment return: " + e.getMessage());
        }
    }

    private String hmacSHA512(String key, String data) {
        try {
            Mac hmac512 = Mac.getInstance("HmacSHA512");
            SecretKeySpec secretKey = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
            hmac512.init(secretKey);
            byte[] result = hmac512.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : result) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (Exception e) {
            throw new RuntimeException("Error generating HMAC SHA512", e);
        }
    }

    private String hashAllFields(Map<String, String> fields) {
        List<String> fieldNames = new ArrayList<>(fields.keySet());
        Collections.sort(fieldNames);
        StringBuilder sb = new StringBuilder();
        
        boolean isFirst = true;
        for (String fieldName : fieldNames) {
            String fieldValue = fields.get(fieldName);
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                if (!isFirst) {
                    sb.append("&");
                }
                sb.append(fieldName);
                sb.append("=");
                sb.append(fieldValue);
                isFirst = false;
            }
        }
        
        String hashData = sb.toString();
        log.info("Hash data for verification: {}", hashData);
        return hmacSHA512(vnPayConfig.getHashSecret(), hashData);
    }
    
    /**
     * Update test drive booking payment status
     */
    private void updateTestDriveBooking(String bookingId, String paymentId, String paymentStatus) {
        try {
            var booking = driverTestRepository.findById(bookingId);
            if (booking.isPresent()) {
                var driverTest = booking.get();
                driverTest.setPaymentId(paymentId);
                driverTest.setPaymentStatus(paymentStatus);
                
                // If payment is successful, confirm the booking
                if ("SUCCESS".equals(paymentStatus)) {
                    driverTest.setStatus(org.example.entity.DriverTest.TestDriveStatus.CONFIRMED);
                }
                
                driverTest.setUpdatedAt(LocalDateTime.now());
                driverTestRepository.save(driverTest);
                log.info("Updated test drive booking {} with payment status {}", bookingId, paymentStatus);
            }
        } catch (Exception e) {
            log.warn("Could not update test drive booking {}: {}", bookingId, e.getMessage());
            // Don't throw exception - payment processing should continue even if booking update fails
        }
    }
}
