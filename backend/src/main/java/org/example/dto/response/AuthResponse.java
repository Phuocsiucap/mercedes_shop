package org.example.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.entity.User;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {

    private String token;

    private String type = "Bearer";

    private String id;

    private String fullName;

    private String email;

    private String phoneNumber;

    private String address;

    private User.Role role;

    public AuthResponse(String token, String id, String fullName, String email,
                       String phoneNumber, String address, User.Role role) {
        this.token = token;
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.address = address;
        this.role = role;
    }
}
