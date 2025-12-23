package org.example.controller;

import org.example.dto.request.OrderRequest;
import org.example.dto.response.ApiResponse;
import org.example.dto.response.OrderResponse;
import org.example.entity.Order;
import org.example.entity.User;
import org.example.repository.UserRepository;
import org.example.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*", maxAge = 3600)
public class OrderController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private UserRepository userRepository;

    private User getCurrentUser(Authentication authentication) {
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    /**
     * Lấy danh sách đơn hàng của user
     */
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getMyOrders(Authentication authentication) {
        try {
            User user = getCurrentUser(authentication);
            List<OrderResponse> orders = orderService.getMyOrders(user.getId());
            
            return ResponseEntity.ok(ApiResponse.<List<OrderResponse>>builder()
                .success(true)
                .message("Lấy danh sách đơn hàng thành công")
                .data(orders)
                .timestamp(LocalDateTime.now())
                .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.<List<OrderResponse>>builder()
                .success(false)
                .message("Lỗi: " + e.getMessage())
                .timestamp(LocalDateTime.now())
                .build());
        }
    }

    /**
     * Lấy chi tiết đơn hàng
     */
    @GetMapping("/{orderId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrderById(
            Authentication authentication,
            @PathVariable String orderId) {
        try {
            User user = getCurrentUser(authentication);
            OrderResponse order = orderService.getOrderById(user.getId(), orderId);
            
            return ResponseEntity.ok(ApiResponse.<OrderResponse>builder()
                .success(true)
                .message("Lấy chi tiết đơn hàng thành công")
                .data(order)
                .timestamp(LocalDateTime.now())
                .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.<OrderResponse>builder()
                .success(false)
                .message("Lỗi: " + e.getMessage())
                .timestamp(LocalDateTime.now())
                .build());
        }
    }

    /**
     * Tạo đơn hàng mới
     */
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<OrderResponse>> createOrder(
            Authentication authentication,
            @Valid @RequestBody OrderRequest orderRequest) {
        try {
            User user = getCurrentUser(authentication);
            ApiResponse<OrderResponse> response = orderService.createOrder(user.getId(), orderRequest);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.<OrderResponse>builder()
                .success(false)
                .message("Lỗi: " + e.getMessage())
                .timestamp(LocalDateTime.now())
                .build());
        }
    }

    /**
     * Hủy đơn hàng
     */
    @DeleteMapping("/{orderId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<String>> cancelOrder(
            Authentication authentication,
            @PathVariable String orderId) {
        try {
            User user = getCurrentUser(authentication);
            ApiResponse<String> response = orderService.cancelOrder(user.getId(), orderId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.<String>builder()
                .success(false)
                .message("Lỗi: " + e.getMessage())
                .timestamp(LocalDateTime.now())
                .build());
        }
    }

    /**
     * Lấy đơn hàng theo trạng thái
     */
    @GetMapping("/status/{status}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getOrdersByStatus(
            Authentication authentication,
            @PathVariable String status) {
        try {
            User user = getCurrentUser(authentication);
            Order.OrderStatus orderStatus = Order.OrderStatus.valueOf(status.toUpperCase());
            List<OrderResponse> orders = orderService.getOrdersByStatus(user.getId(), orderStatus);
            
            return ResponseEntity.ok(ApiResponse.<List<OrderResponse>>builder()
                .success(true)
                .message("Lấy đơn hàng theo trạng thái thành công")
                .data(orders)
                .timestamp(LocalDateTime.now())
                .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.<List<OrderResponse>>builder()
                .success(false)
                .message("Lỗi: " + e.getMessage())
                .timestamp(LocalDateTime.now())
                .build());
        }
    }

    /**
     * [Admin] Lấy tất cả đơn hàng
     */
    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<OrderResponse>>> getAllOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "orderDate") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        try {
            Page<OrderResponse> orders = orderService.getAllOrders(page, size, sortBy, sortDir);
            
            return ResponseEntity.ok(ApiResponse.<Page<OrderResponse>>builder()
                .success(true)
                .message("Lấy tất cả đơn hàng thành công")
                .data(orders)
                .timestamp(LocalDateTime.now())
                .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.<Page<OrderResponse>>builder()
                .success(false)
                .message("Lỗi: " + e.getMessage())
                .timestamp(LocalDateTime.now())
                .build());
        }
    }

    /**
     * [Admin] Cập nhật trạng thái đơn hàng
     */
    @PatchMapping("/{orderId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<OrderResponse>> updateOrderStatus(
            @PathVariable String orderId,
            @RequestParam String status) {
        try {
            Order.OrderStatus orderStatus = Order.OrderStatus.valueOf(status.toUpperCase());
            ApiResponse<OrderResponse> response = orderService.updateOrderStatus(orderId, orderStatus);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.<OrderResponse>builder()
                .success(false)
                .message("Lỗi: " + e.getMessage())
                .timestamp(LocalDateTime.now())
                .build());
        }
    }
}
