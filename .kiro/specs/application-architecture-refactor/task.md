# Implementation Plan

- [x] 1. Set up frontend component structure and base API service





  - Create components directory with layouts, modals, and ui subdirectories
  - Implement base api.js template with authentication and error handling
  - Set up TypeScript type definitions for API responses
  - _Requirements: 1.1, 1.2, 2.1, 4.1_

- [x] 1.1 Create frontend component directory structure


  - Create frontend/src/components/layouts/ directory
  - Create frontend/src/components/modals/ directory  
  - Create frontend/src/components/ui/ directory
  - _Requirements: 1.1_



- [x] 1.2 Implement base API service template










  - Create frontend/src/services/api.js with standardized request/response handling
  - Implement authentication token management
  - Add error handling and retry logic
  - _Requirements: 2.1, 2.4_

- [ ] 1.3 Write property test for authentication token consistency









  - **Property 1: Authentication token consistency**


  - **Validates: Requirements 2.4**

- [x] 1.4 Create TypeScript type definitions





  - Create frontend/src/types/api.types.js with API response interfaces
  - Create frontend/src/types/user.types.js with user-related types
  - Create frontend/src/types/car.types.js with car-related types
  - _Requirements: 4.1, 4.5_

- [ ]* 1.5 Write property test for API response validation
  - **Property 2: API response schema validation**
  - **Validates: Requirements 2.5**

- [x] 2. Implement React context providers for global state management





  - Create AuthContext for authentication state
  - Create CartContext for shopping cart state
  - Create AppContext for global application settings
  - _Requirements: 3.1, 3.2, 3.3_

- [x] 2.1 Create authentication context provider


  - Implement AuthContext with user state, login, logout methods
  - Add token management and automatic refresh
  - Integrate with existing authentication flow
  - _Requirements: 3.1, 3.2_

- [ ]* 2.2 Write property test for context state propagation
  - **Property 3: Context state propagation**
  - **Validates: Requirements 3.2**



- [x] 2.3 Create cart context provider







  - Implement CartContext with cart state and operations
  - Add persistence across page navigation
  - Integrate with existing cart functionality
  - _Requirements: 3.3_

- [ ]* 2.4 Write property test for cart state persistence
  - **Property 4: Cart state persistence**


  - **Validates: Requirements 3.3**

- [x] 2.5 Create global application context




  - Implement AppContext for global settings and configuration
  - Add theme, language, and other app-wide state
  - _Requirements: 3.4_

- [x] 3. Create reusable UI components and layouts





  - Implement AdminLayout for admin pages
  - Create reusable modal components
  - Build basic UI components (Button, Input, Card)
  - _Requirements: 1.4, 1.5_

- [x] 3.1 Implement AdminLayout component


  - Create layout with sidebar navigation
  - Add responsive design for mobile/desktop
  - Integrate with existing admin pages
  - _Requirements: 1.4_

- [x] 3.2 Create reusable modal components


  - Implement ConfirmModal for confirmations
  - Create FormModal for form dialogs
  - Add ImageModal for image previews
  - _Requirements: 1.5_

- [x] 3.3 Build basic UI components


  - Create Button component with variants
  - Implement Input component with validation states
  - Build Card component for content containers
  - Add LoadingSpinner and ErrorBoundary components
  - _Requirements: 1.3, 1.5_


- [x] 4. Restructure backend controllers and implement service layer




  - Create separate controllers for different domains
  - Implement service classes for business logic
  - Add proper error handling and validation

  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 6.1, 6.2_

- [x] 4.1 Create AuthController and AuthService

  - Implement AuthController with login, register, refresh endpoints
  - Create AuthService with authentication business logic
  - Add proper error handling and validation
  - _Requirements: 5.2, 6.1, 6.2_

- [x] 4.2 Create UserController and UserService


  - Implement UserController with profile and user management endpoints
  - Create UserService with user business logic
  - Add validation and error handling
  - _Requirements: 5.3, 6.1, 6.2_

- [x] 4.3 Create CarController and CarService


  - Implement CarController with car-related endpoints
  - Create CarService with car business logic
  - Add search and filtering capabilities
  - _Requirements: 5.4, 6.1, 6.2_

- [x] 4.4 Create CartController and CartService


  - Implement CartController with cart operations
  - Create CartService with cart business logic
  - Add checkout and order processing
  - _Requirements: 5.4, 6.1, 6.2_

- [x] 4.5 Create AdminController and AdminService


  - Implement AdminController with administrative endpoints
  - Create AdminService with admin business logic
  - Add dashboard, reports, and management features
  - _Requirements: 5.5, 6.1, 6.2_

- [ ]* 4.6 Write property test for service layer validation
  - **Property 7: Service layer validation**
  - **Validates: Requirements 6.3**

- [x] 5. Enhance DTOs and mappers for consistent data transfer





  - Add validation annotations to request DTOs
  - Enhance response DTOs with consistent structure
  - Update mappers for proper entity-DTO conversion
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_


- [x] 5.1 Enhance request DTOs with validation

  - Add @Valid annotations and validation constraints
  - Implement proper error messages
  - Update all existing request DTOs
  - _Requirements: 7.1_

- [ ]* 5.2 Write property test for request DTO validation
  - **Property 8: Request DTO validation**
  - **Validates: Requirements 7.1**

- [x] 5.3 Enhance response DTOs with consistent structure


  - Implement ApiResponse wrapper for all responses
  - Add pagination support for list responses
  - Ensure consistent field naming and types
  - _Requirements: 7.2_

- [ ]* 5.4 Write property test for response DTO consistency
  - **Property 9: Response DTO consistency**
  - **Validates: Requirements 7.2**

- [x] 5.5 Update and enhance mappers


  - Update existing mappers with proper field mappings
  - Add validation for required fields
  - Implement bidirectional mapping where needed
  - _Requirements: 7.3, 7.4, 7.5_

- [ ]* 5.6 Write property test for entity-DTO mapping
  - **Property 10: Entity-DTO mapping round-trip**
  - **Validates: Requirements 7.5**

- [x] 6. Implement role-based authorization system





  - Configure Spring Security for role-based access
  - Add authorization annotations to controllers
  - Implement proper error handling for unauthorized access
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 6.1 Configure role-based Spring Security


  - Update SecurityConfig with role-based access rules
  - Configure method-level security
  - Add role hierarchy configuration
  - _Requirements: 8.1, 8.2, 8.3_

- [x] 6.2 Add authorization annotations to controllers


  - Add @PreAuthorize annotations to admin endpoints
  - Secure staff and customer endpoints appropriately
  - Implement role checking in service methods
  - _Requirements: 8.1, 8.2, 8.3_

- [ ]* 6.3 Write property test for admin endpoint authorization
  - **Property 11: Admin endpoint authorization**
  - **Validates: Requirements 8.1**

- [ ]* 6.4 Write property test for staff endpoint authorization
  - **Property 12: Staff endpoint authorization**
  - **Validates: Requirements 8.2**

- [ ]* 6.5 Write property test for customer endpoint authorization
  - **Property 13: Customer endpoint authorization**
  - **Validates: Requirements 8.3**

- [x] 6.6 Implement unauthorized access error handling


  - Create custom exception handlers for 401/403 errors
  - Add proper error messages and response format
  - Implement rate limiting for failed attempts
  - _Requirements: 8.4_

- [ ]* 6.7 Write property test for unauthorized access error handling
  - **Property 14: Unauthorized access error handling**
  - **Validates: Requirements 8.4**

- [ ]* 6.8 Write property test for permission enforcement immediacy
  - **Property 15: Permission enforcement immediacy**
  - **Validates: Requirements 8.5**

- [x] 7. Checkpoint - Ensure all backend tests pass





  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Create frontend service layer using new backend structure





  - Create service files following api.js template
  - Update existing API calls to use new controller endpoints
  - Add proper error handling and type validation
  - _Requirements: 2.1, 2.2, 9.2_

- [x] 8.1 Create authService.js


  - Implement authentication service methods
  - Use api.js template for consistent error handling
  - Add token management and refresh logic
  - _Requirements: 2.1, 2.2, 9.2_



- [x] 8.2 Create userService.js





  - Implement user management service methods
  - Add profile update and password change functions
  - Include proper validation and error handling


  - _Requirements: 2.1, 2.2, 9.2_

- [x] 8.3 Create carService.js








  - Implement car-related service methods


  - Add search, filtering, and review functions
  - Update to use new CarController endpoints
  - _Requirements: 2.1, 2.2, 9.2_






- [x] 8.4 Create cartService.js

  - Implement cart management service methods
  - Add checkout and order processing functions
  - Update to use new CartController endpoints
  - _Requirements: 2.1, 2.2, 9.2_

- [x] 8.5 Create adminService.js





  - Implement administrative service methods
  - Add dashboard, reports, and management functions
  - Update to use new AdminController endpoints
  - _Requirements: 2.1, 2.2, 9.2_

- [ ]* 8.6 Write property test for API endpoint consistency
  - **Property 17: API endpoint consistency**
  - **Validates: Requirements 9.2**

- [x] 9. Update frontend pages to use new components and services



  - Refactor admin pages to use AdminLayout
  - Update all pages to use new service layer
  - Integrate context providers throughout the application
  - _Requirements: 9.1, 9.4, 9.5_



- [x] 9.1 Update admin pages with new layout and services





  - Refactor AdminDashboard to use AdminLayout component
  - Update AdminCars, AdminUsers, AdminOrders to use new services
  - Integrate with context providers for state management
  - _Requirements: 9.1, 9.5_



- [x] 9.2 Update user-facing pages








  - Refactor HomePage, CarsPage, CartPage to use new services
  - Integrate with AuthContext and CartContext
  - Update authentication pages to use new AuthService


  - _Requirements: 9.1, 9.4_

- [ ] 9.3 Update authentication flow





  - Integrate AuthContext throughout the application
  - Update login/logout functionality
  - Add automatic token refresh handling
  - _Requirements: 9.4_

- [ ]* 9.4 Write property test for session management consistency
  - **Property 18: Session management consistency**
  - **Validates: Requirements 9.4**

- [ ]* 9.5 Write property test for feature preservation
  - **Property 16: Feature preservation after refactoring**
  - **Validates: Requirements 9.1**

- [ ]* 9.6 Write property test for admin feature preservation
  - **Property 19: Admin feature preservation**
  - **Validates: Requirements 9.5**



- [-] 10. Add comprehensive error handling and validation




  - Implement frontend error boundaries
  - Add backend global exception handler
  - Create user-friendly error messages
  - _Requirements: 2.5, 4.1, 6.3, 7.1_



- [-] 10.1 Implement frontend error boundaries


  - Create ErrorBoundary component for page-level errors
  - Add component-level error handling
  - Implement global error handler for unhandled errors

  - _Requirements: 2.5, 4.1_


- [ ] 10.2 Enhance backend global exception handler

  - Update GlobalExceptionHandler with comprehensive error handling
  - Add specific handlers for validation, authentication, and business errors
  - Implement consistent error response format
  - _Requirements: 6.3, 7.1_

- [ ]* 10.3 Write property test for frontend API response validation
  - **Property 5: Frontend API response validation**
  - **Validates: Requirements 4.1**


- [ ]* 10.4 Write property test for data serialization round-trip
  - **Property 6: Data serialization round-trip**
  - **Validates: Requirements 4.5**

- [ ] 11. Final integration and testing




  - Run comprehensive integration tests

  - Verify all existing functionality works
  - Test role-based authorization across all endpoints

  - _Requirements: 9.1, 9.2, 9.4, 9.5_


- [ ] 11.1 Run integration tests


  - Test complete user workflows (registration, login, shopping)
  - Verify admin functionality works correctly
  - Test error scenarios and edge cases
  - _Requirements: 9.1, 9.5_

- [ ]* 11.2 Write integration tests for complete workflows
  - Test end-to-end user journeys
  - Verify data consistency between frontend and backend
  - Test authentication and authorization flows

  - _Requirements: 9.1, 9.2, 9.4, 9.5_


- [ ] 12. Final Checkpoint - Ensure all tests pass



  - Ensure all tests pass, ask the user if questions arise.