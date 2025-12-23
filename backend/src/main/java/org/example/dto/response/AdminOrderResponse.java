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
public class AdminOrderResponse {
    private String id;
    private String userId;
    private String userName;
    private String userEmail;
    private String userPhone;
    private LocalDateTime orderDate;
    private BigDecimal totalAmount;
    private Order.OrderStatus status;
    private String deliveryAddress;
    private Integer totalItems;
    private String paymentMethod;
    private String notes;
    
    // Order details (products)
    private List<OrderDetailDto> orderDetails;
    
    // Summary fields for admin
    private LocalDateTime lastStatusUpdate;
    private String assignedStaff;
    private Integer daysSinceOrder;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OrderDetailDto {
        private String id;
        private String carId;
        private String carName;
        private String carImage;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal subtotal;
    }
}