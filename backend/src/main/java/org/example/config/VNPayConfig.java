package org.example.config;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
@Getter
public class VNPayConfig {
    
    @Value("${vnpay.tmn-code:DEMO}")
    private String tmnCode;
    
    @Value("${vnpay.hash-secret:DEMO_SECRET}")
    private String hashSecret;
    
    @Value("${vnpay.url:https://sandbox.vnpayment.vn/paymentv2/vpcpay.html}")
    private String vnpayUrl;
    
    @Value("${vnpay.return-url:http://localhost:5173/payment/vnpay-return}")
    private String returnUrl;
    
    @Value("${vnpay.version:2.1.0}")
    private String version;
    
    @Value("${vnpay.command:pay}")
    private String command;
    
    @Value("${vnpay.order-type:other}")
    private String orderType;
}
