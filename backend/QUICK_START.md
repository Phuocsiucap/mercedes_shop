# Backend VNPay Payment Integration - Quick Start

## What Has Been Implemented

### Complete Payment System
- ✅ Payment entity with MongoDB support
- ✅ VNPay payment gateway integration
- ✅ REST API endpoints for payment operations
- ✅ Payment verification and security
- ✅ Order, Test Drive, and Deposit payment support

## Quick Setup (5 minutes)

### 1. Get VNPay Credentials (Sandbox)

```
Website: https://sandbox.vnpayment.vn
1. Create account
2. Log in to merchant portal
3. Get:
   - TMN Code (e.g., "MERCHANT001")
   - Secret Key (e.g., "SECRETKEY123...")
```

### 2. Update Configuration

**File**: `src/main/resources/application.properties`

```properties
# Replace these with YOUR actual credentials
vnpay.tmnCode=YOUR_TMN_CODE
vnpay.secretKey=YOUR_SECRET_KEY
```

### 3. Start Backend Server

```bash
cd backend
mvn spring-boot:run
```

Server runs on: `http://localhost:8088`

### 4. Test Payment Creation

```bash
curl -X POST http://localhost:8088/api/payments/vnpay/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "orderId": "ORDER_TEST_123",
    "amount": 100000,
    "orderInfo": "Test payment",
    "returnUrl": "http://localhost:5173/payment"
  }'
```

Expected Response:
```json
{
  "success": true,
  "data": {
    "paymentUrl": "https://sandbox.vnpayment.vn/paygate/pay.html?vnp_...",
    "orderId": "ORDER_TEST_123",
    "message": "Tạo yêu cầu thanh toán thành công"
  }
}
```

## File Structure

```
src/main/java/org/example/
├── entity/
│   └── Payment.java (NEW)
│
├── repository/
│   └── PaymentRepository.java (NEW)
│
├── dto/
│   ├── request/
│   │   ├── VNPayPaymentRequest.java (NEW)
│   │   └── VNPayCallbackRequest.java (NEW)
│   └── response/
│       ├── PaymentResponse.java (NEW)
│       └── VNPayPaymentResponse.java (NEW)
│
├── service/
│   └── PaymentService.java (NEW)
│
├── controller/
│   └── PaymentController.java (NEW)
│
└── util/
    └── VNPayUtil.java (NEW)
```

## API Endpoints

### Create Payment
```
POST /api/payments/vnpay/create
Authorization: Bearer {token}

{
  "orderId": "ORDER_xxx",
  "amount": 1000000,
  "orderInfo": "Payment description",
  "returnUrl": "http://localhost:5173/payment"
}
```

### Get Payment History
```
GET /api/payments/history
Authorization: Bearer {token}
```

### Get Payment Details
```
GET /api/payments/{paymentId}
Authorization: Bearer {token}
```

### Verify Payment (Called by Frontend)
```
POST /api/payments/vnpay/verify
{
  "vnp_Amount": "1000000",
  "vnp_BankCode": "NCB",
  "vnp_ResponseCode": "00",
  "vnp_TxnRef": "ORDER_xxx",
  ...
}
```

## Payment Status Codes

| Code | Status | Meaning |
|------|--------|---------|
| 00 | SUCCESS | Payment successful |
| 24 | CANCELLED | User cancelled |
| 01-23 | FAILED | Payment failed (various reasons) |

## Test with Sandbox

### Test Card (Successful Payment)
- Card: `4111111111111111`
- Holder: `NGUYEN VAN A`
- CVV: `123`
- Date: `12/25` (any future date)
- OTP: `123456`

### Payment Flow
1. Create payment → Get URL
2. Redirect to VNPay → User enters card details
3. VNPay processes → Confirms payment
4. Redirects to frontend with status
5. Frontend verifies payment

## Database Records

After successful payment, `payments` collection contains:

```javascript
{
  "_id": ObjectId("..."),
  "user": DBRef("users", "user_id"),
  "orderId": "ORDER_123",
  "amount": 1000000,
  "paymentType": "ORDER",
  "status": "SUCCESS",
  "paymentMethod": "VNPAY",
  "transactionNo": "12345678",
  "bankCode": "NCB",
  "responseCode": "00",
  "paymentDate": ISODate("2024-12-21T10:30:00Z"),
  "createdDate": ISODate("2024-12-21T10:30:00Z"),
  "updatedDate": ISODate("2024-12-21T10:30:00Z")
}
```

## Security Features

✓ **SHA256 Signature**: All requests/responses verified with secret key
✓ **User Authentication**: Requires JWT token
✓ **Amount Validation**: Server-side verification
✓ **Transaction Tracking**: Unique transaction IDs
✓ **Status Management**: Proper payment state transitions

## Webhook Configuration

For production, configure VNPay webhook:

1. Go to VNPay Merchant Portal
2. Settings → Webhook URL
3. Set to: `https://your-domain.com/api/payments/vnpay/callback`

VNPay will call this endpoint after payment:
- Backend automatically updates payment status
- Frontend then verifies payment

## Common Issues

### 1. "Invalid Signature"
- Check TMN Code and Secret Key match VNPay account
- Verify no extra spaces in config

### 2. "Payment URL is null"
- Verify credentials are set correctly
- Check sandbox/production URLs match

### 3. "Cannot find payment"
- Ensure order ID matches what was created
- Check order ID format (ORDER_xxx, TESTDRIVE_xxx, etc.)

## Next Steps

1. ✅ Backend implementation complete
2. ⚠️  Get VNPay credentials
3. ⚠️  Update configuration
4. ⚠️  Test payment flow
5. ⚠️  Configure webhook (production)

## Documentation

- Full setup guide: `VNPAY_INTEGRATION_GUIDE.md`
- Implementation details: `PAYMENT_IMPLEMENTATION_SUMMARY.md`

## Support Commands

```bash
# Build project
mvn clean install

# Run tests
mvn test

# Run server
mvn spring-boot:run

# Check logs
tail -f logs/application.log
```

## Integration with Frontend

Frontend already configured at:
- `PaymentPage.jsx` - Handles payment results
- `CartPage.jsx` - Order payment integration
- `CarDetailPage.jsx` - Test drive & deposit payment
- `CarsPage.jsx` - Test drive booking payment

Frontend automatically:
1. Creates payment request
2. Redirects to VNPay
3. Returns payment result
4. Verifies with backend

---

**Ready to use!** Just add your VNPay credentials and test the payment flow.
