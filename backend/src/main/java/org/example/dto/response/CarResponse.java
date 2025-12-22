package org.example.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CarResponse {

    private String id;

    private String name;

    private BigDecimal price;

    private Integer manufactureYear;

    private String color;

    private String engine;

    private String transmission;

    private Integer seats;

    private String description;

    private List<String> images;

    private CategoryResponse category;

    private Double averageRating;

    private Integer reviewCount;
}
