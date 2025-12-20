package org.example.service;

import org.example.dto.response.AdminCarResponse;
import org.example.dto.response.AdminOrderResponse;
import org.example.dto.response.AdminUserResponse;
import org.example.entity.Car;
import org.example.entity.Order;
import org.example.entity.User;
import org.example.repository.CarRepository;
import org.example.repository.OrderRepository;
import org.example.repository.ReviewRepository;
import org.example.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationResults;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AdminService {

    @Autowired
    private MongoTemplate mongoTemplate;
    
    @Autowired
    private CarRepository carRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private ReviewRepository reviewRepository;

    // ==================== CARS MANAGEMENT ====================
    
    public Page<AdminCarResponse> getAdminCars(String keyword, String categoryId, 
                                              BigDecimal minPrice, BigDecimal maxPrice,
                                              Integer year, String color, String engine,
                                              String transmission, Integer seats, String status,
                                              Pageable pageable) {
        
        List<Criteria> criteriaList = new ArrayList<>();
        
        // Keyword search
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
        
        // Price range
        if (minPrice != null || maxPrice != null) {
            Criteria priceCriteria = Criteria.where("price");
            if (minPrice != null) priceCriteria = priceCriteria.gte(minPrice);
            if (maxPrice != null) priceCriteria = priceCriteria.lte(maxPrice);
            criteriaList.add(priceCriteria);
        }
        
        // Other filters
        if (year != null) criteriaList.add(Criteria.where("manufactureYear").is(year));
        if (color != null && !color.trim().isEmpty()) criteriaList.add(Criteria.where("color").regex(color, "i"));
        if (engine != null && !engine.trim().isEmpty()) criteriaList.add(Criteria.where("engine").regex(engine, "i"));
        if (transmission != null && !transmission.trim().isEmpty()) criteriaList.add(Criteria.where("transmission").regex(transmission, "i"));
        if (seats != null) criteriaList.add(Criteria.where("seats").is(seats));
        
        // Build query
        Query query = new Query();
        if (!criteriaList.isEmpty()) {
            query.addCriteria(new Criteria().andOperator(criteriaList.toArray(new Criteria[0])));
        }
        
        query.with(pageable);
        
        // Execute query
        List<Car> cars = mongoTemplate.find(query, Car.class);
        long total = mongoTemplate.count(query.skip(0).limit(0), Car.class);
        
        // Convert to AdminCarResponse with additional data
        List<AdminCarResponse> adminCars = cars.stream()
                .map(this::mapToAdminCarResponse)
                .collect(Collectors.toList());
        
        return new PageImpl<>(adminCars, pageable, total);
    }
    
    public AdminCarResponse getAdminCarById(String id) {
        Car car = carRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Car not found"));
        return mapToAdminCarResponse(car);
    }
    
    private AdminCarResponse mapToAdminCarResponse(Car car) {
        // Calculate rating
        Double avgRating = calculateAverageRating(car.getId());
        Integer reviewCount = getReviewCount(car.getId());
        Integer totalOrders = getTotalOrdersForCar(car.getId());
        
        return AdminCarResponse.builder()
                .id(car.getId())
                .name(car.getName())
                .categoryId(car.getCategory().getId())
                .categoryName(car.getCategory().getName())
                .price(car.getPrice())
                .manufactureYear(car.getManufactureYear())
                .color(car.getColor())
                .engine(car.getEngine())
                .transmission(car.getTransmission())
                .seats(car.getSeats())
                .image(car.getImage())
                .description(car.getDescription())
                .averageRating(avgRating)
                .reviewCount(reviewCount)
                .totalOrders(totalOrders)
                .status("ACTIVE") // Default status
                .build();
    }

    // ==================== USERS MANAGEMENT ====================
    
    public Page<AdminUserResponse> getAdminUsers(String keyword, String role, String status,
                                                String fromDate, String toDate, Pageable pageable) {
        
        List<Criteria> criteriaList = new ArrayList<>();
        
        // Keyword search
        if (keyword != null && !keyword.trim().isEmpty()) {
            Criteria keywordCriteria = new Criteria().orOperator(
                Criteria.where("fullName").regex(keyword, "i"),
                Criteria.where("email").regex(keyword, "i"),
                Criteria.where("phoneNumber").regex(keyword, "i")
            );
            criteriaList.add(keywordCriteria);
        }
        
        // Role filter
        if (role != null && !role.trim().isEmpty()) {
            User.Role userRole = User.Role.valueOf(role);
            criteriaList.add(Criteria.where("role").is(userRole));
        }
        
        // Date range
        if (fromDate != null && !fromDate.trim().isEmpty()) {
            LocalDate from = LocalDate.parse(fromDate, DateTimeFormatter.ISO_LOCAL_DATE);
            criteriaList.add(Criteria.where("createdAt").gte(from.atStartOfDay()));
        }
        
        if (toDate != null && !toDate.trim().isEmpty()) {
            LocalDate to = LocalDate.parse(toDate, DateTimeFormatter.ISO_LOCAL_DATE);
            criteriaList.add(Criteria.where("createdAt").lte(to.atTime(23, 59, 59)));
        }
        
        // Build query
        Query query = new Query();
        if (!criteriaList.isEmpty()) {
            query.addCriteria(new Criteria().andOperator(criteriaList.toArray(new Criteria[0])));
        }
        
        query.with(pageable);
        
        // Execute query
        List<User> users = mongoTemplate.find(query, User.class);
        long total = mongoTemplate.count(query.skip(0).limit(0), User.class);
        
        // Convert to AdminUserResponse
        List<AdminUserResponse> adminUsers = users.stream()
                .map(this::mapToAdminUserResponse)
                .collect(Collectors.toList());
        
        return new PageImpl<>(adminUsers, pageable, total);
    }
    
    public AdminUserResponse getAdminUserById(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return mapToAdminUserResponse(user);
    }
    
    private AdminUserResponse mapToAdminUserResponse(User user) {
        Integer totalOrders = getTotalOrdersForUser(user.getId());
        Integer totalReviews = getTotalReviewsForUser(user.getId());
        
        return AdminUserResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .address(user.getAddress())
                .role(user.getRole())
                .createdAt(user.getCreatedAt())
                .totalOrders(totalOrders)
                .totalReviews(totalReviews)
                .status("ACTIVE") // Default status
                .isEmailVerified(true) // Default
                .build();
    }

    // ==================== ORDERS MANAGEMENT ====================
    
    public Page<AdminOrderResponse> getAdminOrders(String keyword, String status, String fromDate, 
                                                  String toDate, Double minAmount, Double maxAmount,
                                                  String paymentMethod, Pageable pageable) {
        
        List<Criteria> criteriaList = new ArrayList<>();
        
        // Keyword search
        if (keyword != null && !keyword.trim().isEmpty()) {
            Criteria keywordCriteria = new Criteria().orOperator(
                Criteria.where("user.fullName").regex(keyword, "i"),
                Criteria.where("user.email").regex(keyword, "i"),
                Criteria.where("deliveryAddress").regex(keyword, "i")
            );
            criteriaList.add(keywordCriteria);
        }
        
        // Status filter
        if (status != null && !status.trim().isEmpty()) {
            Order.OrderStatus orderStatus = Order.OrderStatus.valueOf(status);
            criteriaList.add(Criteria.where("status").is(orderStatus));
        }
        
        // Date range
        if (fromDate != null && !fromDate.trim().isEmpty()) {
            LocalDate from = LocalDate.parse(fromDate, DateTimeFormatter.ISO_LOCAL_DATE);
            criteriaList.add(Criteria.where("orderDate").gte(from.atStartOfDay()));
        }
        
        if (toDate != null && !toDate.trim().isEmpty()) {
            LocalDate to = LocalDate.parse(toDate, DateTimeFormatter.ISO_LOCAL_DATE);
            criteriaList.add(Criteria.where("orderDate").lte(to.atTime(23, 59, 59)));
        }
        
        // Amount range
        if (minAmount != null) {
            criteriaList.add(Criteria.where("totalAmount").gte(BigDecimal.valueOf(minAmount)));
        }
        if (maxAmount != null) {
            criteriaList.add(Criteria.where("totalAmount").lte(BigDecimal.valueOf(maxAmount)));
        }
        
        // Build query
        Query query = new Query();
        if (!criteriaList.isEmpty()) {
            query.addCriteria(new Criteria().andOperator(criteriaList.toArray(new Criteria[0])));
        }
        
        query.with(pageable);
        
        // Execute query
        List<Order> orders = mongoTemplate.find(query, Order.class);
        long total = mongoTemplate.count(query.skip(0).limit(0), Order.class);
        
        // Convert to AdminOrderResponse
        List<AdminOrderResponse> adminOrders = orders.stream()
                .map(this::mapToAdminOrderResponse)
                .collect(Collectors.toList());
        
        return new PageImpl<>(adminOrders, pageable, total);
    }
    
    public AdminOrderResponse getAdminOrderById(String id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        return mapToAdminOrderResponse(order);
    }
    
    private AdminOrderResponse mapToAdminOrderResponse(Order order) {
        Integer totalItems = getTotalItemsInOrder(order.getId());
        Integer daysSinceOrder = (int) ChronoUnit.DAYS.between(order.getOrderDate().toLocalDate(), LocalDate.now());
        
        return AdminOrderResponse.builder()
                .id(order.getId())
                .userId(order.getUser().getId())
                .userName(order.getUser().getFullName())
                .userEmail(order.getUser().getEmail())
                .userPhone(order.getUser().getPhoneNumber())
                .orderDate(order.getOrderDate())
                .totalAmount(order.getTotalAmount())
                .status(order.getStatus())
                .deliveryAddress(order.getDeliveryAddress())
                .totalItems(totalItems)
                .daysSinceOrder(daysSinceOrder)
                .paymentMethod("COD") // Default
                .build();
    }

    // ==================== DASHBOARD STATS ====================
    
    public Object getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        
        // Basic counts
        stats.put("totalCars", carRepository.count());
        stats.put("totalUsers", userRepository.count());
        stats.put("totalOrders", orderRepository.count());
        
        // Today's stats
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().atTime(23, 59, 59);
        
        Query todayOrdersQuery = new Query(
            Criteria.where("orderDate").gte(startOfDay).lte(endOfDay)
        );
        stats.put("todayOrders", mongoTemplate.count(todayOrdersQuery, Order.class));
        
        // Revenue stats
        stats.put("totalRevenue", calculateTotalRevenue());
        stats.put("todayRevenue", calculateTodayRevenue());
        
        // Status distribution
        stats.put("orderStatusDistribution", getOrderStatusDistribution());
        
        return stats;
    }
    
    public Object getRecentActivities(int limit) {
        // Get recent orders
        Query recentOrdersQuery = new Query()
                .with(org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "orderDate"))
                .limit(limit);
        
        List<Order> recentOrders = mongoTemplate.find(recentOrdersQuery, Order.class);
        
        return recentOrders.stream()
                .map(order -> Map.of(
                    "type", "ORDER",
                    "id", order.getId(),
                    "description", "Đơn hàng mới từ " + order.getUser().getFullName(),
                    "amount", order.getTotalAmount(),
                    "timestamp", order.getOrderDate()
                ))
                .collect(Collectors.toList());
    }

    // ==================== HELPER METHODS ====================
    
    private Double calculateAverageRating(String carId) {
        // Implementation for calculating average rating
        return 4.5; // Placeholder
    }
    
    private Integer getReviewCount(String carId) {
        // Implementation for getting review count
        return 10; // Placeholder
    }
    
    private Integer getTotalOrdersForCar(String carId) {
        // Implementation for getting total orders for car
        return 5; // Placeholder
    }
    
    private Integer getTotalOrdersForUser(String userId) {
        Query query = new Query(Criteria.where("user.id").is(userId));
        return (int) mongoTemplate.count(query, Order.class);
    }
    
    private Integer getTotalReviewsForUser(String userId) {
        // Implementation for getting total reviews for user
        return 3; // Placeholder
    }
    
    private Integer getTotalItemsInOrder(String orderId) {
        // Implementation for getting total items in order
        return 2; // Placeholder
    }
    
    private BigDecimal calculateTotalRevenue() {
        // Implementation for calculating total revenue
        return new BigDecimal("1000000"); // Placeholder
    }
    
    private BigDecimal calculateTodayRevenue() {
        // Implementation for calculating today's revenue
        return new BigDecimal("50000"); // Placeholder
    }
    
    private Map<String, Long> getOrderStatusDistribution() {
        Map<String, Long> distribution = new HashMap<>();
        for (Order.OrderStatus status : Order.OrderStatus.values()) {
            Query query = new Query(Criteria.where("status").is(status));
            long count = mongoTemplate.count(query, Order.class);
            distribution.put(status.name(), count);
        }
        return distribution;
    }
}