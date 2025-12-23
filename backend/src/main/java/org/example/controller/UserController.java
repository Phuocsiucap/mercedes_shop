package org.example.controller;

import org.example.dto.request.UpdateProfileRequest;
import org.example.dto.request.FavoriteRequest;
import org.example.dto.response.ApiResponse;
import org.example.dto.response.OrderResponse;
import org.example.dto.response.FavoriteResponse;
import org.example.entity.User;
import org.example.repository.UserRepository;
import org.example.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
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

    @Autowired
    private UserRepository userRepository;

    private User getCurrentUser(Authentication authentication) {
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping("/profile")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<User>> getUserProfile(Authentication authentication) {
        try {
            User user = getCurrentUser(authentication);
            
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
            Authentication authentication,
            @Valid @RequestBody UpdateProfileRequest updateRequest) {
        try {
            User user = getCurrentUser(authentication);
            ApiResponse<User> response = userService.updateProfile(user.getId(), updateRequest);
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
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getUserOrders(Authentication authentication) {
        try {
            User user = getCurrentUser(authentication);
            List<OrderResponse> orders = userService.getUserOrders(user.getId());
            
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
            Authentication authentication,
            @PathVariable String orderId) {
        try {
            User user = getCurrentUser(authentication);
            OrderResponse order = userService.getUserOrder(user.getId(), orderId);
            
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
    public ResponseEntity<ApiResponse<List<FavoriteResponse>>> getUserFavorites(Authentication authentication) {
        try {
            User user = getCurrentUser(authentication);
            List<FavoriteResponse> favorites = userService.getUserFavorites(user.getId());
            
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
            Authentication authentication,
            @Valid @RequestBody FavoriteRequest favoriteRequest) {
        try {
            User user = getCurrentUser(authentication);
            ApiResponse<FavoriteResponse> response = userService.addToFavorites(user.getId(), favoriteRequest);
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
            Authentication authentication,
            @PathVariable String carId) {
        try {
            User user = getCurrentUser(authentication);
            ApiResponse<String> response = userService.removeFromFavorites(user.getId(), carId);
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
            Authentication authentication,
            @PathVariable String carId) {
        try {
            User user = getCurrentUser(authentication);
            boolean isInFavorites = userService.isCarInFavorites(user.getId(), carId);
            
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
