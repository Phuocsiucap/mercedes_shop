package org.example.mapper;

import java.math.BigDecimal;
import java.util.List;
import javax.annotation.processing.Generated;
import org.example.dto.response.FavoriteResponse;
import org.example.entity.Car;
import org.example.entity.Favorite;
import org.example.entity.User;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-12-23T23:03:07+0700",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 23.0.2 (Amazon.com Inc.)"
)
@Component
public class FavoriteMapperImpl implements FavoriteMapper {

    @Override
    public FavoriteResponse toFavoriteResponse(Favorite favorite) {
        if ( favorite == null ) {
            return null;
        }

        FavoriteResponse.FavoriteResponseBuilder favoriteResponse = FavoriteResponse.builder();

        favoriteResponse.userId( favoriteUserId( favorite ) );
        favoriteResponse.carId( favoriteCarId( favorite ) );
        favoriteResponse.carName( favoriteCarName( favorite ) );
        favoriteResponse.carPrice( favoriteCarPrice( favorite ) );
        favoriteResponse.carImage( getFirstImage( favoriteCarImages( favorite ) ) );
        favoriteResponse.carColor( favoriteCarColor( favorite ) );
        favoriteResponse.carSeats( favoriteCarSeats( favorite ) );
        favoriteResponse.addedAt( favorite.getAddedAt() );
        favoriteResponse.id( favorite.getId() );

        return favoriteResponse.build();
    }

    private String favoriteUserId(Favorite favorite) {
        if ( favorite == null ) {
            return null;
        }
        User user = favorite.getUser();
        if ( user == null ) {
            return null;
        }
        String id = user.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }

    private String favoriteCarId(Favorite favorite) {
        if ( favorite == null ) {
            return null;
        }
        Car car = favorite.getCar();
        if ( car == null ) {
            return null;
        }
        String id = car.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }

    private String favoriteCarName(Favorite favorite) {
        if ( favorite == null ) {
            return null;
        }
        Car car = favorite.getCar();
        if ( car == null ) {
            return null;
        }
        String name = car.getName();
        if ( name == null ) {
            return null;
        }
        return name;
    }

    private BigDecimal favoriteCarPrice(Favorite favorite) {
        if ( favorite == null ) {
            return null;
        }
        Car car = favorite.getCar();
        if ( car == null ) {
            return null;
        }
        BigDecimal price = car.getPrice();
        if ( price == null ) {
            return null;
        }
        return price;
    }

    private List<String> favoriteCarImages(Favorite favorite) {
        if ( favorite == null ) {
            return null;
        }
        Car car = favorite.getCar();
        if ( car == null ) {
            return null;
        }
        List<String> images = car.getImages();
        if ( images == null ) {
            return null;
        }
        return images;
    }

    private String favoriteCarColor(Favorite favorite) {
        if ( favorite == null ) {
            return null;
        }
        Car car = favorite.getCar();
        if ( car == null ) {
            return null;
        }
        String color = car.getColor();
        if ( color == null ) {
            return null;
        }
        return color;
    }

    private Integer favoriteCarSeats(Favorite favorite) {
        if ( favorite == null ) {
            return null;
        }
        Car car = favorite.getCar();
        if ( car == null ) {
            return null;
        }
        Integer seats = car.getSeats();
        if ( seats == null ) {
            return null;
        }
        return seats;
    }
}
