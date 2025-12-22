package org.example.repository;

import org.example.entity.DriverTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface DriverTestRepository extends MongoRepository<DriverTest, String> {

    // Tìm theo userId
    List<DriverTest> findByUserIdOrderByCreatedAtDesc(String userId);

    Page<DriverTest> findByUserId(String userId, Pageable pageable);

    // Tìm theo carId
    List<DriverTest> findByCarId(String carId);

    // Tìm theo status
    Page<DriverTest> findByStatus(DriverTest.TestDriveStatus status, Pageable pageable);

    // Tìm theo khoảng thời gian
    @Query("{ 'testDriveTime': { $gte: ?0, $lte: ?1 } }")
    List<DriverTest> findByTestDriveTimeBetween(LocalDateTime start, LocalDateTime end);

    // Kiểm tra xe có lịch trùng không
    @Query("{ 'carId': ?0, 'testDriveTime': { $gte: ?1, $lte: ?2 }, 'status': { $nin: ['CANCELLED'] } }")
    List<DriverTest> findConflictingSchedules(String carId, LocalDateTime start, LocalDateTime end);

    // Tìm kiếm với nhiều điều kiện
    @Query("{ $or: [ " +
           "{ 'customerName': { $regex: ?0, $options: 'i' } }, " +
           "{ 'carName': { $regex: ?0, $options: 'i' } }, " +
           "{ 'location': { $regex: ?0, $options: 'i' } } " +
           "] }")
    Page<DriverTest> searchByKeyword(String keyword, Pageable pageable);

    // Đếm theo status
    long countByStatus(DriverTest.TestDriveStatus status);

    // Tìm lịch sắp tới
    @Query("{ 'testDriveTime': { $gte: ?0 }, 'status': { $in: ['PENDING', 'CONFIRMED'] } }")
    List<DriverTest> findUpcomingTestDrives(LocalDateTime from);
}
