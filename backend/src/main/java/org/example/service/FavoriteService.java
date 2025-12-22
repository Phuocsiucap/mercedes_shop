package org.example.service;

import org.example.dto.response.FavoriteResponse;
import org.example.entity.Car;
import org.example.entity.Favorite;
import org.example.entity.User;
import org.example.exception.BadRequestException;
import org.example.exception.ResourceNotFoundException;
import org.example.repository.FavoriteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class FavoriteService {

    @Autowired
    private FavoriteRepository favoriteRepository;

    @Autowired
    private CarService carService;

    @Autowired
    private AuthService authService;

    public List<FavoriteResponse> getUserFavorites() {
        User currentUser = authService.getCurrentUser();
        return favoriteRepository.findByUser(currentUser).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public FavoriteResponse addFavorite(String carId) {
        User currentUser = authService.getCurrentUser();
        Car car = carService.getCarEntityById(carId);

        // Check if already favorited
        if (favoriteRepository.existsByUserAndCar(currentUser, car)) {
            throw new BadRequestException("Xe này đã có trong danh sách yêu thích");
        }

        Favorite favorite = new Favorite();
        favorite.setUser(currentUser);
        favorite.setCar(car);
        favorite.setAddedAt(LocalDateTime.now());

        Favorite savedFavorite = favoriteRepository.save(favorite);
        return mapToResponse(savedFavorite);
    }

    public void removeFavorite(String favoriteId) {
        User currentUser = authService.getCurrentUser();
        Favorite favorite = favoriteRepository.findById(favoriteId)
                .orElseThrow(() -> new ResourceNotFoundException("Yêu thích", "id", favoriteId));

        // Check if user owns this favorite
        if (!favorite.getUser().getId().equals(currentUser.getId())) {
            throw new BadRequestException("Bạn không có quyền xóa mục yêu thích này");
        }

        favoriteRepository.delete(favorite);
    }

    public void removeFavoriteByCarId(String carId) {
        User currentUser = authService.getCurrentUser();
        Car car = carService.getCarEntityById(carId);

        Favorite favorite = favoriteRepository.findByUserAndCar(currentUser, car)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy xe trong danh sách yêu thích"));

        favoriteRepository.delete(favorite);
    }

    public boolean isCarFavorited(String carId) {
        User currentUser = authService.getCurrentUser();
        Car car = carService.getCarEntityById(carId);
        return favoriteRepository.existsByUserAndCar(currentUser, car);
    }

    private FavoriteResponse mapToResponse(Favorite favorite) {
        return FavoriteResponse.builder()
                .id(favorite.getId())
                .userId(favorite.getUser().getId())
                .carId(favorite.getCar().getId())
                .carName(favorite.getCar().getName())
                .carPrice(favorite.getCar().getPrice())
                .carImage(favorite.getCar().getImages().get(0))
                .carColor(favorite.getCar().getColor())
                .carSeats(favorite.getCar().getSeats())
                .addedAt(favorite.getAddedAt())
                .build();
    }
}
