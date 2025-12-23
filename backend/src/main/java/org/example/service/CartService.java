package org.example.service;

import org.example.dto.request.AddToCartRequest;
import org.example.dto.request.UpdateCartItemRequest;
import org.example.dto.request.OrderRequest;
import org.example.dto.response.ApiResponse;
import org.example.dto.response.CartResponse;
import org.example.dto.response.CartItemResponse;
import org.example.dto.response.OrderResponse;
import org.example.entity.*;
import org.example.exception.BadRequestException;
import org.example.exception.ResourceNotFoundException;
import org.example.repository.*;
import org.example.mapper.CartMapper;
import org.example.mapper.OrderMapper;
import org.example.mapper.CarMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class CartService {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CarRepository carRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderDetailRepository orderDetailRepository;

    @Autowired
    private CartMapper cartMapper;

    @Autowired
    private OrderMapper orderMapper;

    @Autowired
    private CarMapper carMapper;

    public CartResponse getUserCart(String userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Cart cart = getOrCreateCart(user);
        return toCartResponse(cart);
    }

    public ApiResponse<CartItemResponse> addToCart(String userId, @Valid AddToCartRequest addToCartRequest) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Car car = carRepository.findById(addToCartRequest.getCarId())
            .orElseThrow(() -> new ResourceNotFoundException("Car not found with id: " + addToCartRequest.getCarId()));

        Cart cart = getOrCreateCart(user);

        // Check if item already exists in cart
        Optional<CartItem> existingItem = cartItemRepository.findByCartAndCarId(cart, car.getId());
        
        CartItem cartItem;
        if (existingItem.isPresent()) {
            // Update quantity
            cartItem = existingItem.get();
            cartItem.setQuantity(cartItem.getQuantity() + addToCartRequest.getQuantity());
        } else {
            // Create new cart item
            cartItem = new CartItem();
            cartItem.setCart(cart);
            cartItem.setCar(car);
            cartItem.setQuantity(addToCartRequest.getQuantity());
        }

        CartItem savedCartItem = cartItemRepository.save(cartItem);
        updateCartTotal(cart);

        return ApiResponse.<CartItemResponse>builder()
            .success(true)
            .message("Đã thêm vào giỏ hàng")
            .data(toCartItemResponse(savedCartItem))
            .timestamp(LocalDateTime.now())
            .build();
    }

    public ApiResponse<CartItemResponse> updateCartItem(String userId, String cartItemId, @Valid UpdateCartItemRequest updateRequest) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        CartItem cartItem = cartItemRepository.findById(cartItemId)
            .orElseThrow(() -> new ResourceNotFoundException("Cart item not found with id: " + cartItemId));

        // Verify that the cart item belongs to the user
        if (!cartItem.getCart().getUser().getId().equals(userId)) {
            throw new BadRequestException("Bạn không có quyền cập nhật item này");
        }

        cartItem.setQuantity(updateRequest.getQuantity());
        CartItem updatedCartItem = cartItemRepository.save(cartItem);
        
        updateCartTotal(cartItem.getCart());

        return ApiResponse.<CartItemResponse>builder()
            .success(true)
            .message("Cập nhật giỏ hàng thành công")
            .data(toCartItemResponse(updatedCartItem))
            .timestamp(LocalDateTime.now())
            .build();
    }

    public ApiResponse<String> removeFromCart(String userId, String cartItemId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        CartItem cartItem = cartItemRepository.findById(cartItemId)
            .orElseThrow(() -> new ResourceNotFoundException("Cart item not found with id: " + cartItemId));

        // Verify that the cart item belongs to the user
        if (!cartItem.getCart().getUser().getId().equals(userId)) {
            throw new BadRequestException("Bạn không có quyền xóa item này");
        }

        Cart cart = cartItem.getCart();
        cartItemRepository.delete(cartItem);
        updateCartTotal(cart);

        return ApiResponse.<String>builder()
            .success(true)
            .message("Đã xóa khỏi giỏ hàng")
            .data("Item removed from cart")
            .timestamp(LocalDateTime.now())
            .build();
    }

    public ApiResponse<String> clearCart(String userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Optional<Cart> cartOpt = cartRepository.findByUser(user);
        if (cartOpt.isPresent()) {
            Cart cart = cartOpt.get();
            cartItemRepository.deleteByCart(cart);
            cart.setTotalAmount(BigDecimal.ZERO);
            cartRepository.save(cart);
        }

        return ApiResponse.<String>builder()
            .success(true)
            .message("Đã xóa tất cả sản phẩm khỏi giỏ hàng")
            .data("Cart cleared")
            .timestamp(LocalDateTime.now())
            .build();
    }

    public ApiResponse<OrderResponse> checkout(String userId, @Valid OrderRequest orderRequest) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Cart cart = cartRepository.findByUser(user)
            .orElseThrow(() -> new BadRequestException("Giỏ hàng trống"));

        List<CartItem> cartItems = cartItemRepository.findByCart(cart);
        if (cartItems.isEmpty()) {
            throw new BadRequestException("Giỏ hàng trống");
        }

        // Create order
        Order order = new Order();
        order.setUser(user);
        order.setOrderDate(LocalDateTime.now());
        order.setStatus(Order.OrderStatus.PENDING);
        order.setDeliveryAddress(orderRequest.getDeliveryAddress());

        // Calculate total amount
        BigDecimal totalAmount = BigDecimal.ZERO;
        for (CartItem cartItem : cartItems) {
            BigDecimal itemTotal = cartItem.getCar().getPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity()));
            totalAmount = totalAmount.add(itemTotal);
        }
        order.setTotalAmount(totalAmount);

        Order savedOrder = orderRepository.save(order);

        // Create order details
        List<OrderDetail> orderDetails = new ArrayList<>();
        for (CartItem cartItem : cartItems) {
            OrderDetail orderDetail = new OrderDetail();
            orderDetail.setOrder(savedOrder);
            orderDetail.setCar(cartItem.getCar());
            orderDetail.setQuantity(cartItem.getQuantity());
            orderDetail.setUnitPrice(cartItem.getCar().getPrice());
            OrderDetail savedOrderDetail = orderDetailRepository.save(orderDetail);
            orderDetails.add(savedOrderDetail);
        }

        // Clear cart
        cartItemRepository.deleteByCart(cart);
        cart.setTotalAmount(BigDecimal.ZERO);
        cartRepository.save(cart);

        // Map order to response with order details
        OrderResponse orderResponse = orderMapper.toOrderResponse(savedOrder);
        List<OrderResponse.OrderDetailResponse> orderDetailResponses = orderDetails.stream()
            .map(orderMapper::toOrderDetailResponse)
            .collect(Collectors.toList());
        orderResponse.setOrderDetails(orderDetailResponses);

        return ApiResponse.<OrderResponse>builder()
            .success(true)
            .message("Đặt hàng thành công")
            .data(orderResponse)
            .timestamp(LocalDateTime.now())
            .build();
    }

    public ApiResponse<OrderResponse> createOrderFromItems(String userId, @Valid OrderRequest orderRequest) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        if (orderRequest.getItems().isEmpty()) {
            throw new BadRequestException("Danh sách sản phẩm không được để trống");
        }

        // Create order
        Order order = new Order();
        order.setUser(user);
        order.setOrderDate(LocalDateTime.now());
        order.setStatus(Order.OrderStatus.PENDING);
        order.setDeliveryAddress(orderRequest.getDeliveryAddress());

        // Calculate total amount and validate items
        BigDecimal totalAmount = BigDecimal.ZERO;
        for (OrderRequest.OrderItemRequest item : orderRequest.getItems()) {
            Car car = carRepository.findById(item.getCarId())
                .orElseThrow(() -> new ResourceNotFoundException("Car not found with id: " + item.getCarId()));
            
            BigDecimal itemTotal = car.getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
            totalAmount = totalAmount.add(itemTotal);
        }
        order.setTotalAmount(totalAmount);

        Order savedOrder = orderRepository.save(order);

        // Create order details
        List<OrderDetail> orderDetails = new ArrayList<>();
        for (OrderRequest.OrderItemRequest item : orderRequest.getItems()) {
            Car car = carRepository.findById(item.getCarId()).get(); // Already validated above
            
            OrderDetail orderDetail = new OrderDetail();
            orderDetail.setOrder(savedOrder);
            orderDetail.setCar(car);
            orderDetail.setQuantity(item.getQuantity());
            orderDetail.setUnitPrice(car.getPrice());
            OrderDetail savedOrderDetail = orderDetailRepository.save(orderDetail);
            orderDetails.add(savedOrderDetail);
        }

        // Map order to response with order details
        OrderResponse orderResponse = orderMapper.toOrderResponse(savedOrder);
        List<OrderResponse.OrderDetailResponse> orderDetailResponses = orderDetails.stream()
            .map(orderMapper::toOrderDetailResponse)
            .collect(Collectors.toList());
        orderResponse.setOrderDetails(orderDetailResponses);

        return ApiResponse.<OrderResponse>builder()
            .success(true)
            .message("Đặt hàng thành công")
            .data(orderResponse)
            .timestamp(LocalDateTime.now())
            .build();
    }

    private Cart getOrCreateCart(User user) {
        return cartRepository.findByUser(user)
            .orElseGet(() -> {
                Cart newCart = new Cart();
                newCart.setUser(user);
                newCart.setTotalAmount(BigDecimal.ZERO);
                return cartRepository.save(newCart);
            });
    }

    private void updateCartTotal(Cart cart) {
        List<CartItem> cartItems = cartItemRepository.findByCart(cart);
        BigDecimal total = cartItems.stream()
            .map(item -> item.getCar().getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        cart.setTotalAmount(total);
        cartRepository.save(cart);
    }

    private CartResponse toCartResponse(Cart cart) {
        List<CartItem> cartItems = cartItemRepository.findByCart(cart);
        List<CartItemResponse> itemResponses = cartItems.stream()
            .map(this::toCartItemResponse)
            .collect(Collectors.toList());

        return CartResponse.builder()
            .id(cart.getId())
            .userId(cart.getUser().getId())
            .items(itemResponses)
            .totalAmount(cart.getTotalAmount())
            .totalItems(cartItems.stream().mapToInt(CartItem::getQuantity).sum())
            .build();
    }

    private CartItemResponse toCartItemResponse(CartItem cartItem) {
        BigDecimal subTotal = cartItem.getCar().getPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity()));
        
        return new CartItemResponse(
            cartItem.getId(),
            carMapper.toCarResponse(cartItem.getCar()),
            cartItem.getQuantity(),
            subTotal
        );
    }
}