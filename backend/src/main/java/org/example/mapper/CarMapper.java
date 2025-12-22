package org.example.mapper;

import org.example.dto.response.AdminCarResponse;
import org.example.dto.response.CarResponse;
import org.example.entity.Car;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

@Mapper(componentModel = "spring", uses = {CategoryMapper.class})
public interface CarMapper {

    @Mapping(target = "category", source = "category")
    @Mapping(target = "averageRating", source = ".", qualifiedByName = "calculateAverageRating")
    @Mapping(target = "reviewCount", source = ".", qualifiedByName = "calculateReviewCount")
    CarResponse toCarResponse(Car car);

    @Mapping(target = "categoryId", source = "category.id")
    @Mapping(target = "categoryName", source = "category.name")
    @Mapping(target = "averageRating", source = ".", qualifiedByName = "calculateAverageRating")
    @Mapping(target = "reviewCount", source = ".", qualifiedByName = "calculateReviewCount")
    @Mapping(target = "totalOrders", source = ".", qualifiedByName = "calculateTotalOrders")
    @Mapping(target = "status", constant = "ACTIVE")
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    AdminCarResponse toAdminCarResponse(Car car);

    @Named("calculateAverageRating")
    default Double calculateAverageRating(Car car) {
        // For now, return 0.0 as placeholder since reviews are not directly linked to car
        return 0.0;
    }

    @Named("calculateReviewCount")
    default Integer calculateReviewCount(Car car) {
        // For now, return 0 as placeholder since reviews are not directly linked to car
        return 0;
    }

    @Named("calculateTotalOrders")
    default Integer calculateTotalOrders(Car car) {
        // This would need to be calculated from order details
        // For now, return 0 as placeholder
        return 0;
    }
}