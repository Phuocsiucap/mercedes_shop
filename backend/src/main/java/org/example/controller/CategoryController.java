package org.example.controller;

import org.example.dto.request.CategoryRequest;
import org.example.dto.response.ApiResponse;
import org.example.dto.response.CategoryResponse;
import org.example.service.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/categories")
@CrossOrigin(origins = "*", maxAge = 3600)
public class CategoryController {

    @Autowired
    private CategoryService categoryService;

    /**
     * Lấy tất cả danh mục
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getAllCategories() {
        try {
            List<CategoryResponse> categories = categoryService.getAllCategories();
            
            return ResponseEntity.ok(ApiResponse.<List<CategoryResponse>>builder()
                .success(true)
                .message("Lấy danh sách danh mục thành công")
                .data(categories)
                .timestamp(LocalDateTime.now())
                .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.<List<CategoryResponse>>builder()
                .success(false)
                .message("Lỗi: " + e.getMessage())
                .timestamp(LocalDateTime.now())
                .build());
        }
    }

    /**
     * Lấy chi tiết danh mục
     */
    @GetMapping("/{categoryId}")
    public ResponseEntity<ApiResponse<CategoryResponse>> getCategoryById(
            @PathVariable String categoryId) {
        try {
            CategoryResponse category = categoryService.getCategoryById(categoryId);
            
            return ResponseEntity.ok(ApiResponse.<CategoryResponse>builder()
                .success(true)
                .message("Lấy chi tiết danh mục thành công")
                .data(category)
                .timestamp(LocalDateTime.now())
                .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.<CategoryResponse>builder()
                .success(false)
                .message("Lỗi: " + e.getMessage())
                .timestamp(LocalDateTime.now())
                .build());
        }
    }

    /**
     * [Admin] Tạo danh mục mới
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CategoryResponse>> createCategory(
            @Valid @RequestBody CategoryRequest categoryRequest) {
        try {
            ApiResponse<CategoryResponse> response = categoryService.createCategory(categoryRequest);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.<CategoryResponse>builder()
                .success(false)
                .message("Lỗi: " + e.getMessage())
                .timestamp(LocalDateTime.now())
                .build());
        }
    }

    /**
     * [Admin] Cập nhật danh mục
     */
    @PutMapping("/{categoryId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CategoryResponse>> updateCategory(
            @PathVariable String categoryId,
            @Valid @RequestBody CategoryRequest categoryRequest) {
        try {
            ApiResponse<CategoryResponse> response = categoryService.updateCategory(
                categoryId, categoryRequest);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.<CategoryResponse>builder()
                .success(false)
                .message("Lỗi: " + e.getMessage())
                .timestamp(LocalDateTime.now())
                .build());
        }
    }

    /**
     * [Admin] Xóa danh mục
     */
    @DeleteMapping("/{categoryId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> deleteCategory(
            @PathVariable String categoryId) {
        try {
            ApiResponse<String> response = categoryService.deleteCategory(categoryId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.<String>builder()
                .success(false)
                .message("Lỗi: " + e.getMessage())
                .timestamp(LocalDateTime.now())
                .build());
        }
    }
}
