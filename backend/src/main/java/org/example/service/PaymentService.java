package org.example.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.dto.PaymentDTO;
import org.example.entity.Payment;
import org.example.mapper.PaymentMapper;
import org.example.repository.PaymentRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final PaymentMapper paymentMapper;

    public PaymentDTO getPaymentById(String id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Payment not found"));
        return paymentMapper.toDTO(payment);
    }

    public PaymentDTO getPaymentByOrderId(String orderId) {
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Payment not found for order: " + orderId));
        return paymentMapper.toDTO(payment);
    }

    public List<PaymentDTO> getPaymentsByUserId(String userId) {
        return paymentRepository.findByUserId(userId).stream()
                .map(paymentMapper::toDTO)
                .collect(Collectors.toList());
    }

    public Page<PaymentDTO> getAllPayments(int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return paymentRepository.findAll(pageable).map(paymentMapper::toDTO);
    }

    public Page<PaymentDTO> getPaymentsByStatus(String status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return paymentRepository.findByStatus(status, pageable).map(paymentMapper::toDTO);
    }

    public Page<PaymentDTO> getPaymentsByMethod(String method, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return paymentRepository.findByPaymentMethod(method, pageable).map(paymentMapper::toDTO);
    }

    public Page<PaymentDTO> getPaymentsByDateRange(LocalDateTime startDate, LocalDateTime endDate, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return paymentRepository.findByCreatedAtBetween(startDate, endDate, pageable).map(paymentMapper::toDTO);
    }

    public Map<String, Object> getPaymentStatistics() {
        List<Payment> allPayments = paymentRepository.findAll();
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalPayments", allPayments.size());
        
        long successCount = allPayments.stream().filter(p -> "SUCCESS".equals(p.getStatus())).count();
        long failedCount = allPayments.stream().filter(p -> "FAILED".equals(p.getStatus())).count();
        long pendingCount = allPayments.stream().filter(p -> "PENDING".equals(p.getStatus())).count();
        
        stats.put("successCount", successCount);
        stats.put("failedCount", failedCount);
        stats.put("pendingCount", pendingCount);
        
        double totalAmount = allPayments.stream()
                .filter(p -> "SUCCESS".equals(p.getStatus()))
                .mapToDouble(Payment::getAmount)
                .sum();
        stats.put("totalAmount", totalAmount);
        
        Map<String, Long> paymentsByMethod = allPayments.stream()
                .collect(Collectors.groupingBy(Payment::getPaymentMethod, Collectors.counting()));
        stats.put("paymentsByMethod", paymentsByMethod);
        
        Map<String, Long> paymentsByStatus = allPayments.stream()
                .collect(Collectors.groupingBy(Payment::getStatus, Collectors.counting()));
        stats.put("paymentsByStatus", paymentsByStatus);
        
        return stats;
    }

    public Map<String, Object> getPaymentStatisticsByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        List<Payment> payments = paymentRepository.findByCreatedAtBetween(startDate, endDate);
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalPayments", payments.size());
        
        long successCount = payments.stream().filter(p -> "SUCCESS".equals(p.getStatus())).count();
        stats.put("successCount", successCount);
        
        double totalAmount = payments.stream()
                .filter(p -> "SUCCESS".equals(p.getStatus()))
                .mapToDouble(Payment::getAmount)
                .sum();
        stats.put("totalAmount", totalAmount);
        
        return stats;
    }

    public PaymentDTO updatePaymentStatus(String paymentId, String newStatus) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found with ID: " + paymentId));
        
        // Validate status
        if (!isValidStatus(newStatus)) {
            throw new RuntimeException("Invalid payment status: " + newStatus);
        }
        
        String oldStatus = payment.getStatus();
        payment.setStatus(newStatus);
        payment.setUpdatedAt(LocalDateTime.now());
        
        Payment updatedPayment = paymentRepository.save(payment);
        
        log.info("Payment status updated: ID={}, Old={}, New={}", paymentId, oldStatus, newStatus);
        
        return paymentMapper.toDTO(updatedPayment);
    }
    
    private boolean isValidStatus(String status) {
        return status != null && (
            status.equals("PENDING") ||
            status.equals("SUCCESS") ||
            status.equals("FAILED") ||
            status.equals("CANCELLED")
        );
    }
}
