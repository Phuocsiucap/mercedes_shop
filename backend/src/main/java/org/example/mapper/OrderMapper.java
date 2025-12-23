package org.example.mapper;

import org.example.dto.response.AdminOrderResponse;
import org.example.dto.response.OrderResponse;
import org.example.entity.Order;
import org.example.entity.OrderDetail;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Mapper(componentModel = "spring", uses = {CarMapper.class})
public interface OrderMapper {

    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "userName", source = "user.fullName")
    OrderResponse toOrderResponse(Order order);

    @Mapping(target = "carId", source = "car.id")
    @Mapping(target = "carName", source = "car.name")
    @Mapping(target = "carImage", source = "car.images", qualifiedByName = "getFirstImage")
    @Mapping(target = "subtotal", source = ".", qualifiedByName = "calculateSubtotal")
    OrderResponse.OrderDetailResponse toOrderDetailResponse(OrderDetail orderDetail);

    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "userName", source = "user.fullName")
    @Mapping(target = "userEmail", source = "user.email")
    @Mapping(target = "userPhone", source = "user.phoneNumber")
    @Mapping(target = "totalItems", source = ".", qualifiedByName = "calculateTotalItems")
    @Mapping(target = "paymentMethod", constant = "COD")
    @Mapping(target = "notes", ignore = true)
    @Mapping(target = "lastStatusUpdate", ignore = true)
    @Mapping(target = "assignedStaff", ignore = true)
    @Mapping(target = "daysSinceOrder", source = ".", qualifiedByName = "calculateDaysSinceOrder")
    AdminOrderResponse toAdminOrderResponse(Order order);

    @Named("calculateSubtotal")
    default java.math.BigDecimal calculateSubtotal(OrderDetail orderDetail) {
        return orderDetail.getUnitPrice().multiply(java.math.BigDecimal.valueOf(orderDetail.getQuantity()));
    }

    @Named("calculateTotalItems")
    default Integer calculateTotalItems(Order order) {
        // For now, return 0 as placeholder since orderDetails are not directly linked to order
        return 0;
    }

    @Named("calculateDaysSinceOrder")
    default Long calculateDaysSinceOrder(Order order) {
        return ChronoUnit.DAYS.between(order.getOrderDate(), LocalDateTime.now());
    }

    @Named("getFirstImage")
    default String getFirstImage(List<String> images) {
        return images != null && !images.isEmpty() ? images.get(0) : null;
    }
}