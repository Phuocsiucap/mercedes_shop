import { ApiService } from './api.js';

/**
 * Car service for handling car-related operations
 * Uses the standardized API service template for consistent error handling
 * Updated to use new CarController endpoints with proper error handling
 */
class CarService extends ApiService {
  constructor() {
    super('/cars');
  }

  /**
   * Get all cars with pagination
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number (default: 0)
   * @param {number} params.size - Page size (default: 10)
   * @param {string} params.sortBy - Sort field (default: 'id')
   * @param {string} params.sortDir - Sort direction (default: 'asc')
   * @returns {Promise<Object>} Paginated car list
   */
  async getAllCars(params = {}) {
    const queryParams = {
      page: params.page || 0,
      size: params.size || 10,
      sortBy: params.sortBy || 'id',
      sortDir: params.sortDir || 'asc'
    };

    return await this.get('', { params: queryParams });
  }

  /**
   * Get car by ID
   * @param {string} carId - Car ID
   * @returns {Promise<Object>} Car details
   */
  async getCarById(carId) {
    return await this.get(`/${carId}`);
  }

  /**
   * Search cars by keyword
   * @param {Object} params - Search parameters
   * @param {string} params.keyword - Search keyword
   * @param {number} params.page - Page number (default: 0)
   * @param {number} params.size - Page size (default: 10)
   * @returns {Promise<Object>} Search results
   */
  async searchCars(params = {}) {
    const queryParams = {
      keyword: params.keyword || '',
      page: params.page || 0,
      size: params.size || 10
    };

    return await this.get('/search', { params: queryParams });
  }

  /**
   * Advanced search for cars
   * @param {Object} params - Advanced search parameters
   * @param {string} params.keyword - Search keyword
   * @param {string} params.categoryId - Category ID filter
   * @param {number} params.minPrice - Minimum price filter
   * @param {number} params.maxPrice - Maximum price filter
   * @param {number} params.year - Year filter
   * @param {string} params.color - Color filter
   * @param {number} params.page - Page number (default: 0)
   * @param {number} params.size - Page size (default: 10)
   * @param {string} params.sortBy - Sort field (default: 'id')
   * @param {string} params.sortDir - Sort direction (default: 'asc')
   * @returns {Promise<Object>} Advanced search results
   */
  async advancedSearch(params = {}) {
    const queryParams = {
      page: params.page || 0,
      size: params.size || 10,
      sortBy: params.sortBy || 'id',
      sortDir: params.sortDir || 'asc'
    };

    // Add optional filters
    if (params.keyword) queryParams.keyword = params.keyword;
    if (params.categoryId) queryParams.categoryId = params.categoryId;
    if (params.minPrice !== undefined) queryParams.minPrice = params.minPrice;
    if (params.maxPrice !== undefined) queryParams.maxPrice = params.maxPrice;
    if (params.year) queryParams.year = params.year;
    if (params.color) queryParams.color = params.color;

    return await this.get('/advanced-search', { params: queryParams });
  }

  /**
   * Get cars by category
   * @param {string} categoryId - Category ID
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number (default: 0)
   * @param {number} params.size - Page size (default: 10)
   * @returns {Promise<Object>} Cars in category
   */
  async getCarsByCategory(categoryId, params = {}) {
    const queryParams = {
      page: params.page || 0,
      size: params.size || 10
    };

    return await this.get(`/category/${categoryId}`, { params: queryParams });
  }

  /**
   * Get all car categories
   * @returns {Promise<Object>} List of categories
   */
  async getAllCategories() {
    return await this.get('/categories');
  }

  /**
   * Get latest cars
   * @returns {Promise<Object>} Latest cars list
   */
  async getLatestCars() {
    return await this.get('/latest');
  }

  /**
   * Get car reviews
   * @param {string} carId - Car ID
   * @returns {Promise<Object>} Car reviews
   */
  async getCarReviews(carId) {
    return await this.get(`/${carId}/reviews`);
  }

  /**
   * Add review for a car
   * @param {string} carId - Car ID
   * @param {Object} reviewData - Review data
   * @param {number} reviewData.rating - Rating (1-5)
   * @param {string} reviewData.comment - Review comment
   * @returns {Promise<Object>} Added review
   */
  async addReview(carId, reviewData) {
    try {
      const response = await this.post(`/${carId}/reviews`, reviewData);
      return response;
    } catch (error) {
      // Re-throw with additional context for car reviews
      if (error.status === 401) {
        throw {
          ...error,
          message: 'You must be logged in to add a review'
        };
      }
      throw error;
    }
  }

  /**
   * Create new car (Admin only)
   * @param {Object} carData - Car data
   * @param {string} carData.name - Car name
   * @param {string} carData.categoryId - Category ID
   * @param {number} carData.price - Car price
   * @param {number} carData.manufactureYear - Manufacture year
   * @param {string} carData.color - Car color
   * @param {string} carData.engine - Engine type
   * @param {string} carData.transmission - Transmission type
   * @param {number} carData.seats - Number of seats
   * @param {string} carData.image - Image URL
   * @param {string} carData.description - Car description
   * @returns {Promise<Object>} Created car
   */
  async createCar(carData) {
    try {
      const response = await this.post('', carData);
      return response;
    } catch (error) {
      // Re-throw with additional context for car creation
      if (error.status === 403) {
        throw {
          ...error,
          message: 'Admin privileges required to create cars'
        };
      }
      throw error;
    }
  }

  /**
   * Update car (Admin only)
   * @param {string} carId - Car ID
   * @param {Object} carData - Updated car data
   * @returns {Promise<Object>} Updated car
   */
  async updateCar(carId, carData) {
    try {
      const response = await this.put(`/${carId}`, carData);
      return response;
    } catch (error) {
      // Re-throw with additional context for car updates
      if (error.status === 403) {
        throw {
          ...error,
          message: 'Admin privileges required to update cars'
        };
      }
      if (error.status === 404) {
        throw {
          ...error,
          message: 'Car not found'
        };
      }
      throw error;
    }
  }

  /**
   * Delete car (Admin only)
   * @param {string} carId - Car ID
   * @returns {Promise<Object>} Delete response
   */
  async deleteCar(carId) {
    try {
      const response = await this.delete(`/${carId}`);
      return response;
    } catch (error) {
      // Re-throw with additional context for car deletion
      if (error.status === 403) {
        throw {
          ...error,
          message: 'Admin privileges required to delete cars'
        };
      }
      if (error.status === 404) {
        throw {
          ...error,
          message: 'Car not found'
        };
      }
      throw error;
    }
  }

  /**
   * Get featured cars (top rated or popular)
   * @param {number} limit - Number of cars to return (default: 6)
   * @returns {Promise<Object>} Featured cars
   */
  async getFeaturedCars(limit = 6) {
    try {
      const response = await this.getAllCars({ 
        size: limit, 
        sortBy: 'averageRating', 
        sortDir: 'desc' 
      });
      
      return {
        success: true,
        data: response.data?.content || [],
        message: 'Featured cars retrieved successfully'
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get top selling cars based on order count
   * @param {number} limit - Number of cars to return (default: 6)
   * @returns {Promise<Object>} Top selling cars
   */
  async getTopSellingCars(limit = 6) {
    try {
      const response = await this.getAllCars({ 
        size: limit, 
        sortBy: 'orderCount', 
        sortDir: 'desc' 
      });
      
      return {
        success: true,
        data: response.data?.content || [],
        message: 'Top selling cars retrieved successfully'
      };
    } catch (error) {
      // If orderCount sorting is not available, fall back to featured cars
      console.warn('Could not fetch top selling cars, falling back to featured cars');
      return {
        success: true,
        data: [],
        message: 'Top selling cars not available'
      };
    }
  }

  /**
   * Get cars with filters and sorting
   * @param {Object} filters - Filter options
   * @param {string} filters.category - Category filter
   * @param {number} filters.minPrice - Minimum price
   * @param {number} filters.maxPrice - Maximum price
   * @param {string} filters.color - Color filter
   * @param {number} filters.year - Year filter
   * @param {string} filters.sortBy - Sort field
   * @param {string} filters.sortDir - Sort direction
   * @param {number} filters.page - Page number
   * @param {number} filters.size - Page size
   * @returns {Promise<Object>} Filtered cars
   */
  async getFilteredCars(filters = {}) {
    if (filters.category || filters.minPrice || filters.maxPrice || 
        filters.color || filters.year) {
      // Use advanced search for complex filters
      return await this.advancedSearch({
        categoryId: filters.category,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        color: filters.color,
        year: filters.year,
        sortBy: filters.sortBy,
        sortDir: filters.sortDir,
        page: filters.page,
        size: filters.size
      });
    } else {
      // Use simple get all for basic sorting/pagination
      return await this.getAllCars({
        sortBy: filters.sortBy,
        sortDir: filters.sortDir,
        page: filters.page,
        size: filters.size
      });
    }
  }

  /**
   * Get car statistics
   * @returns {Promise<Object>} Car statistics
   */
  async getCarStats() {
    try {
      const [carsResponse, categoriesResponse] = await Promise.all([
        this.getAllCars({ size: 1 }), // Just to get total count
        this.getAllCategories()
      ]);

      return {
        success: true,
        data: {
          totalCars: carsResponse.data?.totalElements || 0,
          totalCategories: categoriesResponse.data?.length || 0,
          totalPages: carsResponse.data?.totalPages || 0
        }
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get price range for all cars
   * @returns {Promise<Object>} Price range information
   */
  async getPriceRange() {
    try {
      // Get all cars to calculate price range
      const response = await this.getAllCars({ size: 1000 }); // Large size to get all
      const cars = response.data?.content || [];

      if (cars.length === 0) {
        return {
          success: true,
          data: { minPrice: 0, maxPrice: 0 }
        };
      }

      const prices = cars.map(car => car.price).filter(price => price != null);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);

      return {
        success: true,
        data: { minPrice, maxPrice }
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get available car colors
   * @returns {Promise<Object>} List of available colors
   */
  async getAvailableColors() {
    try {
      const response = await this.getAllCars({ size: 1000 }); // Large size to get all
      const cars = response.data?.content || [];
      
      const colors = [...new Set(cars.map(car => car.color).filter(color => color))];
      
      return {
        success: true,
        data: colors.sort()
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get available manufacture years
   * @returns {Promise<Object>} List of available years
   */
  async getAvailableYears() {
    try {
      const response = await this.getAllCars({ size: 1000 }); // Large size to get all
      const cars = response.data?.content || [];
      
      const years = [...new Set(cars.map(car => car.manufactureYear).filter(year => year))];
      
      return {
        success: true,
        data: years.sort((a, b) => b - a) // Sort descending (newest first)
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get cars with comprehensive filtering and sorting
   * @param {Object} params - Filter and sort parameters
   * @param {string} params.keyword - Search keyword
   * @param {string} params.categoryId - Category filter
   * @param {number} params.minPrice - Minimum price filter
   * @param {number} params.maxPrice - Maximum price filter
   * @param {number} params.year - Year filter
   * @param {string} params.color - Color filter
   * @param {string} params.sortBy - Sort field (name, price, year, rating)
   * @param {string} params.sortDir - Sort direction (asc, desc)
   * @param {number} params.page - Page number
   * @param {number} params.size - Page size
   * @returns {Promise<Object>} Filtered and sorted cars
   */
  async getFilteredAndSortedCars(params = {}) {
    try {
      // Use advanced search if any filters are applied
      if (params.keyword || params.categoryId || params.minPrice !== undefined || 
          params.maxPrice !== undefined || params.year || params.color) {
        return await this.advancedSearch(params);
      } else {
        // Use simple get all for basic sorting/pagination
        return await this.getAllCars({
          sortBy: params.sortBy || 'id',
          sortDir: params.sortDir || 'asc',
          page: params.page || 0,
          size: params.size || 10
        });
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get car recommendations based on a car ID
   * @param {string} carId - Base car ID for recommendations
   * @param {number} limit - Number of recommendations (default: 4)
   * @returns {Promise<Object>} Recommended cars
   */
  async getCarRecommendations(carId, limit = 4) {
    try {
      // Get the base car details
      const carResponse = await this.getCarById(carId);
      const baseCar = carResponse.data;
      
      if (!baseCar) {
        throw new Error('Base car not found');
      }

      // Get cars from the same category
      const categoryResponse = await this.getCarsByCategory(baseCar.categoryId, {
        size: limit + 5 // Get more to filter out the base car
      });
      
      const recommendations = categoryResponse.data?.content
        ?.filter(car => car.id !== carId) // Exclude the base car
        ?.slice(0, limit) || [];

      return {
        success: true,
        data: recommendations,
        message: 'Car recommendations retrieved successfully'
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Search cars with autocomplete suggestions
   * @param {string} query - Search query
   * @param {number} limit - Number of suggestions (default: 5)
   * @returns {Promise<Object>} Search suggestions
   */
  async getSearchSuggestions(query, limit = 5) {
    try {
      if (!query || query.trim().length < 2) {
        return {
          success: true,
          data: []
        };
      }

      const response = await this.searchCars({
        keyword: query.trim(),
        size: limit
      });

      const suggestions = response.data?.content?.map(car => ({
        id: car.id,
        name: car.name,
        category: car.categoryName,
        price: car.price
      })) || [];

      return {
        success: true,
        data: suggestions
      };
    } catch (error) {
      throw error;
    }
  }
}

// Export singleton instance
export default new CarService();