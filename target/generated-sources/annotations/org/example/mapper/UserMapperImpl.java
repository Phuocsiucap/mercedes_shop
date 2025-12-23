package org.example.mapper;

import javax.annotation.processing.Generated;
import org.example.dto.response.AdminUserResponse;
import org.example.entity.User;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-12-24T00:01:12+0700",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 23.0.2 (Oracle Corporation)"
)
@Component
public class UserMapperImpl implements UserMapper {

    @Override
    public AdminUserResponse toAdminUserResponse(User user) {
        if ( user == null ) {
            return null;
        }

        AdminUserResponse.AdminUserResponseBuilder adminUserResponse = AdminUserResponse.builder();

        adminUserResponse.totalOrders( calculateTotalOrders( user ) );
        adminUserResponse.totalReviews( calculateTotalReviews( user ) );
        adminUserResponse.isEmailVerified( user.getVerified() );
        adminUserResponse.id( user.getId() );
        adminUserResponse.fullName( user.getFullName() );
        adminUserResponse.email( user.getEmail() );
        adminUserResponse.phoneNumber( user.getPhoneNumber() );
        adminUserResponse.address( user.getAddress() );
        adminUserResponse.role( user.getRole() );
        adminUserResponse.createdAt( user.getCreatedAt() );

        adminUserResponse.status( "ACTIVE" );

        return adminUserResponse.build();
    }
}
