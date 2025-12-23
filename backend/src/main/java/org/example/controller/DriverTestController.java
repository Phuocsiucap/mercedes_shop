package org.example.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.dto.request.DriverTestRequest;
import org.example.dto.response.ApiResponse;
import org.example.dto.response.DriverTestResponse;
import org.example.entity.User;
import org.example.repository.UserRepository;
import org.example.service.DriverTestService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/test-drive")
@CrossOrigin(origins = "*", maxAge = 3600)
@RequiredArgsConstructor
public class DriverTestController {

    private final DriverTestService driverTestService;
    private final UserRepository userRepository;

    /**
     * Đăng ký lái thử (yêu cầu đăng nhập)
     */
    @PostMapping
    public ResponseEntity<ApiResponse<DriverTestResponse>> createTestDrive(
            @Valid @RequestBody DriverTestRequest request) {
        try {
            String userId = getCurrentUserId();
            if (userId == null) {
                return ResponseEntity.badRequest().body(
                        ApiResponse.error("Vui lòng đăng nhập để đăng ký lái thử"));
            }

            ApiResponse<DriverTestResponse> response = driverTestService.createTestDrive(userId, request);
            if (response.isSuccess()) {
                return ResponseEntity.ok(response);
            }
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                    ApiResponse.<DriverTestResponse>builder()
                            .success(false)
                            .message("Đăng ký lái thử thất bại: " + e.getMessage())
                            .timestamp(LocalDateTime.now())
                            .build());
        }
    }

    /**
     * Lấy danh sách lịch lái thử của user hiện tại
     */
    @GetMapping("/my-bookings")
    public ResponseEntity<ApiResponse<List<DriverTestResponse>>> getMyTestDrives() {
        try {
            String userId = getCurrentUserId();
            if (userId == null) {
                return ResponseEntity.badRequest().body(
                        ApiResponse.error("Vui lòng đăng nhập"));
            }

            ApiResponse<List<DriverTestResponse>> response = driverTestService.getUserTestDrives(userId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                    ApiResponse.<List<DriverTestResponse>>builder()
                            .success(false)
                            .message("Lấy danh sách thất bại: " + e.getMessage())
                            .timestamp(LocalDateTime.now())
                            .build());
        }
    }

    /**
     * Lấy chi tiết lịch lái thử
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DriverTestResponse>> getTestDriveById(@PathVariable String id) {
        try {
            ApiResponse<DriverTestResponse> response = driverTestService.getTestDriveById(id);
            if (response.isSuccess()) {
                return ResponseEntity.ok(response);
            }
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                    ApiResponse.<DriverTestResponse>builder()
                            .success(false)
                            .message("Lấy thông tin thất bại: " + e.getMessage())
                            .timestamp(LocalDateTime.now())
                            .build());
        }
    }

    /**
     * Hủy lịch lái thử
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> cancelTestDrive(@PathVariable String id) {
        try {
            String userId = getCurrentUserId();
            if (userId == null) {
                return ResponseEntity.badRequest().body(
                        ApiResponse.error("Vui lòng đăng nhập"));
            }

            ApiResponse<String> response = driverTestService.cancelTestDrive(userId, id);
            if (response.isSuccess()) {
                return ResponseEntity.ok(response);
            }
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                    ApiResponse.<String>builder()
                            .success(false)
                            .message("Hủy lịch thất bại: " + e.getMessage())
                            .timestamp(LocalDateTime.now())
                            .build());
        }
    }

    // Helper method to get current user ID
    private String getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }

        String email = authentication.getName();
        User user = userRepository.findByEmail(email).orElse(null);
        return user != null ? user.getId() : null;
    }
}
