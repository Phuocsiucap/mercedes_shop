package org.example.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OAuthRequest {
    private String provider; // GOOGLE or GITHUB
    private String code; // Authorization code from OAuth
    private String token; // Access token from OAuth (alternative to code)
    private String email; // User email from OAuth
    private String name; // User name from OAuth
    private String providerId; // OAuth provider user ID
}
