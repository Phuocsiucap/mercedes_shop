import { ApiService } from './api.js';

/**
 * Admin service for handling administrative operations
 * Uses the standardized API service template for consistent error handling
 */
class AdminService extends ApiService {
  constructor() {
    super('/admin');
  }

  // Dashboard endpoints

  /**
   * Get dashboard statistics
   * @returns {Promise<Object>} Dashboard statistics
   */
  async getDashboardStats() {
    return await this.get('/dashboard');
  }

  // User management endpoints

  /**
   * Get all users with filtering and pagination
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number (default: 0)
   * @param {number} params.size - Page size (default: 10)
   * @param {string} params.sortBy - Sort field (default: 'createdAt')
   * @param {string} params.sortDir - Sort direction (default: 'desc')
   * @param {string} params.keyword - Search keyword
   * @param {string} params.role - Role filter
   * @returns {Promise<Object>} Paginated user list
   */
  async getAllUsers(params = {}) {
    const queryParams = {
      page: params.page || 0,
      size: params.size || 10,
      sortBy: params.sortBy || 'createdAt',
      sortDir: params.sortDir || 'desc'
    };

    // Add optional filters
    if (params.keyword) queryParams.keyword = params.keyword;
    if (params.role) queryParams.role = params.role;

    return await this.get('/users', { params: queryParams });
  }

  /**
   * Get user by ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} User details
   */
  async getUserById(userId) {
    return await this.get(`/users/${userId}`);
  }

  /**
   * Update user role
   * @param {string} userId - User ID
   * @param {string} role - New role (CUSTOMER, ADMIN, USER)
   * @returns {Promise<Object>} Update response
   */
  async updateUserRole(userId, role) {
    return await this.put(`/users/${userId}/role`, null, {
      params: { role }
    });
  }

  /**
   * Delete user
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Delete response
   */
  async deleteUser(userId) {
    return await this.delete(`/users/${userId}`);
  }

  // Car management endpoints

  /**
   * Get all cars for admin with filtering and pagination
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number (default: 0)
   * @param {number} params.size - Page size (default: 10)
   * @param {string} params.sortBy - Sort field (default: 'id')
   * @param {string} params.sortDir - Sort direction (default: 'desc')
   * @param {string} params.keyword - Search keyword
   * @param {string} params.categoryId - Category filter
   * @returns {Promise<Object>} Paginated car list
   */
  async getAllCars(params = {}) {
    const queryParams = {
      page: params.page || 0,
      size: params.size || 10,
      sortBy: params.sortBy || 'id',
      sortDir: params.sortDir || 'desc'
    };

    // Add optional filters
    if (params.keyword) queryParams.keyword = params.keyword;
    if (params.categoryId) queryParams.categoryId = params.categoryId;

    return await this.get('/cars', { params: queryParams });
  }

  /**
   * Get car by ID for admin
   * @param {string} carId - Car ID
   * @returns {Promise<Object>} Car details
   */
  async getCarById(carId) {
    return await this.get(`/cars/${carId}`);
  }

  /**
   * Create new car
   * @param {Object} carData - Car data
   * @returns {Promise<Object>} Created car
   */
  async createCar(carData) {
    return await this.post('/cars', carData);
  }

  /**
   * Update car
   * @param {string} carId - Car ID
   * @param {Object} carData - Updated car data
   * @returns {Promise<Object>} Updated car
   */
  async updateCar(carId, carData) {
    return await this.put(`/cars/${carId}`, carData);
  }

  /**
   * Delete car
   * @param {string} carId - Car ID
   * @returns {Promise<Object>} Delete response
   */
  async deleteCar(carId) {
    return await this.delete(`/cars/${carId}`);
  }

  // Order management endpoints

  /**
   * Get all orders with filtering and pagination
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number (default: 0)
   * @param {number} params.size - Page size (default: 10)
   * @param {string} params.sortBy - Sort field (default: 'orderDate')
   * @param {string} params.sortDir - Sort direction (default: 'desc')
   * @param {string} params.status - Order status filter
   * @param {string} params.fromDate - Start date filter (YYYY-MM-DD)
   * @param {string} params.toDate - End date filter (YYYY-MM-DD)
   * @returns {Promise<Object>} Paginated order list
   */
  async getAllOrders(params = {}) {
    const queryParams = {
      page: params.page || 0,
      size: params.size || 10,
      sortBy: params.sortBy || 'orderDate',
      sortDir: params.sortDir || 'desc'
    };

    // Add optional filters
    if (params.status) queryParams.status = params.status;
    if (params.fromDate) queryParams.fromDate = params.fromDate;
    if (params.toDate) queryParams.toDate = params.toDate;

    return await this.get('/orders', { params: queryParams });
  }

  /**
   * Get order by ID
   * @param {string} orderId - Order ID
   * @returns {Promise<Object>} Order details
   */
  async getOrderById(orderId) {
    return await this.get(`/orders/${orderId}`);
  }

  /**
   * Update order status
   * @param {string} orderId - Order ID
   * @param {string} status - New status (PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED)
   * @returns {Promise<Object>} Updated order
   */
  async updateOrderStatus(orderId, status) {
    return await this.put(`/orders/${orderId}/status`, null, {
      params: { status }
    });
  }

  // Category management endpoints

  /**
   * Get all categories
   * @returns {Promise<Object>} List of categories
   */
  async getAllCategories() {
    return await this.get('/categories');
  }

  /**
   * Create new category
   * @param {Object} categoryData - Category data
   * @param {string} categoryData.name - Category name
   * @param {string} categoryData.description - Category description
   * @returns {Promise<Object>} Created category
   */
  async createCategory(categoryData) {
    return await this.post('/categories', categoryData);
  }

  /**
   * Update category
   * @param {string} categoryId - Category ID
   * @param {Object} categoryData - Updated category data
   * @returns {Promise<Object>} Updated category
   */
  async updateCategory(categoryId, categoryData) {
    return await this.put(`/categories/${categoryId}`, categoryData);
  }

  /**
   * Delete category
   * @param {string} categoryId - Category ID
   * @returns {Promise<Object>} Delete response
   */
  async deleteCategory(categoryId) {
    return await this.delete(`/categories/${categoryId}`);
  }

  // Reports endpoints

  /**
   * Get sales report
   * @param {Object} params - Report parameters
   * @param {string} params.fromDate - Start date (YYYY-MM-DD)
   * @param {string} params.toDate - End date (YYYY-MM-DD)
   * @param {string} params.groupBy - Group by period (day, week, month) (default: 'day')
   * @returns {Promise<Object>} Sales report
   */
  async getSalesReport(params = {}) {
    if (!params.fromDate || !params.toDate) {
      throw new Error('fromDate and toDate are required for sales report');
    }

    const queryParams = {
      fromDate: params.fromDate,
      toDate: params.toDate,
      groupBy: params.groupBy || 'day'
    };

    return await this.get('/reports/sales', { params: queryParams });
  }

  /**
   * Get inventory report
   * @returns {Promise<Object>} Inventory report
   */
  async getInventoryReport() {
    return await this.get('/reports/inventory');
  }

  /**
   * Get customer report
   * @param {Object} params - Report parameters
   * @param {string} params.fromDate - Start date (YYYY-MM-DD)
   * @param {string} params.toDate - End date (YYYY-MM-DD)
   * @returns {Promise<Object>} Customer report
   */
  async getCustomerReport(params = {}) {
    if (!params.fromDate || !params.toDate) {
      throw new Error('fromDate and toDate are required for customer report');
    }

    const queryParams = {
      fromDate: params.fromDate,
      toDate: params.toDate
    };

    return await this.get('/reports/customers', { params: queryParams });
  }

  /**
   * Get revenue report
   * @param {Object} params - Report parameters
   * @param {string} params.fromDate - Start date (YYYY-MM-DD)
   * @param {string} params.toDate - End date (YYYY-MM-DD)
   * @returns {Promise<Object>} Revenue report
   */
  async getRevenueReport(params = {}) {
    if (!params.fromDate || !params.toDate) {
      throw new Error('fromDate and toDate are required for revenue report');
    }

    const queryParams = {
      fromDate: params.fromDate,
      toDate: params.toDate
    };

    return await this.get('/reports/revenue', { params: queryParams });
  }

  // Additional utility methods

  /**
   * Search users
   * @param {string} keyword - Search keyword
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Search results
   */
  async searchUsers(keyword, options = {}) {
    return await this.getAllUsers({
      keyword,
      ...options
    });
  }

  /**
   * Search orders
   * @param {Object} searchParams - Search parameters
   * @param {string} searchParams.keyword - Search keyword
   * @param {string} searchParams.status - Status filter
   * @param {string} searchParams.fromDate - Start date
   * @param {string} searchParams.toDate - End date
   * @returns {Promise<Object>} Search results
   */
  async searchOrders(searchParams = {}) {
    return await this.getAllOrders(searchParams);
  }

  /**
   * Get user statistics
   * @returns {Promise<Object>} User statistics
   */
  async getUserStats() {
    try {
      const response = await this.getAllUsers({ size: 1 }); // Just to get total count
      const totalUsers = response.data?.totalElements || 0;

      // Get users by role
      const [adminUsers, customerUsers] = await Promise.all([
        this.getAllUsers({ role: 'ADMIN', size: 1 }),
        this.getAllUsers({ role: 'CUSTOMER', size: 1 })
      ]);

      return {
        success: true,
        data: {
          totalUsers,
          adminUsers: adminUsers.data?.totalElements || 0,
          customerUsers: customerUsers.data?.totalElements || 0,
          regularUsers: totalUsers - (adminUsers.data?.totalElements || 0) - (customerUsers.data?.totalElements || 0)
        }
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get order statistics
   * @returns {Promise<Object>} Order statistics
   */
  async getOrderStats() {
    try {
      const response = await this.getAllOrders({ size: 1 }); // Just to get total count
      const totalOrders = response.data?.totalElements || 0;

      // Get orders by status
      const [pendingOrders, confirmedOrders, deliveredOrders] = await Promise.all([
        this.getAllOrders({ status: 'PENDING', size: 1 }),
        this.getAllOrders({ status: 'CONFIRMED', size: 1 }),
        this.getAllOrders({ status: 'DELIVERED', size: 1 })
      ]);

      return {
        success: true,
        data: {
          totalOrders,
          pendingOrders: pendingOrders.data?.totalElements || 0,
          confirmedOrders: confirmedOrders.data?.totalElements || 0,
          deliveredOrders: deliveredOrders.data?.totalElements || 0
        }
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get recent activities (users, orders)
   * @param {number} limit - Number of items to return (default: 10)
   * @returns {Promise<Object>} Recent activities
   */
  async getRecentActivities(limit = 10) {
    try {
      const [recentUsers, recentOrders] = await Promise.all([
        this.getAllUsers({ size: limit, sortBy: 'createdAt', sortDir: 'desc' }),
        this.getAllOrders({ size: limit, sortBy: 'orderDate', sortDir: 'desc' })
      ]);

      return {
        success: true,
        data: {
          recentUsers: recentUsers.data?.content || [],
          recentOrders: recentOrders.data?.content || []
        }
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Bulk update order statuses
   * @param {Array} updates - Array of order updates
   * @param {string} updates[].orderId - Order ID
   * @param {string} updates[].status - New status
   * @returns {Promise<Object>} Bulk update results
   */
  async bulkUpdateOrderStatus(updates) {
    try {
      const promises = updates.map(update => 
        this.updateOrderStatus(update.orderId, update.status)
      );
      
      const results = await Promise.all(promises);

      return {
        success: true,
        data: results.map(result => result.data),
        message: `Updated ${updates.length} orders`
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Export data (placeholder for future implementation)
   * @param {string} type - Export type (users, orders, cars)
   * @param {Object} filters - Export filters
   * @returns {Promise<Object>} Export response
   */
  async exportData(type, filters = {}) {
    // This would typically generate and download a file
    // For now, return the data that would be exported
    try {
      let data;
      
      switch (type) {
        case 'users':
          data = await this.getAllUsers({ ...filters, size: 1000 });
          break;
        case 'orders':
          data = await this.getAllOrders({ ...filters, size: 1000 });
          break;
        case 'cars':
          data = await this.getAllCars({ ...filters, size: 1000 });
          break;
        default:
          throw new Error('Invalid export type');
      }

      return {
        success: true,
        data: data.data?.content || [],
        message: `Exported ${type} data successfully`
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get system health status
   * @returns {Promise<Object>} System health information
   */
  async getSystemHealth() {
    return await this.get('/system/health');
  }

  /**
   * Get application logs
   * @param {Object} params - Log parameters
   * @param {string} params.level - Log level (ERROR, WARN, INFO, DEBUG)
   * @param {number} params.limit - Number of log entries (default: 100)
   * @param {string} params.fromDate - Start date for logs
   * @returns {Promise<Object>} Application logs
   */
  async getApplicationLogs(params = {}) {
    const queryParams = {
      level: params.level || 'ERROR',
      limit: params.limit || 100
    };

    if (params.fromDate) queryParams.fromDate = params.fromDate;

    return await this.get('/system/logs', { params: queryParams });
  }

  /**
   * Clear application cache
   * @returns {Promise<Object>} Cache clear response
   */
  async clearCache() {
    return await this.post('/system/cache/clear');
  }

  /**
   * Get database statistics
   * @returns {Promise<Object>} Database statistics
   */
  async getDatabaseStats() {
    return await this.get('/system/database/stats');
  }

  /**
   * Backup database
   * @returns {Promise<Object>} Backup response
   */
  async backupDatabase() {
    return await this.post('/system/database/backup');
  }

  /**
   * Send notification to users
   * @param {Object} notificationData - Notification data
   * @param {string} notificationData.title - Notification title
   * @param {string} notificationData.message - Notification message
   * @param {Array} notificationData.userIds - Target user IDs (optional, sends to all if empty)
   * @param {string} notificationData.type - Notification type (INFO, WARNING, ERROR)
   * @returns {Promise<Object>} Notification response
   */
  async sendNotification(notificationData) {
    return await this.post('/notifications/send', notificationData);
  }

  /**
   * Get notification history
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number (default: 0)
   * @param {number} params.size - Page size (default: 20)
   * @returns {Promise<Object>} Notification history
   */
  async getNotificationHistory(params = {}) {
    const queryParams = {
      page: params.page || 0,
      size: params.size || 20
    };

    return await this.get('/notifications/history', { params: queryParams });
  }

  // ==================== TEST DRIVE MANAGEMENT ====================

  /**
   * Get all test drives with filtering and pagination
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Paginated test drive list
   */
  async getAllTestDrives(params = {}) {
    const queryParams = {
      page: params.page || 0,
      size: params.size || 10,
      sortBy: params.sortBy || 'createdAt',
      sortDir: params.sortDir || 'desc'
    };

    if (params.keyword) queryParams.keyword = params.keyword;
    if (params.status) queryParams.status = params.status;

    return await this.get('/test-drives', { params: queryParams });
  }

  /**
   * Get test drive by ID
   * @param {string} id - Test drive ID
   * @returns {Promise<Object>} Test drive details
   */
  async getTestDriveById(id) {
    return await this.get(`/test-drives/${id}`);
  }

  /**
   * Create new test drive (admin)
   * @param {Object} data - Test drive data
   * @returns {Promise<Object>} Created test drive
   */
  async createTestDrive(data) {
    return await this.post('/test-drives', data);
  }

  /**
   * Update test drive
   * @param {string} id - Test drive ID
   * @param {Object} data - Updated data
   * @returns {Promise<Object>} Updated test drive
   */
  async updateTestDrive(id, data) {
    return await this.put(`/test-drives/${id}`, data);
  }

  /**
   * Update test drive status
   * @param {string} id - Test drive ID
   * @param {string} status - New status (PENDING, CONFIRMED, COMPLETED, CANCELLED)
   * @returns {Promise<Object>} Updated test drive
   */
  async updateTestDriveStatus(id, status) {
    return await this.put(`/test-drives/${id}/status`, null, {
      params: { status }
    });
  }

  /**
   * Delete test drive
   * @param {string} id - Test drive ID
   * @returns {Promise<Object>} Delete response
   */
  async deleteTestDrive(id) {
    return await this.delete(`/test-drives/${id}`);
  }
}

// Export singleton instance
export default new AdminService();