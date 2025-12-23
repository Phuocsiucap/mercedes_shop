package org.example.repository;


import org.example.entity.Car;
import org.example.entity.Order;
import org.example.entity.OrderDetail;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderDetailRepository extends MongoRepository<OrderDetail, String> {

    List<OrderDetail> findByOrder(Order order);
    
    // Tìm order details theo list orders - tối ưu cho reports
    @Query("{ 'order.$id': { $in: ?0 } }")
    List<OrderDetail> findByOrderIdIn(List<String> orderIds);
    
    // Tìm order details theo car
    List<OrderDetail> findByCar(Car car);
    
    // Count order details by car
    long countByCar(Car car);
}