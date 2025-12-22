package org.example.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.entity.DriverTest;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DriverTestResponse {

    private String id;

    private String userId;

    private String customerName;

    private String customerPhone;

    private String customerEmail;

    private String carId;

    private String carName;

    private BigDecimal fee;

    private String location;

    private LocalDateTime testDriveTime;

    private DriverTest.TestDriveStatus status;

    private String statusText;

    private String notes;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    // Thông tin bổ sung
    private String carImage;

    private long daysUntilTest;

    public static DriverTestResponse fromEntity(DriverTest driverTest) {
        if (driverTest == null) return null;

        DriverTestResponse response = DriverTestResponse.builder()
                .id(driverTest.getId())
                .userId(driverTest.getUserId())
                .customerName(driverTest.getCustomerName())
                .customerPhone(driverTest.getCustomerPhone())
                .customerEmail(driverTest.getCustomerEmail())
                .carId(driverTest.getCarId())
                .carName(driverTest.getCarName())
                .fee(driverTest.getFee())
                .location(driverTest.getLocation())
                .testDriveTime(driverTest.getTestDriveTime())
                .status(driverTest.getStatus())
                .notes(driverTest.getNotes())
                .createdAt(driverTest.getCreatedAt())
                .updatedAt(driverTest.getUpdatedAt())
                .build();

        // Set status text
        response.setStatusText(getStatusText(driverTest.getStatus()));

        // Calculate days until test
        if (driverTest.getTestDriveTime() != null) {
            long days = java.time.temporal.ChronoUnit.DAYS.between(
                    LocalDateTime.now(), driverTest.getTestDriveTime());
            response.setDaysUntilTest(days);
        }

        return response;
    }

    private static String getStatusText(DriverTest.TestDriveStatus status) {
        if (status == null) return "Không xác định";
        return switch (status) {
            case PENDING -> "Chờ xác nhận";
            case CONFIRMED -> "Đã xác nhận";
            case COMPLETED -> "Hoàn thành";
            case CANCELLED -> "Đã hủy";
        };
    }
}
