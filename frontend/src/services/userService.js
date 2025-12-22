import { ApiService } from './api.js';

/**
 * User service for handling user profile and account operations
 * Uses the standardized API service template for consistent error handling
 */
class UserService extends ApiService {
  constructor() {
    super('/users');
  }

  /**
   * Get current user profile
   * @returns {Promise<Object>} User profile data
   */
  async getProfile() {
    return await this.get('/profile');
  }

  /**
   * Update user profile
   * @param {Object} profileData - Profile update data
   * @param {string} profileData.fullName - User's full name
   * @param {string} profileData.phoneNumber - User's phone number
   * @param {string} profileData.address - User's address
   * @returns {Promise<Object>} Updated user profile
   */
  async updateProfile(profileData) {
    return await this.put('/profile', profileData);
  }

  /**
   * Get user's order history
   * @returns {Promise<Object>} List of user orders
   */
  async getOrders() {
    return await this.get('/orders');
  }

  /**
   * Get specific order details
   * @param {string} orderId - Order ID
   * @returns {Promise<Object>} Order details
   */
  async getOrder(orderId) {
    return await this.get(`/orders/${orderId}`);
  }

  /**
   * Get user's favorite cars
   * @returns {Promise<Object>} List of favorite cars
   */
  async getFavorites() {
    return await this.get('/favorites');
  }

  /**
   * Add car to favorites
   * @param {Object} favoriteData - Favorite data
   * @param {string} favoriteData.carId - Car ID to add to favorites
   * @returns {Promise<Object>} Added favorite response
   */
  async addToFavorites(favoriteData) {
    return await this.post('/favorites', favoriteData);
  }

  /**
   * Remove car from favorites
   * @param {string} carId - Car ID to remove from favorites
   * @returns {Promise<Object>} Remove favorite response
   */
  async removeFromFavorites(carId) {
    return await this.delete(`/favorites/${carId}`);
  }

  /**
   * Check if car is in user's favorites
   * @param {string} carId - Car ID to check
   * @returns {Promise<Object>} Boolean response indicating if car is in favorites
   */
  async checkIfCarInFavorites(carId) {
    return await this.get(`/favorites/${carId}/check`);
  }

  /**
   * Toggle car favorite status
   * @param {string} carId - Car ID to toggle
   * @returns {Promise<Object>} Updated favorite status
   */
  async toggleFavorite(carId) {
    try {
      // First check if car is already in favorites
      const checkResponse = await this.checkIfCarInFavorites(carId);
      const isInFavorites = checkResponse.data;

      if (isInFavorites) {
        // Remove from favorites
        return await this.removeFromFavorites(carId);
      } else {
        // Add to favorites
        return await this.addToFavorites({ carId });
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get user statistics (orders count, favorites count, etc.)
   * @returns {Promise<Object>} User statistics
   */
  async getUserStats() {
    try {
      const [ordersResponse, favoritesResponse] = await Promise.all([
        this.getOrders(),
        this.getFavorites()
      ]);

      return {
        success: true,
        data: {
          totalOrders: ordersResponse.data?.length || 0,
          totalFavorites: favoritesResponse.data?.length || 0,
          recentOrders: ordersResponse.data?.slice(0, 5) || [],
          recentFavorites: favoritesResponse.data?.slice(0, 5) || []
        }
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Search user's orders
   * @param {Object} searchParams - Search parameters
   * @param {string} searchParams.status - Order status filter
   * @param {string} searchParams.dateFrom - Start date filter
   * @param {string} searchParams.dateTo - End date filter
   * @param {string} searchParams.search - Search term
   * @returns {Promise<Object>} Filtered orders
   */
  async searchOrders(searchParams = {}) {
    try {
      const ordersResponse = await this.getOrders();
      let orders = ordersResponse.data || [];

      // Apply filters
      if (searchParams.status) {
        orders = orders.filter(order => 
          order.status?.toLowerCase() === searchParams.status.toLowerCase()
        );
      }

      if (searchParams.dateFrom) {
        const fromDate = new Date(searchParams.dateFrom);
        orders = orders.filter(order => 
          new Date(order.createdAt) >= fromDate
        );
      }

      if (searchParams.dateTo) {
        const toDate = new Date(searchParams.dateTo);
        orders = orders.filter(order => 
          new Date(order.createdAt) <= toDate
        );
      }

      if (searchParams.search) {
        const searchTerm = searchParams.search.toLowerCase();
        orders = orders.filter(order => 
          order.id?.toLowerCase().includes(searchTerm) ||
          order.items?.some(item => 
            item.car?.name?.toLowerCase().includes(searchTerm)
          )
        );
      }

      return {
        success: true,
        data: orders,
        message: `Found ${orders.length} orders`
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Search user's favorites
   * @param {Object} searchParams - Search parameters
   * @param {string} searchParams.category - Category filter
   * @param {string} searchParams.priceMin - Minimum price filter
   * @param {string} searchParams.priceMax - Maximum price filter
   * @param {string} searchParams.search - Search term
   * @returns {Promise<Object>} Filtered favorites
   */
  async searchFavorites(searchParams = {}) {
    try {
      const favoritesResponse = await this.getFavorites();
      let favorites = favoritesResponse.data || [];

      // Apply filters
      if (searchParams.category) {
        favorites = favorites.filter(favorite => 
          favorite.car?.categoryName?.toLowerCase() === searchParams.category.toLowerCase()
        );
      }

      if (searchParams.priceMin) {
        const minPrice = parseFloat(searchParams.priceMin);
        favorites = favorites.filter(favorite => 
          favorite.car?.price >= minPrice
        );
      }

      if (searchParams.priceMax) {
        const maxPrice = parseFloat(searchParams.priceMax);
        favorites = favorites.filter(favorite => 
          favorite.car?.price <= maxPrice
        );
      }

      if (searchParams.search) {
        const searchTerm = searchParams.search.toLowerCase();
        favorites = favorites.filter(favorite => 
          favorite.car?.name?.toLowerCase().includes(searchTerm) ||
          favorite.car?.description?.toLowerCase().includes(searchTerm)
        );
      }

      return {
        success: true,
        data: favorites,
        message: `Found ${favorites.length} favorites`
      };
    } catch (error) {
      throw error;
    }
  }
}

// Export singleton instance
export default new UserService();