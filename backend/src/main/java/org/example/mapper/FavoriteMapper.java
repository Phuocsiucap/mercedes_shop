package org.example.mapper;

import org.example.dto.response.FavoriteResponse;
import org.example.entity.Favorite;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.util.List;

@Mapper(componentModel = "spring")
public interface FavoriteMapper {

    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "carId", source = "car.id")
    @Mapping(target = "carName", source = "car.name")
    @Mapping(target = "carPrice", source = "car.price")
    @Mapping(target = "carImage", source = "car.images", qualifiedByName = "getFirstImage")
    @Mapping(target = "carColor", source = "car.color")
    @Mapping(target = "carSeats", source = "car.seats")
    @Mapping(target = "addedAt", source = "addedAt")
    FavoriteResponse toFavoriteResponse(Favorite favorite);

    @Named("getFirstImage")
    default String getFirstImage(List<String> images) {
        return images != null && !images.isEmpty() ? images.get(0) : null;
    }
}