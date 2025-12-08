package org.example.service;

import org.example.dto.request.CarRequest;
import org.example.dto.response.CarResponse;
import org.example.dto.response.CategoryResponse;
import org.example.entity.Car;
import org.example.entity.Category;
import org.example.entity.Review;
import org.example.exception.ResourceNotFoundException;
import org.example.repository.CarRepository;
import org.example.repository.ReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CarService {

    @Autowired
    private CarRepository carRepository;

    @Autowired
    private CategoryService categoryService;

    @Autowired
    private ReviewRepository reviewRepository;

    public Page<CarResponse> getAllCars(Pageable pageable) {
        return carRepository.findAll(pageable)
                .map(this::mapToResponse);
    }

    public List<CarResponse> getFeaturedCars() {
        return carRepository.findTop5ByOrderByIdDesc().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public CarResponse getCarById(String id) {
        Car car = carRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Xe", "id", id));
        return mapToResponse(car);
    }

    public Page<CarResponse> searchCars(String keyword, String categoryId,
                                       BigDecimal minPrice, BigDecimal maxPrice,
                                       Integer year, String color, Pageable pageable) {

        // If all filters are null, return all cars
        if (keyword == null && categoryId == null && minPrice == null &&
            maxPrice == null && year == null && color == null) {
            return getAllCars(pageable);
        }

        // Set default price range if not provided
        if (minPrice == null) minPrice = BigDecimal.ZERO;
        if (maxPrice == null) maxPrice = new BigDecimal("999999999999");

        // Search by category and price range
        if (categoryId != null && !categoryId.isEmpty()) {
            Category category = categoryService.getCategoryEntityById(categoryId);
            return carRepository.findByCategoryAndPriceRange(category, minPrice, maxPrice, pageable)
                    .map(this::mapToResponse);
        }

        // Search by keyword and price range
        if (keyword != null && !keyword.isEmpty()) {
            return carRepository.searchByNameAndPriceRange(keyword, minPrice, maxPrice, pageable)
                    .map(this::mapToResponse);
        }

        // Search by price range only
        if (minPrice.compareTo(BigDecimal.ZERO) > 0 || maxPrice.compareTo(new BigDecimal("999999999999")) < 0) {
            return carRepository.findByPriceBetween(minPrice, maxPrice, pageable)
                    .map(this::mapToResponse);
        }

        // Search by year
        if (year != null) {
            return carRepository.findByManufactureYear(year, pageable)
                    .map(this::mapToResponse);
        }

        // Search by color
        if (color != null && !color.isEmpty()) {
            return carRepository.findByColor(color, pageable)
                    .map(this::mapToResponse);
        }

        return getAllCars(pageable);
    }

    public CarResponse createCar(CarRequest request) {
        Category category = categoryService.getCategoryEntityById(request.getCategoryId());

        Car car = new Car();
        car.setName(request.getName());
        car.setPrice(request.getPrice());
        car.setManufactureYear(request.getManufactureYear());
        car.setColor(request.getColor());
        car.setEngine(request.getEngine());
        car.setTransmission(request.getTransmission());
        car.setSeats(request.getSeats());
        car.setDescription(request.getDescription());
        car.setImage(request.getImage());
        car.setCategory(category);

        Car savedCar = carRepository.save(car);
        return mapToResponse(savedCar);
    }

    public CarResponse updateCar(String id, CarRequest request) {
        Car car = carRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Xe", "id", id));

        Category category = categoryService.getCategoryEntityById(request.getCategoryId());

        car.setName(request.getName());
        car.setPrice(request.getPrice());
        car.setManufactureYear(request.getManufactureYear());
        car.setColor(request.getColor());
        car.setEngine(request.getEngine());
        car.setTransmission(request.getTransmission());
        car.setSeats(request.getSeats());
        car.setDescription(request.getDescription());
        car.setImage(request.getImage());
        car.setCategory(category);

        Car updatedCar = carRepository.save(car);
        return mapToResponse(updatedCar);
    }

    public void deleteCar(String id) {
        Car car = carRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Xe", "id", id));
        carRepository.delete(car);
    }

    public Car getCarEntityById(String id) {
        return carRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Xe", "id", id));
    }

    private CarResponse mapToResponse(Car car) {
        // Calculate average rating
        List<Review> reviews = reviewRepository.findByCar(car);
        double averageRating = reviews.isEmpty() ? 0.0 :
                reviews.stream()
                        .mapToInt(Review::getRating)
                        .average()
                        .orElse(0.0);

        CategoryResponse categoryResponse = CategoryResponse.builder()
                .id(car.getCategory().getId())
                .name(car.getCategory().getName())
                .description(car.getCategory().getDescription())
                .build();

        return CarResponse.builder()
                .id(car.getId())
                .name(car.getName())
                .price(car.getPrice())
                .manufactureYear(car.getManufactureYear())
                .color(car.getColor())
                .engine(car.getEngine())
                .transmission(car.getTransmission())
                .seats(car.getSeats())
                .description(car.getDescription())
                .image(car.getImage())
                .category(categoryResponse)
                .averageRating(averageRating)
                .reviewCount(reviews.size())
                .build();
    }
}
