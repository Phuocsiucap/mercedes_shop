package org.example.controller;

import org.example.dto.request.CarRequest;
import org.example.dto.request.ReviewRequest;
import org.example.dto.response.ApiResponse;
import org.example.dto.response.CarResponse;
import org.example.dto.response.CategoryResponse;
import org.example.dto.response.ReviewResponse;
import org.example.service.CarService;
import org.example.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/cars")
@CrossOrigin(origins = "*", maxAge = 3600)
public class CarController {

    @Autowired
    private CarService carService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<CarResponse>>> getAllCars(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        try {
            Page<CarResponse> cars = carService.getAllCars(page, size, sortBy, sortDir);
            
            ApiResponse<Page<CarResponse>> response = ApiResponse.<Page<CarResponse>>builder()
                .success(true)
                .message("Lấy danh sách xe thành công")
                .data(cars)
                .timestamp(LocalDateTime.now())
                .build();
                
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ApiResponse<Page<CarResponse>> response = ApiResponse.<Page<CarResponse>>builder()
                .success(false)
                .message("Lấy danh sách xe thất bại: " + e.getMessage())
                .timestamp(LocalDateTime.now())
                .build();
                
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CarResponse>> getCarById(@PathVariable String id) {
        try {
            CarResponse car = carService.getCarById(id);
            
            ApiResponse<CarResponse> response = ApiResponse.<CarResponse>builder()
                .success(true)
                .message("Lấy thông tin xe thành công")
                .data(car)
                .timestamp(LocalDateTime.now())
                .build();
                
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ApiResponse<CarResponse> response = ApiResponse.<CarResponse>builder()
                .success(false)
                .message("Lấy thông tin xe thất bại: " + e.getMessage())
                .timestamp(LocalDateTime.now())
                .build();
                
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Page<CarResponse>>> searchCars(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Page<CarResponse> cars = carService.searchCars(keyword, page, size);
            
            ApiResponse<Page<CarResponse>> response = ApiResponse.<Page<CarResponse>>builder()
                .success(true)
                .message("Tìm kiếm xe thành công")
                .data(cars)
                .timestamp(LocalDateTime.now())
                .build();
                
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ApiResponse<Page<CarResponse>> response = ApiResponse.<Page<CarResponse>>builder()
                .success(false)
                .message("Tìm kiếm xe thất bại: " + e.getMessage())
                .timestamp(LocalDateTime.now())
                .build();
                
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/advanced-search")
    public ResponseEntity<ApiResponse<Page<CarResponse>>> advancedSearch(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String categoryId,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) String color,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        try {
            Page<CarResponse> cars = carService.advancedSearch(
                keyword, categoryId, minPrice, maxPrice, year, color, 
                page, size, sortBy, sortDir);
            
            ApiResponse<Page<CarResponse>> response = ApiResponse.<Page<CarResponse>>builder()
                .success(true)
                .message("Tìm kiếm nâng cao thành công")
                .data(cars)
                .timestamp(LocalDateTime.now())
                .build();
                
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ApiResponse<Page<CarResponse>> response = ApiResponse.<Page<CarResponse>>builder()
                .success(false)
                .message("Tìm kiếm nâng cao thất bại: " + e.getMessage())
                .timestamp(LocalDateTime.now())
                .build();
                
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<ApiResponse<Page<CarResponse>>> getCarsByCategory(
            @PathVariable String categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Page<CarResponse> cars = carService.getCarsByCategory(categoryId, page, size);
            
            ApiResponse<Page<CarResponse>> response = ApiResponse.<Page<CarResponse>>builder()
                .success(true)
                .message("Lấy xe theo danh mục thành công")
                .data(cars)
                .timestamp(LocalDateTime.now())
                .build();
                
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ApiResponse<Page<CarResponse>> response = ApiResponse.<Page<CarResponse>>builder()
                .success(false)
                .message("Lấy xe theo danh mục thất bại: " + e.getMessage())
                .timestamp(LocalDateTime.now())
                .build();
                
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getAllCategories() {
        try {
            List<CategoryResponse> categories = carService.getAllCategories();
            
            ApiResponse<List<CategoryResponse>> response = ApiResponse.<List<CategoryResponse>>builder()
                .success(true)
                .message("Lấy danh sách danh mục thành công")
                .data(categories)
                .timestamp(LocalDateTime.now())
                .build();
                
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ApiResponse<List<CategoryResponse>> response = ApiResponse.<List<CategoryResponse>>builder()
                .success(false)
                .message("Lấy danh sách danh mục thất bại: " + e.getMessage())
                .timestamp(LocalDateTime.now())
                .build();
                
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/latest")
    public ResponseEntity<ApiResponse<List<CarResponse>>> getLatestCars() {
        try {
            List<CarResponse> cars = carService.getLatestCars();
            
            ApiResponse<List<CarResponse>> response = ApiResponse.<List<CarResponse>>builder()
                .success(true)
                .message("Lấy xe mới nhất thành công")
                .data(cars)
                .timestamp(LocalDateTime.now())
                .build();
                
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ApiResponse<List<CarResponse>> response = ApiResponse.<List<CarResponse>>builder()
                .success(false)
                .message("Lấy xe mới nhất thất bại: " + e.getMessage())
                .timestamp(LocalDateTime.now())
                .build();
                
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/{id}/reviews")
    public ResponseEntity<ApiResponse<List<ReviewResponse>>> getCarReviews(@PathVariable String id) {
        try {
            List<ReviewResponse> reviews = carService.getCarReviews(id);
            
            ApiResponse<List<ReviewResponse>> response = ApiResponse.<List<ReviewResponse>>builder()
                .success(true)
                .message("Lấy đánh giá xe thành công")
                .data(reviews)
                .timestamp(LocalDateTime.now())
                .build();
                
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ApiResponse<List<ReviewResponse>> response = ApiResponse.<List<ReviewResponse>>builder()
                .success(false)
                .message("Lấy đánh giá xe thất bại: " + e.getMessage())
                .timestamp(LocalDateTime.now())
                .build();
                
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/{id}/reviews")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<ReviewResponse>> addReview(
            @PathVariable String id,
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody ReviewRequest reviewRequest) {
        try {
            // Set the car ID from path variable
            reviewRequest.setCarId(id);
            
            ApiResponse<ReviewResponse> response = carService.addReview(userPrincipal.getId(), reviewRequest);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ApiResponse<ReviewResponse> response = ApiResponse.<ReviewResponse>builder()
                .success(false)
                .message("Thêm đánh giá thất bại: " + e.getMessage())
                .timestamp(LocalDateTime.now())
                .build();
                
            return ResponseEntity.badRequest().body(response);
        }
    }

    // Admin endpoints
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CarResponse>> createCar(@Valid @RequestBody CarRequest carRequest) {
        try {
            ApiResponse<CarResponse> response = carService.createCar(carRequest);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ApiResponse<CarResponse> response = ApiResponse.<CarResponse>builder()
                .success(false)
                .message("Tạo xe thất bại: " + e.getMessage())
                .timestamp(LocalDateTime.now())
                .build();
                
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CarResponse>> updateCar(
            @PathVariable String id,
            @Valid @RequestBody CarRequest carRequest) {
        try {
            ApiResponse<CarResponse> response = carService.updateCar(id, carRequest);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ApiResponse<CarResponse> response = ApiResponse.<CarResponse>builder()
                .success(false)
                .message("Cập nhật xe thất bại: " + e.getMessage())
                .timestamp(LocalDateTime.now())
                .build();
                
            return ResponseEntity.badRequest().body(response);
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> deleteCar(@PathVariable String id) {
        try {
            ApiResponse<String> response = carService.deleteCar(id);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ApiResponse<String> response = ApiResponse.<String>builder()
                .success(false)
                .message("Xóa xe thất bại: " + e.getMessage())
                .timestamp(LocalDateTime.now())
                .build();
                
            return ResponseEntity.badRequest().body(response);
        }
    }
}