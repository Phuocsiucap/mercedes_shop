package org.mec.com.repository;

import org.mec.com.entity.Car;
import org.mec.com.entity.Favorite;
import org.mec.com.entity.User;
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