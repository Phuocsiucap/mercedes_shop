package org.example.mapper;

import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.example.dto.response.AdminCarResponse;
import org.example.dto.response.CarResponse;
import org.example.entity.Car;
import org.example.entity.Category;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-12-23T23:37:01+0700",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 23.0.2 (Amazon.com Inc.)"
)
@Component
public class CarMapperImpl implements CarMapper {

    @Autowired
    private CategoryMapper categoryMapper;

    @Override
    public CarResponse toCarResponse(Car car) {
        if ( car == null ) {
            return null;
        }

        CarResponse.CarResponseBuilder carResponse = CarResponse.builder();

        carResponse.category( categoryMapper.toCategoryResponse( car.getCategory() ) );
        carResponse.averageRating( calculateAverageRating( car ) );
        carResponse.reviewCount( calculateReviewCount( car ) );
        carResponse.id( car.getId() );
        carResponse.name( car.getName() );
        carResponse.price( car.getPrice() );
        carResponse.manufactureYear( car.getManufactureYear() );
        carResponse.color( car.getColor() );
        carResponse.engine( car.getEngine() );
        carResponse.transmission( car.getTransmission() );
        carResponse.seats( car.getSeats() );
        carResponse.description( car.getDescription() );
        List<String> list = car.getImages();
        if ( list != null ) {
            carResponse.images( new ArrayList<String>( list ) );
        }

        return carResponse.build();
    }

    @Override
    public AdminCarResponse toAdminCarResponse(Car car) {
        if ( car == null ) {
            return null;
        }

        AdminCarResponse.AdminCarResponseBuilder adminCarResponse = AdminCarResponse.builder();

        adminCarResponse.categoryId( carCategoryId( car ) );
        adminCarResponse.categoryName( carCategoryName( car ) );
        adminCarResponse.averageRating( calculateAverageRating( car ) );
        adminCarResponse.reviewCount( calculateReviewCount( car ) );
        adminCarResponse.totalOrders( calculateTotalOrders( car ) );
        adminCarResponse.id( car.getId() );
        adminCarResponse.name( car.getName() );
        adminCarResponse.price( car.getPrice() );
        adminCarResponse.manufactureYear( car.getManufactureYear() );
        adminCarResponse.color( car.getColor() );
        adminCarResponse.engine( car.getEngine() );
        adminCarResponse.transmission( car.getTransmission() );
        adminCarResponse.seats( car.getSeats() );
        List<String> list = car.getImages();
        if ( list != null ) {
            adminCarResponse.images( new ArrayList<String>( list ) );
        }
        adminCarResponse.description( car.getDescription() );

        adminCarResponse.status( "ACTIVE" );

        return adminCarResponse.build();
    }

    private String carCategoryId(Car car) {
        if ( car == null ) {
            return null;
        }
        Category category = car.getCategory();
        if ( category == null ) {
            return null;
        }
        String id = category.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }

    private String carCategoryName(Car car) {
        if ( car == null ) {
            return null;
        }
        Category category = car.getCategory();
        if ( category == null ) {
            return null;
        }
        String name = category.getName();
        if ( name == null ) {
            return null;
        }
        return name;
    }
}
