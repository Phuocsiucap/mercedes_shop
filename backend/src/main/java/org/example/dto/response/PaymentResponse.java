package org.example.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponse {

    private String id;
    private String orderId;
    private BigDecimal amount;
    private String paymentType;
    private String status;
    private String paymentMethod;
    private String transactionNo;
    private String bankCode;
    private String bankTranNo;
    private String orderInfo;
    private LocalDateTime paymentDate;
    private LocalDateTime createdDate;
    private LocalDateTime updatedDate;
    private String responseCode;
}