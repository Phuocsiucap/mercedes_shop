/**
 * @fileoverview User-related type definitions
 * These types define user data structures and authentication state
 */

/**
 * User entity structure
 * @typedef {Object} User
 * @property {string} id - Unique user identifier
 * @property {string} fullName - User's full name
 * @property {string} email - User's email address
 * @property {string} [phoneNumber] - User's phone number (optional)
 * @property {string} [address] - User's address (optional)
 * @property {string} role - User role ('CUSTOMER', 'ADMIN', 'USER')
 * @property {boolean} verified - Whether user email is verified
 * @property {string} [provider] - Authentication provider ('LOCAL', 'GOOGLE', 'FACEBOOK')
 * @property {string} createdAt - User creation timestamp
 * @property {string} [updatedAt] - Last update timestamp (optional)
 * @property {string} [avatar] - User avatar URL (optional)
 */
export const User = {
  id: String,
  fullName: String,
  email: String,
  phoneNumber: String,
  address: String,
  role: String,
  verified: Boolean,
  provider: String,
  createdAt: String,
  updatedAt: String,
  avatar: String
};

/**
 * Authentication state structure
 * @typedef {Object} AuthState
 * @property {User|null} user - Current authenticated user or null
 * @property {string|null} token - JWT access token or null
 * @property {string|null} refreshToken - JWT refresh token or null
 * @property {boolean} isAuthenticated - Whether user is authenticated
 * @property {boolean} loading - Whether authentication is in progress
 * @property {string|null} error - Authentication error message or null
 */
export const AuthState = {
  user: User,
  token: String,
  refreshToken: String,
  isAuthenticated: Boolean,
  loading: Boolean,
  error: String
};

/**
 * Login request structure
 * @typedef {Object} LoginRequest
 * @property {string} email - User email
 * @property {string} password - User password
 * @property {boolean} [rememberMe] - Whether to remember login (optional)
 */
export const LoginRequest = {
  email: String,
  password: String,
  rememberMe: Boolean
};

/**
 * Registration request structure
 * @typedef {Object} RegisterRequest
 * @property {string} fullName - User's full name
 * @property {string} email - User's email address
 * @property {string} password - User's password
 * @property {string} confirmPassword - Password confirmation
 * @property {string} [phoneNumber] - User's phone number (optional)
 * @property {string} [address] - User's address (optional)
 */
export const RegisterRequest = {
  fullName: String,
  email: String,
  password: String,
  confirmPassword: String,
  phoneNumber: String,
  address: String
};

/**
 * Profile update request structure
 * @typedef {Object} UpdateProfileRequest
 * @property {string} fullName - User's full name
 * @property {string} [phoneNumber] - User's phone number (optional)
 * @property {string} [address] - User's address (optional)
 * @property {File} [avatar] - User avatar file (optional)
 */
export const UpdateProfileRequest = {
  fullName: String,
  phoneNumber: String,
  address: String,
  avatar: File
};

/**
 * Change password request structure
 * @typedef {Object} ChangePasswordRequest
 * @property {string} currentPassword - Current password
 * @property {string} newPassword - New password
 * @property {string} confirmPassword - New password confirmation
 */
export const ChangePasswordRequest = {
  currentPassword: String,
  newPassword: String,
  confirmPassword: String
};

/**
 * OAuth request structure
 * @typedef {Object} OAuthRequest
 * @property {string} provider - OAuth provider ('google', 'facebook')
 * @property {string} token - OAuth access token
 * @property {Object} [profile] - OAuth profile data (optional)
 */
export const OAuthRequest = {
  provider: String,
  token: String,
  profile: Object
};

/**
 * Password reset request structure
 * @typedef {Object} PasswordResetRequest
 * @property {string} email - User email for password reset
 */
export const PasswordResetRequest = {
  email: String
};

/**
 * Password reset confirmation structure
 * @typedef {Object} PasswordResetConfirmation
 * @property {string} token - Password reset token
 * @property {string} newPassword - New password
 * @property {string} confirmPassword - New password confirmation
 */
export const PasswordResetConfirmation = {
  token: String,
  newPassword: String,
  confirmPassword: String
};

/**
 * User roles enumeration
 */
export const UserRoles = {
  CUSTOMER: 'CUSTOMER',
  ADMIN: 'ADMIN',
  USER: 'USER',
  STAFF: 'STAFF'
};

/**
 * Authentication providers enumeration
 */
export const AuthProviders = {
  LOCAL: 'LOCAL',
  GOOGLE: 'GOOGLE',
  FACEBOOK: 'FACEBOOK'
};

/**
 * Admin user response structure (for admin panel)
 * @typedef {Object} AdminUserResponse
 * @property {string} id - User ID
 * @property {string} fullName - User's full name
 * @property {string} email - User's email
 * @property {string} role - User role
 * @property {boolean} verified - Email verification status
 * @property {string} createdAt - Creation date
 * @property {number} totalOrders - Total number of orders
 * @property {number} totalSpent - Total amount spent
 * @property {string} lastLogin - Last login timestamp
 */
export const AdminUserResponse = {
  id: String,
  fullName: String,
  email: String,
  role: String,
  verified: Boolean,
  createdAt: String,
  totalOrders: Number,
  totalSpent: Number,
  lastLogin: String
};

/**
 * User profile response structure
 * @typedef {Object} UserProfileResponse
 * @property {string} id - User ID
 * @property {string} fullName - User's full name
 * @property {string} email - User's email
 * @property {string} [phoneNumber] - User's phone number
 * @property {string} [address] - User's address
 * @property {string} [avatar] - User avatar URL
 * @property {boolean} verified - Email verification status
 * @property {string} createdAt - Account creation date
 * @property {string} [updatedAt] - Last profile update
 */
export const UserProfileResponse = {
  id: String,
  fullName: String,
  email: String,
  phoneNumber: String,
  address: String,
  avatar: String,
  verified: Boolean,
  createdAt: String,
  updatedAt: String
};