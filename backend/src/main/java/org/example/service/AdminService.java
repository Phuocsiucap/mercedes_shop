package org.example.service;

import org.example.dto.request.AdminFilterRequest;
import org.example.dto.request.CategoryRequest;
import org.example.dto.response.*;
import org.example.entity.*;
import org.example.exception.BadRequestException;
import org.example.exception.ResourceNotFoundException;
import org.example.repository.*;
import org.example.mapper.CarMapper;
import org.example.mapper.OrderMapper;
import org.example.mapper.UserMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional
public class AdminService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CarRepository carRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private OrderDetailRepository orderDetailRepository;

    @Autowired
    private CarMapper carMapper;

    @Autowired
    private OrderMapper orderMapper;

    @Autowired
    private UserMapper userMapper;

    // Dashboard methods
    public DashboardStatsResponse getDashboardStats() {
        // Basic counts
        long totalUsers = userRepository.count();
        long totalCars = carRepository.count();
        long totalOrders = orderRepository.count();

        // Calculate revenue
        List<Order> allOrders = orderRepository.findAll();
        BigDecimal totalRevenue = allOrders.stream()
            .map(Order::getTotalAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Today's statistics
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = startOfDay.plusDays(1);
        
        // For simplicity, using basic queries. In production, you'd use more efficient aggregation queries
        List<Order> todayOrders = allOrders.stream()
            .filter(order -> order.getOrderDate().isAfter(startOfDay) && order.getOrderDate().isBefore(endOfDay))
            .collect(Collectors.toList());

        long todayOrderCount = todayOrders.size();
        BigDecimal todayRevenue = todayOrders.stream()
            .map(Order::getTotalAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Calculate average order value
        BigDecimal averageOrderValue = totalOrders > 0 ? 
            totalRevenue.divide(BigDecimal.valueOf(totalOrders), 2, BigDecimal.ROUND_HALF_UP) : 
            BigDecimal.ZERO;

        // Order status distribution
        Map<String, Long> orderStatusDistribution = allOrders.stream()
            .collect(Collectors.groupingBy(
                order -> order.getStatus().toString(),
                Collectors.counting()
            ));

        // Recent orders (last 10)
        List<DashboardStatsResponse.RecentOrderDto> recentOrders = allOrders.stream()
            .sorted((o1, o2) -> o2.getOrderDate().compareTo(o1.getOrderDate()))
            .limit(10)
            .map(order -> {
                List<OrderDetail> details = orderDetailRepository.findByOrder(order);
                List<DashboardStatsResponse.OrderDetailDto> orderDetailDtos = details.stream()
                    .map(detail -> DashboardStatsResponse.OrderDetailDto.builder()
                        .carId(detail.getCar() != null ? detail.getCar().getId() : null)
                        .carName(detail.getCar() != null ? detail.getCar().getName() : "N/A")
                        .carImage(detail.getCar() != null && detail.getCar().getImages() != null && !detail.getCar().getImages().isEmpty() 
                            ? detail.getCar().getImages().get(0) : null)
                        .quantity(detail.getQuantity())
                        .unitPrice(detail.getUnitPrice())
                        .subtotal(detail.getUnitPrice() != null && detail.getQuantity() != null 
                            ? detail.getUnitPrice().multiply(BigDecimal.valueOf(detail.getQuantity())) : BigDecimal.ZERO)
                        .build())
                    .collect(Collectors.toList());
                
                return DashboardStatsResponse.RecentOrderDto.builder()
                    .id(order.getId())
                    .userName(order.getUser().getFullName())
                    .userEmail(order.getUser().getEmail())
                    .orderDate(order.getOrderDate())
                    .totalAmount(order.getTotalAmount())
                    .status(order.getStatus().toString())
                    .totalItems(details.size())
                    .deliveryAddress(order.getDeliveryAddress())
                    .orderDetails(orderDetailDtos)
                    .build();
            })
            .collect(Collectors.toList());

        return DashboardStatsResponse.builder()
            .totalUsers(totalUsers)
            .totalCars(totalCars)
            .totalOrders(totalOrders)
            .totalRevenue(totalRevenue)
            .todayRevenue(todayRevenue)
            .todayOrders(todayOrderCount)
            .averageOrderValue(averageOrderValue)
            .orderStatusDistribution(orderStatusDistribution)
            .recentOrders(recentOrders)
            .build();
    }

    // User management methods
    public Page<AdminUserResponse> getAllUsers(AdminFilterRequest filterRequest) {
        Sort sort = filterRequest.getSortDir().equalsIgnoreCase("desc") ? 
            Sort.by(filterRequest.getSortBy()).descending() : 
            Sort.by(filterRequest.getSortBy()).ascending();
        
        Pageable pageable = PageRequest.of(filterRequest.getPage(), filterRequest.getSize(), sort);
        Page<User> users = userRepository.findAll(pageable);
        
        return users.map(this::toAdminUserResponse);
    }

    public AdminUserResponse getUserById(String userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        return toAdminUserResponse(user);
    }

    public ApiResponse<String> updateUserRole(String userId, User.Role newRole) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        user.setRole(newRole);
        userRepository.save(user);
        
        return ApiResponse.<String>builder()
            .success(true)
            .message("Cập nhật quyền người dùng thành công")
            .data("User role updated successfully")
            .timestamp(LocalDateTime.now())
            .build();
    }

    public ApiResponse<String> deleteUser(String userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        // Check if user has orders
        List<Order> userOrders = orderRepository.findByUser(user);
        if (!userOrders.isEmpty()) {
            throw new BadRequestException("Không thể xóa người dùng có đơn hàng");
        }
        
        userRepository.delete(user);
        
        return ApiResponse.<String>builder()
            .success(true)
            .message("Xóa người dùng thành công")
            .data("User deleted successfully")
            .timestamp(LocalDateTime.now())
            .build();
    }

    // Car management methods (delegating to CarService for CRUD operations)
    public Page<AdminCarResponse> getAllCarsForAdmin(AdminFilterRequest filterRequest) {
        Sort sort = filterRequest.getSortDir().equalsIgnoreCase("desc") ? 
            Sort.by(filterRequest.getSortBy()).descending() : 
            Sort.by(filterRequest.getSortBy()).ascending();
        
        Pageable pageable = PageRequest.of(filterRequest.getPage(), filterRequest.getSize(), sort);
        Page<Car> cars = carRepository.findAll(pageable);
        
        return cars.map(this::toAdminCarResponse);
    }

    // Order management methods
    public Page<AdminOrderResponse> getAllOrders(AdminFilterRequest filterRequest) {
        Sort sort = filterRequest.getSortDir().equalsIgnoreCase("desc") ? 
            Sort.by(filterRequest.getSortBy()).descending() : 
            Sort.by(filterRequest.getSortBy()).ascending();
        
        Pageable pageable = PageRequest.of(filterRequest.getPage(), filterRequest.getSize(), sort);
        Page<Order> orders = orderRepository.findAll(pageable);
        
        return orders.map(this::toAdminOrderResponse);
    }

    public AdminOrderResponse getOrderById(String orderId) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));
        
        return toAdminOrderResponse(order);
    }

    public ApiResponse<AdminOrderResponse> updateOrderStatus(String orderId, Order.OrderStatus newStatus) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));
        
        order.setStatus(newStatus);
        Order updatedOrder = orderRepository.save(order);
        
        return ApiResponse.<AdminOrderResponse>builder()
            .success(true)
            .message("Cập nhật trạng thái đơn hàng thành công")
            .data(toAdminOrderResponse(updatedOrder))
            .timestamp(LocalDateTime.now())
            .build();
    }

    // Category management methods
    public List<CategoryResponse> getAllCategories() {
        List<Category> categories = categoryRepository.findAll();
        return categories.stream()
            .map(this::toCategoryResponse)
            .collect(Collectors.toList());
    }

    public ApiResponse<CategoryResponse> createCategory(@Valid CategoryRequest categoryRequest) {
        if (categoryRepository.existsByName(categoryRequest.getName())) {
            throw new BadRequestException("Danh mục với tên này đã tồn tại");
        }
        
        Category category = new Category();
        category.setName(categoryRequest.getName());
        category.setDescription(categoryRequest.getDescription());
        category.setImage(categoryRequest.getImage());
        
        Category savedCategory = categoryRepository.save(category);
        
        return ApiResponse.<CategoryResponse>builder()
            .success(true)
            .message("Tạo danh mục thành công")
            .data(toCategoryResponse(savedCategory))
            .timestamp(LocalDateTime.now())
            .build();
    }

    public ApiResponse<CategoryResponse> updateCategory(String categoryId, @Valid CategoryRequest categoryRequest) {
        Category category = categoryRepository.findById(categoryId)
            .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + categoryId));
        
        // Check if name is already taken by another category
        if (categoryRepository.existsByName(categoryRequest.getName()) && 
            !categoryRequest.getName().equals(category.getName())) {
            throw new BadRequestException("Danh mục với tên này đã tồn tại");
        }
        
        category.setName(categoryRequest.getName());
        category.setDescription(categoryRequest.getDescription());
        category.setImage(categoryRequest.getImage());
        
        Category updatedCategory = categoryRepository.save(category);
        
        return ApiResponse.<CategoryResponse>builder()
            .success(true)
            .message("Cập nhật danh mục thành công")
            .data(toCategoryResponse(updatedCategory))
            .timestamp(LocalDateTime.now())
            .build();
    }

    public ApiResponse<String> deleteCategory(String categoryId) {
        Category category = categoryRepository.findById(categoryId)
            .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + categoryId));
        
        // Check if category has cars
        List<Car> carsInCategory = carRepository.findByCategory(category, Pageable.unpaged()).getContent();
        if (!carsInCategory.isEmpty()) {
            throw new BadRequestException("Không thể xóa danh mục có chứa xe");
        }
        
        categoryRepository.delete(category);
        
        return ApiResponse.<String>builder()
            .success(true)
            .message("Xóa danh mục thành công")
            .data("Category deleted successfully")
            .timestamp(LocalDateTime.now())
            .build();
    }

    // Reports methods
    public ReportResponse.SalesReport getSalesReport(LocalDate fromDate, LocalDate toDate, String groupBy) {
        // Sử dụng query trực tiếp thay vì load tất cả rồi filter
        LocalDateTime fromDateTime = fromDate.atStartOfDay();
        LocalDateTime toDateTime = toDate.atTime(23, 59, 59);
        
        List<Order> orders = orderRepository.findByOrderDateBetween(fromDateTime, toDateTime);

        BigDecimal totalRevenue = orders.stream()
            .filter(order -> order.getTotalAmount() != null)
            .map(Order::getTotalAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        int totalOrders = orders.size();
        
        // Lấy order details cho các orders - sử dụng batch query
        Set<String> orderIdSet = orders.stream()
            .filter(order -> order.getId() != null)
            .map(Order::getId)
            .collect(Collectors.toSet());
        
        // Lấy tất cả order details một lần, sau đó filter trong memory (nhanh hơn nhiều query)
        List<OrderDetail> allOrderDetails;
        if (orderIdSet.isEmpty()) {
            allOrderDetails = List.of();
        } else {
            // Batch fetch - chỉ 1 query thay vì N queries
            allOrderDetails = orderDetailRepository.findAll().stream()
                .filter(detail -> detail.getOrder() != null && 
                        detail.getOrder().getId() != null && 
                        orderIdSet.contains(detail.getOrder().getId()))
                .collect(Collectors.toList());
        }
        
        int totalItems = allOrderDetails.size();

        // Generate sales data points by period
        List<ReportResponse.SalesDataPoint> salesData = generateSalesDataPoints(orders, allOrderDetails, fromDate, toDate, groupBy);
        
        // Generate top selling cars
        List<ReportResponse.TopSellingCar> topSellingCars = generateTopSellingCars(allOrderDetails);
        
        // Generate order status stats
        List<ReportResponse.OrderStatusStat> orderStatusStats = generateOrderStatusStats(orders);

        return ReportResponse.SalesReport.builder()
            .fromDate(fromDate)
            .toDate(toDate)
            .groupBy(groupBy)
            .totalRevenue(totalRevenue)
            .totalOrders(totalOrders)
            .totalItems(totalItems)
            .salesData(salesData)
            .topSellingCars(topSellingCars)
            .orderStatusStats(orderStatusStats)
            .build();
    }
    
    private List<ReportResponse.OrderStatusStat> generateOrderStatusStats(List<Order> orders) {
        Map<String, String> statusDisplayNames = Map.of(
            "PENDING", "Chờ xác nhận",
            "CONFIRMED", "Đã xác nhận", 
            "PROCESSING", "Đang xử lý",
            "SHIPPED", "Đang giao",
            "DELIVERED", "Hoàn thành",
            "CANCELLED", "Đã hủy"
        );
        
        Map<String, Long> statusCounts = orders.stream()
            .filter(order -> order.getStatus() != null)
            .collect(Collectors.groupingBy(
                order -> order.getStatus().toString(),
                Collectors.counting()
            ));
        
        return statusCounts.entrySet().stream()
            .map(entry -> ReportResponse.OrderStatusStat.builder()
                .status(entry.getKey())
                .displayName(statusDisplayNames.getOrDefault(entry.getKey(), entry.getKey()))
                .count(entry.getValue().intValue())
                .build())
            .collect(Collectors.toList());
    }

    private List<ReportResponse.SalesDataPoint> generateSalesDataPoints(List<Order> orders, List<OrderDetail> allOrderDetails, LocalDate fromDate, LocalDate toDate, String groupBy) {
        Map<String, List<Order>> groupedOrders;
        
        if ("month".equalsIgnoreCase(groupBy)) {
            groupedOrders = orders.stream()
                .filter(order -> order.getOrderDate() != null) // Filter null dates
                .collect(Collectors.groupingBy(order -> 
                    order.getOrderDate().getYear() + "-" + 
                    String.format("%02d", order.getOrderDate().getMonthValue())
                ));
        } else if ("week".equalsIgnoreCase(groupBy)) {
            groupedOrders = orders.stream()
                .filter(order -> order.getOrderDate() != null) // Filter null dates
                .collect(Collectors.groupingBy(order -> {
                    LocalDate orderDate = order.getOrderDate().toLocalDate();
                    LocalDate startOfWeek = orderDate.minusDays(orderDate.getDayOfWeek().getValue() - 1);
                    return startOfWeek.toString();
                }));
        } else { // day
            groupedOrders = orders.stream()
                .filter(order -> order.getOrderDate() != null) // Filter null dates
                .collect(Collectors.groupingBy(order -> 
                    order.getOrderDate().toLocalDate().toString()
                ));
        }

        return groupedOrders.entrySet().stream()
            .filter(entry -> entry.getKey() != null) // Filter null keys
            .map(entry -> {
                String period = entry.getKey();
                List<Order> periodOrders = entry.getValue();
                
                BigDecimal periodRevenue = periodOrders.stream()
                    .filter(order -> order.getTotalAmount() != null) // Filter null amounts
                    .map(Order::getTotalAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
                
                int periodOrderCount = periodOrders.size();
                
                // Count items for this period's orders
                Set<String> periodOrderIds = periodOrders.stream()
                    .filter(order -> order.getId() != null) // Filter null IDs
                    .map(Order::getId)
                    .collect(Collectors.toSet());
                
                int periodItemCount = (int) allOrderDetails.stream()
                    .filter(detail -> detail.getOrder() != null && detail.getOrder().getId() != null)
                    .filter(detail -> periodOrderIds.contains(detail.getOrder().getId()))
                    .count();

                return ReportResponse.SalesDataPoint.builder()
                    .period(period)
                    .revenue(periodRevenue)
                    .orders(periodOrderCount)
                    .items(periodItemCount)
                    .build();
            })
            .sorted((a, b) -> a.getPeriod().compareTo(b.getPeriod()))
            .collect(Collectors.toList());
    }

    private List<ReportResponse.TopSellingCar> generateTopSellingCars(List<OrderDetail> allOrderDetails) {
        // Group order details by car, filtering out null cars
        Map<Car, List<OrderDetail>> carOrderDetails = allOrderDetails.stream()
            .filter(detail -> detail.getCar() != null) // Filter null cars
            .collect(Collectors.groupingBy(OrderDetail::getCar));

        return carOrderDetails.entrySet().stream()
            .filter(entry -> entry.getKey() != null) // Filter null car keys
            .map(entry -> {
                Car car = entry.getKey();
                List<OrderDetail> details = entry.getValue();
                
                int totalSold = details.stream()
                    .mapToInt(detail -> detail.getQuantity() != null ? detail.getQuantity() : 0)
                    .sum();
                
                BigDecimal totalRevenue = details.stream()
                    .filter(detail -> detail.getUnitPrice() != null && detail.getQuantity() != null)
                    .map(detail -> detail.getUnitPrice().multiply(BigDecimal.valueOf(detail.getQuantity())))
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

                return ReportResponse.TopSellingCar.builder()
                    .carId(car.getId())
                    .carName(car.getName() != null ? car.getName() : "Unknown")
                    .categoryName(car.getCategory() != null ? car.getCategory().getName() : "N/A")
                    .totalSold(totalSold)
                    .totalRevenue(totalRevenue)
                    .images(car.getImages() != null ? car.getImages() : List.of())
                    .build();
            })
            .filter(car -> car.getTotalSold() > 0) // Only include cars with sales
            .sorted((a, b) -> b.getTotalSold().compareTo(a.getTotalSold()))
            .limit(10) // Top 10 selling cars
            .collect(Collectors.toList());
    }

    public ReportResponse.InventoryReport getInventoryReport() {
        List<Car> allCars = carRepository.findAll();
        List<Category> allCategories = categoryRepository.findAll();
        
        int totalCars = allCars.size();
        int activeCars = (int) allCars.stream().filter(car -> true).count(); // Assuming all cars are active
        int inactiveCars = totalCars - activeCars;

        // Category inventory breakdown
        List<ReportResponse.CategoryInventory> categoryInventory = allCategories.stream()
            .map(category -> {
                List<Car> carsInCategory = allCars.stream()
                    .filter(car -> car.getCategory() != null && car.getCategory().getId().equals(category.getId()))
                    .collect(Collectors.toList());
                
                int categoryCarCount = carsInCategory.size();
                BigDecimal averagePrice = carsInCategory.isEmpty() ? BigDecimal.ZERO :
                    carsInCategory.stream()
                        .map(Car::getPrice)
                        .reduce(BigDecimal.ZERO, BigDecimal::add)
                        .divide(BigDecimal.valueOf(categoryCarCount), 2, BigDecimal.ROUND_HALF_UP);

                return ReportResponse.CategoryInventory.builder()
                    .categoryId(category.getId())
                    .categoryName(category.getName())
                    .totalCars(categoryCarCount)
                    .activeCars(categoryCarCount) // Assuming all are active
                    .averagePrice(averagePrice)
                    .build();
            })
            .collect(Collectors.toList());

        // Low stock alerts (simplified - assuming all cars have stock of 1)
        List<ReportResponse.LowStockAlert> lowStockAlerts = allCars.stream()
            .limit(5) // Show first 5 as examples
            .map(car -> ReportResponse.LowStockAlert.builder()
                .carId(car.getId())
                .carName(car.getName())
                .currentStock(1) // Simplified
                .minimumStock(2) // Simplified
                .build())
            .collect(Collectors.toList());

        return ReportResponse.InventoryReport.builder()
            .totalCars(totalCars)
            .activeCars(activeCars)
            .inactiveCars(inactiveCars)
            .categoryInventory(categoryInventory)
            .lowStockAlerts(lowStockAlerts)
            .build();
    }

    // Helper methods
    private AdminUserResponse toAdminUserResponse(User user) {
        // Sử dụng count thay vì load full list
        long totalOrders = orderRepository.countByUser(user);
        long totalReviews = reviewRepository.countByUser(user);
        
        return AdminUserResponse.builder()
            .id(user.getId())
            .fullName(user.getFullName())
            .email(user.getEmail())
            .phoneNumber(user.getPhoneNumber())
            .address(user.getAddress())
            .role(user.getRole())
            .createdAt(user.getCreatedAt())
            .totalOrders((int) totalOrders)
            .totalReviews((int) totalReviews)
            .status("ACTIVE") // Default status
            .isEmailVerified(user.getVerified() != null ? user.getVerified() : false)
            .build();
    }

    private AdminCarResponse toAdminCarResponse(Car car) {
        AdminCarResponse response = carMapper.toAdminCarResponse(car);
        
        // Sử dụng query trực tiếp thay vì findAll() rồi filter
        long totalOrders = orderDetailRepository.countByCar(car);
        List<Review> reviews = reviewRepository.findByCar(car);
        
        response.setTotalOrders((int) totalOrders);
        response.setCreatedAt(LocalDateTime.now()); // This should come from car entity if available
        response.setUpdatedAt(LocalDateTime.now()); // This should come from car entity if available
        
        if (!reviews.isEmpty()) {
            double averageRating = reviews.stream()
                .mapToInt(Review::getRating)
                .average()
                .orElse(0.0);
            response.setAverageRating(Math.round(averageRating * 10.0) / 10.0);
            response.setReviewCount(reviews.size());
        }
        
        return response;
    }

    private AdminOrderResponse toAdminOrderResponse(Order order) {
        List<OrderDetail> orderDetails = orderDetailRepository.findByOrder(order);
        
        List<AdminOrderResponse.OrderDetailDto> orderDetailDtos = orderDetails.stream()
            .map(detail -> AdminOrderResponse.OrderDetailDto.builder()
                .id(detail.getId())
                .carId(detail.getCar() != null ? detail.getCar().getId() : null)
                .carName(detail.getCar() != null ? detail.getCar().getName() : "N/A")
                .carImage(detail.getCar() != null && detail.getCar().getImages() != null && !detail.getCar().getImages().isEmpty() 
                    ? detail.getCar().getImages().get(0) : null)
                .quantity(detail.getQuantity())
                .unitPrice(detail.getUnitPrice())
                .subtotal(detail.getUnitPrice() != null && detail.getQuantity() != null 
                    ? detail.getUnitPrice().multiply(BigDecimal.valueOf(detail.getQuantity())) : BigDecimal.ZERO)
                .build())
            .collect(Collectors.toList());
        
        // Calculate days since order
        int daysSinceOrder = 0;
        if (order.getOrderDate() != null) {
            daysSinceOrder = (int) java.time.temporal.ChronoUnit.DAYS.between(
                order.getOrderDate().toLocalDate(), 
                LocalDate.now()
            );
        }
        
        return AdminOrderResponse.builder()
            .id(order.getId())
            .userId(order.getUser() != null ? order.getUser().getId() : null)
            .userName(order.getUser() != null ? order.getUser().getFullName() : "Unknown")
            .userEmail(order.getUser() != null ? order.getUser().getEmail() : "Unknown")
            .userPhone(order.getUser() != null ? order.getUser().getPhoneNumber() : null)
            .orderDate(order.getOrderDate())
            .totalAmount(order.getTotalAmount() != null ? order.getTotalAmount() : BigDecimal.ZERO)
            .status(order.getStatus())
            .deliveryAddress(order.getDeliveryAddress())
            .totalItems(orderDetails.size())
            .paymentMethod(order.getPaymentMethod())
            .orderDetails(orderDetailDtos)
            .daysSinceOrder(daysSinceOrder)
            .build();
    }

    private CategoryResponse toCategoryResponse(Category category) {
        return CategoryResponse.builder()
            .id(category.getId())
            .name(category.getName())
            .description(category.getDescription())
            .image(category.getImage())
            .build();
    }
}