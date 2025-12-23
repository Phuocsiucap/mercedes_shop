package org.example.mapper;

import org.example.dto.response.CategoryResponse;
import org.example.entity.Category;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CategoryMapper {

    CategoryResponse toCategoryResponse(Category category);
    
    Category toCategory(CategoryResponse categoryResponse);
}