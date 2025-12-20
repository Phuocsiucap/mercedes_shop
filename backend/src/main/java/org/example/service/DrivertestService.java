package org.example.service;

import lombok.RequiredArgsConstructor;
import org.example.dto.response.CarResponse;
import org.example.entity.Car;
import org.example.entity.Drivertest;
import org.example.entity.User;
import org.example.dto.request.DrivertestRequest;
import org.example.dto.response.DrivertestResponse;
import org.example.exception.ResourceNotFoundException;
import org.example.repository.DrivertestRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DrivertestService {

    private final DrivertestRepository drivertestRepository;
    private final AuthService authService;
    private final CarService carService;

    public List<DrivertestResponse> getAllDrivertests() {
        return drivertestRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public DrivertestResponse getDrivertestById(String id) {
        Drivertest drivertest = drivertestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lái thử không tìm thấy"));
        return mapToResponse(drivertest);
    }

    public List<DrivertestResponse> getUserDrivertests() {
        User currentUser = authService.getCurrentUser();
        return drivertestRepository.findByUserId(currentUser).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public DrivertestResponse createDrivertest(DrivertestRequest request) {
        User currentUser = authService.getCurrentUser();
        CarResponse car = carService.getCarById(request.getCarId());

        Drivertest drivertest = new Drivertest();
        drivertest.setUser(currentUser);
        drivertest.setCar(new Car());
        drivertest.getCar().setId(car.getId());
        drivertest.setTestDate(request.getTestDate());
        drivertest.setTestLocation(request.getTestLocation());
        drivertest.setFee(request.getFee());
        drivertest.setStatus(Drivertest.TestStatus.PENDING);

        Drivertest savedDrivertest = drivertestRepository.save(drivertest);
        return mapToResponse(savedDrivertest);
    }

    @Transactional
    public DrivertestResponse updateDrivertest(String id, DrivertestRequest request) {
        Drivertest drivertest = drivertestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lái thử không tìm thấy"));
        
        drivertest.setTestDate(request.getTestDate());
        drivertest.setTestLocation(request.getTestLocation());
        drivertest.setFee(request.getFee());

        Drivertest updatedDrivertest = drivertestRepository.save(drivertest);
        return mapToResponse(updatedDrivertest);
    }

    @Transactional
    public DrivertestResponse updateStatus(String id, String status) {
        Drivertest drivertest = drivertestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lái thử không tìm thấy"));
        
        try {
            drivertest.setStatus(Drivertest.TestStatus.valueOf(status.toUpperCase()));
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Trạng thái không hợp lệ: " + status);
        }

        Drivertest updatedDrivertest = drivertestRepository.save(drivertest);
        return mapToResponse(updatedDrivertest);
    }

    @Transactional
    public void deleteDrivertest(String id) {
        Drivertest drivertest = drivertestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lái thử không tìm thấy"));
        drivertestRepository.delete(drivertest);
    }

    public List<DrivertestResponse> getByStatus(String status) {
        return drivertestRepository.findAll().stream()
                .filter(dt -> dt.getStatus().name().equalsIgnoreCase(status))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<DrivertestResponse> getByUserId(String userId) {
        return drivertestRepository.findAll().stream()
                .filter(dt -> dt.getUser().getId().equals(userId))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public boolean isOwner(String drivertestId) {
        try {
            User currentUser = authService.getCurrentUser();
            Drivertest drivertest = drivertestRepository.findById(drivertestId)
                    .orElse(null);
            return drivertest != null && drivertest.getUser().getId().equals(currentUser.getId());
        } catch (Exception e) {
            return false;
        }
    }

    private DrivertestResponse mapToResponse(Drivertest drivertest) {
        return DrivertestResponse.builder()
                .id(drivertest.getId())
                .userId(drivertest.getUser().getId())
                .userName(drivertest.getUser().getFullName())
                .carId(drivertest.getCar().getId())
                .carName(drivertest.getCar().getName())
                .testDate(drivertest.getTestDate())
                .testLocation(drivertest.getTestLocation())
                .fee(drivertest.getFee())
                .status(drivertest.getStatus())
                .build();
    }

    public List<DrivertestResponse> getMyDrivertests() {
        return null;
    }
}