package org.example.mapper;

import org.example.dto.response.CartItemResponse;
import org.example.dto.response.CartResponse;
import org.example.entity.Cart;
import org.example.entity.CartItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.math.BigDecimal;
import java.util.List;

@Mapper(componentModel = "spring", uses = {CarMapper.class})
public interface CartMapper {

    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "items", ignore = true)
    @Mapping(target = "totalAmount", source = ".", qualifiedByName = "calculateTotalAmount")
    @Mapping(target = "totalItems", source = ".", qualifiedByName = "calculateTotalItems")
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    CartResponse toCartResponse(Cart cart);

    @Mapping(target = "car", source = "car")
    @Mapping(target = "subTotal", source = ".", qualifiedByName = "calculateSubTotal")
    CartItemResponse toCartItemResponse(CartItem cartItem);

    @Named("calculateTotalAmount")
    default BigDecimal calculateTotalAmount(Cart cart) {
        // For now, return the totalAmount from cart entity
        return cart.getTotalAmount() != null ? cart.getTotalAmount() : BigDecimal.ZERO;
    }

    @Named("calculateTotalItems")
    default Integer calculateTotalItems(Cart cart) {
        // For now, return 0 as placeholder since cartItems are not directly linked to cart
        return 0;
    }

    @Named("calculateSubTotal")
    default BigDecimal calculateSubTotal(CartItem cartItem) {
        return cartItem.getCar().getPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity()));
    }
}