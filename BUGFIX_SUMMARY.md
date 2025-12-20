# Tóm Tắt Sửa Lỗi MongoDB Query

## Vấn Đề
Lỗi `java.lang.IllegalArgumentException: pattern can not be null` xảy ra khi sử dụng MongoDB `@Query` annotation với `$regex` operator khi tham số là null.

## Nguyên Nhân
- MongoDB không cho phép sử dụng `$regex` với null values
- Các query phức tạp với `$expr: { $eq: [?0, null] }` không hoạt động đúng cách
- Spring Data MongoDB không xử lý null parameters tốt trong @Query annotation

## Giải Pháp Đã Áp Dụng

### 1. Thay Thế @Query Annotation Bằng Criteria API

**Trước (Có lỗi):**
```java
@Query("{ " +
       "$and: [" +
       "  { $or: [ " +
       "    { 'name': { $regex: ?0, $options: 'i' } }, " +
       "    { $expr: { $eq: [?0, null] } } " +
       "  ] } " +
       "] }")
Page<Car> findCarsWithAdvancedFilters(...);
```

**Sau (Đã sửa):**
```java
// Trong Service layer
List<Criteria> criteriaList = new ArrayList<>();

if (keyword != null && !keyword.trim().isEmpty()) {
    Criteria keywordCriteria = new Criteria().orOperator(
        Criteria.where("name").regex(keyword, "i"),
        Criteria.where("description").regex(keyword, "i")
    );
    criteriaList.add(keywordCriteria);
}

Query query = new Query();
if (!criteriaList.isEmpty()) {
    query.addCriteria(new Criteria().andOperator(criteriaList.toArray(new Criteria[0])));
}
```

### 2. Các File Đã Được Cập Nhật

#### Backend Services:
- `CarService.java`: Thêm MongoTemplate và implement `searchCarsAdvanced()` với Criteria API
- `UserService.java`: Thêm MongoTemplate và implement `getFilteredUsers()` với Criteria API  
- `OrderService.java`: Thêm MongoTemplate và implement `getFilteredOrders()` với Criteria API

#### Backend Repositories:
- `CarRepository.java`: Xóa @Query annotation phức tạp
- `UserRepository.java`: Xóa @Query annotation phức tạp
- `OrderRepository.java`: Xóa @Query annotation phức tạp

### 3. Lợi Ích Của Giải Pháp

#### Ưu Điểm:
- **An toàn với null values**: Criteria API tự động xử lý null parameters
- **Linh hoạt hơn**: Có thể build query động dựa trên điều kiện
- **Dễ debug**: Code Java dễ đọc và debug hơn JSON query
- **Type-safe**: Compile-time checking thay vì runtime errors
- **Performance tốt**: Không cần parse JSON query

#### Tính Năng Được Bảo Toàn:
- Tìm kiếm theo từ khóa (regex case-insensitive)
- Lọc theo nhiều tiêu chí đồng thời
- Pagination và sorting
- Tất cả API endpoints hoạt động bình thường

### 4. Cách Thức Hoạt Động

#### Xử Lý Null Values:
```java
// Chỉ thêm criteria khi value không null/empty
if (keyword != null && !keyword.trim().isEmpty()) {
    criteriaList.add(keywordCriteria);
}
```

#### Build Dynamic Query:
```java
// Kết hợp tất cả criteria với AND operator
if (!criteriaList.isEmpty()) {
    query.addCriteria(new Criteria().andOperator(criteriaList.toArray(new Criteria[0])));
}
```

#### Pagination Support:
```java
query.with(pageable);
List<Entity> results = mongoTemplate.find(query, Entity.class);
long total = mongoTemplate.count(query.skip(0).limit(0), Entity.class);
return new PageImpl<>(results, pageable, total);
```

## Kết Quả
- ✅ Không còn lỗi `pattern can not be null`
- ✅ Tất cả filter functions hoạt động bình thường
- ✅ Performance được cải thiện
- ✅ Code dễ maintain và extend
- ✅ Type-safe và compile-time checking

## Testing
Đã test các scenarios:
- Tìm kiếm với keyword null/empty
- Lọc với tất cả parameters null
- Lọc với một số parameters null
- Pagination và sorting
- Tất cả đều hoạt động ổn định

## Lưu Ý Cho Tương Lai
- Sử dụng Criteria API thay vì @Query annotation cho complex queries
- Luôn kiểm tra null/empty trước khi thêm vào criteria
- Sử dụng MongoTemplate cho dynamic queries
- @Query annotation chỉ nên dùng cho simple, static queries