package org.example.repository;

import org.example.entity.Drivertest;
import org.example.entity.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DrivertestRepository extends MongoRepository<Drivertest, String> {
    List<Drivertest> findByUserId(User user);

    List<Drivertest> findByCarId(String carId);
}