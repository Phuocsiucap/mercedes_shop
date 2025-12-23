package org.example.mapper;

import javax.annotation.processing.Generated;
import org.example.dto.PaymentDTO;
import org.example.entity.Payment;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-12-24T00:10:51+0700",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 23.0.2 (Oracle Corporation)"
)
@Component
public class PaymentMapperImpl implements PaymentMapper {

    @Override
    public PaymentDTO toDTO(Payment payment) {
        if ( payment == null ) {
            return null;
        }

        PaymentDTO paymentDTO = new PaymentDTO();

        paymentDTO.setId( payment.getId() );
        paymentDTO.setOrderId( payment.getOrderId() );
        paymentDTO.setUserId( payment.getUserId() );
        paymentDTO.setUserEmail( payment.getUserEmail() );
        paymentDTO.setAmount( payment.getAmount() );
        paymentDTO.setCurrency( payment.getCurrency() );
        paymentDTO.setPaymentMethod( payment.getPaymentMethod() );
        paymentDTO.setStatus( payment.getStatus() );
        paymentDTO.setTransactionId( payment.getTransactionId() );
        paymentDTO.setVnpayResponseCode( payment.getVnpayResponseCode() );
        paymentDTO.setVnpayTransactionNo( payment.getVnpayTransactionNo() );
        paymentDTO.setVnpayBankCode( payment.getVnpayBankCode() );
        paymentDTO.setVnpayCardType( payment.getVnpayCardType() );
        paymentDTO.setVnpayOrderInfo( payment.getVnpayOrderInfo() );
        paymentDTO.setPaymentDate( payment.getPaymentDate() );
        paymentDTO.setCreatedAt( payment.getCreatedAt() );
        paymentDTO.setUpdatedAt( payment.getUpdatedAt() );

        return paymentDTO;
    }

    @Override
    public Payment toEntity(PaymentDTO paymentDTO) {
        if ( paymentDTO == null ) {
            return null;
        }

        Payment payment = new Payment();

        payment.setId( paymentDTO.getId() );
        payment.setOrderId( paymentDTO.getOrderId() );
        payment.setUserId( paymentDTO.getUserId() );
        payment.setUserEmail( paymentDTO.getUserEmail() );
        payment.setAmount( paymentDTO.getAmount() );
        payment.setCurrency( paymentDTO.getCurrency() );
        payment.setPaymentMethod( paymentDTO.getPaymentMethod() );
        payment.setStatus( paymentDTO.getStatus() );
        payment.setTransactionId( paymentDTO.getTransactionId() );
        payment.setVnpayResponseCode( paymentDTO.getVnpayResponseCode() );
        payment.setVnpayTransactionNo( paymentDTO.getVnpayTransactionNo() );
        payment.setVnpayBankCode( paymentDTO.getVnpayBankCode() );
        payment.setVnpayCardType( paymentDTO.getVnpayCardType() );
        payment.setVnpayOrderInfo( paymentDTO.getVnpayOrderInfo() );
        payment.setPaymentDate( paymentDTO.getPaymentDate() );
        payment.setCreatedAt( paymentDTO.getCreatedAt() );
        payment.setUpdatedAt( paymentDTO.getUpdatedAt() );

        return payment;
    }
}
