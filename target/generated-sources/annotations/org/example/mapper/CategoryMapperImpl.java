package org.example.mapper;

import javax.annotation.processing.Generated;
import org.example.dto.response.CategoryResponse;
import org.example.entity.Category;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-12-23T23:37:01+0700",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 23.0.2 (Amazon.com Inc.)"
)
@Component
public class CategoryMapperImpl implements CategoryMapper {

    @Override
    public CategoryResponse toCategoryResponse(Category category) {
        if ( category == null ) {
            return null;
        }

        CategoryResponse.CategoryResponseBuilder categoryResponse = CategoryResponse.builder();

        categoryResponse.id( category.getId() );
        categoryResponse.name( category.getName() );
        categoryResponse.description( category.getDescription() );
        categoryResponse.image( category.getImage() );

        return categoryResponse.build();
    }

    @Override
    public Category toCategory(CategoryResponse categoryResponse) {
        if ( categoryResponse == null ) {
            return null;
        }

        Category category = new Category();

        category.setId( categoryResponse.getId() );
        category.setName( categoryResponse.getName() );
        category.setDescription( categoryResponse.getDescription() );
        category.setImage( categoryResponse.getImage() );

        return category;
    }
}
