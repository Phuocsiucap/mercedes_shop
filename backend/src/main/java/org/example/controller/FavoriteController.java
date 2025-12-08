package org.example.controller;

import org.example.dto.response.ApiResponse;
import org.example.dto.response.FavoriteResponse;
import org.example.service.FavoriteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/favorites")
@CrossOrigin(origins = "*", maxAge = 3600)
@PreAuthorize("isAuthenticated()")
public class FavoriteController {

    @Autowired
    private FavoriteService favoriteService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<FavoriteResponse>>> getUserFavorites() {
        List<FavoriteResponse> favorites = favoriteService.getUserFavorites();
        return ResponseEntity.ok(ApiResponse.success(favorites));
    }

    @PostMapping("/car/{carId}")
    public ResponseEntity<ApiResponse<FavoriteResponse>> addFavorite(@PathVariable String carId) {
        FavoriteResponse favorite = favoriteService.addFavorite(carId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Thêm vào yêu thích thành công", favorite));
    }

    @DeleteMapping("/{favoriteId}")
    public ResponseEntity<ApiResponse<Void>> removeFavorite(@PathVariable String favoriteId) {
        favoriteService.removeFavorite(favoriteId);
        return ResponseEntity.ok(ApiResponse.success("Xóa khỏi yêu thích thành công", null));
    }

    @DeleteMapping("/car/{carId}")
    public ResponseEntity<ApiResponse<Void>> removeFavoriteByCarId(@PathVariable String carId) {
        favoriteService.removeFavoriteByCarId(carId);
        return ResponseEntity.ok(ApiResponse.success("Xóa khỏi yêu thích thành công", null));
    }

    @GetMapping("/car/{carId}/check")
    public ResponseEntity<ApiResponse<Boolean>> isCarFavorited(@PathVariable String carId) {
        boolean isFavorited = favoriteService.isCarFavorited(carId);
        return ResponseEntity.ok(ApiResponse.success(isFavorited));
    }
}
