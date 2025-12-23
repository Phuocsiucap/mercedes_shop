package org.example.controller;

import org.example.dto.request.UpdateProfileRequest;
import org.example.dto.request.FavoriteRequest;
import org.example.dto.response.ApiResponse;
import org.example.dto.response.OrderResponse;
import org.example.dto.response.FavoriteResponse;
import org.example.entity.User;
import org.example.service.UserService;
import org.example.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*", maxAge = 3600)
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/profile")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<User>> getUserProfile(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            User user = userService.getUserProfile(userPrincipal.getId());
            
            ApiResponse<User> response = ApiResponse.<User>builder()
                .success(true)
                .message("Lấy thông tin người dùng thành công")
                .data(user)
                .timestamp(LocalDateTime.now())
                .build();
                
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ApiResponse<User> response = ApiResponse.<User>builder()
                .success(false)
                .message("Lấy thông tin thất bại: " + e.getMessage())
                .timestamp(LocalDateTime.now())
                .build();
                
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PutMapping("/profile")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<User>> updateProfile(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody UpdateProfileRequest updateRequest) {
        try {
            ApiResponse<User> response = userService.updateProfile(userPrincipal.getId(), updateRequest);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ApiResponse<User> response = ApiResponse.<User>builder()
                .success(false)
                .message("Cập nhật thông tin thất bại: " + e.getMessage())
                .timestamp(LocalDateTime.now())
                .build();
                
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/orders")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getUserOrders(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            List<OrderResponse> orders = userService.getUserOrders(userPrincipal.getId());
            
            ApiResponse<List<OrderResponse>> response = ApiResponse.<List<OrderResponse>>builder()
                .success(true)
                .message("Lấy danh sách đơn hàng thành công")
                .data(orders)
                .timestamp(LocalDateTime.now())
                .build();
                
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ApiResponse<List<OrderResponse>> response = ApiResponse.<List<OrderResponse>>builder()
                .success(false)
                .message("Lấy danh sách đơn hàng thất bại: " + e.getMessage())
                .timestamp(LocalDateTime.now())
                .build();
                
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/orders/{orderId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<OrderResponse>> getUserOrder(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable String orderId) {
        try {
            OrderResponse order = userService.getUserOrder(userPrincipal.getId(), orderId);
            
            ApiResponse<OrderResponse> response = ApiResponse.<OrderResponse>builder()
                .success(true)
                .message("Lấy thông tin đơn hàng thành công")
                .data(order)
                .timestamp(LocalDateTime.now())
                .build();
                
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ApiResponse<OrderResponse> response = ApiResponse.<OrderResponse>builder()
                .success(false)
                .message("Lấy thông tin đơn hàng thất bại: " + e.getMessage())
                .timestamp(LocalDateTime.now())
                .build();
                
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/favorites")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<FavoriteResponse>>> getUserFavorites(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            List<FavoriteResponse> favorites = userService.getUserFavorites(userPrincipal.getId());
            
            ApiResponse<List<FavoriteResponse>> response = ApiResponse.<List<FavoriteResponse>>builder()
                .success(true)
                .message("Lấy danh sách yêu thích thành công")
                .data(favorites)
                .timestamp(LocalDateTime.now())
                .build();
                
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ApiResponse<List<FavoriteResponse>> response = ApiResponse.<List<FavoriteResponse>>builder()
                .success(false)
                .message("Lấy danh sách yêu thích thất bại: " + e.getMessage())
                .timestamp(LocalDateTime.now())
                .build();
                
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/favorites")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<FavoriteResponse>> addToFavorites(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody FavoriteRequest favoriteRequest) {
        try {
            ApiResponse<FavoriteResponse> response = userService.addToFavorites(userPrincipal.getId(), favoriteRequest);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ApiResponse<FavoriteResponse> response = ApiResponse.<FavoriteResponse>builder()
                .success(false)
                .message("Thêm vào yêu thích thất bại: " + e.getMessage())
                .timestamp(LocalDateTime.now())
                .build();
                
            return ResponseEntity.badRequest().body(response);
        }
    }

    @DeleteMapping("/favorites/{carId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<String>> removeFromFavorites(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable String carId) {
        try {
            ApiResponse<String> response = userService.removeFromFavorites(userPrincipal.getId(), carId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ApiResponse<String> response = ApiResponse.<String>builder()
                .success(false)
                .message("Xóa khỏi yêu thích thất bại: " + e.getMessage())
                .timestamp(LocalDateTime.now())
                .build();
                
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/favorites/{carId}/check")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Boolean>> checkIfCarInFavorites(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable String carId) {
        try {
            boolean isInFavorites = userService.isCarInFavorites(userPrincipal.getId(), carId);
            
            ApiResponse<Boolean> response = ApiResponse.<Boolean>builder()
                .success(true)
                .message("Kiểm tra yêu thích thành công")
                .data(isInFavorites)
                .timestamp(LocalDateTime.now())
                .build();
                
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ApiResponse<Boolean> response = ApiResponse.<Boolean>builder()
                .success(false)
                .message("Kiểm tra yêu thích thất bại: " + e.getMessage())
                .timestamp(LocalDateTime.now())
                .build();
                
            return ResponseEntity.badRequest().body(response);
        }
    }
}