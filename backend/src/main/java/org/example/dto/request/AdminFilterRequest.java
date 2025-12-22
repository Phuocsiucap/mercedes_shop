package org.example.dto.request;

import lombok.Data;
import java.time.LocalDate;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.PositiveOrZero;

@Data
public class AdminFilterRequest {
    
    private String keyword;
    
    private LocalDate fromDate;
    
    private LocalDate toDate;
    
    @Pattern(regexp = "^(ACTIVE|INACTIVE|PENDING|COMPLETED|CANCELLED)?$", 
             message = "Status must be ACTIVE, INACTIVE, PENDING, COMPLETED, or CANCELLED")
    private String status;
    
    private String categoryId;
    
    @Pattern(regexp = "^(CUSTOMER|ADMIN|USER)?$", 
             message = "Role must be CUSTOMER, ADMIN, or USER")
    private String role;
    
    @PositiveOrZero(message = "Minimum price must be zero or positive")
    private Double minPrice;
    
    @PositiveOrZero(message = "Maximum price must be zero or positive")
    private Double maxPrice;
    
    @Min(value = 1900, message = "Year must be 1900 or later")
    @Max(value = 2100, message = "Year must be 2100 or earlier")
    private Integer year;
    
    private String color;
    
    private String engine;
    
    private String transmission;
    
    @Min(value = 2, message = "Seats must be at least 2")
    @Max(value = 50, message = "Seats must be at most 50")
    private Integer seats;
    
    // Pagination
    @Min(value = 0, message = "Page must be zero or positive")
    private int page = 0;
    
    @Min(value = 1, message = "Size must be at least 1")
    @Max(value = 100, message = "Size must be at most 100")
    private int size = 10;
    
    @Pattern(regexp = "^[a-zA-Z]+$", message = "Sort by must contain only letters")
    private String sortBy = "id";
    
    @Pattern(regexp = "^(ASC|DESC)$", message = "Sort direction must be ASC or DESC")
    private String sortDir = "DESC";
}