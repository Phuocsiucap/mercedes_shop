package org.example.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.entity.Order;

import java.math.BigDecimal;
import java.time.LocalDateTime;

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
    
    // Summary fields for admin
    private LocalDateTime lastStatusUpdate;
    private String assignedStaff;
    private Integer daysSinceOrder;
}