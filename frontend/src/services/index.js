/**
 * @fileoverview Services index - Export tất cả services
 * 
 * Cấu trúc services:
 * - api.js: Base API service với axios instance
 * - authService.js: Authentication (login, register, logout, OAuth)
 * - userService.js: User profile management
 * - carService.js: Car operations (bao gồm cả category)
 * - categoryService.js: Category management
 * - cartService.js: Shopping cart operations
 * - orderService.js: Order management
 * - favoriteService.js: Favorites management
 * - reviewService.js: Reviews management
 * - driverTestService.js: Test drive booking
 * - adminService.js: Admin operations
 * - uploadService.js: File upload
 * - exportService.js: Export to PDF/Excel
 */

// Base API
export { default as api, ApiService, tokenManager, roleValidator, responseFormatter } from './api.js';

// Domain Services
export { default as authService } from './authService.js';
export { default as userService } from './userService.js';
export { default as carService } from './carService.js';
export { default as categoryService } from './categoryService.js';
export { default as cartService } from './cartService.js';
export { default as orderService } from './orderService.js';
export { default as favoriteService } from './favoriteService.js';
export { default as reviewService } from './reviewService.js';
export { default as driverTestService } from './driverTestService.js';

// Admin Service
export { default as adminService } from './adminService.js';

// Payment Service
export { default as paymentService } from './paymentService.js';

// Utility Services
export { default as uploadService } from './uploadService.js';
export { default as exportService } from './exportService.js';
