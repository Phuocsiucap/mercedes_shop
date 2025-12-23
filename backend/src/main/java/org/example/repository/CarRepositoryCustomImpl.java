// Tạo file: CarRepositoryCustomImpl.java
package org.example.repository;

import org.example.entity.Car;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Repository;
import org.bson.types.ObjectId; // Thêm import này

    @Repository
public class CarRepositoryCustomImpl implements CarRepositoryCustom {

    @Autowired
    private MongoTemplate mongoTemplate;

    @Override
    public Page<Car> findCarsByFilters(String keyword, String categoryId, BigDecimal minPrice,
                                       BigDecimal maxPrice, Integer year, String color, Pageable pageable) {
        Query query = new Query().with(pageable);
        List<Criteria> criteriaList = new ArrayList<>();

        // 1. Lọc theo từ khóa (Tên xe)
        if (keyword != null && !keyword.trim().isEmpty()) {
            criteriaList.add(Criteria.where("name").regex(keyword, "i"));
        }

        // 2. Lọc theo Danh mục
        if (categoryId != null && !categoryId.trim().isEmpty()) {
            try {
                // Chuyển đổi string ID sang ObjectId để khớp với kiểu dữ liệu trong DB
                ObjectId objId = new ObjectId(categoryId);

                // Thử đường dẫn phổ biến nhất cho DBRef/DocumentReference
                criteriaList.add(Criteria.where("category.$id").is(objId));
            } catch (IllegalArgumentException e) {
                // Nếu categoryId không phải định dạng ObjectId hợp lệ
                criteriaList.add(Criteria.where("category.$id").is(categoryId));
            }
        }

        // 3. Lọc theo khoảng giá
        if (minPrice != null || maxPrice != null) {
            Criteria priceCriteria = Criteria.where("price");
            if (minPrice != null) priceCriteria.gte(minPrice);
            if (maxPrice != null) priceCriteria.lte(maxPrice);
            criteriaList.add(priceCriteria);
        }

        // 4. Lọc theo năm sản xuất
        if (year != null) {
            criteriaList.add(Criteria.where("manufactureYear").is(year));
        }

        // 5. Lọc theo màu sắc
        if (color != null && !color.trim().isEmpty()) {
            criteriaList.add(Criteria.where("color").regex(color, "i"));
        }

        // Kết hợp tất cả criteria bằng phép AND
        if (!criteriaList.isEmpty()) {
            query.addCriteria(new Criteria().andOperator(criteriaList.toArray(new Criteria[0])));
        }

        // Thực hiện đếm tổng số bản ghi và lấy danh sách kết quả
        long total = mongoTemplate.count(Query.of(query).limit(-1).skip(-1), Car.class);
        List<Car> cars = mongoTemplate.find(query, Car.class);

        return new PageImpl<>(cars, pageable, total);
    }
}