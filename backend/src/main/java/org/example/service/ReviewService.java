package org.example.service;

import org.example.dto.request.ReviewRequest;
import org.example.dto.response.ApiResponse;
import org.example.dto.response.ReviewResponse;
import org.example.entity.Car;
import org.example.entity.Review;
import org.example.entity.User;
import org.example.exception.BadRequestException;
import org.example.exception.ResourceNotFoundException;
import org.example.repository.CarRepository;
import org.example.repository.ReviewRepository;
import org.example.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.validation.Valid;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CarRepository carRepository;

    /**
     * Lấy đánh giá theo xe
     */
    public List<ReviewResponse> getReviewsByCarId(String carId) {
        Car car = carRepository.findById(carId)
            .orElseThrow(() -> new ResourceNotFoundException("Car not found"));

        List<Review> reviews = reviewRepository.findByCar(car);
        
        return reviews.stream()
            .map(this::toReviewResponse)
            .collect(Collectors.toList());
    }

    /**
     * Lấy chi tiết đánh giá
     */
    public ReviewResponse getReviewById(String reviewId) {
        Review review = reviewRepository.findById(reviewId)
            .orElseThrow(() -> new ResourceNotFoundException("Review not found"));

        return toReviewResponse(review);
    }

    /**
     * Tạo đánh giá mới
     */
    public ApiResponse<ReviewResponse> createReview(String userId, @Valid ReviewRequest reviewRequest) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Car car = carRepository.findById(reviewRequest.getCarId())
            .orElseThrow(() -> new ResourceNotFoundException("Car not found"));

        // Kiểm tra user đã đánh giá xe này chưa
        if (reviewRepository.existsByUserAndCar(user, car)) {
            throw new BadRequestException("Bạn đã đánh giá xe này rồi");
        }

        Review review = new Review();
        review.setUser(user);
        review.setCar(car);
        review.setRating(reviewRequest.getRating());
        review.setContent(reviewRequest.getComment());
        review.setCreatedAt(LocalDateTime.now());

        Review savedReview = reviewRepository.save(review);

        return ApiResponse.<ReviewResponse>builder()
            .success(true)
            .message("Đánh giá đã được thêm thành công")
            .data(toReviewResponse(savedReview))
            .timestamp(LocalDateTime.now())
            .build();
    }

    /**
     * Cập nhật đánh giá
     */
    public ApiResponse<ReviewResponse> updateReview(String userId, String reviewId, @Valid ReviewRequest reviewRequest) {
        Review review = reviewRepository.findById(reviewId)
            .orElseThrow(() -> new ResourceNotFoundException("Review not found"));

        // Verify ownership
        if (!review.getUser().getId().equals(userId)) {
            throw new BadRequestException("Bạn không có quyền sửa đánh giá này");
        }

        review.setRating(reviewRequest.getRating());
        review.setContent(reviewRequest.getComment());

        Review updatedReview = reviewRepository.save(review);

        return ApiResponse.<ReviewResponse>builder()
            .success(true)
            .message("Cập nhật đánh giá thành công")
            .data(toReviewResponse(updatedReview))
            .timestamp(LocalDateTime.now())
            .build();
    }

    /**
     * Xóa đánh giá
     */
    public ApiResponse<String> deleteReview(String userId, String reviewId) {
        Review review = reviewRepository.findById(reviewId)
            .orElseThrow(() -> new ResourceNotFoundException("Review not found"));

        // Verify ownership
        if (!review.getUser().getId().equals(userId)) {
            throw new BadRequestException("Bạn không có quyền xóa đánh giá này");
        }

        reviewRepository.delete(review);

        return ApiResponse.<String>builder()
            .success(true)
            .message("Xóa đánh giá thành công")
            .data("Review deleted")
            .timestamp(LocalDateTime.now())
            .build();
    }

    /**
     * [Admin] Lấy tất cả đánh giá
     */
    public Page<ReviewResponse> getAllReviews(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Review> reviews = reviewRepository.findAll(pageable);
        
        return reviews.map(this::toReviewResponse);
    }

    /**
     * [Admin] Xóa đánh giá
     */
    public ApiResponse<String> adminDeleteReview(String reviewId) {
        Review review = reviewRepository.findById(reviewId)
            .orElseThrow(() -> new ResourceNotFoundException("Review not found"));

        reviewRepository.delete(review);

        return ApiResponse.<String>builder()
            .success(true)
            .message("Xóa đánh giá thành công")
            .data("Review deleted")
            .timestamp(LocalDateTime.now())
            .build();
    }

    private ReviewResponse toReviewResponse(Review review) {
        ReviewResponse response = new ReviewResponse();
        response.setId(review.getId());
        response.setUserId(review.getUser().getId());
        response.setUserName(review.getUser().getFullName());
        response.setCarId(review.getCar().getId());
        response.setRating(review.getRating());
        response.setContent(review.getContent());
        response.setCreatedAt(review.getCreatedAt());
        return response;
    }
}
