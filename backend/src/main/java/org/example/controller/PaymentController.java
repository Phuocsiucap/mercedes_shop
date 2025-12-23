package org.example.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.dto.PaymentDTO;
import org.example.dto.VNPayPaymentRequest;
import org.example.entity.Payment;
import org.example.service.PaymentService;
import org.example.service.VNPayService;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class PaymentController {

    private final VNPayService vnPayService;
    private final PaymentService paymentService;
    private final org.example.service.UserService userService;

    @PostMapping("/vnpay/create")
    public ResponseEntity<Map<String, Object>> createVNPayPayment(
            @RequestBody VNPayPaymentRequest request,
            Authentication authentication) {
        try {
            String userId = authentication.getName();
            
            // Get user email from UserService
            String userEmail = null;
            try {
                var user = userService.getUserProfile(userId);
                userEmail = user.getEmail();
            } catch (Exception e) {
                log.warn("Could not get user email, using fallback", e);
                userEmail = userId + "@example.com";
            }
            
            String paymentUrl = vnPayService.createPaymentUrl(request, userId, userEmail);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("paymentUrl", paymentUrl);
            response.put("message", "Payment URL created successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error creating VNPay payment", e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/vnpay/test-drive")
    public ResponseEntity<Map<String, Object>> createTestDrivePayment(
            @RequestBody VNPayPaymentRequest request,
            Authentication authentication) {
        try {
            String userId = authentication.getName();
            
            // Get user email
            String userEmail = null;
            try {
                var user = userService.getUserProfile(userId);
                userEmail = user.getEmail();
            } catch (Exception e) {
                log.warn("Could not get user email, using fallback", e);
                userEmail = userId + "@example.com";
            }
            
            // Create payment URL for test drive deposit
            String paymentUrl = vnPayService.createPaymentUrl(request, userId, userEmail);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("paymentUrl", paymentUrl);
            response.put("message", "Test drive payment URL created successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error creating test drive payment", e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/vnpay/return")
    public ResponseEntity<Map<String, Object>> vnpayReturn(@RequestParam Map<String, String> params) {
        try {
            Payment payment = vnPayService.processVNPayReturn(params);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("payment", payment);
            response.put("message", "Payment processed successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error processing VNPay return", e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getPaymentById(@PathVariable String id) {
        try {
            PaymentDTO payment = paymentService.getPaymentById(id);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", payment);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<Map<String, Object>> getPaymentByOrderId(@PathVariable String orderId) {
        try {
            PaymentDTO payment = paymentService.getPaymentByOrderId(orderId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", payment);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/my-payments")
    public ResponseEntity<Map<String, Object>> getMyPayments(Authentication authentication) {
        try {
            String userId = authentication.getName();
            List<PaymentDTO> payments = paymentService.getPaymentsByUserId(userId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", payments);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // ==================== ADMIN ENDPOINTS ====================

    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getAllPayments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        try {
            Page<PaymentDTO> payments = paymentService.getAllPayments(page, size, sortBy, sortDir);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", payments.getContent());
            response.put("currentPage", payments.getNumber());
            response.put("totalItems", payments.getTotalElements());
            response.put("totalPages", payments.getTotalPages());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/admin/status/{status}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getPaymentsByStatus(
            @PathVariable String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Page<PaymentDTO> payments = paymentService.getPaymentsByStatus(status, page, size);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", payments.getContent());
            response.put("currentPage", payments.getNumber());
            response.put("totalItems", payments.getTotalElements());
            response.put("totalPages", payments.getTotalPages());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/admin/method/{method}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getPaymentsByMethod(
            @PathVariable String method,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Page<PaymentDTO> payments = paymentService.getPaymentsByMethod(method, page, size);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", payments.getContent());
            response.put("currentPage", payments.getNumber());
            response.put("totalItems", payments.getTotalElements());
            response.put("totalPages", payments.getTotalPages());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/admin/date-range")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getPaymentsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Page<PaymentDTO> payments = paymentService.getPaymentsByDateRange(startDate, endDate, page, size);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", payments.getContent());
            response.put("currentPage", payments.getNumber());
            response.put("totalItems", payments.getTotalElements());
            response.put("totalPages", payments.getTotalPages());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/admin/statistics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getPaymentStatistics() {
        try {
            Map<String, Object> stats = paymentService.getPaymentStatistics();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", stats);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/admin/statistics/date-range")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getPaymentStatisticsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        try {
            Map<String, Object> stats = paymentService.getPaymentStatisticsByDateRange(startDate, endDate);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", stats);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PutMapping("/admin/{paymentId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> updatePaymentStatus(
            @PathVariable String paymentId,
            @RequestParam String status) {
        try {
            PaymentDTO payment = paymentService.updatePaymentStatus(paymentId, status);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", payment);
            response.put("message", "Payment status updated successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error updating payment status", e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}
