package org.example.controller;

import org.example.dto.request.LoginRequest;
import org.example.dto.request.RegisterRequest;
import org.example.dto.request.ChangePasswordRequest;
import org.example.dto.request.OAuthRequest;
import org.example.dto.response.AuthResponse;
import org.example.dto.response.ApiResponse;
import org.example.service.AuthService;
import org.example.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            AuthResponse authResponse = authService.login(loginRequest);
            
            ApiResponse<AuthResponse> response = ApiResponse.<AuthResponse>builder()
                .success(true)
                .message("Đăng nhập thành công")
                .data(authResponse)
                .timestamp(LocalDateTime.now())
                .build();
                
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ApiResponse<AuthResponse> response = ApiResponse.<AuthResponse>builder()
                .success(false)
                .message("Đăng nhập thất bại: " + e.getMessage())
                .timestamp(LocalDateTime.now())
                .build();
                
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest registerRequest) {
        try {
            AuthResponse authResponse = authService.register(registerRequest);
            
            ApiResponse<AuthResponse> response = ApiResponse.<AuthResponse>builder()
                .success(true)
                .message("Đăng ký thành công")
                .data(authResponse)
                .timestamp(LocalDateTime.now())
                .build();
                
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ApiResponse<AuthResponse> response = ApiResponse.<AuthResponse>builder()
                .success(false)
                .message("Đăng ký thất bại: " + e.getMessage())
                .timestamp(LocalDateTime.now())
                .build();
                
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/refresh")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<AuthResponse>> refreshToken(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            AuthResponse authResponse = authService.refreshToken(userPrincipal.getId());
            
            ApiResponse<AuthResponse> response = ApiResponse.<AuthResponse>builder()
                .success(true)
                .message("Token làm mới thành công")
                .data(authResponse)
                .timestamp(LocalDateTime.now())
                .build();
                
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ApiResponse<AuthResponse> response = ApiResponse.<AuthResponse>builder()
                .success(false)
                .message("Làm mới token thất bại: " + e.getMessage())
                .timestamp(LocalDateTime.now())
                .build();
                
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/oauth")
    public ResponseEntity<ApiResponse<AuthResponse>> oauthLogin(@Valid @RequestBody OAuthRequest oauthRequest) {
        try {
            AuthResponse authResponse = authService.oauthLogin(oauthRequest);
            
            ApiResponse<AuthResponse> response = ApiResponse.<AuthResponse>builder()
                .success(true)
                .message("Đăng nhập OAuth thành công")
                .data(authResponse)
                .timestamp(LocalDateTime.now())
                .build();
                
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ApiResponse<AuthResponse> response = ApiResponse.<AuthResponse>builder()
                .success(false)
                .message("Đăng nhập OAuth thất bại: " + e.getMessage())
                .timestamp(LocalDateTime.now())
                .build();
                
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/change-password")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<String>> changePassword(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody ChangePasswordRequest changePasswordRequest) {
        try {
            ApiResponse<String> response = authService.changePassword(userPrincipal.getId(), changePasswordRequest);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ApiResponse<String> response = ApiResponse.<String>builder()
                .success(false)
                .message("Đổi mật khẩu thất bại: " + e.getMessage())
                .timestamp(LocalDateTime.now())
                .build();
                
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<String>> forgotPassword(@RequestParam String email) {
        try {
            ApiResponse<String> response = authService.forgotPassword(email);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ApiResponse<String> response = ApiResponse.<String>builder()
                .success(false)
                .message("Gửi email reset thất bại: " + e.getMessage())
                .timestamp(LocalDateTime.now())
                .build();
                
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<String>> resetPassword(
            @RequestParam String token,
            @RequestParam String newPassword) {
        try {
            ApiResponse<String> response = authService.resetPassword(token, newPassword);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ApiResponse<String> response = ApiResponse.<String>builder()
                .success(false)
                .message("Reset mật khẩu thất bại: " + e.getMessage())
                .timestamp(LocalDateTime.now())
                .build();
                
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/logout")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<String>> logout(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            ApiResponse<String> response = authService.logout(userPrincipal.getId());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ApiResponse<String> response = ApiResponse.<String>builder()
                .success(false)
                .message("Đăng xuất thất bại: " + e.getMessage())
                .timestamp(LocalDateTime.now())
                .build();
                
            return ResponseEntity.badRequest().body(response);
        }
    }
    // Endpoint to create admin user (for development/testing purposes)
    @PostMapping("/create-admin")
    public ResponseEntity<ApiResponse<AuthResponse>> createAdmin(
            @RequestParam String email,
            @RequestParam String password,
            @RequestParam String fullName) {
        try {
            AuthResponse authResponse = authService.createAdminUser(email, password, fullName);

            ApiResponse<AuthResponse> response = ApiResponse.<AuthResponse>builder()
                .success(true)
                .message("Admin user created successfully")
                .data(authResponse)
                .timestamp(LocalDateTime.now())
                .build();

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ApiResponse<AuthResponse> response = ApiResponse.<AuthResponse>builder()
                .success(false)
                .message("Failed to create admin user: " + e.getMessage())
                .timestamp(LocalDateTime.now())
                .build();

            return ResponseEntity.badRequest().body(response);
        }
    }}