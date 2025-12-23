package org.example.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentDTO {
    private String id;
    private String orderId;
    private String userId;
    private String userEmail;
    private Double amount;
    private String currency;
    private String paymentMethod;
    private String status;
    private String transactionId;
    private String vnpayResponseCode;
    private String vnpayTransactionNo;
    private String vnpayBankCode;
    private String vnpayCardType;
    private String vnpayOrderInfo;
    private LocalDateTime paymentDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
