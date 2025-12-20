package org.example.controller;

import lombok.RequiredArgsConstructor;
import org.example.dto.request.DrivertestRequest;
import org.example.dto.response.ApiResponse;
import org.example.dto.response.DrivertestResponse;
import org.example.service.DrivertestService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/drivertests")
@CrossOrigin(origins = "*", maxAge = 3600) // Thêm cấu hình CORS giống CarController
@RequiredArgsConstructor
public class DrivertestController {

    private final DrivertestService drivertestService;

    // Lấy tất cả (Chỉ Admin)
    @GetMapping
//    @PreAuthorize("hasRole('ADMIN')") //
    public ResponseEntity<ApiResponse<List<DrivertestResponse>>> getAllDrivertests() {
        List<DrivertestResponse> drivertests = drivertestService.getAllDrivertests();
        // Sử dụng ApiResponse.success(data) cho các method GET list
        return ResponseEntity.ok(ApiResponse.success(drivertests));
    }

    // Lấy chi tiết (Admin hoặc chính chủ)
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @drivertestService.isOwner(#id)")
    public ResponseEntity<ApiResponse<DrivertestResponse>> getDrivertestById(@PathVariable String id) {
        DrivertestResponse drivertest = drivertestService.getDrivertestById(id);
        // Sử dụng ApiResponse.success(data) cho method GET detail
        return ResponseEntity.ok(ApiResponse.success(drivertest));
    }

    // Tạo mới (Ai cũng tạo được nếu đã login)
    @PostMapping
    public ResponseEntity<ApiResponse<DrivertestResponse>> createDrivertest(
            @Valid @RequestBody DrivertestRequest request) {
        DrivertestResponse drivertest = drivertestService.createDrivertest(request);
        // Sửa status thành 201 CREATED và dùng ApiResponse.success(message, data)
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tạo yêu cầu lái thử thành công", drivertest));
    }

    // Cập nhật thông tin (Admin)
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<DrivertestResponse>> updateDrivertest(
            @PathVariable String id,
            @Valid @RequestBody DrivertestRequest request) {
        DrivertestResponse drivertest = drivertestService.updateDrivertest(id, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật lái thử thành công", drivertest));
    }

    // Đổi trạng thái (Admin)
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<DrivertestResponse>> updateStatus(
            @PathVariable String id,
            @RequestParam String status) {
        DrivertestResponse drivertest = drivertestService.updateStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật trạng thái thành công", drivertest));
    }

    // Xóa (Admin)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteDrivertest(@PathVariable String id) {
        drivertestService.deleteDrivertest(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa lái thử thành công", null));
    }

    // Lọc theo trạng thái (Admin)
    @GetMapping("/status/{status}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<DrivertestResponse>>> getByStatus(@PathVariable String status) {
        List<DrivertestResponse> drivertests = drivertestService.getByStatus(status);
        return ResponseEntity.ok(ApiResponse.success(drivertests));
    }

    // Lấy danh sách của user cụ thể (Admin xem)
    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<DrivertestResponse>>> getByUserId(@PathVariable String userId) {
        List<DrivertestResponse> drivertests = drivertestService.getByUserId(userId);
        return ResponseEntity.ok(ApiResponse.success(drivertests));
    }

    // API cho người dùng tự xem danh sách của mình
    @GetMapping("/my-requests")
    public ResponseEntity<ApiResponse<List<DrivertestResponse>>> getMyDrivertests() {
        List<DrivertestResponse> drivertests = drivertestService.getMyDrivertests();
        return ResponseEntity.ok(ApiResponse.success(drivertests));
    }
}