package org.example.repository;

import org.example.entity.Car;
import org.example.entity.Review;
import org.example.entity.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends MongoRepository<Review, String> {

    List<Review> findByCar(Car car);

    List<Review> findByUser(User user);
}