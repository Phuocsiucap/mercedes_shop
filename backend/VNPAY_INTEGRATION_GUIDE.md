# Backend VNPay Payment Integration - Setup Guide

## Overview
This guide explains how to set up and configure VNPay payment integration in the Mercedes Shop backend.

## Files Created

### 1. **Entity Classes**
- `Payment.java` - Payment entity with VNPay support

### 2. **Repository**
- `PaymentRepository.java` - MongoDB repository for Payment entity

### 3. **DTOs**
- `VNPayPaymentRequest.java` - Request to create VNPay payment
- `VNPayCallbackRequest.java` - VNPay callback response
- `PaymentResponse.java` - Payment details response
- `VNPayPaymentResponse.java` - VNPay payment creation response

### 4. **Service**
- `PaymentService.java` - Business logic for payment processing

### 5. **Controller**
- `PaymentController.java` - REST API endpoints for payments

### 6. **Utility**
- `VNPayUtil.java` - VNPay signature generation and verification

## Configuration Steps

### Step 1: Get VNPay Merchant Credentials
1. Visit https://sandbox.vnpayment.vn (for testing)
2. Create a merchant account
3. Get the following credentials:
   - TMN Code (Merchant ID)
   - Secret Key

### Step 2: Update application.properties

Update `src/main/resources/application.properties`:

```properties
# VNPay Configuration
vnpay.tmnCode=YOUR_TMN_CODE         # Replace with your TMN Code
vnpay.secretKey=YOUR_SECRET_KEY     # Replace with your Secret Key
vnpay.paymentUrl=https://sandbox.vnpayment.vn/paygate/pay.html  # For testing
vnpay.apiUrl=https://sandbox.vnpayment.vn/merchant_webapi/merchant.html

# Frontend Configuration
app.frontend.returnUrl=http://localhost:5173/payment  # Your frontend payment callback URL
```

**For Production:**
- Change sandbox URLs to production URLs
- Use your production credentials

### Step 3: Database Seeding (Optional)

The Payment entity is automatically managed by Spring Data MongoDB. No migration needed.

## API Endpoints

### 1. Create VNPay Payment
**POST** `/api/payments/vnpay/create`

Request:
```json
{
  "orderId": "ORDER_12345",
  "amount": 500000,
  "orderInfo": "Thanh toán đơn hàng #12345",
  "returnUrl": "http://localhost:5173/payment"
}
```

Response:
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "paymentUrl": "https://sandbox.vnpayment.vn/paygate/pay.html?vnp_...",
    "orderId": "ORDER_12345",
    "message": "Tạo yêu cầu thanh toán thành công"
  }
}
```

### 2. Verify VNPay Callback
**POST** `/api/payments/vnpay/verify`

This endpoint is called by the frontend after user completes payment on VNPay gateway.

### 3. Get Payment History
**GET** `/api/payments/history`

Returns all payments for the current user.

### 4. Get Payment by ID
**GET** `/api/payments/{paymentId}`

Returns details of a specific payment.

### 5. Get Payment by Order ID
**GET** `/api/payments/order/{orderId}`

Returns payment details for a specific order.

### 6. VNPay Webhook Callback
**GET** `/api/payments/vnpay/callback`

VNPay calls this endpoint directly after payment processing. Configure this URL in VNPay merchant settings.

## Payment Flow

```
1. Frontend: User selects VNPay payment
   ↓
2. Frontend: POST /api/payments/vnpay/create
   ↓
3. Backend: Create Payment record (PENDING status)
   ↓
4. Backend: Generate VNPay payment URL
   ↓
5. Frontend: Redirect to VNPay gateway
   ↓
6. VNPay: User completes payment
   ↓
7. VNPay: Calls /api/payments/vnpay/callback (webhook)
   ↓
8. Backend: Update Payment status (SUCCESS/FAILED)
   ↓
9. VNPay: Redirects to returnUrl with callback params
   ↓
10. Frontend: POST /api/payments/vnpay/verify
   ↓
11. Backend: Verify payment and return status
   ↓
12. Frontend: Display payment result
```

## Security Considerations

1. **Signature Verification**: All VNPay callbacks are verified using SHA256 signature
2. **User Authentication**: Payment endpoints require authentication (except webhook)
3. **Amount Validation**: Verify amount matches order total before processing
4. **HTTPS**: Always use HTTPS for production
5. **IP Whitelisting**: Configure VNPay's IP whitelist for webhook security

## VNPay Response Codes

| Code | Meaning |
|------|---------|
| 00 | Payment successful |
| 24 | User cancelled transaction |
| 01 | Bank rejected |
| 02 | Invalid amount |
| 03 | Session expired |

## Testing in Sandbox

### Test Card Details
- Card Number: `4111111111111111`
- Holder: `NGUYEN VAN A`
- CVV: `123`
- Date: Any future date (MM/YY)
- OTP: `123456`

## Troubleshooting

### Payment URL is NULL
- Check TMN Code and Secret Key in application.properties
- Ensure credentials match VNPay merchant account

### Signature Verification Failed
- Verify Secret Key matches VNPay account
- Check parameter encoding (UTF-8)
- Ensure no extra spaces in parameters

### Webhook Not Called
- Configure webhook URL in VNPay merchant settings
- Ensure backend is accessible from internet
- Check firewall/network settings

## Integration with Orders and Test Drives

### For Orders
```java
// When creating order with VNPay payment
String orderId = order.getId(); // Use actual order ID
createVNPayPayment(orderId, totalAmount, orderInfo, returnUrl);
```

### For Test Drives
```java
// Test drive payments use special order ID format
String testDriveOrderId = "TESTDRIVE_" + drivertest.getId();
createVNPayPayment(testDriveOrderId, fee, orderInfo, returnUrl);
```

### For Deposits
```java
// Deposit payments use special order ID format
String depositOrderId = "DEPOSIT_" + car.getId();
createVNPayPayment(depositOrderId, depositAmount, orderInfo, returnUrl);
```

## Database Collections

### payments Collection Fields
```javascript
{
  "_id": ObjectId,
  "user": DBRef,
  "orderId": String,
  "amount": Decimal128,
  "paymentType": String (ORDER|TESTDRIVE|DEPOSIT),
  "status": String (PENDING|SUCCESS|FAILED|CANCELLED),
  "paymentMethod": String (VNPAY|DIRECT),
  "transactionNo": String,
  "bankCode": String,
  "bankTranNo": String,
  "orderInfo": String,
  "paymentDate": ISODate,
  "createdDate": ISODate,
  "updatedDate": ISODate,
  "order": DBRef,
  "drivertest": DBRef,
  "responseCode": String
}
```

## Next Steps

1. Get VNPay merchant credentials
2. Update application.properties with your credentials
3. Test payment creation endpoint
4. Configure webhook URL in VNPay settings
5. Test complete payment flow end-to-end
6. Deploy to production with production credentials

## Support

For VNPay integration support:
- Documentation: https://sandbox.vnpayment.vn/apis
- Contact: VNPay Support Team

For application support:
- Check logs for detailed error messages
- Verify all required fields are present in requests
- Ensure user is authenticated for protected endpoints
