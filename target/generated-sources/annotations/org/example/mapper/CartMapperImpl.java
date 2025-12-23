package org.example.mapper;

import javax.annotation.processing.Generated;
import org.example.dto.response.CartItemResponse;
import org.example.dto.response.CartResponse;
import org.example.entity.Cart;
import org.example.entity.CartItem;
import org.example.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-12-23T23:37:01+0700",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 23.0.2 (Amazon.com Inc.)"
)
@Component
public class CartMapperImpl implements CartMapper {

    @Autowired
    private CarMapper carMapper;

    @Override
    public CartResponse toCartResponse(Cart cart) {
        if ( cart == null ) {
            return null;
        }

        CartResponse.CartResponseBuilder cartResponse = CartResponse.builder();

        cartResponse.userId( cartUserId( cart ) );
        cartResponse.totalAmount( calculateTotalAmount( cart ) );
        cartResponse.totalItems( calculateTotalItems( cart ) );
        cartResponse.id( cart.getId() );

        return cartResponse.build();
    }

    @Override
    public CartItemResponse toCartItemResponse(CartItem cartItem) {
        if ( cartItem == null ) {
            return null;
        }

        CartItemResponse.CartItemResponseBuilder cartItemResponse = CartItemResponse.builder();

        cartItemResponse.car( carMapper.toCarResponse( cartItem.getCar() ) );
        cartItemResponse.subTotal( calculateSubTotal( cartItem ) );
        cartItemResponse.id( cartItem.getId() );
        cartItemResponse.quantity( cartItem.getQuantity() );

        return cartItemResponse.build();
    }

    private String cartUserId(Cart cart) {
        if ( cart == null ) {
            return null;
        }
        User user = cart.getUser();
        if ( user == null ) {
            return null;
        }
        String id = user.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }
}
