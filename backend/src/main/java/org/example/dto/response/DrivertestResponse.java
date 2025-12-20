package org.example.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.entity.Drivertest;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DrivertestResponse {
    private String id;

    private String userId;

    private String userName;

    private String carId;

    private String carName;

    private LocalDateTime testDate;

    private String testLocation;

    private BigDecimal fee;

    private Drivertest.TestStatus status;
}
