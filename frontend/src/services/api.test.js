import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { ApiService, roleValidator, responseFormatter, tokenManager } from './api.js';
import axios from 'axios';

// Mock axios
vi.mock('axios');
const mockedAxios = vi.mocked(axios);

describe('API Service Property Tests', () => {
  let apiService;

  beforeEach(() => {
    apiService = new ApiService('/test');
    vi.clearAllMocks();
    
    // Mock axios.create to return a mock instance
    const mockAxiosInstance = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() }
      }
    };
    
    mockedAxios.create.mockReturnValue(mockAxiosInstance);
    
    // Clear localStorage
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  /**
   * **Feature: service-architecture-refactor, Property 11: Error handling consistency**
   * **Validates: Requirements 3.1**
   * 
   * Property: For any service method, the error handling pattern should be consistent across all services
   * This test verifies that all HTTP methods in ApiService handle errors consistently,
   * producing the same error structure regardless of the HTTP method used.
   */
  it('should handle errors consistently across all HTTP methods', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate test data
        fc.record({
          endpoint: fc.string({ minLength: 1, maxLength: 50 }),
          statusCode: fc.integer({ min: 400, max: 599 }),
          errorMessage: fc.string({ minLength: 1, maxLength: 100 }),
          errorCode: fc.string({ minLength: 1, maxLength: 20 }),
          method: fc.constantFrom('get', 'post', 'put', 'patch', 'delete')
        }),
        async ({ endpoint, statusCode, errorMessage, errorCode, method }) => {
          // Create consistent error response
          const errorResponse = {
            response: {
              status: statusCode,
              data: {
                message: errorMessage,
                code: errorCode,
                errors: []
              }
            }
          };

          // Mock the axios instance methods to reject with the error
          const mockAxiosInstance = mockedAxios.create();
          mockAxiosInstance[method].mockRejectedValue(errorResponse);

          // Mock makeRequest to directly throw the transformed error
          const transformedError = {
            type: getExpectedErrorType(statusCode),
            status: statusCode,
            message: errorMessage,
            code: errorCode,
            data: errorResponse.response.data
          };

          // Test the specific HTTP method
          let thrownError;
          try {
            switch (method) {
              case 'get':
                await apiService.get(endpoint);
                break;
              case 'post':
                await apiService.post(endpoint, {});
                break;
              case 'put':
                await apiService.put(endpoint, {});
                break;
              case 'patch':
                await apiService.patch(endpoint, {});
                break;
              case 'delete':
                await apiService.delete(endpoint);
                break;
            }
          } catch (error) {
            thrownError = error;
          }

          // Verify error structure consistency
          expect(thrownError).toBeDefined();
          expect(thrownError).toHaveProperty('type');
          expect(thrownError).toHaveProperty('status');
          expect(thrownError).toHaveProperty('message');
          expect(thrownError).toHaveProperty('code');
          
          // Verify error type mapping is consistent
          expect(thrownError.type).toBe(getExpectedErrorType(statusCode));
          expect(thrownError.status).toBe(statusCode);
          expect(typeof thrownError.message).toBe('string');
          expect(typeof thrownError.code).toBe('string');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Helper function to get expected error type based on status code
   * This ensures consistency with the error transformation logic
   */
  function getExpectedErrorType(statusCode) {
    const errorTypeMap = {
      400: 'VALIDATION_ERROR',
      401: 'AUTHENTICATION_ERROR',
      403: 'AUTHORIZATION_ERROR',
      404: 'NOT_FOUND_ERROR',
      422: 'VALIDATION_ERROR',
      429: 'RATE_LIMIT_ERROR',
      500: 'SERVER_ERROR',
      502: 'BAD_GATEWAY_ERROR',
      503: 'SERVICE_UNAVAILABLE_ERROR',
      504: 'GATEWAY_TIMEOUT_ERROR'
    };

    return errorTypeMap[statusCode] || 'API_ERROR';
  }

  /**
   * Additional property test for admin methods error handling consistency
   */
  it('should handle errors consistently across admin HTTP methods', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          endpoint: fc.string({ minLength: 1, maxLength: 50 }),
          statusCode: fc.constantFrom(401, 403), // Focus on auth/authz errors for admin methods
          errorMessage: fc.string({ minLength: 1, maxLength: 100 }),
          errorCode: fc.string({ minLength: 1, maxLength: 20 }),
          method: fc.constantFrom('adminGet', 'adminPost', 'adminPut', 'adminPatch', 'adminDelete')
        }),
        async ({ endpoint, statusCode, errorMessage, errorCode, method }) => {
          // Mock no authentication for admin methods
          vi.spyOn(roleValidator, 'validateAdminAccess').mockImplementation(() => {
            throw {
              type: statusCode === 401 ? 'AUTHENTICATION_ERROR' : 'AUTHORIZATION_ERROR',
              status: statusCode,
              message: statusCode === 401 ? 'Authentication required' : 'Admin access required',
              code: statusCode === 401 ? 'AUTH_REQUIRED' : 'ADMIN_ACCESS_REQUIRED'
            };
          });

          // Test the specific admin HTTP method
          let thrownError;
          try {
            switch (method) {
              case 'adminGet':
                await apiService.adminGet(endpoint);
                break;
              case 'adminPost':
                await apiService.adminPost(endpoint, {});
                break;
              case 'adminPut':
                await apiService.adminPut(endpoint, {});
                break;
              case 'adminPatch':
                await apiService.adminPatch(endpoint, {});
                break;
              case 'adminDelete':
                await apiService.adminDelete(endpoint);
                break;
            }
          } catch (error) {
            thrownError = error;
          }

          // Verify error structure consistency for admin methods
          expect(thrownError).toBeDefined();
          expect(thrownError).toHaveProperty('type');
          expect(thrownError).toHaveProperty('status');
          expect(thrownError).toHaveProperty('message');
          expect(thrownError).toHaveProperty('code');
          
          // Verify admin error handling is consistent
          expect(thrownError.status).toBe(statusCode);
          expect(thrownError.type).toBe(statusCode === 401 ? 'AUTHENTICATION_ERROR' : 'AUTHORIZATION_ERROR');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: service-architecture-refactor, Property 12: Response format consistency**
   * **Validates: Requirements 3.2**
   * 
   * Property: For any service method response, the formatting should be consistent across all services
   * This test verifies that all HTTP methods in ApiService format responses consistently,
   * producing the same response structure regardless of the HTTP method used or response data.
   */
  it('should format successful responses consistently across all HTTP methods', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          endpoint: fc.string({ minLength: 1, maxLength: 50 }),
          responseData: fc.oneof(
            fc.object(),
            fc.array(fc.anything()),
            fc.string(),
            fc.integer(),
            fc.boolean(),
            fc.constant(null)
          ),
          method: fc.constantFrom('get', 'post', 'put', 'patch', 'delete')
        }),
        async ({ endpoint, responseData, method }) => {
          // Mock successful response
          const mockAxiosInstance = mockedAxios.create();
          mockAxiosInstance[method].mockResolvedValue({ data: responseData });

          // Test the specific HTTP method
          let result;
          switch (method) {
            case 'get':
              result = await apiService.get(endpoint);
              break;
            case 'post':
              result = await apiService.post(endpoint, {});
              break;
            case 'put':
              result = await apiService.put(endpoint, {});
              break;
            case 'patch':
              result = await apiService.patch(endpoint, {});
              break;
            case 'delete':
              result = await apiService.delete(endpoint);
              break;
          }

          // Verify consistent response format structure
          expect(result).toHaveProperty('success', true);
          expect(result).toHaveProperty('data');
          expect(result).toHaveProperty('timestamp');
          expect(result).toHaveProperty('message');
          
          // Verify data types are consistent
          expect(typeof result.success).toBe('boolean');
          expect(typeof result.timestamp).toBe('string');
          expect(typeof result.message).toBe('string');
          
          // Verify timestamp is a valid ISO string
          expect(() => new Date(result.timestamp)).not.toThrow();
          expect(new Date(result.timestamp).toISOString()).toBe(result.timestamp);
          
          // Verify the data field contains the original response data
          expect(result.data).toEqual(responseData);
          
          // Verify success message is present and meaningful
          expect(result.message).toBeTruthy();
          expect(result.message.length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: service-architecture-refactor, Property 12: Response format consistency**
   * **Validates: Requirements 3.2**
   * 
   * Property: For any admin service method response, the formatting should be consistent across all admin methods
   * This test verifies that admin HTTP methods format responses consistently with the same structure.
   */
  it('should format admin responses consistently across all admin HTTP methods', async () => {
    // Mock valid admin authentication
    vi.spyOn(roleValidator, 'validateAdminAccess').mockImplementation(() => {
      // Mock successful validation - no throw
    });

    await fc.assert(
      fc.asyncProperty(
        fc.record({
          endpoint: fc.string({ minLength: 1, maxLength: 50 }),
          responseData: fc.oneof(
            fc.object(),
            fc.array(fc.anything()),
            fc.string(),
            fc.integer(),
            fc.boolean(),
            fc.constant(null)
          ),
          method: fc.constantFrom('adminGet', 'adminPost', 'adminPut', 'adminPatch', 'adminDelete')
        }),
        async ({ endpoint, responseData, method }) => {
          // Mock successful response
          const mockAxiosInstance = mockedAxios.create();
          const httpMethod = method.replace('admin', '').toLowerCase();
          mockAxiosInstance[httpMethod].mockResolvedValue({ data: responseData });

          // Test the specific admin HTTP method
          let result;
          switch (method) {
            case 'adminGet':
              result = await apiService.adminGet(endpoint);
              break;
            case 'adminPost':
              result = await apiService.adminPost(endpoint, {});
              break;
            case 'adminPut':
              result = await apiService.adminPut(endpoint, {});
              break;
            case 'adminPatch':
              result = await apiService.adminPatch(endpoint, {});
              break;
            case 'adminDelete':
              result = await apiService.adminDelete(endpoint);
              break;
          }

          // Verify consistent response format structure (same as regular methods)
          expect(result).toHaveProperty('success', true);
          expect(result).toHaveProperty('data');
          expect(result).toHaveProperty('timestamp');
          expect(result).toHaveProperty('message');
          
          // Verify data types are consistent
          expect(typeof result.success).toBe('boolean');
          expect(typeof result.timestamp).toBe('string');
          expect(typeof result.message).toBe('string');
          
          // Verify timestamp is a valid ISO string
          expect(() => new Date(result.timestamp)).not.toThrow();
          expect(new Date(result.timestamp).toISOString()).toBe(result.timestamp);
          
          // Verify the data field contains the original response data
          expect(result.data).toEqual(responseData);
          
          // Verify success message is present and meaningful
          expect(result.message).toBeTruthy();
          expect(result.message.length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 100 }
    );
  });
});