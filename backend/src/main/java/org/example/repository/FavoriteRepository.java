package org.example.repository;

import org.example.entity.Car;
import org.example.entity.Favorite;
import org.example.entity.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FavoriteRepository extends MongoRepository<Favorite, String> {

    List<Favorite> findByUser(User user);

    Optional<Favorite> findByUserAndCar(User user, Car car);

    boolean existsByUserAndCar(User user, Car car);
}