package org.example.repository;

import org.example.entity.Order;
import org.example.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderRepository extends MongoRepository<Order, String> {

    List<Order> findByUser(User user);

    List<Order> findByStatus(Order.OrderStatus status);

    List<Order> findByUserAndStatus(User user, Order.OrderStatus status);

    Page<Order> findByStatus(Order.OrderStatus status, Pageable pageable);
    
    // Query orders by date range - tối ưu cho reports
    @Query("{ 'orderDate': { $gte: ?0, $lte: ?1 } }")
    List<Order> findByOrderDateBetween(LocalDateTime fromDate, LocalDateTime toDate);
    
    // Count orders by user
    long countByUser(User user);
}