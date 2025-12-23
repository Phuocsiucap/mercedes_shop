# Design Document

## Overview

This design document outlines the architectural refactoring of the car dealership application to improve code organization, maintainability, and scalability. The refactoring will establish clear separation of concerns in both frontend (React) and backend (Spring Boot), implement proper service layers, and ensure consistent data handling patterns.

The refactoring focuses on:
- Frontend: Component organization, service layer standardization, context management, and type safety
- Backend: Controller separation, service layer implementation, DTO/mapper patterns, and role-based authorization
- Integration: Seamless data flow between restructured backend and existing frontend interfaces

## Architecture

### Frontend Architecture

```
frontend/
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── layouts/         # Page layouts (AdminLayout, UserLayout)
│   │   ├── modals/          # Modal components (ConfirmModal, FormModal)
│   │   └── ui/              # Basic UI components (Button, Input, Card)
│   ├── services/            # API service layer
│   │   ├── api.js           # Base API template
│   │   ├── authService.js   # Authentication services
│   │   ├── carService.js    # Car-related services
│   │   └── userService.js   # User-related services
│   ├── context/             # React context providers
│   │   ├── AuthContext.js   # Authentication state
│   │   ├── CartContext.js   # Shopping cart state
│   │   └── AppContext.js    # Global application state
│   ├── types/               # TypeScript definitions
│   │   ├── api.types.js     # API response types
│   │   ├── user.types.js    # User-related types
│   │   └── car.types.js     # Car-related types
│   └── pages/               # Existing page components
```

### Backend Architecture

```
backend/src/main/java/org/example/
├── controller/              # REST controllers
│   ├── AuthController.java  # Authentication endpoints
│   ├── UserController.java  # User management endpoints
│   ├── CarController.java   # Car-related endpoints
│   ├── CartController.java  # Shopping cart endpoints
│   └── AdminController.java # Administrative endpoints
├── service/                 # Business logic layer
│   ├── AuthService.java     # Authentication business logic
│   ├── UserService.java     # User management logic
│   ├── CarService.java      # Car-related logic
│   ├── CartService.java     # Cart management logic
│   └── AdminService.java    # Administrative logic
├── dto/                     # Existing DTOs (enhanced)
├── mapper/                  # Existing mappers (enhanced)
├── entity/                  # Existing entities
├── repository/              # Existing repositories
└── security/                # Enhanced security configuration
```

## Components and Interfaces

### Frontend Components

#### Layout Components
- **AdminLayout**: Common layout for admin pages with sidebar navigation
- **UserLayout**: Common layout for user-facing pages with header/footer
- **AuthLayout**: Layout for authentication pages

#### Modal Components
- **ConfirmModal**: Reusable confirmation dialog
- **FormModal**: Generic form modal with validation
- **ImageModal**: Image preview modal

#### UI Components
- **Button**: Standardized button with variants
- **Input**: Form input with validation states
- **Card**: Content container component
- **LoadingSpinner**: Loading indicator
- **ErrorBoundary**: Error handling wrapper

### Backend Controllers

#### AuthController
```java
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @PostMapping("/login")
    @PostMapping("/register")
    @PostMapping("/refresh")
    @PostMapping("/logout")
    @PostMapping("/forgot-password")
    @PostMapping("/reset-password")
}
```

#### UserController
```java
@RestController
@RequestMapping("/api/users")
public class UserController {
    @GetMapping("/profile")
    @PutMapping("/profile")
    @PostMapping("/change-password")
    @GetMapping("/orders")
    @GetMapping("/favorites")
}
```

#### CarController
```java
@RestController
@RequestMapping("/api/cars")
public class CarController {
    @GetMapping
    @GetMapping("/{id}")
    @GetMapping("/search")
    @GetMapping("/categories")
    @PostMapping("/{id}/reviews")
    @GetMapping("/{id}/reviews")
}
```

#### CartController
```java
@RestController
@RequestMapping("/api/cart")
public class CartController {
    @GetMapping
    @PostMapping("/items")
    @PutMapping("/items/{id}")
    @DeleteMapping("/items/{id}")
    @PostMapping("/checkout")
}
```

#### AdminController
```java
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    @GetMapping("/dashboard")
    @GetMapping("/users")
    @GetMapping("/cars")
    @PostMapping("/cars")
    @PutMapping("/cars/{id}")
    @DeleteMapping("/cars/{id}")
    @GetMapping("/orders")
    @PutMapping("/orders/{id}/status")
    @GetMapping("/reports")
}
```

## Data Models

### Frontend Type Definitions

#### API Response Types
```javascript
// types/api.types.js
export const ApiResponse = {
  success: Boolean,
  message: String,
  data: Object,
  errors: Array
};

export const PaginatedResponse = {
  ...ApiResponse,
  data: {
    content: Array,
    totalElements: Number,
    totalPages: Number,
    currentPage: Number,
    size: Number
  }
};
```

#### User Types
```javascript
// types/user.types.js
export const User = {
  id: String,
  fullName: String,
  email: String,
  phoneNumber: String,
  address: String,
  role: String, // 'CUSTOMER' | 'ADMIN' | 'USER'
  verified: Boolean,
  provider: String,
  createdAt: String
};

export const AuthState = {
  user: User,
  token: String,
  isAuthenticated: Boolean,
  loading: Boolean
};
```

#### Car Types
```javascript
// types/car.types.js
export const Car = {
  id: String,
  name: String,
  categoryId: String,
  categoryName: String,
  price: Number,
  manufactureYear: Number,
  color: String,
  engine: String,
  transmission: String,
  seats: Number,
  image: String,
  description: String,
  averageRating: Number,
  reviewCount: Number
};

export const CartItem = {
  id: String,
  car: Car,
  quantity: Number,
  price: Number
};
```

### Backend Enhanced DTOs

#### Enhanced Request DTOs
```java
// Additional validation and documentation
@Data
@Valid
public class CarRequest {
    @NotBlank(message = "Car name is required")
    @Size(min = 2, max = 100)
    private String name;
    
    @NotNull(message = "Category is required")
    private String categoryId;
    
    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.0", inclusive = false)
    private BigDecimal price;
    
    // Additional fields with validation
}
```

#### Enhanced Response DTOs
```java
// Consistent response structure
@Data
@Builder
public class ApiResponse<T> {
    private boolean success;
    private String message;
    private T data;
    private List<String> errors;
    private LocalDateTime timestamp;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

Property 1: Authentication token consistency
*For any* authenticated API request, the request should include a valid authentication token in the Authorization header
**Validates: Requirements 2.4**

Property 2: API response schema validation
*For any* API response, the response data should conform to the predefined schema for that endpoint
**Validates: Requirements 2.5**

Property 3: Context state propagation
*For any* context state change, all consuming components should receive the updated state automatically
**Validates: Requirements 3.2**

Property 4: Cart state persistence
*For any* cart modification, the cart state should remain consistent across page navigation and browser refresh
**Validates: Requirements 3.3**

Property 5: Frontend API response validation
*For any* API response received by the frontend, the data should match the expected TypeScript interface definitions
**Validates: Requirements 4.1**

Property 6: Data serialization round-trip
*For any* data object, serializing to API format and then deserializing should produce an equivalent object
**Validates: Requirements 4.5**

Property 7: Service layer validation
*For any* invalid data submitted to service methods, the validation should reject the data before any repository operations
**Validates: Requirements 6.3**

Property 8: Request DTO validation
*For any* API request, invalid request data should be rejected with appropriate validation error messages
**Validates: Requirements 7.1**

Property 9: Response DTO consistency
*For any* API response, the response should follow the defined DTO structure with all required fields present
**Validates: Requirements 7.2**

Property 10: Entity-DTO mapping round-trip
*For any* entity, converting to DTO and back to entity should preserve all essential data
**Validates: Requirements 7.5**

Property 11: Admin endpoint authorization
*For any* admin endpoint access attempt, users without admin role should be rejected with 403 Forbidden
**Validates: Requirements 8.1**

Property 12: Staff endpoint authorization
*For any* staff-restricted endpoint access attempt, users without staff role should be rejected with 403 Forbidden
**Validates: Requirements 8.2**

Property 13: Customer endpoint authorization
*For any* customer endpoint access attempt, unauthenticated users should be rejected with 401 Unauthorized
**Validates: Requirements 8.3**

Property 14: Unauthorized access error handling
*For any* unauthorized access attempt, the system should return appropriate HTTP error codes and error messages
**Validates: Requirements 8.4**

Property 15: Permission enforcement immediacy
*For any* role permission change, the new permissions should be enforced on the next API request
**Validates: Requirements 8.5**

Property 16: Feature preservation after refactoring
*For any* existing application feature, the functionality should remain intact after backend restructuring
**Validates: Requirements 9.1**

Property 17: API endpoint consistency
*For any* frontend service call, the endpoint URL should match the corresponding backend controller mapping
**Validates: Requirements 9.2**

Property 18: Session management consistency
*For any* authentication state change, user sessions should be maintained correctly across the application
**Validates: Requirements 9.4**

Property 19: Admin feature preservation
*For any* administrative capability, the feature should remain fully functional after restructuring
**Validates: Requirements 9.5**

<function_calls>
<invoke name="prework">
<parameter name="featureName">application-architecture-refactor
##
 Error Handling

### Frontend Error Handling

#### API Service Error Handling
- **Network Errors**: Retry mechanism with exponential backoff
- **Authentication Errors**: Automatic token refresh and redirect to login
- **Validation Errors**: Display field-specific error messages
- **Server Errors**: Show user-friendly error messages with retry options

#### Component Error Boundaries
- **Page-level Error Boundaries**: Catch and display page-specific errors
- **Component-level Error Boundaries**: Isolate component failures
- **Global Error Handler**: Catch unhandled errors and log to monitoring service

### Backend Error Handling

#### Global Exception Handler
```java
@ControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(ValidationException.class)
    @ExceptionHandler(ResourceNotFoundException.class)
    @ExceptionHandler(UnauthorizedException.class)
    @ExceptionHandler(BusinessLogicException.class)
}
```

#### Service Layer Error Handling
- **Input Validation**: Validate all inputs before processing
- **Business Rule Violations**: Throw specific business exceptions
- **Data Integrity**: Handle database constraint violations
- **External Service Failures**: Implement circuit breaker pattern

#### Security Error Handling
- **Authentication Failures**: Return 401 with appropriate message
- **Authorization Failures**: Return 403 with role requirements
- **Token Validation**: Handle expired and invalid tokens
- **Rate Limiting**: Implement request throttling

## Testing Strategy

### Dual Testing Approach

This project will implement both unit testing and property-based testing to ensure comprehensive coverage:

- **Unit tests** verify specific examples, edge cases, and error conditions
- **Property tests** verify universal properties that should hold across all inputs
- Together they provide comprehensive coverage: unit tests catch concrete bugs, property tests verify general correctness

### Frontend Testing

#### Unit Testing
- **Component Testing**: Test individual components with React Testing Library
- **Service Testing**: Test API service methods with mocked responses
- **Context Testing**: Test context providers and state management
- **Integration Testing**: Test component interactions and data flow

#### Property-Based Testing
- **API Response Validation**: Test that all API responses conform to expected schemas
- **State Management**: Test that context state changes propagate correctly
- **Form Validation**: Test that form validation works across all input combinations
- **Navigation**: Test that routing and navigation work consistently

**Frontend Testing Framework**: Jest with React Testing Library and fast-check for property-based testing

### Backend Testing

#### Unit Testing
- **Controller Testing**: Test REST endpoints with MockMvc
- **Service Testing**: Test business logic with mocked dependencies
- **Repository Testing**: Test data access with @DataMongoTest
- **Mapper Testing**: Test entity-DTO conversions

#### Property-Based Testing
- **Authorization Testing**: Test that role-based access control works for all endpoints
- **DTO Validation**: Test that request/response DTOs handle all valid/invalid inputs
- **Data Mapping**: Test that entity-DTO mapping preserves data integrity
- **Business Logic**: Test that service methods maintain invariants

**Backend Testing Framework**: JUnit 5 with Mockito and jqwik for property-based testing

### Integration Testing

#### API Integration Tests
- **End-to-End Workflows**: Test complete user journeys
- **Authentication Flow**: Test login, token refresh, and logout
- **Data Consistency**: Test that frontend and backend data models align
- **Error Scenarios**: Test error handling across the full stack

#### Database Integration Tests
- **Transaction Testing**: Test that service layer transactions work correctly
- **Data Integrity**: Test that database constraints are enforced
- **Performance Testing**: Test that queries perform within acceptable limits

### Property-Based Testing Configuration

Each property-based test will run a minimum of 100 iterations to ensure thorough coverage of the input space. Tests will be tagged with comments explicitly referencing the correctness property they implement using this format: **Feature: application-architecture-refactor, Property {number}: {property_text}**

## Security Considerations

### Authentication and Authorization

#### JWT Token Management
- **Token Expiration**: Implement short-lived access tokens with refresh tokens
- **Token Validation**: Validate tokens on every protected endpoint
- **Token Revocation**: Implement token blacklisting for logout

#### Role-Based Access Control
- **Role Hierarchy**: ADMIN > STAFF > CUSTOMER
- **Endpoint Protection**: Secure endpoints based on required roles
- **Method-Level Security**: Use @PreAuthorize annotations

### Data Protection

#### Input Validation
- **Request DTOs**: Validate all incoming data
- **SQL Injection Prevention**: Use parameterized queries
- **XSS Prevention**: Sanitize user inputs

#### Data Encryption
- **Password Hashing**: Use BCrypt for password storage
- **Sensitive Data**: Encrypt sensitive fields in database
- **HTTPS**: Enforce HTTPS in production

## Performance Considerations

### Frontend Performance

#### Code Splitting
- **Route-based Splitting**: Split code by routes
- **Component Lazy Loading**: Load components on demand
- **Bundle Optimization**: Minimize bundle sizes

#### State Management
- **Context Optimization**: Prevent unnecessary re-renders
- **Memoization**: Use React.memo and useMemo appropriately
- **Virtual Scrolling**: Implement for large lists

### Backend Performance

#### Database Optimization
- **Query Optimization**: Use efficient MongoDB queries
- **Indexing**: Create appropriate database indexes
- **Connection Pooling**: Configure optimal connection pool size

#### Caching Strategy
- **Response Caching**: Cache frequently accessed data
- **Query Result Caching**: Cache expensive query results
- **CDN Integration**: Use CDN for static assets

## Deployment and DevOps

### Build Process

#### Frontend Build
- **Vite Configuration**: Optimize build for production
- **Environment Variables**: Manage different environments
- **Asset Optimization**: Compress images and assets

#### Backend Build
- **Maven Configuration**: Optimize JAR packaging
- **Profile Management**: Separate dev/prod configurations
- **Docker Integration**: Containerize application

### Monitoring and Logging

#### Application Monitoring
- **Health Checks**: Implement health check endpoints
- **Metrics Collection**: Monitor application performance
- **Error Tracking**: Implement error logging and alerting

#### Security Monitoring
- **Access Logging**: Log all authentication attempts
- **Audit Trail**: Track administrative actions
- **Intrusion Detection**: Monitor for suspicious activities