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
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
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

    @Autowired
    private MongoTemplate mongoTemplate;

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

    public Page<CarResponse> searchCarsAdvanced(String keyword, String categoryId,
                                              BigDecimal minPrice, BigDecimal maxPrice,
                                              Integer year, String color, String engine,
                                              String transmission, Integer seats, Pageable pageable) {
        
        List<Criteria> criteriaList = new ArrayList<>();
        
        // Keyword search (name or description)
        if (keyword != null && !keyword.trim().isEmpty()) {
            Criteria keywordCriteria = new Criteria().orOperator(
                Criteria.where("name").regex(keyword, "i"),
                Criteria.where("description").regex(keyword, "i")
            );
            criteriaList.add(keywordCriteria);
        }
        
        // Category filter
        if (categoryId != null && !categoryId.trim().isEmpty()) {
            criteriaList.add(Criteria.where("category.id").is(categoryId));
        }
        
        // Price range filter
        if (minPrice != null || maxPrice != null) {
            Criteria priceCriteria = Criteria.where("price");
            if (minPrice != null) {
                priceCriteria = priceCriteria.gte(minPrice);
            }
            if (maxPrice != null) {
                priceCriteria = priceCriteria.lte(maxPrice);
            }
            criteriaList.add(priceCriteria);
        }
        
        // Year filter
        if (year != null) {
            criteriaList.add(Criteria.where("manufactureYear").is(year));
        }
        
        // Color filter
        if (color != null && !color.trim().isEmpty()) {
            criteriaList.add(Criteria.where("color").regex(color, "i"));
        }
        
        // Engine filter
        if (engine != null && !engine.trim().isEmpty()) {
            criteriaList.add(Criteria.where("engine").regex(engine, "i"));
        }
        
        // Transmission filter
        if (transmission != null && !transmission.trim().isEmpty()) {
            criteriaList.add(Criteria.where("transmission").regex(transmission, "i"));
        }
        
        // Seats filter
        if (seats != null) {
            criteriaList.add(Criteria.where("seats").is(seats));
        }
        
        // Build final query
        Query query = new Query();
        if (!criteriaList.isEmpty()) {
            query.addCriteria(new Criteria().andOperator(criteriaList.toArray(new Criteria[0])));
        }
        
        // Add pagination and sorting
        query.with(pageable);
        
        // Execute query
        List<Car> cars = mongoTemplate.find(query, Car.class);
        long total = mongoTemplate.count(query.skip(0).limit(0), Car.class);
        
        // Convert to response
        List<CarResponse> carResponses = cars.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        
        return new PageImpl<>(carResponses, pageable, total);
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
