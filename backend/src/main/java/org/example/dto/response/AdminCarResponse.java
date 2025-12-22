package org.example.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminCarResponse {
    private String id;
    private String name;
    private String categoryId;
    private String categoryName;
    private BigDecimal price;
    private Integer manufactureYear;
    private String color;
    private String engine;
    private String transmission;
    private Integer seats;
    private List<String> images;
    private String description;
    private Double averageRating;
    private Integer reviewCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Summary fields for list view
    private String status; // ACTIVE, INACTIVE
    private Integer totalOrders; // Số lần được đặt
}