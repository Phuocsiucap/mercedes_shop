package org.example.repository;

import org.example.entity.Order;
import org.example.entity.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends MongoRepository<Order, String> {

    List<Order> findByUser(User user);

    List<Order> findByStatus(Order.OrderStatus status);
}