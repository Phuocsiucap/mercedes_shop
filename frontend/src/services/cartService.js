import { ApiService } from './api.js';

/**
 * Cart service for handling shopping cart operations
 * Uses the standardized API service template for consistent error handling
 */
class CartService extends ApiService {
  constructor() {
    super('/cart');
  }

  /**
   * Get user's cart
   * @returns {Promise<Object>} User's cart with items
   */
  async getCart() {
    return await this.get('');
  }

  /**
   * Add item to cart
   * @param {Object} itemData - Item data to add
   * @param {string} itemData.carId - Car ID to add
   * @param {number} itemData.quantity - Quantity to add (default: 1)
   * @returns {Promise<Object>} Added cart item
   */
  async addToCart(itemData) {
    const requestData = {
      carId: itemData.carId,
      quantity: itemData.quantity || 1
    };

    return await this.post('/items', requestData);
  }

  /**
   * Update cart item quantity
   * @param {string} cartItemId - Cart item ID
   * @param {Object} updateData - Update data
   * @param {number} updateData.quantity - New quantity
   * @returns {Promise<Object>} Updated cart item
   */
  async updateCartItem(cartItemId, updateData) {
    return await this.put(`/items/${cartItemId}`, updateData);
  }

  /**
   * Remove item from cart
   * @param {string} cartItemId - Cart item ID to remove
   * @returns {Promise<Object>} Remove response
   */
  async removeFromCart(cartItemId) {
    return await this.delete(`/items/${cartItemId}`);
  }

  /**
   * Clear entire cart
   * @returns {Promise<Object>} Clear cart response
   */
  async clearCart() {
    return await this.delete('/clear');
  }

  /**
   * Checkout cart (process payment and create order)
   * @param {Object} orderData - Order data
   * @param {string} orderData.deliveryAddress - Delivery address
   * @param {string} orderData.paymentMethod - Payment method
   * @param {string} orderData.notes - Order notes (optional)
   * @returns {Promise<Object>} Order response
   */
  async checkout(orderData) {
    return await this.post('/checkout', orderData);
  }

  /**
   * Create order from specific items (not entire cart)
   * @param {Object} orderData - Order data
   * @param {Array} orderData.items - Array of items to order
   * @param {string} orderData.deliveryAddress - Delivery address
   * @param {string} orderData.paymentMethod - Payment method
   * @param {string} orderData.notes - Order notes (optional)
   * @returns {Promise<Object>} Order response
   */
  async createOrder(orderData) {
    return await this.post('/order', orderData);
  }

  /**
   * Get cart summary (total items, total price)
   * @returns {Promise<Object>} Cart summary
   */
  async getCartSummary() {
    try {
      const cartResponse = await this.getCart();
      const cart = cartResponse.data;

      if (!cart || !cart.items) {
        return {
          success: true,
          data: {
            totalItems: 0,
            totalPrice: 0,
            itemCount: 0,
            isEmpty: true
          }
        };
      }

      const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
      const totalPrice = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      return {
        success: true,
        data: {
          totalItems,
          totalPrice,
          itemCount: cart.items.length,
          isEmpty: cart.items.length === 0
        }
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Check if car is in cart
   * @param {string} carId - Car ID to check
   * @returns {Promise<Object>} Boolean response indicating if car is in cart
   */
  async isCarInCart(carId) {
    try {
      const cartResponse = await this.getCart();
      const cart = cartResponse.data;

      if (!cart || !cart.items) {
        return {
          success: true,
          data: false
        };
      }

      const isInCart = cart.items.some(item => item.car?.id === carId);

      return {
        success: true,
        data: isInCart
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get cart item by car ID
   * @param {string} carId - Car ID
   * @returns {Promise<Object>} Cart item or null
   */
  async getCartItemByCarId(carId) {
    try {
      const cartResponse = await this.getCart();
      const cart = cartResponse.data;

      if (!cart || !cart.items) {
        return {
          success: true,
          data: null
        };
      }

      const cartItem = cart.items.find(item => item.car?.id === carId);

      return {
        success: true,
        data: cartItem || null
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update cart item quantity by car ID
   * @param {string} carId - Car ID
   * @param {number} quantity - New quantity
   * @returns {Promise<Object>} Updated cart item
   */
  async updateQuantityByCarId(carId, quantity) {
    try {
      const cartItemResponse = await this.getCartItemByCarId(carId);
      const cartItem = cartItemResponse.data;

      if (!cartItem) {
        throw new Error('Car not found in cart');
      }

      return await this.updateCartItem(cartItem.id, { quantity });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Remove cart item by car ID
   * @param {string} carId - Car ID
   * @returns {Promise<Object>} Remove response
   */
  async removeByCarId(carId) {
    try {
      const cartItemResponse = await this.getCartItemByCarId(carId);
      const cartItem = cartItemResponse.data;

      if (!cartItem) {
        throw new Error('Car not found in cart');
      }

      return await this.removeFromCart(cartItem.id);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Add multiple items to cart
   * @param {Array} items - Array of items to add
   * @param {string} items[].carId - Car ID
   * @param {number} items[].quantity - Quantity
   * @returns {Promise<Object>} Array of added items
   */
  async addMultipleToCart(items) {
    try {
      const promises = items.map(item => this.addToCart(item));
      const results = await Promise.all(promises);

      return {
        success: true,
        data: results.map(result => result.data),
        message: `Added ${items.length} items to cart`
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Validate cart before checkout
   * @returns {Promise<Object>} Validation result
   */
  async validateCart() {
    try {
      const cartResponse = await this.getCart();
      const cart = cartResponse.data;

      const validationErrors = [];

      if (!cart || !cart.items || cart.items.length === 0) {
        validationErrors.push('Cart is empty');
      }

      // Check for invalid items
      if (cart && cart.items) {
        cart.items.forEach((item, index) => {
          if (!item.car) {
            validationErrors.push(`Item ${index + 1}: Car information missing`);
          }
          if (item.quantity <= 0) {
            validationErrors.push(`Item ${index + 1}: Invalid quantity`);
          }
          if (!item.price || item.price <= 0) {
            validationErrors.push(`Item ${index + 1}: Invalid price`);
          }
        });
      }

      return {
        success: validationErrors.length === 0,
        data: {
          isValid: validationErrors.length === 0,
          errors: validationErrors,
          cart: cart
        },
        message: validationErrors.length === 0 ? 'Cart is valid' : 'Cart validation failed'
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get cart statistics
   * @returns {Promise<Object>} Cart statistics
   */
  async getCartStats() {
    try {
      const cartResponse = await this.getCart();
      const cart = cartResponse.data;

      if (!cart || !cart.items) {
        return {
          success: true,
          data: {
            totalItems: 0,
            totalPrice: 0,
            uniqueItems: 0,
            averageItemPrice: 0,
            isEmpty: true
          }
        };
      }

      const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
      const totalPrice = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const uniqueItems = cart.items.length;
      const averageItemPrice = uniqueItems > 0 ? totalPrice / totalItems : 0;

      return {
        success: true,
        data: {
          totalItems,
          totalPrice,
          uniqueItems,
          averageItemPrice,
          isEmpty: uniqueItems === 0
        }
      };
    } catch (error) {
      throw error;
    }
  }
}

// Export singleton instance
export default new CartService();