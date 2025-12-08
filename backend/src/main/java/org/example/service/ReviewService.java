package org.example.service;

import org.example.dto.request.ReviewRequest;
import org.example.dto.response.ReviewResponse;
import org.example.entity.Car;
import org.example.entity.Review;
import org.example.entity.User;
import org.example.exception.BadRequestException;
import org.example.exception.ResourceNotFoundException;
import org.example.repository.ReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private CarService carService;

    @Autowired
    private AuthService authService;

    public List<ReviewResponse> getReviewsByCarId(String carId) {
        Car car = carService.getCarEntityById(carId);
        return reviewRepository.findByCar(car).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<ReviewResponse> getReviewsByUserId(String userId) {
        User user = new User();
        user.setId(userId);
        return reviewRepository.findByUser(user).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public ReviewResponse createReview(ReviewRequest request) {
        User currentUser = authService.getCurrentUser();
        Car car = carService.getCarEntityById(request.getCarId());

        // Validate rating
        if (request.getRating() < 1 || request.getRating() > 5) {
            throw new BadRequestException("Đánh giá phải từ 1 đến 5 sao");
        }

        Review review = new Review();
        review.setUser(currentUser);
        review.setCar(car);
        review.setContent(request.getContent());
        review.setRating(request.getRating());
        review.setCreatedAt(LocalDateTime.now());

        Review savedReview = reviewRepository.save(review);
        return mapToResponse(savedReview);
    }

    public void deleteReview(String id) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Đánh giá", "id", id));

        User currentUser = authService.getCurrentUser();

        // Check if user is the owner of the review or admin
        if (!review.getUser().getId().equals(currentUser.getId()) &&
            currentUser.getRole() != User.Role.ADMIN) {
            throw new BadRequestException("Bạn không có quyền xóa đánh giá này");
        }

        reviewRepository.delete(review);
    }

    public List<ReviewResponse> getAllReviews() {
        return reviewRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private ReviewResponse mapToResponse(Review review) {
        return ReviewResponse.builder()
                .id(review.getId())
                .userId(review.getUser().getId())
                .userName(review.getUser().getFullName())
                .carId(review.getCar().getId())
                .carName(review.getCar().getName())
                .content(review.getContent())
                .rating(review.getRating())
                .createdAt(review.getCreatedAt())
                .build();
    }
}
