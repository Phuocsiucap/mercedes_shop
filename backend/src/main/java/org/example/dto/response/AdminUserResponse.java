package org.example.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.entity.User;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminUserResponse {
    private String id;
    private String fullName;
    private String email;
    private String phoneNumber;
    private String address;
    private User.Role role;
    private LocalDateTime createdAt;
    private LocalDateTime lastLoginAt;
    
    // Summary fields for admin
    private Integer totalOrders;
    private Integer totalReviews;
    private String status; // ACTIVE, INACTIVE, BANNED
    private Boolean isEmailVerified;
}