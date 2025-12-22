package org.example.service;

import lombok.RequiredArgsConstructor;
import org.example.dto.request.DriverTestRequest;
import org.example.dto.response.ApiResponse;
import org.example.dto.response.DriverTestResponse;
import org.example.entity.Car;
import org.example.entity.DriverTest;
import org.example.entity.User;
import org.example.repository.CarRepository;
import org.example.repository.DriverTestRepository;
import org.example.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DriverTestService {

    private final DriverTestRepository driverTestRepository;
    private final CarRepository carRepository;
    private final UserRepository userRepository;

    /**
     * Khách hàng đăng ký lái thử
     */
    public ApiResponse<DriverTestResponse> createTestDrive(String userId, DriverTestRequest request) {
        // Validate user
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return ApiResponse.error("Không tìm thấy thông tin người dùng");
        }

        // Validate car
        Car car = carRepository.findById(request.getCarId()).orElse(null);
        if (car == null) {
            return ApiResponse.error("Không tìm thấy xe");
        }

        // Validate time is in future
        if (request.getTestDriveTime() == null || request.getTestDriveTime().isBefore(LocalDateTime.now())) {
            return ApiResponse.error("Vui lòng chọn thời gian trong tương lai");
        }

        // Check for conflicting schedules (within 2 hours)
        LocalDateTime start = request.getTestDriveTime().minusHours(1);
        LocalDateTime end = request.getTestDriveTime().plusHours(1);
        List<DriverTest> conflicts = driverTestRepository.findConflictingSchedules(
                request.getCarId(), start, end);
        if (!conflicts.isEmpty()) {
            return ApiResponse.error("Xe không khả dụng trong khung giờ này. Vui lòng chọn thời gian khác.");
        }

        // Create driver test
        DriverTest driverTest = new DriverTest();
        driverTest.setUserId(userId);
        driverTest.setCustomerName(user.getFullName());
        driverTest.setCustomerPhone(user.getPhoneNumber());
        driverTest.setCustomerEmail(user.getEmail());
        driverTest.setCarId(car.getId());
        driverTest.setCarName(car.getName());
        driverTest.setFee(request.getFee() != null ? request.getFee() : BigDecimal.ZERO);
        driverTest.setLocation(request.getLocation());
        driverTest.setTestDriveTime(request.getTestDriveTime());
        driverTest.setStatus(DriverTest.TestDriveStatus.PENDING);
        driverTest.setNotes(request.getNotes());
        driverTest.setCreatedAt(LocalDateTime.now());
        driverTest.setUpdatedAt(LocalDateTime.now());

        DriverTest saved = driverTestRepository.save(driverTest);
        DriverTestResponse response = DriverTestResponse.fromEntity(saved);

        // Set car image if available
        if (car.getImages() != null && !car.getImages().isEmpty()) {
            response.setCarImage(car.getImages().get(0));
        }

        return ApiResponse.success("Đăng ký lái thử thành công", response);
    }

    /**
     * Lấy danh sách lịch lái thử của user
     */
    public ApiResponse<List<DriverTestResponse>> getUserTestDrives(String userId) {
        List<DriverTest> testDrives = driverTestRepository.findByUserIdOrderByCreatedAtDesc(userId);
        List<DriverTestResponse> responses = testDrives.stream()
                .map(this::enrichResponse)
                .collect(Collectors.toList());
        return ApiResponse.success("Lấy danh sách lịch lái thử thành công", responses);
    }

    /**
     * Lấy chi tiết lịch lái thử
     */
    public ApiResponse<DriverTestResponse> getTestDriveById(String id) {
        DriverTest driverTest = driverTestRepository.findById(id).orElse(null);
        if (driverTest == null) {
            return ApiResponse.error("Không tìm thấy lịch lái thử");
        }
        return ApiResponse.success(enrichResponse(driverTest));
    }

    /**
     * Hủy lịch lái thử (khách hàng)
     */
    public ApiResponse<String> cancelTestDrive(String userId, String testDriveId) {
        DriverTest driverTest = driverTestRepository.findById(testDriveId).orElse(null);
        if (driverTest == null) {
            return ApiResponse.error("Không tìm thấy lịch lái thử");
        }

        if (!driverTest.getUserId().equals(userId)) {
            return ApiResponse.error("Bạn không có quyền hủy lịch này");
        }

        if (driverTest.getStatus() == DriverTest.TestDriveStatus.COMPLETED) {
            return ApiResponse.error("Không thể hủy lịch đã hoàn thành");
        }

        if (driverTest.getStatus() == DriverTest.TestDriveStatus.CANCELLED) {
            return ApiResponse.error("Lịch này đã được hủy trước đó");
        }

        driverTest.setStatus(DriverTest.TestDriveStatus.CANCELLED);
        driverTest.setUpdatedAt(LocalDateTime.now());
        driverTestRepository.save(driverTest);

        return ApiResponse.success("Hủy lịch lái thử thành công", null);
    }

    // ==================== ADMIN METHODS ====================

    /**
     * Admin: Lấy tất cả lịch lái thử với filter
     */
    public Page<DriverTestResponse> getAllTestDrives(int page, int size, String sortBy, 
            String sortDir, String keyword, String status) {
        
        Sort sort = sortDir.equalsIgnoreCase("ASC") 
                ? Sort.by(sortBy).ascending() 
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<DriverTest> testDrives;

        if (keyword != null && !keyword.trim().isEmpty()) {
            testDrives = driverTestRepository.searchByKeyword(keyword.trim(), pageable);
        } else if (status != null && !status.trim().isEmpty()) {
            try {
                DriverTest.TestDriveStatus statusEnum = DriverTest.TestDriveStatus.valueOf(status);
                testDrives = driverTestRepository.findByStatus(statusEnum, pageable);
            } catch (IllegalArgumentException e) {
                testDrives = driverTestRepository.findAll(pageable);
            }
        } else {
            testDrives = driverTestRepository.findAll(pageable);
        }

        return testDrives.map(this::enrichResponse);
    }

    /**
     * Admin: Tạo lịch lái thử (cho khách gọi điện đặt)
     */
    public ApiResponse<DriverTestResponse> adminCreateTestDrive(DriverTestRequest request) {
        // Validate car
        Car car = carRepository.findById(request.getCarId()).orElse(null);
        if (car == null) {
            return ApiResponse.error("Không tìm thấy xe");
        }

        // Validate time
        if (request.getTestDriveTime() == null || request.getTestDriveTime().isBefore(LocalDateTime.now())) {
            return ApiResponse.error("Vui lòng chọn thời gian trong tương lai");
        }

        // Check conflicts
        LocalDateTime start = request.getTestDriveTime().minusHours(1);
        LocalDateTime end = request.getTestDriveTime().plusHours(1);
        List<DriverTest> conflicts = driverTestRepository.findConflictingSchedules(
                request.getCarId(), start, end);
        if (!conflicts.isEmpty()) {
            return ApiResponse.error("Xe đã có người đặt trùng giờ");
        }

        // Get user info if userId provided
        User user = null;
        if (request.getUserId() != null && !request.getUserId().isEmpty()) {
            user = userRepository.findById(request.getUserId()).orElse(null);
        }

        DriverTest driverTest = new DriverTest();
        driverTest.setUserId(request.getUserId());
        driverTest.setCustomerName(user != null ? user.getFullName() : request.getCustomerName());
        driverTest.setCustomerPhone(user != null ? user.getPhoneNumber() : request.getCustomerPhone());
        driverTest.setCustomerEmail(user != null ? user.getEmail() : request.getCustomerEmail());
        driverTest.setCarId(car.getId());
        driverTest.setCarName(car.getName());
        driverTest.setFee(request.getFee() != null ? request.getFee() : BigDecimal.ZERO);
        driverTest.setLocation(request.getLocation());
        driverTest.setTestDriveTime(request.getTestDriveTime());
        driverTest.setStatus(DriverTest.TestDriveStatus.PENDING);
        driverTest.setNotes(request.getNotes());
        driverTest.setCreatedAt(LocalDateTime.now());
        driverTest.setUpdatedAt(LocalDateTime.now());

        DriverTest saved = driverTestRepository.save(driverTest);
        return ApiResponse.success("Thêm lịch lái thử thành công", enrichResponse(saved));
    }

    /**
     * Admin: Cập nhật lịch lái thử
     */
    public ApiResponse<DriverTestResponse> adminUpdateTestDrive(String id, DriverTestRequest request) {
        DriverTest driverTest = driverTestRepository.findById(id).orElse(null);
        if (driverTest == null) {
            return ApiResponse.error("Không tìm thấy lịch lái thử");
        }

        // Update fields if provided
        if (request.getLocation() != null) {
            driverTest.setLocation(request.getLocation());
        }
        if (request.getTestDriveTime() != null) {
            // Check conflicts for new time
            LocalDateTime start = request.getTestDriveTime().minusHours(1);
            LocalDateTime end = request.getTestDriveTime().plusHours(1);
            List<DriverTest> conflicts = driverTestRepository.findConflictingSchedules(
                    driverTest.getCarId(), start, end);
            // Remove self from conflicts
            conflicts.removeIf(c -> c.getId().equals(id));
            if (!conflicts.isEmpty()) {
                return ApiResponse.error("Xe đã có người đặt trùng giờ");
            }
            driverTest.setTestDriveTime(request.getTestDriveTime());
        }
        if (request.getNotes() != null) {
            driverTest.setNotes(request.getNotes());
        }
        if (request.getFee() != null) {
            driverTest.setFee(request.getFee());
        }

        driverTest.setUpdatedAt(LocalDateTime.now());
        DriverTest saved = driverTestRepository.save(driverTest);
        return ApiResponse.success("Cập nhật lịch lái thử thành công", enrichResponse(saved));
    }

    /**
     * Admin: Cập nhật trạng thái
     */
    public ApiResponse<DriverTestResponse> updateStatus(String id, DriverTest.TestDriveStatus status) {
        DriverTest driverTest = driverTestRepository.findById(id).orElse(null);
        if (driverTest == null) {
            return ApiResponse.error("Không tìm thấy lịch lái thử");
        }

        driverTest.setStatus(status);
        driverTest.setUpdatedAt(LocalDateTime.now());
        DriverTest saved = driverTestRepository.save(driverTest);

        String message = switch (status) {
            case CONFIRMED -> "Đã xác nhận lịch lái thử";
            case COMPLETED -> "Đã hoàn thành lịch lái thử";
            case CANCELLED -> "Đã hủy lịch lái thử";
            default -> "Cập nhật trạng thái thành công";
        };

        return ApiResponse.success(message, enrichResponse(saved));
    }

    /**
     * Admin: Xóa lịch lái thử
     */
    public ApiResponse<String> deleteTestDrive(String id) {
        DriverTest driverTest = driverTestRepository.findById(id).orElse(null);
        if (driverTest == null) {
            return ApiResponse.error("Không tìm thấy lịch lái thử");
        }

        driverTestRepository.delete(driverTest);
        return ApiResponse.success("Xóa lịch lái thử thành công", null);
    }

    /**
     * Thống kê cho dashboard
     */
    public long countByStatus(DriverTest.TestDriveStatus status) {
        return driverTestRepository.countByStatus(status);
    }

    public long countAll() {
        return driverTestRepository.count();
    }

    // Helper method
    private DriverTestResponse enrichResponse(DriverTest driverTest) {
        DriverTestResponse response = DriverTestResponse.fromEntity(driverTest);
        if (response != null && driverTest.getCarId() != null) {
            Car car = carRepository.findById(driverTest.getCarId()).orElse(null);
            if (car != null && car.getImages() != null && !car.getImages().isEmpty()) {
                response.setCarImage(car.getImages().get(0));
            }
        }
        return response;
    }
}
