package org.example.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.entity.Order;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderResponse {

    private String id;

    private String userId;

    private String userName;

    private LocalDateTime orderDate;

    private BigDecimal totalAmount;

    private Order.OrderStatus status;

    private String deliveryAddress;

    private List<OrderDetailResponse> orderDetails;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OrderDetailResponse {

        private String id;

        private String carId;

        private String carName;

        private String carImage;

        private Integer quantity;

        private BigDecimal unitPrice;

        private BigDecimal subtotal;
    }
}
