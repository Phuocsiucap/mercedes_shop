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
import java.util.ArrayList;

import org.springframework.data.domain.PageImpl;

import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;

@Service
public class CarService {

    @Autowired
    private MongoTemplate mongoTemplate;

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
        Query query = new Query().with(pageable);
        List<Criteria> criteriaList = new ArrayList<>();

        if (keyword != null && !keyword.isEmpty()) {
            criteriaList.add(Criteria.where("name").regex(keyword, "i"));
        }
        if (categoryId != null && !categoryId.isEmpty()) {
            criteriaList.add(Criteria.where("category.id").is(categoryId));
        }
        if (year != null) {
            criteriaList.add(Criteria.where("manufactureYear").is(year));
        }
        if (color != null && !color.isEmpty()) {
            criteriaList.add(Criteria.where("color").is(color));
        }

        // Khoảng giá
        if (minPrice != null || maxPrice != null) {
            Criteria priceCriteria = Criteria.where("price");
            if (minPrice != null) priceCriteria.gte(minPrice);
            if (maxPrice != null) priceCriteria.lte(maxPrice);
            criteriaList.add(priceCriteria);
        }

        if (!criteriaList.isEmpty()) {
            query.addCriteria(new Criteria().andOperator(criteriaList.toArray(new Criteria[0])));
        }

        List<Car> cars = mongoTemplate.find(query, Car.class);
        long total = mongoTemplate.count(query.skip(-1).limit(-1), Car.class);

        return new PageImpl<>(cars, pageable, total).map(this::mapToResponse);
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
        car.setImages(request.getImages());
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
        car.setImages(request.getImages());
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
                .images(car.getImages())
                .category(categoryResponse)
                .averageRating(averageRating)
                .reviewCount(reviews.size())
                .build();
    }
}
