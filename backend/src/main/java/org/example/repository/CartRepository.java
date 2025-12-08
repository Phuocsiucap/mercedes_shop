package org.example.repository;

import org.example.entity.Cart;
import org.example.entity.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CartRepository extends MongoRepository<Cart, String> {
    Optional<Cart> findByUser(User user);

    Optional<Cart> findByUser_Id(String userId);
}
