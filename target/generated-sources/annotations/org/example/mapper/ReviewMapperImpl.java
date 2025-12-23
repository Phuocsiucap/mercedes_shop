package org.example.mapper;

import javax.annotation.processing.Generated;
import org.example.dto.response.ReviewResponse;
import org.example.entity.Car;
import org.example.entity.Review;
import org.example.entity.User;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-12-23T23:03:07+0700",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 23.0.2 (Amazon.com Inc.)"
)
@Component
public class ReviewMapperImpl implements ReviewMapper {

    @Override
    public ReviewResponse toReviewResponse(Review review) {
        if ( review == null ) {
            return null;
        }

        ReviewResponse.ReviewResponseBuilder reviewResponse = ReviewResponse.builder();

        reviewResponse.userId( reviewUserId( review ) );
        reviewResponse.userName( reviewUserFullName( review ) );
        reviewResponse.carId( reviewCarId( review ) );
        reviewResponse.carName( reviewCarName( review ) );
        reviewResponse.content( review.getContent() );
        reviewResponse.id( review.getId() );
        reviewResponse.rating( review.getRating() );
        reviewResponse.createdAt( review.getCreatedAt() );

        return reviewResponse.build();
    }

    private String reviewUserId(Review review) {
        if ( review == null ) {
            return null;
        }
        User user = review.getUser();
        if ( user == null ) {
            return null;
        }
        String id = user.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }

    private String reviewUserFullName(Review review) {
        if ( review == null ) {
            return null;
        }
        User user = review.getUser();
        if ( user == null ) {
            return null;
        }
        String fullName = user.getFullName();
        if ( fullName == null ) {
            return null;
        }
        return fullName;
    }

    private String reviewCarId(Review review) {
        if ( review == null ) {
            return null;
        }
        Car car = review.getCar();
        if ( car == null ) {
            return null;
        }
        String id = car.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }

    private String reviewCarName(Review review) {
        if ( review == null ) {
            return null;
        }
        Car car = review.getCar();
        if ( car == null ) {
            return null;
        }
        String name = car.getName();
        if ( name == null ) {
            return null;
        }
        return name;
    }
}
