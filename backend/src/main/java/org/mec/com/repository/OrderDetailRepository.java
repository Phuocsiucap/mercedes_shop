package org.mec.com.repository;


import org.mec.com.entity.Order;
import org.mec.com.entity.OrderDetail;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderDetailRepository extends MongoRepository<OrderDetail, String> {

    List<OrderDetail> findByOrder(Order order);
}