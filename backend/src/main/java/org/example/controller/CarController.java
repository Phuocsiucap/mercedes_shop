package org.example.controller;

import jakarta.validation.Valid;
import org.example.dto.request.CarRequest;
import org.example.dto.response.ApiResponse;
import org.example.dto.response.CarResponse;
import org.example.service.CarService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
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
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("ASC") ?
                    Sort.by(sortBy).ascending() :
                    Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(page, size, sort);
        Page<CarResponse> cars = carService.getAllCars(pageable);
        return ResponseEntity.ok(ApiResponse.success(cars));
    }

    @GetMapping("/featured")
    public ResponseEntity<ApiResponse<List<CarResponse>>> getFeaturedCars() {
        List<CarResponse> cars = carService.getFeaturedCars();
        return ResponseEntity.ok(ApiResponse.success(cars));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Page<CarResponse>>> searchCars(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String categoryId,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) String color,
            @RequestParam(required = false) String engine,
            @RequestParam(required = false) String transmission,
            @RequestParam(required = false) Integer seats,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("ASC") ?
                    Sort.by(sortBy).ascending() :
                    Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(page, size, sort);
        Page<CarResponse> cars = carService.searchCarsAdvanced(keyword, categoryId, minPrice, maxPrice, 
                                                              year, color, engine, transmission, seats, pageable);
        return ResponseEntity.ok(ApiResponse.success(cars));
    }

    @GetMapping("/admin/filter")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<CarResponse>>> getFilteredCarsForAdmin(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String categoryId,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) String color,
            @RequestParam(required = false) String engine,
            @RequestParam(required = false) String transmission,
            @RequestParam(required = false) Integer seats,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("ASC") ?
                    Sort.by(sortBy).ascending() :
                    Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(page, size, sort);
        Page<CarResponse> cars = carService.searchCarsAdvanced(keyword, categoryId, minPrice, maxPrice, 
                                                              year, color, engine, transmission, seats, pageable);
        return ResponseEntity.ok(ApiResponse.success(cars));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CarResponse>> getCarById(@PathVariable String id) {
        CarResponse car = carService.getCarById(id);
        return ResponseEntity.ok(ApiResponse.success(car));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CarResponse>> createCar(@Valid @RequestBody CarRequest request) {
        CarResponse car = carService.createCar(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tạo xe thành công", car));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CarResponse>> updateCar(
            @PathVariable String id,
            @Valid @RequestBody CarRequest request) {
        CarResponse car = carService.updateCar(id, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật xe thành công", car));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteCar(@PathVariable String id) {
        carService.deleteCar(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa xe thành công", null));
    }
}
