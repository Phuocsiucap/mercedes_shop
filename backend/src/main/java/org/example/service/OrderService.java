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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
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

    @Autowired
    private MongoTemplate mongoTemplate;

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
        if (!order.getUser().getId().equals(currentUser.getId()) &&
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
        if (!order.getUser().getId().equals(currentUser.getId())) {
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

    public Page<OrderResponse> getFilteredOrders(String keyword, String status, String fromDate, String toDate,
                                                Double minAmount, Double maxAmount, Pageable pageable) {
        List<Criteria> criteriaList = new ArrayList<>();
        
        // Keyword search (user fullName, email, deliveryAddress)
        if (keyword != null && !keyword.trim().isEmpty()) {
            Criteria keywordCriteria = new Criteria().orOperator(
                Criteria.where("user.fullName").regex(keyword, "i"),
                Criteria.where("user.email").regex(keyword, "i"),
                Criteria.where("deliveryAddress").regex(keyword, "i")
            );
            criteriaList.add(keywordCriteria);
        }
        
        // Status filter
        if (status != null && !status.trim().isEmpty()) {
            Order.OrderStatus orderStatus = Order.OrderStatus.valueOf(status);
            criteriaList.add(Criteria.where("status").is(orderStatus));
        }
        
        // Date range filter
        if (fromDate != null && !fromDate.trim().isEmpty()) {
            LocalDate from = LocalDate.parse(fromDate, DateTimeFormatter.ISO_LOCAL_DATE);
            criteriaList.add(Criteria.where("orderDate").gte(from.atStartOfDay()));
        }
        
        if (toDate != null && !toDate.trim().isEmpty()) {
            LocalDate to = LocalDate.parse(toDate, DateTimeFormatter.ISO_LOCAL_DATE);
            criteriaList.add(Criteria.where("orderDate").lte(to.atTime(23, 59, 59)));
        }
        
        // Amount range filter
        if (minAmount != null) {
            BigDecimal min = BigDecimal.valueOf(minAmount);
            criteriaList.add(Criteria.where("totalAmount").gte(min));
        }
        
        if (maxAmount != null) {
            BigDecimal max = BigDecimal.valueOf(maxAmount);
            criteriaList.add(Criteria.where("totalAmount").lte(max));
        }
        
        // Build final query
        Query query = new Query();
        if (!criteriaList.isEmpty()) {
            query.addCriteria(new Criteria().andOperator(criteriaList.toArray(new Criteria[0])));
        }
        
        // Add pagination and sorting
        query.with(pageable);
        
        // Execute query
        List<Order> orders = mongoTemplate.find(query, Order.class);
        long total = mongoTemplate.count(query.skip(0).limit(0), Order.class);
        
        // Convert to response
        List<OrderResponse> orderResponses = orders.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        
        return new PageImpl<>(orderResponses, pageable, total);
    }

    private OrderResponse mapToResponse(Order order) {
        List<OrderDetail> orderDetails = orderDetailRepository.findByOrder(order);

        List<OrderResponse.OrderDetailResponse> orderDetailResponses = orderDetails.stream()
                .map(detail -> OrderResponse.OrderDetailResponse.builder()
                        .id(detail.getId())
                        .carId(detail.getCar().getId())
                        .carName(detail.getCar().getName())
                        .carImage(detail.getCar().getImage())
                        .quantity(detail.getQuantity())
                        .unitPrice(detail.getUnitPrice())
                        .subtotal(detail.getUnitPrice().multiply(new BigDecimal(detail.getQuantity())))
                        .build())
                .collect(Collectors.toList());

        return OrderResponse.builder()
                .id(order.getId())
                .userId(order.getUser().getId())
                .userName(order.getUser().getFullName())
                .orderDate(order.getOrderDate())
                .totalAmount(order.getTotalAmount())
                .status(order.getStatus())
                .deliveryAddress(order.getDeliveryAddress())
                .orderDetails(orderDetailResponses)
                .build();
    }
}
