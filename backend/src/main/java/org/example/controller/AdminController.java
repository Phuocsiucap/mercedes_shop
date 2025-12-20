package org.example.controller;

import org.example.dto.response.AdminCarResponse;
import org.example.dto.response.AdminOrderResponse;
import org.example.dto.response.AdminUserResponse;
import org.example.dto.response.ApiResponse;
import org.example.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*", maxAge = 3600)
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private AdminService adminService;
    
    @GetMapping("/cars")
    public ResponseEntity<ApiResponse<Page<AdminCarResponse>>> getAdminCars(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String categoryId,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) String color,
            @RequestParam(required = false) String engine,
            @RequestParam(required = false) String transmission,
            @RequestParam(required = false) Integer seats,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("ASC") ?
                Sort.by(sortBy).ascending() :
                Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(page, size, sort);
        Page<AdminCarResponse> cars = adminService.getAdminCars(
                keyword, categoryId, minPrice, maxPrice, year, color, 
                engine, transmission, seats, status, pageable);
        
        return ResponseEntity.ok(ApiResponse.success(cars));
    }

    @GetMapping("/cars/{id}")
    public ResponseEntity<ApiResponse<AdminCarResponse>> getAdminCarById(@PathVariable String id) {
        AdminCarResponse car = adminService.getAdminCarById(id);
        return ResponseEntity.ok(ApiResponse.success(car));
    }

    // ==================== USERS MANAGEMENT ====================
    
    @GetMapping("/users")
    public ResponseEntity<ApiResponse<Page<AdminUserResponse>>> getAdminUsers(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String fromDate,
            @RequestParam(required = false) String toDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("ASC") ?
                Sort.by(sortBy).ascending() :
                Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(page, size, sort);
        Page<AdminUserResponse> users = adminService.getAdminUsers(
                keyword, role, status, fromDate, toDate, pageable);
        
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<ApiResponse<AdminUserResponse>> getAdminUserById(@PathVariable String id) {
        AdminUserResponse user = adminService.getAdminUserById(id);
        return ResponseEntity.ok(ApiResponse.success(user));
    }

    // ==================== ORDERS MANAGEMENT ====================
    
    @GetMapping("/orders")
    public ResponseEntity<ApiResponse<Page<AdminOrderResponse>>> getAdminOrders(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String fromDate,
            @RequestParam(required = false) String toDate,
            @RequestParam(required = false) Double minAmount,
            @RequestParam(required = false) Double maxAmount,
            @RequestParam(required = false) String paymentMethod,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "orderDate") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("ASC") ?
                Sort.by(sortBy).ascending() :
                Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(page, size, sort);
        Page<AdminOrderResponse> orders = adminService.getAdminOrders(
                keyword, status, fromDate, toDate, minAmount, maxAmount, 
                paymentMethod, pageable);
        
        return ResponseEntity.ok(ApiResponse.success(orders));
    }

    @GetMapping("/orders/{id}")
    public ResponseEntity<ApiResponse<AdminOrderResponse>> getAdminOrderById(@PathVariable String id) {
        AdminOrderResponse order = adminService.getAdminOrderById(id);
        return ResponseEntity.ok(ApiResponse.success(order));
    }

    // ==================== DASHBOARD STATS ====================
    
    @GetMapping("/dashboard/stats")
    public ResponseEntity<ApiResponse<Object>> getDashboardStats() {
        Object stats = adminService.getDashboardStats();
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    @GetMapping("/dashboard/recent-activities")
    public ResponseEntity<ApiResponse<Object>> getRecentActivities(
            @RequestParam(defaultValue = "10") int limit) {
        Object activities = adminService.getRecentActivities(limit);
        return ResponseEntity.ok(ApiResponse.success(activities));
    }
}