package org.example.controller;

import org.example.dto.request.AddToCartRequest;
import org.example.dto.request.UpdateCartItemRequest;
import org.example.dto.request.OrderRequest;
import org.example.dto.response.ApiResponse;
import org.example.dto.response.CartResponse;
import org.example.dto.response.CartItemResponse;
import org.example.dto.response.OrderResponse;
import org.example.service.CartService;
import org.example.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "*", maxAge = 3600)
public class CartController {

    @Autowired
    private CartService cartService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<CartResponse>> getUserCart(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            CartResponse cart = cartService.getUserCart(userPrincipal.getId());
            
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
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody AddToCartRequest addToCartRequest) {
        try {
            ApiResponse<CartItemResponse> response = cartService.addToCart(userPrincipal.getId(), addToCartRequest);
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
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable String cartItemId,
            @Valid @RequestBody UpdateCartItemRequest updateRequest) {
        try {
            ApiResponse<CartItemResponse> response = cartService.updateCartItem(
                userPrincipal.getId(), cartItemId, updateRequest);
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
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable String cartItemId) {
        try {
            ApiResponse<String> response = cartService.removeFromCart(userPrincipal.getId(), cartItemId);
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
    public ResponseEntity<ApiResponse<String>> clearCart(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            ApiResponse<String> response = cartService.clearCart(userPrincipal.getId());
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
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody OrderRequest orderRequest) {
        try {
            ApiResponse<OrderResponse> response = cartService.checkout(userPrincipal.getId(), orderRequest);
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
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody OrderRequest orderRequest) {
        try {
            ApiResponse<OrderResponse> response = cartService.createOrderFromItems(userPrincipal.getId(), orderRequest);
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