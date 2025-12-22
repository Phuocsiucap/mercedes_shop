package org.example.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * DTO for comprehensive dashboard statistics
 * Returns all dashboard data in a single response
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsResponse {

    // Basic counts
    private Long totalUsers;
    private Long totalCars;
    private Long totalOrders;

    // Revenue statistics
    private BigDecimal totalRevenue;
    private BigDecimal todayRevenue;
    private BigDecimal averageOrderValue;

    // Today's statistics
    private Long todayOrders;
    private Long todayUsers;

    // Trends (growth percentages)
    private Double revenueGrowth;
    private Double ordersGrowth;
    private Double usersGrowth;

    // Order status distribution
    private Map<String, Long> orderStatusDistribution;

    // Recent orders (limited to 5-10)
    private List<RecentOrderDto> recentOrders;

    /**
     * DTO for recent order summary
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecentOrderDto {
        private String id;
        private String userName;
        private LocalDateTime orderDate;
        private BigDecimal totalAmount;
        private String status;
    }
}
