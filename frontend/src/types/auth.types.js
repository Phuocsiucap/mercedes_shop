/**
 * @fileoverview Authentication type definitions
 * Định nghĩa các kiểu dữ liệu cho authentication
 */

/**
 * Login request
 * @typedef {Object} LoginRequest
 * @property {string} email - Email đăng nhập
 * @property {string} password - Mật khẩu
 */

/**
 * Register request
 * @typedef {Object} RegisterRequest
 * @property {string} fullName - Họ tên
 * @property {string} email - Email
 * @property {string} password - Mật khẩu
 * @property {string} [phoneNumber] - Số điện thoại
 * @property {string} [address] - Địa chỉ
 */

/**
 * OAuth request
 * @typedef {Object} OAuthRequest
 * @property {string} provider - Provider (google, facebook)
 * @property {string} token - OAuth token
 * @property {string} [email] - Email từ provider
 * @property {string} [fullName] - Tên từ provider
 */

/**
 * Auth response
 * @typedef {Object} AuthResponse
 * @property {boolean} success
 * @property {string} message
 * @property {AuthData} data
 */

/**
 * Auth data
 * @typedef {Object} AuthData
 * @property {string} token - JWT access token
 * @property {string} [refreshToken] - Refresh token
 * @property {UserInfo} [user] - User info
 */

/**
 * User info from token
 * @typedef {Object} UserInfo
 * @property {string} id - User ID
 * @property {string} email - Email
 * @property {string} fullName - Họ tên
 * @property {string} role - Role (ADMIN, USER, CUSTOMER)
 * @property {number} [exp] - Token expiration
 */

export const AuthTypes = {
  LoginRequest: {
    email: '',
    password: ''
  },
  RegisterRequest: {
    fullName: '',
    email: '',
    password: '',
    phoneNumber: '',
    address: ''
  },
  OAuthRequest: {
    provider: '',
    token: '',
    email: '',
    fullName: ''
  }
};

export const UserRoles = {
  ADMIN: 'ADMIN',
  USER: 'USER',
  CUSTOMER: 'CUSTOMER'
};
