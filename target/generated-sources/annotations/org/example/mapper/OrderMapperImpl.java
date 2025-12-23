package org.example.mapper;

import java.util.List;
import javax.annotation.processing.Generated;
import org.example.dto.response.AdminOrderResponse;
import org.example.dto.response.OrderResponse;
import org.example.entity.Car;
import org.example.entity.Order;
import org.example.entity.OrderDetail;
import org.example.entity.User;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-12-23T23:03:07+0700",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 23.0.2 (Amazon.com Inc.)"
)
@Component
public class OrderMapperImpl implements OrderMapper {

    @Override
    public OrderResponse toOrderResponse(Order order) {
        if ( order == null ) {
            return null;
        }

        OrderResponse.OrderResponseBuilder orderResponse = OrderResponse.builder();

        orderResponse.userId( orderUserId( order ) );
        orderResponse.userName( orderUserFullName( order ) );
        orderResponse.id( order.getId() );
        orderResponse.orderDate( order.getOrderDate() );
        orderResponse.totalAmount( order.getTotalAmount() );
        orderResponse.status( order.getStatus() );
        orderResponse.deliveryAddress( order.getDeliveryAddress() );

        return orderResponse.build();
    }

    @Override
    public OrderResponse.OrderDetailResponse toOrderDetailResponse(OrderDetail orderDetail) {
        if ( orderDetail == null ) {
            return null;
        }

        OrderResponse.OrderDetailResponse.OrderDetailResponseBuilder orderDetailResponse = OrderResponse.OrderDetailResponse.builder();

        orderDetailResponse.carId( orderDetailCarId( orderDetail ) );
        orderDetailResponse.carName( orderDetailCarName( orderDetail ) );
        orderDetailResponse.carImage( getFirstImage( orderDetailCarImages( orderDetail ) ) );
        orderDetailResponse.subtotal( calculateSubtotal( orderDetail ) );
        orderDetailResponse.id( orderDetail.getId() );
        orderDetailResponse.quantity( orderDetail.getQuantity() );
        orderDetailResponse.unitPrice( orderDetail.getUnitPrice() );

        return orderDetailResponse.build();
    }

    @Override
    public AdminOrderResponse toAdminOrderResponse(Order order) {
        if ( order == null ) {
            return null;
        }

        AdminOrderResponse.AdminOrderResponseBuilder adminOrderResponse = AdminOrderResponse.builder();

        adminOrderResponse.userId( orderUserId( order ) );
        adminOrderResponse.userName( orderUserFullName( order ) );
        adminOrderResponse.userEmail( orderUserEmail( order ) );
        adminOrderResponse.userPhone( orderUserPhoneNumber( order ) );
        adminOrderResponse.totalItems( calculateTotalItems( order ) );
        if ( order != null ) {
            adminOrderResponse.daysSinceOrder( calculateDaysSinceOrder( order ).intValue() );
        }
        adminOrderResponse.id( order.getId() );
        adminOrderResponse.orderDate( order.getOrderDate() );
        adminOrderResponse.totalAmount( order.getTotalAmount() );
        adminOrderResponse.status( order.getStatus() );
        adminOrderResponse.deliveryAddress( order.getDeliveryAddress() );

        adminOrderResponse.paymentMethod( "COD" );

        return adminOrderResponse.build();
    }

    private String orderUserId(Order order) {
        if ( order == null ) {
            return null;
        }
        User user = order.getUser();
        if ( user == null ) {
            return null;
        }
        String id = user.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }

    private String orderUserFullName(Order order) {
        if ( order == null ) {
            return null;
        }
        User user = order.getUser();
        if ( user == null ) {
            return null;
        }
        String fullName = user.getFullName();
        if ( fullName == null ) {
            return null;
        }
        return fullName;
    }

    private String orderDetailCarId(OrderDetail orderDetail) {
        if ( orderDetail == null ) {
            return null;
        }
        Car car = orderDetail.getCar();
        if ( car == null ) {
            return null;
        }
        String id = car.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }

    private String orderDetailCarName(OrderDetail orderDetail) {
        if ( orderDetail == null ) {
            return null;
        }
        Car car = orderDetail.getCar();
        if ( car == null ) {
            return null;
        }
        String name = car.getName();
        if ( name == null ) {
            return null;
        }
        return name;
    }

    private List<String> orderDetailCarImages(OrderDetail orderDetail) {
        if ( orderDetail == null ) {
            return null;
        }
        Car car = orderDetail.getCar();
        if ( car == null ) {
            return null;
        }
        List<String> images = car.getImages();
        if ( images == null ) {
            return null;
        }
        return images;
    }

    private String orderUserEmail(Order order) {
        if ( order == null ) {
            return null;
        }
        User user = order.getUser();
        if ( user == null ) {
            return null;
        }
        String email = user.getEmail();
        if ( email == null ) {
            return null;
        }
        return email;
    }

    private String orderUserPhoneNumber(Order order) {
        if ( order == null ) {
            return null;
        }
        User user = order.getUser();
        if ( user == null ) {
            return null;
        }
        String phoneNumber = user.getPhoneNumber();
        if ( phoneNumber == null ) {
            return null;
        }
        return phoneNumber;
    }
}
