# Service Architecture Refactor Design

## Overview

This design document outlines the refactoring of the frontend service architecture to achieve clear domain separation, fix admin access issues, and improve maintainability. The new architecture will organize services by business domain while maintaining consistent patterns and proper role-based access control.

## Architecture

### Current Issues
- Mixed domain responsibilities in services
- Admin access not working properly due to role validation issues
- Inconsistent API patterns across services
- Lack of admin-specific endpoints

### New Architecture
```
services/
├── api.js (base API service & token management)
├── authService.js (authentication & authorization)
├── userService.js (user profile & management)
├── carService.js (car catalog & operations)
├── orderService.js (order management)
├── cartService.js (cart operations)
└── adminService.js (admin-specific operations)
```

## Components and Interfaces

### Base API Service (Enhanced)
```javascript
// api.js - Combined base service and token management
class ApiService {
  constructor(baseURL) {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json'
    };
  }

  // Enhanced with better error handling and role validation
  async request(method, url, data, options = {}) {
    // Implementation with consistent error handling
  }

  // Role-based request method for admin operations
  async adminRequest(method, url, data, options = {}) {
    // Validates admin role before making request
  }
}

// Token management utilities in same file
export const tokenManager = {
  getToken: () => localStorage.getItem('token'),
  setToken: (token) => localStorage.setItem('token', token),
  clearTokens: () => localStorage.clear()
};
```

### Authentication Service
```javascript
class AuthService extends ApiService {
  // Core authentication methods
  async login(credentials)
  async register(userData)
  async logout()
  async refreshToken()
  
  // Enhanced role validation
  isAuthenticated()
  getCurrentUser()
  hasRole(role)
  isAdmin()
}
```

### User Service
```javascript
class UserService extends ApiService {
  // User profile operations
  async getProfile()
  async updateProfile(userData)
  async changePassword(passwordData)
  async uploadAvatar(file)
}
```

### Car Service
```javascript
class CarService extends ApiService {
  // Car catalog operations
  async getCars(filters)
  async getCarById(id)
  async searchCars(query)
  async getCarCategories()
  async addReview(carId, review)
  async getReviews(carId)
}
```

### Order Service
```javascript
class OrderService extends ApiService {
  // Order management operations
  async createOrder(orderData)
  async getOrders(filters)
  async getOrderById(id)
  async updateOrderStatus(id, status)
  async cancelOrder(id)
}
```

### Cart Service
```javascript
class CartService extends ApiService {
  // Cart operations
  async getCart()
  async addToCart(item)
  async updateCartItem(itemId, quantity)
  async removeFromCart(itemId)
  async clearCart()
}
```

### Admin Service
```javascript
class AdminService extends ApiService {
  constructor() {
    super('/admin');
  }

  // User management
  async getUsers(filters)
  async getUserById(id)
  async updateUser(id, userData)
  async deleteUser(id)
  async banUser(id)

  // Car management
  async createCar(carData)
  async updateCar(id, carData)
  async deleteCar(id)
  async getCarStats()

  // Order management
  async getOrders(filters)
  async updateOrderStatus(id, status)
  async getOrderStats()

  // Dashboard & Reports
  async getDashboardData()
  async getReports(type, dateRange)
  async getSystemStats()
}
```

## Data Models

### User Model
```javascript
{
  id: string,
  email: string,
  fullName: string,
  phoneNumber: string,
  address: string,
  role: 'USER' | 'ADMIN',
  avatar: string,
  createdAt: Date,
  updatedAt: Date
}
```

### Admin Access Model
```javascript
{
  isAuthenticated: boolean,
  hasAdminRole: boolean,
  permissions: string[],
  tokenValid: boolean,
  sessionExpiry: Date
}
```

## Error Handling

### Consistent Error Response Format
```javascript
{
  success: boolean,
  message: string,
  error: {
    code: string,
    details: any
  },
  data: any
}
```

### Role-Based Error Handling
- **401 Unauthorized**: Invalid or missing token
- **403 Forbidden**: Valid token but insufficient role/permissions
- **404 Not Found**: Resource not found or access denied
- **422 Validation Error**: Invalid request data

### Admin Access Error Flow
1. Check authentication status
2. Validate token expiry
3. Verify admin role in token payload
4. Handle role-specific errors with appropriate redirects

## Testing Strategy

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property-Based Testing

Property 1: Authentication domain isolation
*For any* authentication-related operation, it should only be accessible through authService and not exist in other services
**Validates: Requirements 1.1**

Property 2: User domain isolation
*For any* user management operation, it should only be accessible through userService and not exist in other services
**Validates: Requirements 1.2**

Property 3: Car domain isolation
*For any* car-related operation, it should only be accessible through carService and not exist in other services
**Validates: Requirements 1.3**

Property 4: Order domain isolation
*For any* order management operation, it should only be accessible through orderService and not exist in other services
**Validates: Requirements 1.4**

Property 5: Cart domain isolation
*For any* cart operation, it should only be accessible through cartService and not exist in other services
**Validates: Requirements 1.5**

Property 6: Admin domain isolation
*For any* admin-specific operation, it should only be accessible through adminService and not exist in other services
**Validates: Requirements 1.6**

Property 7: Admin access control
*For any* user with ADMIN role and valid authentication, they should be granted access to admin routes
**Validates: Requirements 2.1**

Property 8: Non-admin access denial
*For any* user without ADMIN role, they should be redirected away from admin routes
**Validates: Requirements 2.2**

Property 9: Dual validation requirement
*For any* admin access check, both authentication status and role authorization must be validated
**Validates: Requirements 2.3**

Property 10: Token role verification
*For any* admin route access, the system should verify ADMIN role from valid token payload
**Validates: Requirements 2.5**

Property 11: Error handling consistency
*For any* service method, the error handling pattern should be consistent across all services
**Validates: Requirements 3.1**

Property 12: Response format consistency
*For any* service method response, the formatting should be consistent across all services
**Validates: Requirements 3.2**

Property 13: Authentication header consistency
*For any* authenticated service request, the headers should be consistent across all services
**Validates: Requirements 3.3**

Property 14: Data transformation consistency
*For any* service method, request/response transformation should follow consistent patterns
**Validates: Requirements 3.4**

Property 15: Caching strategy consistency
*For any* service method with caching, the caching strategy should be consistent across all services
**Validates: Requirements 3.5**

Property 16: Token validation requirement
*For any* admin access validation, a valid authentication token must be present and verified
**Validates: Requirements 5.1**

Property 17: Role payload verification
*For any* admin access validation, the ADMIN role must be verified from token payload
**Validates: Requirements 5.2**

Property 18: Token refresh handling
*For any* expired admin token, the system should handle token refresh appropriately
**Validates: Requirements 5.3**

Property 19: Authorization error codes
*For any* admin operation failure due to authorization, appropriate error codes should be returned
**Validates: Requirements 5.4**

Property 20: Session expiry handling
*For any* expired admin session, the system should redirect to login with appropriate messaging
**Validates: Requirements 5.5**

Property 21: Parameter validation consistency
*For any* service method, parameter validation should be consistent across all services
**Validates: Requirements 6.2**

Property 22: Loading state consistency
*For any* service method, loading states should be handled consistently across all services
**Validates: Requirements 6.4**

Property 23: Error propagation consistency
*For any* service method, error propagation should be consistent across all services
**Validates: Requirements 6.5**

### Unit Testing Strategy

#### Authentication Service Tests
- Login with valid/invalid credentials
- Token validation and refresh
- Role checking methods
- Admin access validation

#### Admin Service Tests
- Admin-only endpoint access
- Role-based authorization
- Error handling for non-admin users
- Dashboard data retrieval

#### Service Integration Tests
- Cross-service communication patterns
- Error propagation between services
- Consistent response formatting

### Testing Framework
- **Unit Tests**: Jest with React Testing Library
- **Property-Based Tests**: fast-check library
- **Integration Tests**: MSW (Mock Service Worker) for API mocking
- **E2E Tests**: Playwright for admin workflow testing

Each property-based test will run a minimum of 100 iterations to ensure comprehensive coverage of edge cases and random inputs.