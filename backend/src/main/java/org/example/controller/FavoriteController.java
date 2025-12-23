package org.example.controller;

import org.example.dto.response.ApiResponse;
import org.example.dto.response.FavoriteResponse;
import org.example.service.FavoriteService;
import org.example.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/favorites")
@CrossOrigin(origins = "*", maxAge = 3600)
public class FavoriteController {

    @Autowired
    private FavoriteService favoriteService;

    /**
     * Lấy danh sách yêu thích của user
     */
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<FavoriteResponse>>> getMyFavorites(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            List<FavoriteResponse> favorites = favoriteService.getMyFavorites(userPrincipal.getId());
            
            return ResponseEntity.ok(ApiResponse.<List<FavoriteResponse>>builder()
                .success(true)
                .message("Lấy danh sách yêu thích thành công")
                .data(favorites)
                .timestamp(LocalDateTime.now())
                .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.<List<FavoriteResponse>>builder()
                .success(false)
                .message("Lỗi: " + e.getMessage())
                .timestamp(LocalDateTime.now())
                .build());
        }
    }

    /**
     * Thêm xe vào yêu thích
     */
    @PostMapping("/car/{carId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<FavoriteResponse>> addFavorite(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable String carId) {
        try {
            ApiResponse<FavoriteResponse> response = favoriteService.addFavorite(
                userPrincipal.getId(), carId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.<FavoriteResponse>builder()
                .success(false)
                .message("Lỗi: " + e.getMessage())
                .timestamp(LocalDateTime.now())
                .build());
        }
    }

    /**
     * Xóa khỏi yêu thích theo favorite ID
     */
    @DeleteMapping("/{favoriteId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<String>> removeFavorite(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable String favoriteId) {
        try {
            ApiResponse<String> response = favoriteService.removeFavorite(
                userPrincipal.getId(), favoriteId);
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
     * Xóa khỏi yêu thích theo car ID
     */
    @DeleteMapping("/car/{carId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<String>> removeFavoriteByCarId(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable String carId) {
        try {
            ApiResponse<String> response = favoriteService.removeFavoriteByCarId(
                userPrincipal.getId(), carId);
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
     * Kiểm tra xe đã được yêu thích chưa
     */
    @GetMapping("/car/{carId}/check")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Boolean>> checkFavorite(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable String carId) {
        try {
            boolean isFavorited = favoriteService.checkFavorite(userPrincipal.getId(), carId);
            
            return ResponseEntity.ok(ApiResponse.<Boolean>builder()
                .success(true)
                .message("Kiểm tra yêu thích thành công")
                .data(isFavorited)
                .timestamp(LocalDateTime.now())
                .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.<Boolean>builder()
                .success(false)
                .message("Lỗi: " + e.getMessage())
                .timestamp(LocalDateTime.now())
                .build());
        }
    }
}
