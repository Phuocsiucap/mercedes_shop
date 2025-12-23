package org.example.controller;

import org.example.dto.response.ApiResponse;
import org.example.service.CloudinaryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/upload")
@CrossOrigin(origins = "*", maxAge = 3600)
public class UploadController {

    @Autowired
    private CloudinaryService cloudinaryService;

    /**
     * Upload single image file
     * POST /api/upload/image
     */
    @PostMapping("/image")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "folder", defaultValue = "general") String folder) {
        try {
            String url = cloudinaryService.uploadFile(file, folder);
            
            ApiResponse<Map<String, String>> response = ApiResponse.<Map<String, String>>builder()
                .success(true)
                .message("Upload ảnh thành công")
                .data(Map.of("url", url))
                .timestamp(LocalDateTime.now())
                .build();
                
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ApiResponse<Map<String, String>> response = ApiResponse.<Map<String, String>>builder()
                .success(false)
                .message("Upload ảnh thất bại: " + e.getMessage())
                .timestamp(LocalDateTime.now())
                .build();
                
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Upload multiple image files
     * POST /api/upload/images
     */
    @PostMapping("/images")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, List<String>>>> uploadImages(
            @RequestParam("files") List<MultipartFile> files,
            @RequestParam(value = "folder", defaultValue = "general") String folder) {
        try {
            List<String> urls = cloudinaryService.uploadFiles(files, folder);
            
            ApiResponse<Map<String, List<String>>> response = ApiResponse.<Map<String, List<String>>>builder()
                .success(true)
                .message("Upload " + urls.size() + " ảnh thành công")
                .data(Map.of("urls", urls))
                .timestamp(LocalDateTime.now())
                .build();
                
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ApiResponse<Map<String, List<String>>> response = ApiResponse.<Map<String, List<String>>>builder()
                .success(false)
                .message("Upload ảnh thất bại: " + e.getMessage())
                .timestamp(LocalDateTime.now())
                .build();
                
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Upload image from URL
     * POST /api/upload/from-url
     */
    @PostMapping("/from-url")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadFromUrl(
            @RequestBody Map<String, String> request) {
        try {
            String imageUrl = request.get("url");
            String folder = request.getOrDefault("folder", "general");
            
            String url = cloudinaryService.uploadFromUrl(imageUrl, folder);
            
            ApiResponse<Map<String, String>> response = ApiResponse.<Map<String, String>>builder()
                .success(true)
                .message("Upload ảnh từ URL thành công")
                .data(Map.of("url", url))
                .timestamp(LocalDateTime.now())
                .build();
                
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ApiResponse<Map<String, String>> response = ApiResponse.<Map<String, String>>builder()
                .success(false)
                .message("Upload ảnh từ URL thất bại: " + e.getMessage())
                .timestamp(LocalDateTime.now())
                .build();
                
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Upload multiple images from URLs
     * POST /api/upload/from-urls
     */
    @PostMapping("/from-urls")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, List<String>>>> uploadFromUrls(
            @RequestBody Map<String, Object> request) {
        try {
            @SuppressWarnings("unchecked")
            List<String> imageUrls = (List<String>) request.get("urls");
            String folder = (String) request.getOrDefault("folder", "general");
            
            List<String> urls = cloudinaryService.uploadFromUrls(imageUrls, folder);
            
            ApiResponse<Map<String, List<String>>> response = ApiResponse.<Map<String, List<String>>>builder()
                .success(true)
                .message("Upload " + urls.size() + " ảnh từ URL thành công")
                .data(Map.of("urls", urls))
                .timestamp(LocalDateTime.now())
                .build();
                
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ApiResponse<Map<String, List<String>>> response = ApiResponse.<Map<String, List<String>>>builder()
                .success(false)
                .message("Upload ảnh từ URL thất bại: " + e.getMessage())
                .timestamp(LocalDateTime.now())
                .build();
                
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Delete image by URL
     * DELETE /api/upload/image
     */
    @DeleteMapping("/image")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> deleteImage(@RequestBody Map<String, String> request) {
        try {
            String imageUrl = request.get("url");
            cloudinaryService.deleteImage(imageUrl);
            
            ApiResponse<String> response = ApiResponse.<String>builder()
                .success(true)
                .message("Xóa ảnh thành công")
                .data("Image deleted")
                .timestamp(LocalDateTime.now())
                .build();
                
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ApiResponse<String> response = ApiResponse.<String>builder()
                .success(false)
                .message("Xóa ảnh thất bại: " + e.getMessage())
                .timestamp(LocalDateTime.now())
                .build();
                
            return ResponseEntity.badRequest().body(response);
        }
    }
}
