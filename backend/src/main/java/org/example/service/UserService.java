package org.example.service;

import org.example.dto.request.UpdateProfileRequest;
import org.example.dto.request.FavoriteRequest;
import org.example.dto.response.ApiResponse;
import org.example.dto.response.OrderResponse;
import org.example.dto.response.FavoriteResponse;
import org.example.entity.User;
import org.example.entity.Car;
import org.example.entity.Order;
import org.example.entity.OrderDetail;
import org.example.entity.Favorite;
import org.example.exception.BadRequestException;
import org.example.exception.ResourceNotFoundException;
import org.example.repository.UserRepository;
import org.example.repository.CarRepository;
import org.example.repository.OrderRepository;
import org.example.repository.OrderDetailRepository;
import org.example.repository.FavoriteRepository;
import org.example.mapper.OrderMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.validation.Valid;
import java.util.List;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CarRepository carRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderDetailRepository orderDetailRepository;

    @Autowired
    private FavoriteRepository favoriteRepository;

    @Autowired
    private OrderMapper orderMapper;

    public User getUserProfile(String userId) {
        return userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
    }

    public ApiResponse<User> updateProfile(String userId, @Valid UpdateProfileRequest updateRequest) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        // Update user fields if provided
        if (updateRequest.getFullName() != null && !updateRequest.getFullName().trim().isEmpty()) {
            user.setFullName(updateRequest.getFullName().trim());
        }

        if (updateRequest.getPhoneNumber() != null && !updateRequest.getPhoneNumber().trim().isEmpty()) {
            // Check if phone number is already taken by another user
            if (userRepository.existsByPhoneNumber(updateRequest.getPhoneNumber()) && 
                !updateRequest.getPhoneNumber().equals(user.getPhoneNumber())) {
                throw new BadRequestException("Số điện thoại đã được sử dụng bởi người dùng khác");
            }
            user.setPhoneNumber(updateRequest.getPhoneNumber().trim());
        }

        if (updateRequest.getAddress() != null && !updateRequest.getAddress().trim().isEmpty()) {
            user.setAddress(updateRequest.getAddress().trim());
        }

        User updatedUser = userRepository.save(user);

        return ApiResponse.<User>builder()
            .success(true)
            .message("Cập nhật thông tin thành công")
            .data(updatedUser)
            .timestamp(LocalDateTime.now())
            .build();
    }

    public List<OrderResponse> getUserOrders(String userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        List<Order> orders = orderRepository.findByUser(user);
        
        return orders.stream()
            .map(order -> {
                // Fetch order details for each order
                List<OrderDetail> orderDetails = orderDetailRepository.findByOrder(order);
                
                // Map order to response
                OrderResponse orderResponse = orderMapper.toOrderResponse(order);
                
                // Map order details
                List<OrderResponse.OrderDetailResponse> orderDetailResponses = orderDetails.stream()
                    .map(orderMapper::toOrderDetailResponse)
                    .collect(Collectors.toList());
                
                orderResponse.setOrderDetails(orderDetailResponses);
                
                return orderResponse;
            })
            .collect(Collectors.toList());
    }

    public OrderResponse getUserOrder(String userId, String orderId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        // Verify that the order belongs to the user
        if (!order.getUser().getId().equals(userId)) {
            throw new BadRequestException("Bạn không có quyền xem đơn hàng này");
        }

        // Fetch order details
        List<OrderDetail> orderDetails = orderDetailRepository.findByOrder(order);
        
        // Map order to response
        OrderResponse orderResponse = orderMapper.toOrderResponse(order);
        
        // Map order details
        List<OrderResponse.OrderDetailResponse> orderDetailResponses = orderDetails.stream()
            .map(orderMapper::toOrderDetailResponse)
            .collect(Collectors.toList());
        
        orderResponse.setOrderDetails(orderDetailResponses);
        
        return orderResponse;
    }

    public List<FavoriteResponse> getUserFavorites(String userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        List<Favorite> favorites = favoriteRepository.findByUser(user);
        
        return favorites.stream()
            .map(this::toFavoriteResponse)
            .collect(Collectors.toList());
    }

    public ApiResponse<FavoriteResponse> addToFavorites(String userId, @Valid FavoriteRequest favoriteRequest) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Car car = carRepository.findById(favoriteRequest.getCarId())
            .orElseThrow(() -> new ResourceNotFoundException("Car not found with id: " + favoriteRequest.getCarId()));

        // Check if already in favorites
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

    public ApiResponse<String> removeFromFavorites(String userId, String carId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Car car = carRepository.findById(carId)
            .orElseThrow(() -> new ResourceNotFoundException("Car not found with id: " + carId));

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

    public boolean isCarInFavorites(String userId, String carId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Car car = carRepository.findById(carId)
            .orElseThrow(() -> new ResourceNotFoundException("Car not found with id: " + carId));

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