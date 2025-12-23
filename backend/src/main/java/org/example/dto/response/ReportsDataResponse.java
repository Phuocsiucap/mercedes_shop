package org.example.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

/**
 * DTO for comprehensive reports analytics data
 * Returns all reports data in a single response
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportsDataResponse {

    // Summary statistics
    private BigDecimal totalRevenue;
    private Long totalOrders;
    private Long totalCars;
    private BigDecimal averageRevenue;

    // Revenue data grouped by period
    private List<RevenueByPeriodDto> revenueByPeriod;

    // Order status statistics
    private List<OrderStatusStatDto> orderStatusStats;

    // Top selling cars
    private List<TopCarDto> topCars;

    /**
     * DTO for revenue grouped by time period
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RevenueByPeriodDto {
        private String period; // Display label (e.g., "01/12/2024" or "Tháng 12, 2024")
        private String key; // Sortable key (e.g., "2024-12-01")
        private Long orderCount;
        private BigDecimal revenue;
    }

    /**
     * DTO for order status statistics
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderStatusStatDto {
        private String status; // Status name
        private String displayName; // Localized display name
        private Long count;
    }

    /**
     * DTO for top selling cars
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopCarDto {
        private String id;
        private String name;
        private String imageUrl;
        private Integer soldCount;
        private BigDecimal revenue;
    }
}
