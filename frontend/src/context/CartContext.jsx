import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CartContext = createContext(null);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

const CART_STORAGE_KEY = 'cart_items';
const CART_TIMESTAMP_KEY = 'cart_timestamp';

/**
 * CartProvider component that provides cart context to child components
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 */
// eslint-disable-next-line react/prop-types
export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem(CART_STORAGE_KEY);
      
      if (storedCart) {
        const parsedCart = JSON.parse(storedCart);
        
        // Validate cart data structure
        if (Array.isArray(parsedCart)) {
          setItems(parsedCart);
        } else {
          console.warn('Invalid cart data structure, resetting cart');
          setItems([]);
        }
      }
    } catch (err) {
      console.error('Failed to load cart from localStorage:', err);
      setError('Failed to load cart data');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Persist cart to localStorage whenever it changes
  useEffect(() => {
    if (!loading) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
        localStorage.setItem(CART_TIMESTAMP_KEY, new Date().toISOString());
        setError(null);
      } catch (err) {
        console.error('Failed to save cart to localStorage:', err);
        setError('Failed to save cart data');
      }
    }
  }, [items, loading]);

  // Calculate total amount
  const totalAmount = items.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);

  // Calculate total items count
  const totalItems = items.reduce((total, item) => {
    return total + item.quantity;
  }, 0);

  // Validate cart item structure
  const validateCartItem = (car, quantity) => {
    if (!car || typeof car !== 'object') {
      throw new Error('Invalid car object');
    }
    if (!car.id || !car.name || typeof car.price !== 'number') {
      throw new Error('Car object missing required fields');
    }
    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new Error('Quantity must be a positive integer');
    }
    return true;
  };

  const addItem = useCallback((car, quantity = 1) => {
    try {
      validateCartItem(car, quantity);
      
      setItems((prevItems) => {
        const existingItem = prevItems.find((item) => item.id === car.id);
        
        if (existingItem) {
          // Update quantity if item already exists
          return prevItems.map((item) =>
            item.id === car.id
              ? { 
                  ...item, 
                  quantity: item.quantity + quantity,
                  updatedAt: new Date().toISOString()
                }
              : item
          );
        } else {
          // Add new item with enhanced structure
          const newItem = {
            id: car.id,
            name: car.name,
            price: car.price,
            image: car.images && car.images.length > 0 ? car.images[0] : '/placeholder-car.jpg',
            color: car.color,
            quantity: quantity,
            car: {
              id: car.id,
              name: car.name,
              categoryId: car.categoryId,
              categoryName: car.categoryName,
              price: car.price,
              manufactureYear: car.manufactureYear,
              color: car.color,
              engine: car.engine,
              transmission: car.transmission,
              seats: car.seats,
              image: car.images && car.images.length > 0 ? car.images[0] : '/placeholder-car.jpg',
              description: car.description,
              averageRating: car.averageRating,
              reviewCount: car.reviewCount,
              available: car.available
            },
            addedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          
          return [...prevItems, newItem];
        }
      });
      
      setError(null);
    } catch (err) {
      console.error('Failed to add item to cart:', err);
      setError(err.message);
    }
  }, []);

  const removeItem = useCallback((itemId) => {
    try {
      setItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
      setError(null);
    } catch (err) {
      console.error('Failed to remove item from cart:', err);
      setError('Failed to remove item from cart');
    }
  }, []);

  const updateQuantity = useCallback((itemId, newQuantity) => {
    try {
      if (!Number.isInteger(newQuantity) || newQuantity < 0) {
        throw new Error('Quantity must be a non-negative integer');
      }
      
      if (newQuantity === 0) {
        removeItem(itemId);
        return;
      }

      setItems((prevItems) =>
        prevItems.map((item) =>
          item.id === itemId 
            ? { 
                ...item, 
                quantity: newQuantity,
                updatedAt: new Date().toISOString()
              } 
            : item
        )
      );
      
      setError(null);
    } catch (err) {
      console.error('Failed to update item quantity:', err);
      setError(err.message);
    }
  }, [removeItem]);

  const clearCart = useCallback(() => {
    try {
      setItems([]);
      setError(null);
    } catch (err) {
      console.error('Failed to clear cart:', err);
      setError('Failed to clear cart');
    }
  }, []);

  // Clear all cart data including localStorage
  const clearAllData = useCallback(() => {
    try {
      setItems([]);
      setError(null);
      localStorage.removeItem(CART_STORAGE_KEY);
      localStorage.removeItem(CART_TIMESTAMP_KEY);
    } catch (err) {
      console.error('Failed to clear all cart data:', err);
      setError('Failed to clear cart data');
    }
  }, []);

  const getItemQuantity = useCallback((itemId) => {
    const item = items.find((item) => item.id === itemId);
    return item ? item.quantity : 0;
  }, [items]);

  const isInCart = useCallback((itemId) => {
    return items.some((item) => item.id === itemId);
  }, [items]);

  // Get cart item by ID
  const getCartItem = useCallback((itemId) => {
    return items.find((item) => item.id === itemId) || null;
  }, [items]);

  // Get cart summary
  const getCartSummary = useCallback(() => {
    return {
      totalItems,
      totalAmount,
      itemCount: items.length,
      lastUpdated: localStorage.getItem(CART_TIMESTAMP_KEY)
    };
  }, [totalItems, totalAmount, items.length]);

  // Validate cart integrity
  const validateCart = useCallback(() => {
    const invalidItems = items.filter(item => 
      !item.id || 
      !item.name || 
      typeof item.price !== 'number' || 
      !Number.isInteger(item.quantity) || 
      item.quantity < 1
    );
    
    if (invalidItems.length > 0) {
      console.warn('Found invalid cart items:', invalidItems);
      // Remove invalid items
      setItems(prevItems => 
        prevItems.filter(item => 
          item.id && 
          item.name && 
          typeof item.price === 'number' && 
          Number.isInteger(item.quantity) && 
          item.quantity >= 1
        )
      );
      return false;
    }
    
    return true;
  }, [items]);

  // Sync cart with backend (placeholder for future implementation)
  const syncWithBackend = useCallback(async () => {
    // This would sync cart with backend when user is authenticated
    // Implementation would depend on backend cart API
    try {
      // TODO: Implement backend sync when cart API is available
      console.log('Cart sync with backend not yet implemented');
      return true;
    } catch (err) {
      console.error('Failed to sync cart with backend:', err);
      setError('Failed to sync cart with server');
      return false;
    }
  }, []);

  const value = {
    items,
    totalAmount,
    totalItems,
    loading,
    error,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    clearAllData,
    getItemQuantity,
    isInCart,
    getCartItem,
    getCartSummary,
    validateCart,
    syncWithBackend,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
