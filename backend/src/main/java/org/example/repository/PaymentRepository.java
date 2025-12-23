package org.example.repository;

import org.example.entity.Payment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends MongoRepository<Payment, String> {
    Optional<Payment> findByOrderId(String orderId);
    Optional<Payment> findByTransactionId(String transactionId);
    List<Payment> findByUserId(String userId);
    List<Payment> findByStatus(String status);
    Page<Payment> findByStatus(String status, Pageable pageable);
    Page<Payment> findByPaymentMethod(String paymentMethod, Pageable pageable);
    Page<Payment> findByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);
    List<Payment> findByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);
}
