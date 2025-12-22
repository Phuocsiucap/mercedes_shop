package org.example.service;

import org.example.dto.request.CategoryRequest;
import org.example.dto.response.ApiResponse;
import org.example.dto.response.CategoryResponse;
import org.example.entity.Car;
import org.example.entity.Category;
import org.example.exception.BadRequestException;
import org.example.exception.ResourceNotFoundException;
import org.example.repository.CarRepository;
import org.example.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.validation.Valid;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private CarRepository carRepository;

    /**
     * Lấy tất cả danh mục
     */
    public List<CategoryResponse> getAllCategories() {
        List<Category> categories = categoryRepository.findAll();
        return categories.stream()
            .map(this::toCategoryResponse)
            .collect(Collectors.toList());
    }

    /**
     * Lấy chi tiết danh mục
     */
    public CategoryResponse getCategoryById(String categoryId) {
        Category category = categoryRepository.findById(categoryId)
            .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        return toCategoryResponse(category);
    }

    /**
     * [Admin] Tạo danh mục mới
     */
    public ApiResponse<CategoryResponse> createCategory(@Valid CategoryRequest categoryRequest) {
        if (categoryRepository.existsByName(categoryRequest.getName())) {
            throw new BadRequestException("Danh mục với tên này đã tồn tại");
        }

        Category category = new Category();
        category.setName(categoryRequest.getName());
        category.setDescription(categoryRequest.getDescription());
        category.setImage(categoryRequest.getImage());

        Category savedCategory = categoryRepository.save(category);

        return ApiResponse.<CategoryResponse>builder()
            .success(true)
            .message("Tạo danh mục thành công")
            .data(toCategoryResponse(savedCategory))
            .timestamp(LocalDateTime.now())
            .build();
    }

    /**
     * [Admin] Cập nhật danh mục
     */
    public ApiResponse<CategoryResponse> updateCategory(String categoryId, @Valid CategoryRequest categoryRequest) {
        Category category = categoryRepository.findById(categoryId)
            .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        // Kiểm tra tên đã tồn tại chưa (trừ chính nó)
        if (categoryRepository.existsByName(categoryRequest.getName()) && 
            !categoryRequest.getName().equals(category.getName())) {
            throw new BadRequestException("Danh mục với tên này đã tồn tại");
        }

        category.setName(categoryRequest.getName());
        category.setDescription(categoryRequest.getDescription());
        category.setImage(categoryRequest.getImage());

        Category updatedCategory = categoryRepository.save(category);

        return ApiResponse.<CategoryResponse>builder()
            .success(true)
            .message("Cập nhật danh mục thành công")
            .data(toCategoryResponse(updatedCategory))
            .timestamp(LocalDateTime.now())
            .build();
    }

    /**
     * [Admin] Xóa danh mục
     */
    public ApiResponse<String> deleteCategory(String categoryId) {
        Category category = categoryRepository.findById(categoryId)
            .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        // Kiểm tra có xe trong danh mục không
        List<Car> carsInCategory = carRepository.findByCategory(category, Pageable.unpaged()).getContent();
        if (!carsInCategory.isEmpty()) {
            throw new BadRequestException("Không thể xóa danh mục có chứa xe");
        }

        categoryRepository.delete(category);

        return ApiResponse.<String>builder()
            .success(true)
            .message("Xóa danh mục thành công")
            .data("Category deleted")
            .timestamp(LocalDateTime.now())
            .build();
    }

    private CategoryResponse toCategoryResponse(Category category) {
        // Đếm số xe trong danh mục
        long carCount = carRepository.findByCategory(category, Pageable.unpaged()).getTotalElements();

        return CategoryResponse.builder()
            .id(category.getId())
            .name(category.getName())
            .description(category.getDescription())
            .image(category.getImage())
            .carCount((int) carCount)
            .build();
    }
}
