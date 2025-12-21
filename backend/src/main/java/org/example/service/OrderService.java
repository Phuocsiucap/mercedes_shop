package org.example.service;

import org.example.dto.request.OrderRequest;
import org.example.dto.response.OrderResponse;
import org.example.entity.*;
import org.example.exception.BadRequestException;
import org.example.exception.ResourceNotFoundException;
import org.example.repository.OrderDetailRepository;
import org.example.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderDetailRepository orderDetailRepository;

    @Autowired
    private CarService carService;

    @Autowired
    private AuthService authService;

    public List<OrderResponse> getUserOrders() {
        User currentUser = authService.getCurrentUser();
        return orderRepository.findByUser(currentUser).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public OrderResponse getOrderById(String id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Đơn hàng", "id", id));

        User currentUser = authService.getCurrentUser();

        // Check if user owns this order or is admin
        // Added null check for order.getUser() just in case user is deleted
        if (order.getUser() != null &&
                !order.getUser().getId().equals(currentUser.getId()) &&
                currentUser.getRole() != User.Role.ADMIN) {
            throw new BadRequestException("Bạn không có quyền xem đơn hàng này");
        }

        return mapToResponse(order);
    }

    @Transactional
    public OrderResponse createOrder(OrderRequest request) {
        User currentUser = authService.getCurrentUser();

        // Validate order items
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new BadRequestException("Đơn hàng phải có ít nhất 1 sản phẩm");
        }

        // Create order
        Order order = new Order();
        order.setUser(currentUser);
        order.setOrderDate(LocalDateTime.now());
        order.setStatus(Order.OrderStatus.PENDING);
        order.setDeliveryAddress(request.getDeliveryAddress());

        // Calculate total amount and create order details
        BigDecimal totalAmount = BigDecimal.ZERO;

        Order savedOrder = orderRepository.save(order);

        for (OrderRequest.OrderItemRequest item : request.getItems()) {
            Car car = carService.getCarEntityById(item.getCarId());

            // Validate quantity
            if (item.getQuantity() <= 0) {
                throw new BadRequestException("Số lượng phải lớn hơn 0");
            }

            // Create order detail
            OrderDetail orderDetail = new OrderDetail();
            orderDetail.setOrder(savedOrder);
            orderDetail.setCar(car);
            orderDetail.setQuantity(item.getQuantity());
            orderDetail.setUnitPrice(car.getPrice());

            orderDetailRepository.save(orderDetail);

            // Add to total amount
            BigDecimal itemTotal = car.getPrice().multiply(new BigDecimal(item.getQuantity()));
            totalAmount = totalAmount.add(itemTotal);
        }

        // Update order with total amount
        savedOrder.setTotalAmount(totalAmount);
        Order finalOrder = orderRepository.save(savedOrder);

        return mapToResponse(finalOrder);
    }

    @Transactional
    public OrderResponse updateOrderStatus(String id, Order.OrderStatus newStatus) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Đơn hàng", "id", id));

        // Validate status transition
        if (order.getStatus() == Order.OrderStatus.CANCELLED) {
            throw new BadRequestException("Không thể thay đổi trạng thái đơn hàng đã hủy");
        }

        if (order.getStatus() == Order.OrderStatus.COMPLETED) {
            throw new BadRequestException("Không thể thay đổi trạng thái đơn hàng đã hoàn thành");
        }

        order.setStatus(newStatus);
        Order updatedOrder = orderRepository.save(order);

        return mapToResponse(updatedOrder);
    }

    @Transactional
    public void cancelOrder(String id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Đơn hàng", "id", id));

        User currentUser = authService.getCurrentUser();

        // Check if user owns this order
        // Added null check for order.getUser()
        if (order.getUser() != null && !order.getUser().getId().equals(currentUser.getId())) {
            throw new BadRequestException("Bạn không có quyền hủy đơn hàng này");
        }

        // Only allow cancel if order is pending
        if (order.getStatus() != Order.OrderStatus.PENDING) {
            throw new BadRequestException("Chỉ có thể hủy đơn hàng đang chờ xác nhận");
        }

        order.setStatus(Order.OrderStatus.CANCELLED);
        orderRepository.save(order);
    }

    public List<OrderResponse> getOrdersByStatus(Order.OrderStatus status) {
        return orderRepository.findByStatus(status).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // --- FIX APPLIED HERE ---
    private OrderResponse mapToResponse(Order order) {
        List<OrderDetail> orderDetails = orderDetailRepository.findByOrder(order);

        List<OrderResponse.OrderDetailResponse> orderDetailResponses = orderDetails.stream()
                .map(detail -> {
                    // Extract Car logic to handle Null values safely
                    Car car = detail.getCar();
                    String carId = (car != null) ? car.getId() : null;
                    String carName = (car != null) ? car.getName() : "Sản phẩm không tồn tại (Đã xóa)";
                    String carImage = (car != null) ? car.getImage() : null;

                    return OrderResponse.OrderDetailResponse.builder()
                            .id(detail.getId())
                            .carId(carId)
                            .carName(carName)
                            .carImage(carImage)
                            .quantity(detail.getQuantity())
                            .unitPrice(detail.getUnitPrice())
                            .subtotal(detail.getUnitPrice().multiply(new BigDecimal(detail.getQuantity())))
                            .build();
                })
                .collect(Collectors.toList());

        // Also safeguard against User being null (if user was deleted)
        String userId = (order.getUser() != null) ? order.getUser().getId() : null;
        String userName = (order.getUser() != null) ? order.getUser().getFullName() : "Người dùng ẩn danh";

        return OrderResponse.builder()
                .id(order.getId())
                .userId(userId)
                .userName(userName)
                .orderDate(order.getOrderDate())
                .totalAmount(order.getTotalAmount())
                .status(order.getStatus())
                .deliveryAddress(order.getDeliveryAddress())
                .orderDetails(orderDetailResponses)
                .build();
    }
}