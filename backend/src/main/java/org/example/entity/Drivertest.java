package org.example.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "drivertests")
public class Drivertest {

    @Id
    private String id;

    @DBRef
    private User user; // Tham chiếu đến bảng User

    @DBRef // Nên để DBRef để tham chiếu đến bảng Car thay vì lưu cứng thông tin xe vào đây
    private Car car;

    private LocalDateTime testDate;

    private String testLocation;

    private BigDecimal fee;

    private TestStatus status;

    // Enum định nghĩa trạng thái
    public enum TestStatus {
        SCHEDULED, // Trạng thái "Đã đặt lịch" (Khớp với Service code cũ)
        PENDING,
        COMPLETED,
        CANCELLED
    }
}