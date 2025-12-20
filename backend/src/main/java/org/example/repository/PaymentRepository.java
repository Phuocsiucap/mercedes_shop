package org.example.repository;

import org.example.entity.Payment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends MongoRepository<Payment, String> {

    // Sửa: Dùng User_Id để tìm theo ID của User (vì field trong Entity là 'user')
    List<Payment> findByUser_Id(String userId);

    // Sửa: Trả về Optional thay vì List để xử lý logic check tồn tại trong Service dễ hơn
    Optional<Payment> findByOrderId(String orderId);

    Optional<Payment> findByTransactionNo(String transactionNo);

    List<Payment> findByStatus(Payment.PaymentStatus status);

    List<Payment> findByPaymentType(Payment.PaymentType paymentType);

    // Sửa: Tìm theo User ID và sắp xếp giảm dần theo ngày tạo
    List<Payment> findByUser_IdOrderByCreatedDateDesc(String userId);

    Optional<Payment> findByOrderIdAndPaymentType(String orderId, Payment.PaymentType paymentType);
}