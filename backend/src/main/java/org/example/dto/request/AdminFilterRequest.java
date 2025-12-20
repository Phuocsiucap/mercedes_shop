package org.example.dto.request;

import lombok.Data;
import java.time.LocalDate;

@Data
public class AdminFilterRequest {
    private String keyword;
    private LocalDate fromDate;
    private LocalDate toDate;
    private String status;
    private String categoryId;
    private String role;
    private Double minPrice;
    private Double maxPrice;
    private Integer year;
    private String color;
    private String engine;
    private String transmission;
    private Integer seats;
    
    // Pagination
    private int page = 0;
    private int size = 10;
    private String sortBy = "id";
    private String sortDir = "DESC";
}