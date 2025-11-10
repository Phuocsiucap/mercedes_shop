package org.mec.com.repository;

import org.mec.com.entity.Order;
import org.mec.com.entity.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends MongoRepository<Order, String> {

    List<Order> findByUser(User user);

    List<Order> findByStatus(Order.OrderStatus status);
}