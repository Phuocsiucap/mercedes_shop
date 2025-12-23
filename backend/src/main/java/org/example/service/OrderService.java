package org.example.service;

import org.example.dto.request.OrderRequest;
import org.example.dto.response.ApiResponse;
import org.example.dto.response.OrderResponse;
import org.example.entity.*;
import org.example.exception.BadRequestException;
import org.example.exception.ResourceNotFoundException;
import org.example.repository.*;
import org.example.mapper.OrderMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderDetailRepository orderDetailRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private OrderMapper orderMapper;

    /**
     * Lấy danh sách đơn hàng của user
     */
    public List<OrderResponse> getMyOrders(String userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        List<Order> orders = orderRepository.findByUser(user);
        
        return orders.stream()
            .map(this::toOrderResponseWithDetails)
            .collect(Collectors.toList());
    }

    /**
     * Lấy chi tiết đơn hàng
     */
    public OrderResponse getOrderById(String userId, String orderId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        // Verify ownership
        if (!order.getUser().getId().equals(userId)) {
            throw new BadRequestException("Bạn không có quyền xem đơn hàng này");
        }

        return toOrderResponseWithDetails(order);
    }

    /**
     * Tạo đơn hàng từ giỏ hàng
     */
    public ApiResponse<OrderResponse> createOrder(String userId, @Valid OrderRequest orderRequest) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Cart cart = cartRepository.findByUser(user)
            .orElseThrow(() -> new ResourceNotFoundException("Cart not found"));

        List<CartItem> cartItems = cartItemRepository.findByCart(cart);
        
        if (cartItems.isEmpty()) {
            throw new BadRequestException("Giỏ hàng trống");
        }

        // Tính tổng tiền
        BigDecimal totalAmount = cartItems.stream()
            .map(item -> item.getCar().getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Tạo đơn hàng
        Order order = new Order();
        order.setUser(user);
        order.setTotalAmount(totalAmount);
        order.setStatus(Order.OrderStatus.PENDING);
        order.setDeliveryAddress(orderRequest.getDeliveryAddress());
        order.setPaymentMethod(orderRequest.getPaymentMethod());
        order.setNotes(orderRequest.getNotes());
        order.setOrderDate(LocalDateTime.now());

        Order savedOrder = orderRepository.save(order);

        // Tạo chi tiết đơn hàng
        for (CartItem cartItem : cartItems) {
            OrderDetail orderDetail = new OrderDetail();
            orderDetail.setOrder(savedOrder);
            orderDetail.setCar(cartItem.getCar());
            orderDetail.setQuantity(cartItem.getQuantity());
            orderDetail.setUnitPrice(cartItem.getCar().getPrice());
            orderDetailRepository.save(orderDetail);
        }

        // Xóa giỏ hàng
        cartItemRepository.deleteAll(cartItems);

        return ApiResponse.<OrderResponse>builder()
            .success(true)
            .message("Đặt hàng thành công")
            .data(toOrderResponseWithDetails(savedOrder))
            .timestamp(LocalDateTime.now())
            .build();
    }

    /**
     * Hủy đơn hàng
     */
    public ApiResponse<String> cancelOrder(String userId, String orderId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        // Verify ownership
        if (!order.getUser().getId().equals(userId)) {
            throw new BadRequestException("Bạn không có quyền hủy đơn hàng này");
        }

        // Chỉ cho phép hủy đơn hàng PENDING
        if (order.getStatus() != Order.OrderStatus.PENDING) {
            throw new BadRequestException("Chỉ có thể hủy đơn hàng đang chờ xác nhận");
        }

        order.setStatus(Order.OrderStatus.CANCELLED);
        orderRepository.save(order);

        return ApiResponse.<String>builder()
            .success(true)
            .message("Hủy đơn hàng thành công")
            .data("Order cancelled")
            .timestamp(LocalDateTime.now())
            .build();
    }

    /**
     * Lấy đơn hàng theo trạng thái
     */
    public List<OrderResponse> getOrdersByStatus(String userId, Order.OrderStatus status) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        List<Order> orders = orderRepository.findByUserAndStatus(user, status);
        
        return orders.stream()
            .map(this::toOrderResponseWithDetails)
            .collect(Collectors.toList());
    }

    /**
     * [Admin] Lấy tất cả đơn hàng
     */
    public Page<OrderResponse> getAllOrders(int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
            Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Order> orders = orderRepository.findAll(pageable);
        
        return orders.map(this::toOrderResponseWithDetails);
    }

    /**
     * [Admin] Cập nhật trạng thái đơn hàng
     */
    public ApiResponse<OrderResponse> updateOrderStatus(String orderId, Order.OrderStatus newStatus) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        order.setStatus(newStatus);
        Order updatedOrder = orderRepository.save(order);

        return ApiResponse.<OrderResponse>builder()
            .success(true)
            .message("Cập nhật trạng thái thành công")
            .data(toOrderResponseWithDetails(updatedOrder))
            .timestamp(LocalDateTime.now())
            .build();
    }

    private OrderResponse toOrderResponseWithDetails(Order order) {
        OrderResponse response = orderMapper.toOrderResponse(order);
        
        List<OrderDetail> orderDetails = orderDetailRepository.findByOrder(order);
        List<OrderResponse.OrderDetailResponse> detailResponses = orderDetails.stream()
            .map(orderMapper::toOrderDetailResponse)
            .collect(Collectors.toList());
        
        response.setOrderDetails(detailResponses);
        
        return response;
    }
}
