package org.example.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CarRequest {

    @NotBlank(message = "Tên xe không được để trống")
    @Size(min = 2, max = 100, message = "Tên xe phải từ 2-100 ký tự")
    private String name;

    @NotNull(message = "Giá không được để trống")
    @DecimalMin(value = "0.0", inclusive = false, message = "Giá phải lớn hơn 0")
    private BigDecimal price;

    @NotNull(message = "Năm sản xuất không được để trống")
    @Min(value = 1900, message = "Năm sản xuất phải từ 1900 trở lên")
    @Max(value = 2100, message = "Năm sản xuất không hợp lệ")
    private Integer manufactureYear;

    @NotBlank(message = "Màu sắc không được để trống")
    @Size(max = 50, message = "Màu sắc tối đa 50 ký tự")
    private String color;

    @NotBlank(message = "Động cơ không được để trống")
    @Size(max = 100, message = "Động cơ tối đa 100 ký tự")
    private String engine;

    @NotBlank(message = "Hộp số không được để trống")
    @Size(max = 50, message = "Hộp số tối đa 50 ký tự")
    private String transmission;

    @NotNull(message = "Số chỗ ngồi không được để trống")
    @Min(value = 2, message = "Số chỗ ngồi tối thiểu là 2")
    @Max(value = 50, message = "Số chỗ ngồi tối đa là 50")
    private Integer seats;

    @Size(max = 2000, message = "Mô tả tối đa 2000 ký tự")
    private String description;

    private List<String> images;

    @NotBlank(message = "Danh mục không được để trống")
    private String categoryId;
}
