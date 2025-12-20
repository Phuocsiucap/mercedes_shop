package org.example.util;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.text.SimpleDateFormat;
import java.util.*;

@Component
public class VNPayUtil {

    @Value("${vnpay.tmnCode:YOUR_TMN_CODE}")
    private String tmnCode;

    @Value("${vnpay.secretKey:YOUR_SECRET_KEY}")
    private String secretKey;

    @Value("${vnpay.paymentUrl:https://sandbox.vnpayment.vn/paymentv2/vpcpay.html}")
    private String paymentUrl;

    @Value("${vnpay.version:2.1.0}")
    private String vnpVersion;

    /**
     * Tạo URL thanh toán VNPay
     */
    public String createPaymentUrl(String orderId, long amount, String orderInfo, String returnUrl, HttpServletRequest request) {
        try {
            String vnp_IpAddr = getIpAddress(request);
            String vnp_TxnRef = orderId;
            String vnp_TmnCode = tmnCode;

            Map<String, String> vnp_Params = new HashMap<>();
            vnp_Params.put("vnp_Version", vnpVersion);
            vnp_Params.put("vnp_Command", "pay");
            vnp_Params.put("vnp_TmnCode", vnp_TmnCode);
            // VNPay yêu cầu số tiền nhân 100 (đơn vị: vnđ -> xu)
            vnp_Params.put("vnp_Amount", String.valueOf(amount * 100));
            vnp_Params.put("vnp_CurrCode", "VND");
            vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
            vnp_Params.put("vnp_OrderInfo", orderInfo);
            vnp_Params.put("vnp_OrderType", "other");
            vnp_Params.put("vnp_Locale", "vn");
            vnp_Params.put("vnp_ReturnUrl", returnUrl);
            vnp_Params.put("vnp_IpAddr", vnp_IpAddr);

            // Thời gian tạo
            Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
            SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
            String vnp_CreateDate = formatter.format(cld.getTime());
            vnp_Params.put("vnp_CreateDate", vnp_CreateDate);

            // Thời gian hết hạn (ví dụ 15 phút)
            cld.add(Calendar.MINUTE, 15);
            String vnp_ExpireDate = formatter.format(cld.getTime());
            vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);

            // Build chuỗi hash và query string
            List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
            Collections.sort(fieldNames);

            StringBuilder hashData = new StringBuilder();
            StringBuilder query = new StringBuilder();

            Iterator<String> itr = fieldNames.iterator();
            while (itr.hasNext()) {
                String fieldName = itr.next();
                String fieldValue = vnp_Params.get(fieldName);
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
            // Tạo SecureHash bằng HMAC-SHA512
            String vnp_SecureHash = hmacSHA512(secretKey, hashData.toString());

            queryUrl += "&vnp_SecureHash=" + vnp_SecureHash;

            return paymentUrl + "?" + queryUrl;

        } catch (UnsupportedEncodingException e) {
            throw new RuntimeException("Error encoding URL", e);
        }
    }

    /**
     * Xác minh chữ ký từ VNPay callback
     */
    public boolean verifySecureHash(Map<String, String> fields, String vnp_SecureHash) {
        if (fields.containsKey("vnp_SecureHashType")) {
            fields.remove("vnp_SecureHashType");
        }
        if (fields.containsKey("vnp_SecureHash")) {
            fields.remove("vnp_SecureHash");
        }

        try {
            // Sắp xếp tham số
            List<String> fieldNames = new ArrayList<>(fields.keySet());
            Collections.sort(fieldNames);

            StringBuilder hashData = new StringBuilder();
            Iterator<String> itr = fieldNames.iterator();

            while (itr.hasNext()) {
                String fieldName = itr.next();
                String fieldValue = fields.get(fieldName);
                if ((fieldValue != null) && (fieldValue.length() > 0)) {
                    hashData.append(fieldName);
                    hashData.append('=');
                    hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                    if (itr.hasNext()) {
                        hashData.append('&');
                    }
                }
            }

            String expectedHash = hmacSHA512(secretKey, hashData.toString());
            return expectedHash.equals(vnp_SecureHash);

        } catch (UnsupportedEncodingException e) {
            return false;
        }
    }

    /**
     * Hash bằng thuật toán HMAC-SHA512 (Chuẩn VNPay)
     */
    private String hmacSHA512(String key, String data) {
        try {
            if (key == null || data == null) {
                throw new NullPointerException();
            }
            final Mac hmac512 = Mac.getInstance("HmacSHA512");
            byte[] hmacKeyBytes = key.getBytes();
            final SecretKeySpec secretKey = new SecretKeySpec(hmacKeyBytes, "HmacSHA512");
            hmac512.init(secretKey);
            byte[] dataBytes = data.getBytes(StandardCharsets.UTF_8);
            byte[] result = hmac512.doFinal(dataBytes);

            StringBuilder sb = new StringBuilder(2 * result.length);
            for (byte b : result) {
                sb.append(String.format("%02x", b & 0xff));
            }
            return sb.toString();

        } catch (Exception ex) {
            return "";
        }
    }

    /**
     * Lấy IP Address thực từ Request
     */
    public String getIpAddress(HttpServletRequest request) {
        String ipAdress;
        try {
            ipAdress = request.getHeader("X-FORWARDED-FOR");
            if (ipAdress == null) {
                ipAdress = request.getRemoteAddr();
            }
        } catch (Exception e) {
            ipAdress = "Invalid IP:" + e.getMessage();
        }
        return ipAdress;
    }

    /**
     * Tạo mã giao dịch random
     */
    public String generateTransactionId() {
        long timestamp = System.currentTimeMillis();
        SecureRandom random = new SecureRandom();
        int randomNum = random.nextInt(10000);
        return timestamp + String.format("%04d", randomNum);
    }
}