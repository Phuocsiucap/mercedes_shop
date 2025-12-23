package org.example.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public class ReportResponse {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SalesReport {
        private LocalDate fromDate;
        private LocalDate toDate;
        private String groupBy;
        private BigDecimal totalRevenue;
        private Integer totalOrders;
        private Integer totalItems;
        private List<SalesDataPoint> salesData;
        private List<TopSellingCar> topSellingCars;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SalesDataPoint {
        private String period; // Date or Month
        private BigDecimal revenue;
        private Integer orders;
        private Integer items;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TopSellingCar {
        private String carId;
        private String carName;
        private String categoryName;
        private Integer totalSold;
        private BigDecimal totalRevenue;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class InventoryReport {
        private Integer totalCars;
        private Integer activeCars;
        private Integer inactiveCars;
        private List<CategoryInventory> categoryInventory;
        private List<LowStockAlert> lowStockAlerts;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CategoryInventory {
        private String categoryId;
        private String categoryName;
        private Integer totalCars;
        private Integer activeCars;
        private BigDecimal averagePrice;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class LowStockAlert {
        private String carId;
        private String carName;
        private Integer currentStock;
        private Integer minimumStock;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CustomerReport {
        private LocalDate fromDate;
        private LocalDate toDate;
        private Integer totalCustomers;
        private Integer newCustomers;
        private Integer activeCustomers;
        private List<TopCustomer> topCustomers;
        private Map<String, Integer> customersByRegion;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TopCustomer {
        private String userId;
        private String userName;
        private String userEmail;
        private Integer totalOrders;
        private BigDecimal totalSpent;
        private LocalDate lastOrderDate;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RevenueReport {
        private LocalDate fromDate;
        private LocalDate toDate;
        private BigDecimal totalRevenue;
        private BigDecimal averageOrderValue;
        private List<RevenueDataPoint> revenueData;
        private Map<String, BigDecimal> revenueByCategory;
        private Map<String, BigDecimal> revenueByPaymentMethod;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RevenueDataPoint {
        private String period;
        private BigDecimal revenue;
        private BigDecimal growth; // Percentage growth from previous period
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DashboardReport {
        private DashboardStats todayStats;
        private DashboardStats weekStats;
        private DashboardStats monthStats;
        private List<RecentActivity> recentActivities;
        private List<AlertItem> alerts;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DashboardStats {
        private BigDecimal revenue;
        private Integer orders;
        private Integer customers;
        private Integer cars;
        private Double growthRate; // Percentage
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RecentActivity {
        private String type; // ORDER, USER_REGISTRATION, REVIEW, etc.
        private String description;
        private String entityId;
        private LocalDate timestamp;
        private Map<String, Object> metadata;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AlertItem {
        private String type; // LOW_STOCK, HIGH_RETURN_RATE, etc.
        private String severity; // LOW, MEDIUM, HIGH, CRITICAL
        private String message;
        private String actionUrl;
        private LocalDate createdAt;
    }
}