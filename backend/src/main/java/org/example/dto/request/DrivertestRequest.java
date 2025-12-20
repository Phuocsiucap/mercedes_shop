package org.example.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DrivertestRequest {

    @NotBlank(message = "ID xe không được để trống")
    private String carId;

    @NotNull(message = "Ngày thi không được để trống")
    private LocalDateTime testDate;

    @NotBlank(message = "Địa điểm lái thử không được để trống")
    private String testLocation;

    @NotNull(message = "Phí không được để trống")
    @Positive(message = "Phí phải lớn hơn 0")
    private BigDecimal fee;


}
