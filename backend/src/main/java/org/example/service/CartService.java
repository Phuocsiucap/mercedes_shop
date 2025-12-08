package org.example.service;

import org.example.dto.request.AddToCartRequest;
import org.example.dto.request.UpdateCartItemRequest;
import org.example.dto.response.CartItemResponse;
import org.example.dto.response.CartResponse;
import org.example.entity.Car;
import org.example.entity.Cart;
import org.example.entity.CartItem;
import org.example.entity.User;
import org.example.repository.CarRepository;
import org.example.repository.CartItemRepository;
import org.example.repository.CartRepository;
import org.example.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CartService {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private CarRepository carRepository;

    @Autowired
    private UserRepository userRepository;

    public CartResponse getCart(String userId) {
        Cart cart = getOrCreateCart(userId);
        return mapToCartResponse(cart);
    }

    @Transactional
    public CartResponse addToCart(String userId, AddToCartRequest request) {
        Cart cart = getOrCreateCart(userId);
        Car car = carRepository.findById(request.getCarId())
                .orElseThrow(() -> new RuntimeException("Car not found"));

        CartItem cartItem = cartItemRepository.findByCartAndCarId(cart, car.getId())
                .orElse(new CartItem(null, cart, car, 0));

        cartItem.setQuantity(cartItem.getQuantity() + request.getQuantity());
        cartItemRepository.save(cartItem);

        updateCartTotal(cart);
        return mapToCartResponse(cart);
    }

    @Transactional
    public CartResponse updateCartItem(String userId, String itemId, UpdateCartItemRequest request) {
        Cart cart = getOrCreateCart(userId);
        CartItem cartItem = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));

        if (!cartItem.getCart().getId().equals(cart.getId())) {
            throw new RuntimeException("Item does not belong to user's cart");
        }

        cartItem.setQuantity(request.getQuantity());
        cartItemRepository.save(cartItem);

        updateCartTotal(cart);
        return mapToCartResponse(cart);
    }

    @Transactional
    public void removeCartItem(String userId, String itemId) {
        Cart cart = getOrCreateCart(userId);
        CartItem cartItem = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));

        if (!cartItem.getCart().getId().equals(cart.getId())) {
            throw new RuntimeException("Item does not belong to user's cart");
        }

        cartItemRepository.delete(cartItem);
        updateCartTotal(cart);
    }

    @Transactional
    public void clearCart(String userId) {
        Cart cart = getOrCreateCart(userId);
        cartItemRepository.deleteByCart(cart);
        updateCartTotal(cart);
    }

    private Cart getOrCreateCart(String userId) {
        return cartRepository.findByUser_Id(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new RuntimeException("User not found"));
                    Cart cart = new Cart();
                    cart.setUser(user);
                    return cartRepository.save(cart);
                });
    }

    private void updateCartTotal(Cart cart) {
        List<CartItem> items = cartItemRepository.findByCart(cart);
        BigDecimal total = items.stream()
                .map(item -> item.getCar().getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        cart.setTotalAmount(total);
        cartRepository.save(cart);
    }

    private CartResponse mapToCartResponse(Cart cart) {
        List<CartItem> items = cartItemRepository.findByCart(cart);
        List<CartItemResponse> itemResponses = items.stream()
                .map(item -> new CartItemResponse(
                        item.getId(),
                        item.getCar(),
                        item.getQuantity(),
                        item.getCar().getPrice().multiply(BigDecimal.valueOf(item.getQuantity()))))
                .collect(Collectors.toList());

        return new CartResponse(cart.getId(), itemResponses, cart.getTotalAmount());
    }
}
