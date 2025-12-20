package org.example.dto.request;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VNPayPaymentRequest {

    @NotBlank(message = "Mã đơn hàng không được trống")
    private String orderId;

    @NotNull(message = "Số tiền không được trống")
    @DecimalMin(value = "1000", message = "Số tiền phải lớn hơn 1000")
    private BigDecimal amount;

    @NotBlank(message = "Nội dung giao dịch không được trống")
    private String orderInfo;
}