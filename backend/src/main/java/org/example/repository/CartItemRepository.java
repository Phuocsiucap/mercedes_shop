package org.example.repository;

import org.example.entity.Cart;
import org.example.entity.CartItem;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartItemRepository extends MongoRepository<CartItem, String> {
    List<CartItem> findByCart(Cart cart);

    Optional<CartItem> findByCartAndCarId(Cart cart, String carId);

    void deleteByCart(Cart cart);
}
