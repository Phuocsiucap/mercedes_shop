package org.example.controller;

import org.example.dto.request.AdminFilterRequest;
import org.example.dto.request.CategoryRequest;
import org.example.dto.request.DriverTestRequest;
import org.example.dto.response.*;
import org.example.entity.DriverTest;
import org.example.entity.Order;
import org.example.entity.User;
import org.example.service.AdminService;
import org.example.service.DriverTestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*", maxAge = 3600)
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @Autowired
    private DriverTestService driverTestService;

    // Dashboard endpoints
    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<DashboardStatsResponse>> getDashboardStats() {
        try {
            DashboardStatsResponse stats = adminService.getDashboardStats();
            
            ApiResponse<DashboardStatsResponse> response = ApiResponse.<DashboardStatsResponse>builder()
                .success(true)
                .message("Lấy thống kê dashboard thành công")
                .data(stats)
                .timestamp(LocalDateTime.now())
                .build();
                
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ApiResponse<DashboardStatsResponse> response = ApiResponse.<DashboardStatsResponse>builder()
                .success(false)
                .message("Lấy thống kê dashboard thất bại: " + e.getMessage())
                .timestamp(LocalDateTime.now())
                .build();
                
            return ResponseEntity.badRequest().body(response);
        }
    }

    // User management endpoints
    @GetMapping("/users")
    public ResponseEntity<ApiResponse<Page<AdminUserResponse>>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String role) {
        try {
            AdminFilterRequest filterRequest = new AdminFilterRequest();
            filterRequest.setPage(page);
            filterRequest.setSize(size);
            filterRequest.setSortBy(sortBy);
            filterRequest.setSortDir(sortDir);
            filterRequest.setKeyword(keyword);
            filterRequest.setRole(role);
            
            Page<AdminUserResponse> users = adminService.getAllUsers(filterRequest);
            
            ApiResponse<Page<AdminUserResponse>> response = ApiResponse.<Page<AdminUserResponse>>builder()
                .success(true)
                .message("Lấy danh sách người dùng thành công")
                .data(users)
                .timestamp(LocalDateTime.now())
                .build();
                
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ApiResponse<Page<AdminUserResponse>> response = ApiResponse.<Page<AdminUserResponse>>builder()
                .success(false)
                .message("Lấy danh sách người dùng thất bại: " + e.getMessage())
                .timestamp(LocalDateTime.now())
                .build();
                
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/users/{userId}")
    public ResponseEntity<ApiResponse<AdminUserResponse>> getUserById(@PathVariable String userId) {
        try {
            AdminUserResponse user = adminService.getUserById(userId);
            
            ApiResponse<AdminUserResponse> response = ApiResponse.<AdminUserResponse>builder()
                .success(true)
                .message("Lấy thông tin người dùng thành công")
                .data(user)
                .timestamp(LocalDateTime.now())
                .build();
                
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ApiResponse<AdminUserResponse> response = ApiResponse.<AdminUserResponse>builder()
                .success(false)
                .message("Lấy thông tin người dùng thất bại: " + e.getMessage())
                .timestamp(LocalDateTime.now())
                .build();
                
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PutMapping("/users/{userId}/role")
    public ResponseEntity<ApiResponse<String>> updateUserRole(
            @PathVariable String userId,
            @RequestParam User.Role role) {
        try {
            ApiResponse<String> response = adminService.updateUserRole(userId, role);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ApiResponse<String> response = ApiResponse.<String>builder()
                .success(false)
                .message("Cập nhật quyền người dùng thất bại: " + e.getMessage())
                .timestamp(LocalDateTime.now())
                .build();
                
            return ResponseEntity.badRequest().body(response);
        }
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<ApiResponse<String>> deleteUser(@PathVariable String userId) {
        try {
            ApiResponse<String> response = adminService.deleteUser(userId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ApiResponse<String> response = ApiResponse.<String>builder()
                .success(false)
                .message("Xóa người dùng thất bại: " + e.getMessage())
                .timestamp(LocalDateTime.now())
                .build();
                
            return ResponseEntity.badRequest().body(response);
        }
    }

    // Car management endpoints
    @GetMapping("/cars")
    public ResponseEntity<ApiResponse<Page<AdminCarResponse>>> getAllCars(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String categoryId) {
        try {
            AdminFilterRequest filterRequest = new AdminFilterRequest();
            filterRequest.setPage(page);
            filterRequest.setSize(size);
            filterRequest.setSortBy(sortBy);
            filterRequest.setSortDir(sortDir);
            filterRequest.setKeyword(keyword);
            filterRequest.setCategoryId(categoryId);
            
            Page<AdminCarResponse> cars = adminService.getAllCarsForAdmin(filterRequest);
            
            ApiResponse<Page<AdminCarResponse>> response = ApiResponse.<Page<AdminCarResponse>>builder()
                .success(true)
                .message("Lấy danh sách xe thành công")
                .data(cars)
                .timestamp(LocalDateTime.now())
                .build();
                
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ApiResponse<Page<AdminCarResponse>> response = ApiResponse.<Page<AdminCarResponse>>builder()
                .success(false)
                .message("Lấy danh sách xe thất bại: " + e.getMessage())
                .timestamp(LocalDateTime.now())
                .build();
                
            return ResponseEntity.badRequest().body(response);
        }
    }

    // Order management endpoints
    @GetMapping("/orders")
    public ResponseEntity<ApiResponse<Page<AdminOrderResponse>>> getAllOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "orderDate") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {
        try {
            AdminFilterRequest filterRequest = new AdminFilterRequest();
            filterRequest.setPage(page);
            filterRequest.setSize(size);
            filterRequest.setSortBy(sortBy);
            filterRequest.setSortDir(sortDir);
            filterRequest.setStatus(status);
            filterRequest.setFromDate(fromDate);
            filterRequest.setToDate(toDate);
            
            Page<AdminOrderResponse> orders = adminService.getAllOrders(filterRequest);
            
            ApiResponse<Page<AdminOrderResponse>> response = ApiResponse.<Page<AdminOrderResponse>>builder()
                .success(true)
                .message("Lấy danh sách đơn hàng thành công")
                .data(orders)
                .timestamp(LocalDateTime.now())
                .build();
                
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ApiResponse<Page<AdminOrderResponse>> response = ApiResponse.<Page<AdminOrderResponse>>builder()
                .success(false)
                .message("Lấy danh sách đơn hàng thất bại: " + e.getMessage())
                .timestamp(LocalDateTime.now())
                .build();
                
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/orders/{orderId}")
    public ResponseEntity<ApiResponse<AdminOrderResponse>> getOrderById(@PathVariable String orderId) {
        try {
            AdminOrderResponse order = adminService.getOrderById(orderId);
            
            ApiResponse<AdminOrderResponse> response = ApiResponse.<AdminOrderResponse>builder()
                .success(true)
                .message("Lấy thông tin đơn hàng thành công")
                .data(order)
                .timestamp(LocalDateTime.now())
                .build();
                
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ApiResponse<AdminOrderResponse> response = ApiResponse.<AdminOrderResponse>builder()
                .success(false)
                .message("Lấy thông tin đơn hàng thất bại: " + e.getMessage())
                .timestamp(LocalDateTime.now())
                .build();
                
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PutMapping("/orders/{orderId}/status")
    public ResponseEntity<ApiResponse<AdminOrderResponse>> updateOrderStatus(
            @PathVariable String orderId,
            @RequestParam Order.OrderStatus status) {
        try {
            ApiResponse<AdminOrderResponse> response = adminService.updateOrderStatus(orderId, status);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ApiResponse<AdminOrderResponse> response = ApiResponse.<AdminOrderResponse>builder()
                .success(false)
                .message("Cập nhật trạng thái đơn hàng thất bại: " + e.getMessage())
                .timestamp(LocalDateTime.now())
                .build();
                
            return ResponseEntity.badRequest().body(response);
        }
    }

    // Category management endpoints
    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getAllCategories() {
        try {
            List<CategoryResponse> categories = adminService.getAllCategories();
            
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

    @PostMapping("/categories")
    public ResponseEntity<ApiResponse<CategoryResponse>> createCategory(@Valid @RequestBody CategoryRequest categoryRequest) {
        try {
            ApiResponse<CategoryResponse> response = adminService.createCategory(categoryRequest);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ApiResponse<CategoryResponse> response = ApiResponse.<CategoryResponse>builder()
                .success(false)
                .message("Tạo danh mục thất bại: " + e.getMessage())
                .timestamp(LocalDateTime.now())
                .build();
                
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PutMapping("/categories/{categoryId}")
    public ResponseEntity<ApiResponse<CategoryResponse>> updateCategory(
            @PathVariable String categoryId,
            @Valid @RequestBody CategoryRequest categoryRequest) {
        try {
            ApiResponse<CategoryResponse> response = adminService.updateCategory(categoryId, categoryRequest);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ApiResponse<CategoryResponse> response = ApiResponse.<CategoryResponse>builder()
                .success(false)
                .message("Cập nhật danh mục thất bại: " + e.getMessage())
                .timestamp(LocalDateTime.now())
                .build();
                
            return ResponseEntity.badRequest().body(response);
        }
    }

    @DeleteMapping("/categories/{categoryId}")
    public ResponseEntity<ApiResponse<String>> deleteCategory(@PathVariable String categoryId) {
        try {
            ApiResponse<String> response = adminService.deleteCategory(categoryId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ApiResponse<String> response = ApiResponse.<String>builder()
                .success(false)
                .message("Xóa danh mục thất bại: " + e.getMessage())
                .timestamp(LocalDateTime.now())
                .build();
                
            return ResponseEntity.badRequest().body(response);
        }
    }

    // Reports endpoints
    @GetMapping("/reports/sales")
    public ResponseEntity<ApiResponse<ReportResponse.SalesReport>> getSalesReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(defaultValue = "day") String groupBy) {
        try {
            ReportResponse.SalesReport report = adminService.getSalesReport(fromDate, toDate, groupBy);
            
            ApiResponse<ReportResponse.SalesReport> response = ApiResponse.<ReportResponse.SalesReport>builder()
                .success(true)
                .message("Lấy báo cáo bán hàng thành công")
                .data(report)
                .timestamp(LocalDateTime.now())
                .build();
                
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ApiResponse<ReportResponse.SalesReport> response = ApiResponse.<ReportResponse.SalesReport>builder()
                .success(false)
                .message("Lấy báo cáo bán hàng thất bại: " + e.getMessage())
                .timestamp(LocalDateTime.now())
                .build();
                
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/reports/inventory")
    public ResponseEntity<ApiResponse<ReportResponse.InventoryReport>> getInventoryReport() {
        try {
            ReportResponse.InventoryReport report = adminService.getInventoryReport();
            
            ApiResponse<ReportResponse.InventoryReport> response = ApiResponse.<ReportResponse.InventoryReport>builder()
                .success(true)
                .message("Lấy báo cáo tồn kho thành công")
                .data(report)
                .timestamp(LocalDateTime.now())
                .build();
                
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ApiResponse<ReportResponse.InventoryReport> response = ApiResponse.<ReportResponse.InventoryReport>builder()
                .success(false)
                .message("Lấy báo cáo tồn kho thất bại: " + e.getMessage())
                .timestamp(LocalDateTime.now())
                .build();
                
            return ResponseEntity.badRequest().body(response);
        }
    }

    // ==================== TEST DRIVE MANAGEMENT ====================

    @GetMapping("/test-drives")
    public ResponseEntity<ApiResponse<Page<DriverTestResponse>>> getAllTestDrives(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status) {
        try {
            Page<DriverTestResponse> testDrives = driverTestService.getAllTestDrives(
                    page, size, sortBy, sortDir, keyword, status);
            
            ApiResponse<Page<DriverTestResponse>> response = ApiResponse.<Page<DriverTestResponse>>builder()
                .success(true)
                .message("Lấy danh sách lịch lái thử thành công")
                .data(testDrives)
                .timestamp(LocalDateTime.now())
                .build();
                
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ApiResponse<Page<DriverTestResponse>> response = ApiResponse.<Page<DriverTestResponse>>builder()
                .success(false)
                .message("Lấy danh sách lịch lái thử thất bại: " + e.getMessage())
                .timestamp(LocalDateTime.now())
                .build();
                
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/test-drives/{id}")
    public ResponseEntity<ApiResponse<DriverTestResponse>> getTestDriveById(@PathVariable String id) {
        try {
            ApiResponse<DriverTestResponse> response = driverTestService.getTestDriveById(id);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ApiResponse<DriverTestResponse> response = ApiResponse.<DriverTestResponse>builder()
                .success(false)
                .message("Lấy thông tin lịch lái thử thất bại: " + e.getMessage())
                .timestamp(LocalDateTime.now())
                .build();
                
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/test-drives")
    public ResponseEntity<ApiResponse<DriverTestResponse>> createTestDrive(
            @Valid @RequestBody DriverTestRequest request) {
        try {
            ApiResponse<DriverTestResponse> response = driverTestService.adminCreateTestDrive(request);
            if (response.isSuccess()) {
                return ResponseEntity.ok(response);
            }
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            ApiResponse<DriverTestResponse> response = ApiResponse.<DriverTestResponse>builder()
                .success(false)
                .message("Tạo lịch lái thử thất bại: " + e.getMessage())
                .timestamp(LocalDateTime.now())
                .build();
                
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PutMapping("/test-drives/{id}")
    public ResponseEntity<ApiResponse<DriverTestResponse>> updateTestDrive(
            @PathVariable String id,
            @RequestBody DriverTestRequest request) {
        try {
            ApiResponse<DriverTestResponse> response = driverTestService.adminUpdateTestDrive(id, request);
            if (response.isSuccess()) {
                return ResponseEntity.ok(response);
            }
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            ApiResponse<DriverTestResponse> response = ApiResponse.<DriverTestResponse>builder()
                .success(false)
                .message("Cập nhật lịch lái thử thất bại: " + e.getMessage())
                .timestamp(LocalDateTime.now())
                .build();
                
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PutMapping("/test-drives/{id}/status")
    public ResponseEntity<ApiResponse<DriverTestResponse>> updateTestDriveStatus(
            @PathVariable String id,
            @RequestParam DriverTest.TestDriveStatus status) {
        try {
            ApiResponse<DriverTestResponse> response = driverTestService.updateStatus(id, status);
            if (response.isSuccess()) {
                return ResponseEntity.ok(response);
            }
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            ApiResponse<DriverTestResponse> response = ApiResponse.<DriverTestResponse>builder()
                .success(false)
                .message("Cập nhật trạng thái thất bại: " + e.getMessage())
                .timestamp(LocalDateTime.now())
                .build();
                
            return ResponseEntity.badRequest().body(response);
        }
    }

    @DeleteMapping("/test-drives/{id}")
    public ResponseEntity<ApiResponse<String>> deleteTestDrive(@PathVariable String id) {
        try {
            ApiResponse<String> response = driverTestService.deleteTestDrive(id);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ApiResponse<String> response = ApiResponse.<String>builder()
                .success(false)
                .message("Xóa lịch lái thử thất bại: " + e.getMessage())
                .timestamp(LocalDateTime.now())
                .build();
                
            return ResponseEntity.badRequest().body(response);
        }
    }
}