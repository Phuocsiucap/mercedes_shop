package org.example.controller;

import org.example.dto.request.AddToCartRequest;
import org.example.dto.request.UpdateCartItemRequest;
import org.example.dto.request.OrderRequest;
import org.example.dto.response.ApiResponse;
import org.example.dto.response.CartResponse;
import org.example.dto.response.CartItemResponse;
import org.example.dto.response.OrderResponse;
import org.example.entity.User;
import org.example.repository.UserRepository;
import org.example.service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "*", maxAge = 3600)
public class CartController {

    @Autowired
    private CartService cartService;

    @Autowired
    private UserRepository userRepository;

    private User getCurrentUser(Authentication authentication) {
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<CartResponse>> getUserCart(Authentication authentication) {
        try {
            User user = getCurrentUser(authentication);
            CartResponse cart = cartService.getUserCart(user.getId());
            
            ApiResponse<CartResponse> response = ApiResponse.<CartResponse>builder()
                .success(true)
                .message("Lấy giỏ hàng thành công")
                .data(cart)
                .timestamp(LocalDateTime.now())
                .build();
                
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ApiResponse<CartResponse> response = ApiResponse.<CartResponse>builder()
                .success(false)
                .message("Lấy giỏ hàng thất bại: " + e.getMessage())
                .timestamp(LocalDateTime.now())
                .build();
                
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/items")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<CartItemResponse>> addToCart(
            Authentication authentication,
            @Valid @RequestBody AddToCartRequest addToCartRequest) {
        try {
            User user = getCurrentUser(authentication);
            ApiResponse<CartItemResponse> response = cartService.addToCart(user.getId(), addToCartRequest);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ApiResponse<CartItemResponse> response = ApiResponse.<CartItemResponse>builder()
                .success(false)
                .message("Thêm vào giỏ hàng thất bại: " + e.getMessage())
                .timestamp(LocalDateTime.now())
                .build();
                
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PutMapping("/items/{cartItemId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<CartItemResponse>> updateCartItem(
            Authentication authentication,
            @PathVariable String cartItemId,
            @Valid @RequestBody UpdateCartItemRequest updateRequest) {
        try {
            User user = getCurrentUser(authentication);
            ApiResponse<CartItemResponse> response = cartService.updateCartItem(
                user.getId(), cartItemId, updateRequest);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ApiResponse<CartItemResponse> response = ApiResponse.<CartItemResponse>builder()
                .success(false)
                .message("Cập nhật giỏ hàng thất bại: " + e.getMessage())
                .timestamp(LocalDateTime.now())
                .build();
                
            return ResponseEntity.badRequest().body(response);
        }
    }

    @DeleteMapping("/items/{cartItemId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<String>> removeFromCart(
            Authentication authentication,
            @PathVariable String cartItemId) {
        try {
            User user = getCurrentUser(authentication);
            ApiResponse<String> response = cartService.removeFromCart(user.getId(), cartItemId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ApiResponse<String> response = ApiResponse.<String>builder()
                .success(false)
                .message("Xóa khỏi giỏ hàng thất bại: " + e.getMessage())
                .timestamp(LocalDateTime.now())
                .build();
                
            return ResponseEntity.badRequest().body(response);
        }
    }

    @DeleteMapping("/clear")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<String>> clearCart(Authentication authentication) {
        try {
            User user = getCurrentUser(authentication);
            ApiResponse<String> response = cartService.clearCart(user.getId());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ApiResponse<String> response = ApiResponse.<String>builder()
                .success(false)
                .message("Xóa giỏ hàng thất bại: " + e.getMessage())
                .timestamp(LocalDateTime.now())
                .build();
                
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/checkout")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<OrderResponse>> checkout(
            Authentication authentication,
            @Valid @RequestBody OrderRequest orderRequest) {
        try {
            User user = getCurrentUser(authentication);
            ApiResponse<OrderResponse> response = cartService.checkout(user.getId(), orderRequest);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ApiResponse<OrderResponse> response = ApiResponse.<OrderResponse>builder()
                .success(false)
                .message("Thanh toán thất bại: " + e.getMessage())
                .timestamp(LocalDateTime.now())
                .build();
                
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/order")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<OrderResponse>> createOrder(
            Authentication authentication,
            @Valid @RequestBody OrderRequest orderRequest) {
        try {
            User user = getCurrentUser(authentication);
            ApiResponse<OrderResponse> response = cartService.createOrderFromItems(user.getId(), orderRequest);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ApiResponse<OrderResponse> response = ApiResponse.<OrderResponse>builder()
                .success(false)
                .message("Tạo đơn hàng thất bại: " + e.getMessage())
                .timestamp(LocalDateTime.now())
                .build();
                
            return ResponseEntity.badRequest().body(response);
        }
    }
}
