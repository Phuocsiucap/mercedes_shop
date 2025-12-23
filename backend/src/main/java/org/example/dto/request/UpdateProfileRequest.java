package org.example.dto.request;

import lombok.Data;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

@Data
public class UpdateProfileRequest {
    
    @NotBlank(message = "Full name is required")
    @Size(min = 2, max = 100, message = "Full name must be between 2 and 100 characters")
    private String fullName;
    
    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^(0|\\+84)[0-9]{9,10}$", message = "Phone number is invalid")
    private String phoneNumber;
    
    @NotBlank(message = "Address is required")
    @Size(min = 5, max = 500, message = "Address must be between 5 and 500 characters")
    private String address;
}
