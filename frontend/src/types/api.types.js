/**
 * @fileoverview API response type definitions
 * These types define the structure of API responses from the backend
 */

/**
 * Standard API response wrapper
 * @typedef {Object} ApiResponse
 * @property {boolean} success - Whether the request was successful
 * @property {string} message - Response message
 * @property {*} data - Response data (can be any type)
 * @property {string[]} [errors] - Array of error messages (optional)
 * @property {string} [timestamp] - Response timestamp (optional)
 */
export const ApiResponse = {
  success: Boolean,
  message: String,
  data: Object,
  errors: Array,
  timestamp: String
};

/**
 * Paginated response structure
 * @typedef {Object} PaginatedResponse
 * @property {boolean} success - Whether the request was successful
 * @property {string} message - Response message
 * @property {Object} data - Paginated data object
 * @property {Array} data.content - Array of items for current page
 * @property {number} data.totalElements - Total number of items
 * @property {number} data.totalPages - Total number of pages
 * @property {number} data.currentPage - Current page number (0-based)
 * @property {number} data.size - Page size
 * @property {boolean} data.first - Whether this is the first page
 * @property {boolean} data.last - Whether this is the last page
 * @property {string[]} [errors] - Array of error messages (optional)
 */
export const PaginatedResponse = {
  success: Boolean,
  message: String,
  data: {
    content: Array,
    totalElements: Number,
    totalPages: Number,
    currentPage: Number,
    size: Number,
    first: Boolean,
    last: Boolean
  },
  errors: Array
};

/**
 * Authentication response structure
 * @typedef {Object} AuthResponse
 * @property {boolean} success - Whether authentication was successful
 * @property {string} message - Authentication message
 * @property {Object} data - Authentication data
 * @property {string} data.token - JWT access token
 * @property {string} data.refreshToken - JWT refresh token
 * @property {Object} data.user - User information
 * @property {string[]} [errors] - Array of error messages (optional)
 */
export const AuthResponse = {
  success: Boolean,
  message: String,
  data: {
    token: String,
    refreshToken: String,
    user: Object
  },
  errors: Array
};

/**
 * Error response structure
 * @typedef {Object} ErrorResponse
 * @property {string} type - Error type ('API_ERROR', 'NETWORK_ERROR', 'UNKNOWN_ERROR')
 * @property {number} [status] - HTTP status code (for API errors)
 * @property {string} message - Error message
 * @property {string[]} [errors] - Detailed error messages
 * @property {*} [data] - Additional error data
 * @property {Error} [originalError] - Original error object
 */
export const ErrorResponse = {
  type: String,
  status: Number,
  message: String,
  errors: Array,
  data: Object,
  originalError: Error
};

/**
 * Upload progress structure
 * @typedef {Object} UploadProgress
 * @property {number} loaded - Bytes uploaded
 * @property {number} total - Total bytes to upload
 * @property {number} percentage - Upload percentage (0-100)
 */
export const UploadProgress = {
  loaded: Number,
  total: Number,
  percentage: Number
};

/**
 * Request configuration options
 * @typedef {Object} RequestConfig
 * @property {Object} [headers] - Additional headers
 * @property {number} [timeout] - Request timeout in milliseconds
 * @property {AbortSignal} [signal] - Abort signal for cancelling requests
 * @property {Function} [onUploadProgress] - Upload progress callback
 * @property {Function} [onDownloadProgress] - Download progress callback
 */
export const RequestConfig = {
  headers: Object,
  timeout: Number,
  signal: AbortSignal,
  onUploadProgress: Function,
  onDownloadProgress: Function
};

/**
 * Search/Filter parameters
 * @typedef {Object} SearchParams
 * @property {string} [query] - Search query string
 * @property {number} [page] - Page number (0-based)
 * @property {number} [size] - Page size
 * @property {string} [sort] - Sort field
 * @property {string} [direction] - Sort direction ('asc' or 'desc')
 * @property {Object} [filters] - Additional filter parameters
 */
export const SearchParams = {
  query: String,
  page: Number,
  size: Number,
  sort: String,
  direction: String,
  filters: Object
};

/**
 * Dashboard statistics response
 * @typedef {Object} DashboardStats
 * @property {number} totalUsers - Total number of users
 * @property {number} totalCars - Total number of cars
 * @property {number} totalOrders - Total number of orders
 * @property {number} totalRevenue - Total revenue
 * @property {number} todayRevenue - Today's revenue
 * @property {number} averageOrderValue - Average order value
 * @property {number} todayOrders - Today's orders count
 * @property {number} todayUsers - Today's new users count
 * @property {number} revenueGrowth - Revenue growth percentage
 * @property {number} ordersGrowth - Orders growth percentage
 * @property {number} usersGrowth - Users growth percentage
 * @property {Object} orderStatusDistribution - Order status distribution map
 * @property {Array} recentOrders - Recent orders data
 */
export const DashboardStats = {
  totalUsers: Number,
  totalCars: Number,
  totalOrders: Number,
  totalRevenue: Number,
  todayRevenue: Number,
  averageOrderValue: Number,
  todayOrders: Number,
  todayUsers: Number,
  revenueGrowth: Number,
  ordersGrowth: Number,
  usersGrowth: Number,
  orderStatusDistribution: Object,
  recentOrders: Array
};

/**
 * Recent order summary for dashboard
 * @typedef {Object} RecentOrder
 * @property {string} id - Order ID
 * @property {string} userName - User name
 * @property {string} orderDate - Order date
 * @property {number} totalAmount - Total amount
 * @property {string} status - Order status
 */
export const RecentOrder = {
  id: String,
  userName: String,
  orderDate: String,
  totalAmount: Number,
  status: String
};

/**
 * Report data structure
 * @typedef {Object} ReportData
 * @property {string} period - Report period
 * @property {Array} data - Report data points
 * @property {Object} summary - Report summary statistics
 */
export const ReportData = {
  period: String,
  data: Array,
  summary: Object
};

/**
 * Sales report structure
 * @typedef {Object} SalesReport
 * @property {string} fromDate - Start date
 * @property {string} toDate - End date
 * @property {string} groupBy - Grouping criteria
 * @property {number} totalRevenue - Total revenue
 * @property {number} totalOrders - Total orders
 * @property {number} totalItems - Total items sold
 * @property {Array} salesData - Sales data points
 * @property {Array} topSellingCars - Top selling cars
 */
export const SalesReport = {
  fromDate: String,
  toDate: String,
  groupBy: String,
  totalRevenue: Number,
  totalOrders: Number,
  totalItems: Number,
  salesData: Array,
  topSellingCars: Array
};

/**
 * Sales data point structure
 * @typedef {Object} SalesDataPoint
 * @property {string} period - Time period
 * @property {number} revenue - Revenue for period
 * @property {number} orders - Orders for period
 * @property {number} items - Items sold for period
 */
export const SalesDataPoint = {
  period: String,
  revenue: Number,
  orders: Number,
  items: Number
};

/**
 * Top selling car structure
 * @typedef {Object} TopSellingCar
 * @property {string} carId - Car ID
 * @property {string} carName - Car name
 * @property {string} categoryName - Category name
 * @property {number} totalSold - Total units sold
 * @property {number} totalRevenue - Total revenue from this car
 */
export const TopSellingCar = {
  carId: String,
  carName: String,
  categoryName: String,
  totalSold: Number,
  totalRevenue: Number
};

/**
 * Admin filter request structure
 * @typedef {Object} AdminFilterRequest
 * @property {string} [searchTerm] - Search term
 * @property {string} [status] - Status filter
 * @property {string} [dateFrom] - Start date filter
 * @property {string} [dateTo] - End date filter
 * @property {string} [sortBy] - Sort field
 * @property {string} [sortDirection] - Sort direction
 * @property {number} [page] - Page number
 * @property {number} [size] - Page size
 */
export const AdminFilterRequest = {
  searchTerm: String,
  status: String,
  dateFrom: String,
  dateTo: String,
  sortBy: String,
  sortDirection: String,
  page: Number,
  size: Number
};

/**
 * Type validation utilities
 */
export const TypeValidators = {
  /**
   * Validate if response matches ApiResponse structure
   * @param {*} response - Response to validate
   * @returns {boolean} - Whether response is valid
   */
  isValidApiResponse: (response) => {
    return response && 
           typeof response.success === 'boolean' &&
           typeof response.message === 'string' &&
           response.data !== undefined;
  },

  /**
   * Validate if response matches PaginatedResponse structure
   * @param {*} response - Response to validate
   * @returns {boolean} - Whether response is valid
   */
  isValidPaginatedResponse: (response) => {
    return TypeValidators.isValidApiResponse(response) &&
           response.data &&
           Array.isArray(response.data.content) &&
           typeof response.data.totalElements === 'number' &&
           typeof response.data.totalPages === 'number' &&
           typeof response.data.currentPage === 'number';
  },

  /**
   * Validate if response matches AuthResponse structure
   * @param {*} response - Response to validate
   * @returns {boolean} - Whether response is valid
   */
  isValidAuthResponse: (response) => {
    return TypeValidators.isValidApiResponse(response) &&
           response.data &&
           typeof response.data.token === 'string' &&
           response.data.user !== undefined;
  }
};