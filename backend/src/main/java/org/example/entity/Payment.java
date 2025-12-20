package org.example.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "payments")
public class Payment {

    @Id
    private String id;

    @DBRef
    private User user;

    private String orderId; // Unique Order Ref

    private BigDecimal amount;

    private PaymentType paymentType;

    private PaymentStatus status;

    private String paymentMethod;

    private String transactionNo;

    private String bankCode;

    private String bankTranNo;

    private String orderInfo;

    private LocalDateTime paymentDate;

    private LocalDateTime createdDate;

    private LocalDateTime updatedDate;

    // Optional: References to other entities if needed for logic
    // @DBRef(lazy = true)
    // private Order order;

    // @DBRef(lazy = true)
    // private Drivertest drivertest;

    private String responseCode;

    public enum PaymentType {
        ORDER,
        TESTDRIVE,
        DEPOSIT
    }

    public enum PaymentStatus {
        PENDING,
        SUCCESS,
        FAILED,
        CANCELLED
    }
}