package org.example.mapper;

import org.example.dto.response.AdminUserResponse;
import org.example.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(target = "totalOrders", source = ".", qualifiedByName = "calculateTotalOrders")
    @Mapping(target = "totalReviews", source = ".", qualifiedByName = "calculateTotalReviews")
    @Mapping(target = "status", constant = "ACTIVE")
    @Mapping(target = "isEmailVerified", source = "verified")
    @Mapping(target = "lastLoginAt", ignore = true) // This would need to be tracked separately
    AdminUserResponse toAdminUserResponse(User user);

    @Named("calculateTotalOrders")
    default Integer calculateTotalOrders(User user) {
        // This would need to be calculated from orders
        // For now, return 0 as placeholder
        return 0;
    }

    @Named("calculateTotalReviews")
    default Integer calculateTotalReviews(User user) {
        // This would need to be calculated from reviews
        // For now, return 0 as placeholder
        return 0;
    }
}