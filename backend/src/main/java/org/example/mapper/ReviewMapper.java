package org.example.mapper;

import org.example.dto.response.ReviewResponse;
import org.example.entity.Review;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ReviewMapper {

    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "userName", source = "user.fullName")
    @Mapping(target = "carId", source = "car.id")
    @Mapping(target = "carName", source = "car.name")
    @Mapping(target = "content", source = "content")
    ReviewResponse toReviewResponse(Review review);
}