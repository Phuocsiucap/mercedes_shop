package org.example.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OAuthRequest {
    
    @NotBlank(message = "Provider is required")
    @Pattern(regexp = "^(GOOGLE|GITHUB)$", message = "Provider must be GOOGLE or GITHUB")
    private String provider; // GOOGLE or GITHUB
    
    private String code; // Authorization code from OAuth (for GitHub)
    
    private String token; // Access token from OAuth (for Google)
    
    private String redirectUri; // Redirect URI for code exchange
    
    @Email(message = "Email must be valid")
    private String email; // User email from OAuth
    
    @Size(max = 100, message = "Name must be max 100 characters")
    private String name; // User name from OAuth
    
    private String providerId; // OAuth provider user ID (optional, backend will get from provider)
}
