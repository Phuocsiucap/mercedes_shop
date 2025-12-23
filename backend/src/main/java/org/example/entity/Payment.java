package org.example.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "payments")
public class Payment {
    @Id
    private String id;
    private String orderId;
    private String userId;
    private String userEmail;
    private Double amount;
    private String currency;
    private String paymentMethod; // VNPAY, COD
    private String status; // PENDING, SUCCESS, FAILED, CANCELLED
    private String transactionId; // VNPay transaction ID
    private String vnpayResponseCode;
    private String vnpayTransactionNo;
    private String vnpayBankCode;
    private String vnpayCardType;
    private String vnpayOrderInfo;
    private LocalDateTime paymentDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
