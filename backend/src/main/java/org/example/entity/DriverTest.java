package org.example.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "drivertests")
public class DriverTest {

    @Id
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

    private TestDriveStatus status;
    
    private String paymentId;  // ID của payment record
    
    private String paymentStatus;  // PENDING, SUCCESS, FAILED
    
    private BigDecimal depositAmount;  // Số tiền đặt cọc (1% giá xe)

    private String notes;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    public enum TestDriveStatus {
        PENDING,      // Chờ xác nhận
        CONFIRMED,    // Đã xác nhận
        COMPLETED,    // Hoàn thành
        CANCELLED     // Đã hủy
    }
}
