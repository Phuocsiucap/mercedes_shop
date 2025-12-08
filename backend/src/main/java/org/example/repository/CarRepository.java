package org.example.repository;

import org.example.entity.Car;
import org.example.entity.Category;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface CarRepository extends MongoRepository<Car, String> {

    Page<Car> findByCategory(Category category, Pageable pageable);

    Page<Car> findByNameContainingIgnoreCase(String name, Pageable pageable);

    Page<Car> findByPriceBetween(BigDecimal minPrice, BigDecimal maxPrice, Pageable pageable);

    Page<Car> findByManufactureYear(Integer year, Pageable pageable);

    Page<Car> findByColor(String color, Pageable pageable);

    @Query("{ 'category': ?0, 'price': { $gte: ?1, $lte: ?2 } }")
    Page<Car> findByCategoryAndPriceRange(Category category, BigDecimal minPrice, BigDecimal maxPrice, Pageable pageable);

    @Query("{ 'name': { $regex: ?0, $options: 'i' }, 'price': { $gte: ?1, $lte: ?2 } }")
    Page<Car> searchByNameAndPriceRange(String name, BigDecimal minPrice, BigDecimal maxPrice, Pageable pageable);

    List<Car> findTop5ByOrderByIdDesc();
}
