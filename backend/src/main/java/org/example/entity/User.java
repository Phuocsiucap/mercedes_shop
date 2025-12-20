package org.example.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "users")
public class User {

    @Id
    private String id;

    private String fullName;

    @Indexed(unique = true)
    private String email;

    private String password;

    private String phoneNumber;

    private String address;

    private Role role;

    private LocalDateTime createdAt;

    // OAuth fields
    private Boolean verified = false;

    private String provider = "LOCAL"; // LOCAL, GOOGLE, GITHUB

    private String providerId; // OAuth provider user ID

    public enum Role {
        CUSTOMER, // Changed from USER for consistency
        ADMIN, USER
    }
}