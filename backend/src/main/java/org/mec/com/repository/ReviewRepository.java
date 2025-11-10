package org.mec.com.repository;

import org.mec.com.entity.Car;
import org.mec.com.entity.Review;
import org.mec.com.entity.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends MongoRepository<Review, String> {

    List<Review> findByCar(Car car);

    List<Review> findByUser(User user);
}