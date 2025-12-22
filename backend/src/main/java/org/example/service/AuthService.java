package org.example.service;

import org.example.dto.request.LoginRequest;
import org.example.dto.request.RegisterRequest;
import org.example.dto.request.ChangePasswordRequest;
import org.example.dto.request.OAuthRequest;
import org.example.dto.response.AuthResponse;
import org.example.dto.response.ApiResponse;
import org.example.entity.User;
import org.example.exception.BadRequestException;
import org.example.exception.ResourceNotFoundException;
import org.example.repository.UserRepository;
import org.example.security.JwtTokenProvider;
import org.example.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.validation.Valid;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
@Transactional
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    public AuthResponse login(@Valid LoginRequest loginRequest) {
        // Authenticate user
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                loginRequest.getEmailOrPhone(),
                loginRequest.getPassword()
            )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        // Generate JWT token
        String jwt = tokenProvider.generateToken(authentication);

        // Get user details
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        User user = userRepository.findById(userPrincipal.getId())
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return new AuthResponse(
            jwt,
            user.getId(),
            user.getFullName(),
            user.getEmail(),
            user.getPhoneNumber(),
            user.getAddress(),
            user.getRole(),
            user.getVerified()
        );
    }

    public AuthResponse register(@Valid RegisterRequest registerRequest) {
        // Check if user already exists
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new BadRequestException("Email đã được sử dụng!");
        }

        if (userRepository.existsByPhoneNumber(registerRequest.getPhoneNumber())) {
            throw new BadRequestException("Số điện thoại đã được sử dụng!");
        }

        // Create new user
        User user = new User();
        user.setFullName(registerRequest.getFullName());
        user.setEmail(registerRequest.getEmail());
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        user.setPhoneNumber(registerRequest.getPhoneNumber());
        user.setAddress(registerRequest.getAddress());
        user.setRole(User.Role.CUSTOMER);
        user.setCreatedAt(LocalDateTime.now());
        user.setVerified(false);
        user.setProvider("LOCAL");

        User savedUser = userRepository.save(user);

        // Generate JWT token
        String jwt = tokenProvider.generateTokenFromUserId(savedUser.getId());

        return new AuthResponse(
            jwt,
            savedUser.getId(),
            savedUser.getFullName(),
            savedUser.getEmail(),
            savedUser.getPhoneNumber(),
            savedUser.getAddress(),
            savedUser.getRole(),
            savedUser.getVerified()
        );
    }

    public AuthResponse refreshToken(String userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String jwt = tokenProvider.generateTokenFromUserId(user.getId());

        return new AuthResponse(
            jwt,
            user.getId(),
            user.getFullName(),
            user.getEmail(),
            user.getPhoneNumber(),
            user.getAddress(),
            user.getRole(),
            user.getVerified()
        );
    }

    public AuthResponse oauthLogin(@Valid OAuthRequest oauthRequest) {
        // Check if user exists by provider ID
        Optional<User> existingUser = userRepository.findByEmail(oauthRequest.getEmail());
        
        User user;
        if (existingUser.isPresent()) {
            user = existingUser.get();
            // Update OAuth info if needed
            if (!oauthRequest.getProvider().equals(user.getProvider())) {
                user.setProvider(oauthRequest.getProvider());
                user.setProviderId(oauthRequest.getProviderId());
                user.setVerified(true);
                user = userRepository.save(user);
            }
        } else {
            // Create new OAuth user
            user = new User();
            user.setFullName(oauthRequest.getName());
            user.setEmail(oauthRequest.getEmail());
            user.setRole(User.Role.CUSTOMER);
            user.setCreatedAt(LocalDateTime.now());
            user.setVerified(true);
            user.setProvider(oauthRequest.getProvider());
            user.setProviderId(oauthRequest.getProviderId());
            
            user = userRepository.save(user);
        }

        // Generate JWT token
        String jwt = tokenProvider.generateTokenFromUserId(user.getId());

        return new AuthResponse(
            jwt,
            user.getId(),
            user.getFullName(),
            user.getEmail(),
            user.getPhoneNumber(),
            user.getAddress(),
            user.getRole(),
            user.getVerified()
        );
    }

    public ApiResponse<String> changePassword(String userId, @Valid ChangePasswordRequest changePasswordRequest) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Verify current password
        if (!passwordEncoder.matches(changePasswordRequest.getOldPassword(), user.getPassword())) {
            throw new BadRequestException("Mật khẩu hiện tại không đúng");
        }

        // Update password
        user.setPassword(passwordEncoder.encode(changePasswordRequest.getNewPassword()));
        userRepository.save(user);

        return ApiResponse.<String>builder()
            .success(true)
            .message("Đổi mật khẩu thành công")
            .data("Password changed successfully")
            .timestamp(LocalDateTime.now())
            .build();
    }

    public ApiResponse<String> forgotPassword(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với email: " + email));

        // In a real application, you would send an email with reset token
        // For now, we'll just return a success message
        return ApiResponse.<String>builder()
            .success(true)
            .message("Email reset mật khẩu đã được gửi")
            .data("Reset email sent")
            .timestamp(LocalDateTime.now())
            .build();
    }

    public ApiResponse<String> resetPassword(String token, String newPassword) {
        // In a real application, you would validate the reset token
        // For now, we'll just return a success message
        return ApiResponse.<String>builder()
            .success(true)
            .message("Mật khẩu đã được reset thành công")
            .data("Password reset successfully")
            .timestamp(LocalDateTime.now())
            .build();
    }

    public ApiResponse<String> logout(String userId) {
        // In a real application, you might want to blacklist the token
        // For now, we'll just return a success message
        return ApiResponse.<String>builder()
            .success(true)
            .message("Đăng xuất thành công")
            .data("Logged out successfully")
            .timestamp(LocalDateTime.now())
            .build();
    }

    // Method to create admin user (for development/testing purposes)
    public AuthResponse createAdminUser(String email, String password, String fullName) {
        // Check if admin already exists
        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException("Email đã được sử dụng!");
        }

        // Create admin user
        User user = new User();
        user.setFullName(fullName);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setPhoneNumber(""); // Admin doesn't need phone
        user.setAddress(""); // Admin doesn't need address
        user.setRole(User.Role.ADMIN);
        user.setCreatedAt(LocalDateTime.now());
        user.setVerified(true); // Admin is pre-verified
        user.setProvider("LOCAL");

        User savedUser = userRepository.save(user);

        // Generate JWT token
        String jwt = tokenProvider.generateTokenFromUserId(savedUser.getId());

        return new AuthResponse(
            jwt,
            savedUser.getId(),
            savedUser.getFullName(),
            savedUser.getEmail(),
            savedUser.getPhoneNumber(),
            savedUser.getAddress(),
            savedUser.getRole(),
            savedUser.getVerified()
        );
    }
}