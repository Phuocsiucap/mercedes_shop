/**
 * @fileoverview Car-related type definitions
 * These types define car data structures, cart items, and related entities
 */

/**
 * Car entity structure
 * @typedef {Object} Car
 * @property {string} id - Unique car identifier
 * @property {string} name - Car name/model
 * @property {string} categoryId - Category identifier
 * @property {string} categoryName - Category name
 * @property {number} price - Car price
 * @property {number} manufactureYear - Year of manufacture
 * @property {string} color - Car color
 * @property {string} engine - Engine specifications
 * @property {string} transmission - Transmission type ('MANUAL', 'AUTOMATIC')
 * @property {number} seats - Number of seats
 * @property {string} [image] - Car image URL (optional)
 * @property {string} [description] - Car description (optional)
 * @property {number} [averageRating] - Average rating (0-5) (optional)
 * @property {number} [reviewCount] - Number of reviews (optional)
 * @property {boolean} [available] - Whether car is available (optional)
 * @property {string} createdAt - Creation timestamp
 * @property {string} [updatedAt] - Last update timestamp (optional)
 */
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
  reviewCount: Number,
  available: Boolean,
  createdAt: String,
  updatedAt: String
};

/**
 * Car category structure
 * @typedef {Object} Category
 * @property {string} id - Category identifier
 * @property {string} name - Category name
 * @property {string} [description] - Category description (optional)
 * @property {number} [carCount] - Number of cars in category (optional)
 */
export const Category = {
  id: String,
  name: String,
  description: String,
  carCount: Number
};

/**
 * Cart item structure
 * @typedef {Object} CartItem
 * @property {string} id - Cart item identifier
 * @property {Car} car - Car details
 * @property {number} quantity - Quantity of this car in cart
 * @property {number} price - Price per item (may differ from car.price due to discounts)
 * @property {number} totalPrice - Total price for this item (price * quantity)
 * @property {string} addedAt - When item was added to cart
 */
export const CartItem = {
  id: String,
  car: Car,
  quantity: Number,
  price: Number,
  totalPrice: Number,
  addedAt: String
};

/**
 * Shopping cart structure
 * @typedef {Object} Cart
 * @property {string} id - Cart identifier
 * @property {string} userId - User identifier
 * @property {CartItem[]} items - Array of cart items
 * @property {number} totalItems - Total number of items in cart
 * @property {number} totalPrice - Total cart price
 * @property {string} updatedAt - Last update timestamp
 */
export const Cart = {
  id: String,
  userId: String,
  items: Array,
  totalItems: Number,
  totalPrice: Number,
  updatedAt: String
};

/**
 * Car review structure
 * @typedef {Object} Review
 * @property {string} id - Review identifier
 * @property {string} carId - Car identifier
 * @property {string} userId - User identifier
 * @property {string} userName - User name
 * @property {number} rating - Rating (1-5)
 * @property {string} [comment] - Review comment (optional)
 * @property {string} createdAt - Review creation timestamp
 */
export const Review = {
  id: String,
  carId: String,
  userId: String,
  userName: String,
  rating: Number,
  comment: String,
  createdAt: String
};

/**
 * Order structure
 * @typedef {Object} Order
 * @property {string} id - Order identifier
 * @property {string} userId - User identifier
 * @property {string} userFullName - User full name
 * @property {OrderDetail[]} orderDetails - Array of order items
 * @property {number} totalAmount - Total order amount
 * @property {string} status - Order status
 * @property {string} createdAt - Order creation timestamp
 * @property {string} [updatedAt] - Last update timestamp (optional)
 */
export const Order = {
  id: String,
  userId: String,
  userFullName: String,
  orderDetails: Array,
  totalAmount: Number,
  status: String,
  createdAt: String,
  updatedAt: String
};

/**
 * Order detail structure
 * @typedef {Object} OrderDetail
 * @property {string} id - Order detail identifier
 * @property {string} orderId - Order identifier
 * @property {string} carId - Car identifier
 * @property {string} carName - Car name
 * @property {number} quantity - Quantity ordered
 * @property {number} price - Price per item at time of order
 * @property {number} totalPrice - Total price for this item
 */
export const OrderDetail = {
  id: String,
  orderId: String,
  carId: String,
  carName: String,
  quantity: Number,
  price: Number,
  totalPrice: Number
};

/**
 * Favorite car structure
 * @typedef {Object} Favorite
 * @property {string} id - Favorite identifier
 * @property {string} userId - User identifier
 * @property {Car} car - Car details
 * @property {string} addedAt - When car was added to favorites
 */
export const Favorite = {
  id: String,
  userId: String,
  car: Car,
  addedAt: String
};

/**
 * Car request structure (for creating/updating cars)
 * @typedef {Object} CarRequest
 * @property {string} name - Car name/model
 * @property {string} categoryId - Category identifier
 * @property {number} price - Car price
 * @property {number} manufactureYear - Year of manufacture
 * @property {string} color - Car color
 * @property {string} engine - Engine specifications
 * @property {string} transmission - Transmission type
 * @property {number} seats - Number of seats
 * @property {string} [description] - Car description (optional)
 * @property {File} [image] - Car image file (optional)
 */
export const CarRequest = {
  name: String,
  categoryId: String,
  price: Number,
  manufactureYear: Number,
  color: String,
  engine: String,
  transmission: String,
  seats: Number,
  description: String,
  image: File
};

/**
 * Add to cart request structure
 * @typedef {Object} AddToCartRequest
 * @property {string} carId - Car identifier
 * @property {number} quantity - Quantity to add
 */
export const AddToCartRequest = {
  carId: String,
  quantity: Number
};

/**
 * Update cart item request structure
 * @typedef {Object} UpdateCartItemRequest
 * @property {number} quantity - New quantity
 */
export const UpdateCartItemRequest = {
  quantity: Number
};

/**
 * Review request structure
 * @typedef {Object} ReviewRequest
 * @property {string} carId - Car identifier
 * @property {number} rating - Rating (1-5)
 * @property {string} [comment] - Review comment (optional)
 */
export const ReviewRequest = {
  carId: String,
  rating: Number,
  comment: String
};

/**
 * Order request structure
 * @typedef {Object} OrderRequest
 * @property {string} [deliveryAddress] - Delivery address (optional)
 * @property {string} [paymentMethod] - Payment method (optional)
 * @property {string} [notes] - Order notes (optional)
 */
export const OrderRequest = {
  deliveryAddress: String,
  paymentMethod: String,
  notes: String
};

/**
 * Car search/filter parameters
 * @typedef {Object} CarSearchParams
 * @property {string} [query] - Search query
 * @property {string} [categoryId] - Filter by category
 * @property {number} [minPrice] - Minimum price filter
 * @property {number} [maxPrice] - Maximum price filter
 * @property {number} [minYear] - Minimum year filter
 * @property {number} [maxYear] - Maximum year filter
 * @property {string} [color] - Color filter
 * @property {string} [transmission] - Transmission filter
 * @property {number} [minSeats] - Minimum seats filter
 * @property {number} [maxSeats] - Maximum seats filter
 * @property {string} [sortBy] - Sort field
 * @property {string} [sortDirection] - Sort direction ('asc' or 'desc')
 * @property {number} [page] - Page number
 * @property {number} [size] - Page size
 */
export const CarSearchParams = {
  query: String,
  categoryId: String,
  minPrice: Number,
  maxPrice: Number,
  minYear: Number,
  maxYear: Number,
  color: String,
  transmission: String,
  minSeats: Number,
  maxSeats: Number,
  sortBy: String,
  sortDirection: String,
  page: Number,
  size: Number
};

/**
 * Transmission types enumeration
 */
export const TransmissionTypes = {
  MANUAL: 'MANUAL',
  AUTOMATIC: 'AUTOMATIC'
};

/**
 * Order status enumeration
 */
export const OrderStatus = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  PROCESSING: 'PROCESSING',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED'
};

/**
 * Admin car response structure (for admin panel)
 * @typedef {Object} AdminCarResponse
 * @property {string} id - Car ID
 * @property {string} name - Car name
 * @property {string} categoryName - Category name
 * @property {number} price - Car price
 * @property {number} manufactureYear - Manufacture year
 * @property {boolean} available - Availability status
 * @property {number} totalOrders - Total number of orders for this car
 * @property {number} averageRating - Average rating
 * @property {string} createdAt - Creation date
 */
export const AdminCarResponse = {
  id: String,
  name: String,
  categoryName: String,
  price: Number,
  manufactureYear: Number,
  available: Boolean,
  totalOrders: Number,
  averageRating: Number,
  createdAt: String
};

/**
 * Admin order response structure (for admin panel)
 * @typedef {Object} AdminOrderResponse
 * @property {string} id - Order ID
 * @property {string} userId - User ID
 * @property {string} userName - User name
 * @property {string} userEmail - User email
 * @property {string} userPhone - User phone
 * @property {string} orderDate - Order date
 * @property {number} totalAmount - Total amount
 * @property {string} status - Order status
 * @property {string} deliveryAddress - Delivery address
 * @property {number} totalItems - Total items count
 * @property {string} paymentMethod - Payment method
 * @property {string} notes - Order notes
 * @property {string} lastStatusUpdate - Last status update
 * @property {string} assignedStaff - Assigned staff member
 * @property {number} daysSinceOrder - Days since order was placed
 */
export const AdminOrderResponse = {
  id: String,
  userId: String,
  userName: String,
  userEmail: String,
  userPhone: String,
  orderDate: String,
  totalAmount: Number,
  status: String,
  deliveryAddress: String,
  totalItems: Number,
  paymentMethod: String,
  notes: String,
  lastStatusUpdate: String,
  assignedStaff: String,
  daysSinceOrder: Number
};