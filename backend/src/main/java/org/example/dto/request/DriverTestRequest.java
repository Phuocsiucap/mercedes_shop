package org.example.dto.request;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class DriverTestRequest {

    @NotBlank(message = "Car ID không được để trống")
    private String carId;

    private String carName;

    @NotBlank(message = "Địa điểm không được để trống")
    private String location;

    @NotNull(message = "Thời gian lái thử không được để trống")
    @Future(message = "Thời gian lái thử phải ở tương lai")
    private LocalDateTime testDriveTime;

    private BigDecimal fee;

    private String notes;

    // Payment fields
    private BigDecimal depositAmount;
    private String paymentMethod; // VNPAY or SHOWROOM
    private String paymentId;
    private String paymentStatus;

    // Dùng cho admin khi tạo lịch thay khách
    private String userId;
    private String customerName;
    private String customerPhone;
    private String customerEmail;
}
