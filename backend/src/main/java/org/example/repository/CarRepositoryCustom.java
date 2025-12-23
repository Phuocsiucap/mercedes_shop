package org.example.repository;

import org.example.entity.Car;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.math.BigDecimal;

public interface CarRepositoryCustom {
    Page<Car> findCarsByFilters(String keyword, String categoryId, BigDecimal minPrice,
                                BigDecimal maxPrice, Integer year, String color, Pageable pageable);
}