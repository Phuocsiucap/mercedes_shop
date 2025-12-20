package org.example.service;

import org.example.dto.request.LoginRequest;
import org.example.dto.request.RegisterRequest;
import org.example.dto.response.AuthResponse;
import org.example.entity.User;
import org.example.exception.BadRequestException;
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

import java.time.LocalDateTime;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private TokenService tokenService;

    public AuthResponse register(RegisterRequest request) {
        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email đã được sử dụng");
        }

        // Check if phone number already exists
        if (userRepository.existsByPhoneNumber(request.getPhoneNumber())) {
            throw new BadRequestException("Số điện thoại đã được sử dụng");
        }

        // Create new user
        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhoneNumber(request.getPhoneNumber());
        user.setAddress(request.getAddress());
        user.setRole(User.Role.CUSTOMER);
        user.setCreatedAt(LocalDateTime.now());

        User savedUser = userRepository.save(user);

        // Generate JWT token
        String token = tokenProvider.generateTokenFromUserId(savedUser.getId());
        saveUserToken(savedUser, token);

        return new AuthResponse(
                token,
                savedUser.getId(),
                savedUser.getFullName(),
                savedUser.getEmail(),
                savedUser.getPhoneNumber(),
                savedUser.getAddress(),
                savedUser.getRole(),
                savedUser.getVerified());
    }

    public AuthResponse login(LoginRequest request) {
        // Authenticate user
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmailOrPhone(),
                        request.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);

        // Generate JWT token
        String token = tokenProvider.generateToken(authentication);
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();

        // Revoke all existing tokens for this user
        tokenService.revokeAllUserTokens(userPrincipal.getId());

        saveUserToken(userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new BadRequestException("User not found")), token);

        return new AuthResponse(
                token,
                userPrincipal.getId(),
                userPrincipal.getFullName(),
                userPrincipal.getEmail(),
                userPrincipal.getPhoneNumber(),
                userPrincipal.getAddress(),
                userPrincipal.getAuthorities().stream()
                        .findFirst()
                        .map(auth -> User.Role.valueOf(auth.getAuthority().replace("ROLE_", "")))
                        .orElse(User.Role.CUSTOMER),
                userRepository.findById(userPrincipal.getId())
                        .map(User::getVerified)
                        .orElse(false));
    }

    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new BadRequestException("Người dùng chưa đăng nhập");
        }

        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        return userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new BadRequestException("Không tìm thấy người dùng"));
    }

    private void saveUserToken(User user, String jwtToken) {
        var token = org.example.entity.Token.builder()
                .userId(user.getId())
                .token(jwtToken)
                .tokenType(org.example.entity.Token.TokenType.BEARER)
                .expired(false)
                .revoked(false)
                .build();
        tokenService.save(token);
    }

    public AuthResponse authenticateWithOAuth(org.example.dto.request.OAuthRequest request) {
        // Check if user exists by email
        User user = userRepository.findByEmail(request.getEmail()).orElse(null);

        if (user == null) {
            // Create new user from OAuth
            user = new User();
            user.setFullName(request.getName());
            user.setEmail(request.getEmail());
            user.setPassword(passwordEncoder.encode(java.util.UUID.randomUUID().toString())); // Random password
            user.setRole(User.Role.CUSTOMER);
            user.setVerified(true); // OAuth users are verified
            user.setProvider(request.getProvider());
            user.setProviderId(request.getProviderId());
            user.setCreatedAt(LocalDateTime.now());
            user = userRepository.save(user);
        } else {
            // Update existing user's OAuth info if needed
            if (user.getProvider() == null || user.getProvider().equals("LOCAL")) {
                user.setProvider(request.getProvider());
                user.setProviderId(request.getProviderId());
                user.setVerified(true);
                user = userRepository.save(user);
            }
        }

        // Generate JWT token
        String token = tokenProvider.generateTokenFromUserId(user.getId());

        // Revoke all existing tokens
        tokenService.revokeAllUserTokens(user.getId());
        saveUserToken(user, token);

        return new AuthResponse(
                token,
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getPhoneNumber(),
                user.getAddress(),
                user.getRole(),
                user.getVerified());
    }
}
