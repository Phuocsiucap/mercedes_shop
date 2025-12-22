package org.example.service;

import org.example.dto.response.ApiResponse;
import org.example.dto.response.FavoriteResponse;
import org.example.entity.Car;
import org.example.entity.Favorite;
import org.example.entity.User;
import org.example.exception.BadRequestException;
import org.example.exception.ResourceNotFoundException;
import org.example.repository.CarRepository;
import org.example.repository.FavoriteRepository;
import org.example.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class FavoriteService {

    @Autowired
    private FavoriteRepository favoriteRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CarRepository carRepository;

    /**
     * Lấy danh sách yêu thích của user
     */
    public List<FavoriteResponse> getMyFavorites(String userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        List<Favorite> favorites = favoriteRepository.findByUser(user);
        
        return favorites.stream()
            .map(this::toFavoriteResponse)
            .collect(Collectors.toList());
    }

    /**
     * Thêm xe vào yêu thích
     */
    public ApiResponse<FavoriteResponse> addFavorite(String userId, String carId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Car car = carRepository.findById(carId)
            .orElseThrow(() -> new ResourceNotFoundException("Car not found"));

        // Kiểm tra đã yêu thích chưa
        if (favoriteRepository.existsByUserAndCar(user, car)) {
            throw new BadRequestException("Xe này đã có trong danh sách yêu thích");
        }

        Favorite favorite = new Favorite();
        favorite.setUser(user);
        favorite.setCar(car);
        favorite.setAddedAt(LocalDateTime.now());

        Favorite savedFavorite = favoriteRepository.save(favorite);

        return ApiResponse.<FavoriteResponse>builder()
            .success(true)
            .message("Đã thêm vào danh sách yêu thích")
            .data(toFavoriteResponse(savedFavorite))
            .timestamp(LocalDateTime.now())
            .build();
    }

    /**
     * Xóa khỏi yêu thích theo favorite ID
     */
    public ApiResponse<String> removeFavorite(String userId, String favoriteId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Favorite favorite = favoriteRepository.findById(favoriteId)
            .orElseThrow(() -> new ResourceNotFoundException("Favorite not found"));

        // Verify ownership
        if (!favorite.getUser().getId().equals(userId)) {
            throw new BadRequestException("Bạn không có quyền xóa mục này");
        }

        favoriteRepository.delete(favorite);

        return ApiResponse.<String>builder()
            .success(true)
            .message("Đã xóa khỏi danh sách yêu thích")
            .data("Removed from favorites")
            .timestamp(LocalDateTime.now())
            .build();
    }

    /**
     * Xóa khỏi yêu thích theo car ID
     */
    public ApiResponse<String> removeFavoriteByCarId(String userId, String carId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Car car = carRepository.findById(carId)
            .orElseThrow(() -> new ResourceNotFoundException("Car not found"));

        Favorite favorite = favoriteRepository.findByUserAndCar(user, car)
            .orElseThrow(() -> new ResourceNotFoundException("Xe này không có trong danh sách yêu thích"));

        favoriteRepository.delete(favorite);

        return ApiResponse.<String>builder()
            .success(true)
            .message("Đã xóa khỏi danh sách yêu thích")
            .data("Removed from favorites")
            .timestamp(LocalDateTime.now())
            .build();
    }

    /**
     * Kiểm tra xe đã được yêu thích chưa
     */
    public boolean checkFavorite(String userId, String carId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Car car = carRepository.findById(carId)
            .orElseThrow(() -> new ResourceNotFoundException("Car not found"));

        return favoriteRepository.existsByUserAndCar(user, car);
    }

    private FavoriteResponse toFavoriteResponse(Favorite favorite) {
        FavoriteResponse response = new FavoriteResponse();
        response.setId(favorite.getId());
        response.setCarId(favorite.getCar().getId());
        response.setCarName(favorite.getCar().getName());
        response.setCarPrice(favorite.getCar().getPrice());
        List<String> images = favorite.getCar().getImages();
        response.setCarImage(images != null && !images.isEmpty() ? images.get(0) : null);
        response.setAddedAt(favorite.getAddedAt());
        return response;
    }
}
