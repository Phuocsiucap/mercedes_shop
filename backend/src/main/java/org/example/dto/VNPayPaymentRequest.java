package org.example.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VNPayPaymentRequest {
    private String orderId;
    private Double amount;
    private String orderInfo;
    private String returnUrl;
    private String locale; // vn or en
}
