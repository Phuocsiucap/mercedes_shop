package org.example.controller;

import org.example.dto.request.ReviewRequest;
import org.example.dto.response.ApiResponse;
import org.example.dto.response.ReviewResponse;
import org.example.entity.User;
import org.example.repository.UserRepository;
import org.example.service.ReviewService;
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
@RequestMapping("/api/reviews")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    @Autowired
    private UserRepository userRepository;

    private User getCurrentUser(Authentication authentication) {
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    /**
     * Lấy đánh giá theo xe
     */
    @GetMapping("/car/{carId}")
    public ResponseEntity<ApiResponse<List<ReviewResponse>>> getReviewsByCarId(
            @PathVariable String carId) {
        try {
            List<ReviewResponse> reviews = reviewService.getReviewsByCarId(carId);
            
            return ResponseEntity.ok(ApiResponse.<List<ReviewResponse>>builder()
                .success(true)
                .message("Lấy đánh giá thành công")
                .data(reviews)
                .timestamp(LocalDateTime.now())
                .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.<List<ReviewResponse>>builder()
                .success(false)
                .message("Lỗi: " + e.getMessage())
                .timestamp(LocalDateTime.now())
                .build());
        }
    }

    /**
     * Lấy chi tiết đánh giá
     */
    @GetMapping("/{reviewId}")
    public ResponseEntity<ApiResponse<ReviewResponse>> getReviewById(
            @PathVariable String reviewId) {
        try {
            ReviewResponse review = reviewService.getReviewById(reviewId);
            
            return ResponseEntity.ok(ApiResponse.<ReviewResponse>builder()
                .success(true)
                .message("Lấy chi tiết đánh giá thành công")
                .data(review)
                .timestamp(LocalDateTime.now())
                .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.<ReviewResponse>builder()
                .success(false)
                .message("Lỗi: " + e.getMessage())
                .timestamp(LocalDateTime.now())
                .build());
        }
    }

    /**
     * Tạo đánh giá mới
     */
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<ReviewResponse>> createReview(
            Authentication authentication,
            @Valid @RequestBody ReviewRequest reviewRequest) {
        try {
            User user = getCurrentUser(authentication);
            ApiResponse<ReviewResponse> response = reviewService.createReview(user.getId(), reviewRequest);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.<ReviewResponse>builder()
                .success(false)
                .message("Lỗi: " + e.getMessage())
                .timestamp(LocalDateTime.now())
                .build());
        }
    }

    /**
     * Cập nhật đánh giá
     */
    @PutMapping("/{reviewId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<ReviewResponse>> updateReview(
            Authentication authentication,
            @PathVariable String reviewId,
            @Valid @RequestBody ReviewRequest reviewRequest) {
        try {
            User user = getCurrentUser(authentication);
            ApiResponse<ReviewResponse> response = reviewService.updateReview(user.getId(), reviewId, reviewRequest);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.<ReviewResponse>builder()
                .success(false)
                .message("Lỗi: " + e.getMessage())
                .timestamp(LocalDateTime.now())
                .build());
        }
    }

    /**
     * Xóa đánh giá
     */
    @DeleteMapping("/{reviewId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<String>> deleteReview(
            Authentication authentication,
            @PathVariable String reviewId) {
        try {
            User user = getCurrentUser(authentication);
            ApiResponse<String> response = reviewService.deleteReview(user.getId(), reviewId);
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
     * [Admin] Lấy tất cả đánh giá
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<ReviewResponse>>> getAllReviews(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Page<ReviewResponse> reviews = reviewService.getAllReviews(page, size);
            
            return ResponseEntity.ok(ApiResponse.<Page<ReviewResponse>>builder()
                .success(true)
                .message("Lấy tất cả đánh giá thành công")
                .data(reviews)
                .timestamp(LocalDateTime.now())
                .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.<Page<ReviewResponse>>builder()
                .success(false)
                .message("Lỗi: " + e.getMessage())
                .timestamp(LocalDateTime.now())
                .build());
        }
    }
}
