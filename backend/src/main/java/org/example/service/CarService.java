package org.example.service;

import org.example.dto.request.CarRequest;
import org.example.dto.request.ReviewRequest;
import org.example.dto.response.ApiResponse;
import org.example.dto.response.CarResponse;
import org.example.dto.response.CategoryResponse;
import org.example.dto.response.ReviewResponse;
import org.example.entity.Car;
import org.example.entity.Category;
import org.example.entity.Review;
import org.example.entity.User;
import org.example.exception.BadRequestException;
import org.example.exception.ResourceNotFoundException;
import org.example.repository.CarRepository;
import org.example.repository.CategoryRepository;
import org.example.repository.ReviewRepository;
import org.example.repository.UserRepository;
import org.example.mapper.CarMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class CarService {

    @Autowired
    private CarRepository carRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CarMapper carMapper;

    public Page<CarResponse> getAllCars(int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
            Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Car> cars = carRepository.findAll(pageable);
        
        return cars.map(this::toCarResponseWithStats);
    }

    public CarResponse getCarById(String id) {
        Car car = carRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Car not found with id: " + id));
        
        return toCarResponseWithStats(car);
    }

    public Page<CarResponse> searchCars(String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Car> cars = carRepository.findByNameContainingIgnoreCase(keyword, pageable);
        
        return cars.map(this::toCarResponseWithStats);
    }

    public Page<CarResponse> getCarsByCategory(String categoryId, int page, int size) {
        Category category = categoryRepository.findById(categoryId)
            .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + categoryId));
        
        Pageable pageable = PageRequest.of(page, size);
        Page<Car> cars = carRepository.findByCategory(category, pageable);
        
        return cars.map(this::toCarResponseWithStats);
    }

    public Page<CarResponse> getCarsByPriceRange(BigDecimal minPrice, BigDecimal maxPrice, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Car> cars = carRepository.findByPriceBetween(minPrice, maxPrice, pageable);
        
        return cars.map(this::toCarResponseWithStats);
    }

    public Page<CarResponse> getCarsByYear(Integer year, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Car> cars = carRepository.findByManufactureYear(year, pageable);
        
        return cars.map(this::toCarResponseWithStats);
    }

    public Page<CarResponse> getCarsByColor(String color, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Car> cars = carRepository.findByColor(color, pageable);
        
        return cars.map(this::toCarResponseWithStats);
    }

    public Page<CarResponse> advancedSearch(String keyword, String categoryId, BigDecimal minPrice, 
                                          BigDecimal maxPrice, Integer year, String color, 
                                          int page, int size, String sortBy, String sortDir) {
        // This would typically use MongoDB Criteria API for complex queries
        // For now, implementing basic search logic
        Pageable pageable = PageRequest.of(page, size, 
            sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending());
        
        Page<Car> cars;
        
        if (keyword != null && !keyword.trim().isEmpty()) {
            if (minPrice != null && maxPrice != null) {
                cars = carRepository.searchByNameAndPriceRange(keyword, minPrice, maxPrice, pageable);
            } else {
                cars = carRepository.findByNameContainingIgnoreCase(keyword, pageable);
            }
        } else if (categoryId != null && minPrice != null && maxPrice != null) {
            Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
            cars = carRepository.findByCategoryAndPriceRange(category, minPrice, maxPrice, pageable);
        } else {
            cars = carRepository.findAll(pageable);
        }
        
        return cars.map(this::toCarResponseWithStats);
    }

    public List<CategoryResponse> getAllCategories() {
        List<Category> categories = categoryRepository.findAll();
        return categories.stream()
            .map(this::toCategoryResponse)
            .collect(Collectors.toList());
    }

    public List<CarResponse> getLatestCars() {
        List<Car> cars = carRepository.findTop5ByOrderByIdDesc();
        return cars.stream()
            .map(this::toCarResponseWithStats)
            .collect(Collectors.toList());
    }

    public List<ReviewResponse> getCarReviews(String carId) {
        Car car = carRepository.findById(carId)
            .orElseThrow(() -> new ResourceNotFoundException("Car not found with id: " + carId));
        
        List<Review> reviews = reviewRepository.findByCar(car);
        return reviews.stream()
            .map(this::toReviewResponse)
            .collect(Collectors.toList());
    }

    public ApiResponse<ReviewResponse> addReview(String userId, @Valid ReviewRequest reviewRequest) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        Car car = carRepository.findById(reviewRequest.getCarId())
            .orElseThrow(() -> new ResourceNotFoundException("Car not found with id: " + reviewRequest.getCarId()));
        
        Review review = new Review();
        review.setUser(user);
        review.setCar(car);
        review.setRating(reviewRequest.getRating());
        review.setContent(reviewRequest.getComment());
        review.setCreatedAt(LocalDateTime.now());
        
        Review savedReview = reviewRepository.save(review);
        
        return ApiResponse.<ReviewResponse>builder()
            .success(true)
            .message("Đánh giá đã được thêm thành công")
            .data(toReviewResponse(savedReview))
            .timestamp(LocalDateTime.now())
            .build();
    }

    // Admin methods
    public ApiResponse<CarResponse> createCar(@Valid CarRequest carRequest) {
        Category category = categoryRepository.findById(carRequest.getCategoryId())
            .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + carRequest.getCategoryId()));
        
        Car car = new Car();
        car.setName(carRequest.getName());
        car.setPrice(carRequest.getPrice());
        car.setManufactureYear(carRequest.getManufactureYear());
        car.setColor(carRequest.getColor());
        car.setEngine(carRequest.getEngine());
        car.setTransmission(carRequest.getTransmission());
        car.setSeats(carRequest.getSeats());
        car.setDescription(carRequest.getDescription());
        car.setImages(carRequest.getImages());
        car.setCategory(category);
        
        Car savedCar = carRepository.save(car);
        
        return ApiResponse.<CarResponse>builder()
            .success(true)
            .message("Xe đã được tạo thành công")
            .data(toCarResponseWithStats(savedCar))
            .timestamp(LocalDateTime.now())
            .build();
    }

    public ApiResponse<CarResponse> updateCar(String id, @Valid CarRequest carRequest) {
        Car car = carRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Car not found with id: " + id));
        
        Category category = categoryRepository.findById(carRequest.getCategoryId())
            .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + carRequest.getCategoryId()));
        
        car.setName(carRequest.getName());
        car.setPrice(carRequest.getPrice());
        car.setManufactureYear(carRequest.getManufactureYear());
        car.setColor(carRequest.getColor());
        car.setEngine(carRequest.getEngine());
        car.setTransmission(carRequest.getTransmission());
        car.setSeats(carRequest.getSeats());
        car.setDescription(carRequest.getDescription());
        car.setImages(carRequest.getImages());
        car.setCategory(category);
        
        Car updatedCar = carRepository.save(car);
        
        return ApiResponse.<CarResponse>builder()
            .success(true)
            .message("Xe đã được cập nhật thành công")
            .data(toCarResponseWithStats(updatedCar))
            .timestamp(LocalDateTime.now())
            .build();
    }

    public ApiResponse<String> deleteCar(String id) {
        Car car = carRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Car not found with id: " + id));
        
        carRepository.delete(car);
        
        return ApiResponse.<String>builder()
            .success(true)
            .message("Xe đã được xóa thành công")
            .data("Car deleted successfully")
            .timestamp(LocalDateTime.now())
            .build();
    }

    private CarResponse toCarResponseWithStats(Car car) {
        CarResponse response = carMapper.toCarResponse(car);
        
        // Calculate average rating and review count
        List<Review> reviews = reviewRepository.findByCar(car);
        if (!reviews.isEmpty()) {
            double averageRating = reviews.stream()
                .mapToInt(Review::getRating)
                .average()
                .orElse(0.0);
            response.setAverageRating(Math.round(averageRating * 10.0) / 10.0);
            response.setReviewCount(reviews.size());
        } else {
            response.setAverageRating(0.0);
            response.setReviewCount(0);
        }
        
        return response;
    }

    private CategoryResponse toCategoryResponse(Category category) {
        CategoryResponse response = new CategoryResponse();
        response.setId(category.getId());
        response.setName(category.getName());
        response.setDescription(category.getDescription());
        response.setImage(category.getImage());
        return response;
    }

    private ReviewResponse toReviewResponse(Review review) {
        ReviewResponse response = new ReviewResponse();
        response.setId(review.getId());
        response.setUserId(review.getUser().getId());
        response.setUserName(review.getUser().getFullName());
        response.setCarId(review.getCar().getId());
        response.setRating(review.getRating());
        response.setContent(review.getContent());
        response.setCreatedAt(review.getCreatedAt());
        return response;
    }
}