import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import cartService from '../services/cartService';

const CartContext = createContext(null);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

/**
 * CartProvider component that provides cart context to child components
 * Sử dụng API để lưu giỏ hàng vào database
 */
// eslint-disable-next-line react/prop-types
export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isAuthenticated, user } = useAuth();

  // Load cart from API when user is authenticated
  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setItems([]);
      return;
    }

    setLoading(true);
    try {
      const response = await cartService.getCart();
      if (response.success && response.data) {
        const cartItems = response.data.items || [];
        // Transform API response to match our cart item structure
        const transformedItems = cartItems.map(item => ({
          id: item.car?.id || item.carId,
          cartItemId: item.id, // ID của cart item trong database
          name: item.car?.name || item.carName,
          price: item.price || item.car?.price,
          image: item.car?.images?.[0] || item.car?.image || '/placeholder-car.jpg',
          color: item.car?.color,
          quantity: item.quantity,
          car: item.car,
          addedAt: item.createdAt,
          updatedAt: item.updatedAt
        }));
        setItems(transformedItems);
      } else {
        setItems([]);
      }
      setError(null);
    } catch (err) {
      console.error('Failed to fetch cart:', err);
      setError('Không thể tải giỏ hàng');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Fetch cart when authentication state changes
  useEffect(() => {
    fetchCart();
  }, [fetchCart, user]);

  // Calculate total amount
  const totalAmount = items.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);

  // Calculate total items count
  const totalItems = items.reduce((total, item) => {
    return total + item.quantity;
  }, 0);

  const addItem = useCallback(async (car, quantity = 1) => {
    if (!isAuthenticated) {
      setError('Vui lòng đăng nhập để thêm vào giỏ hàng');
      return false;
    }

    setLoading(true);
    try {
      const response = await cartService.addToCart({
        carId: car.id,
        quantity: quantity
      });

      if (response.success) {
        // Refresh cart from server
        await fetchCart();
        setError(null);
        return true;
      } else {
        setError(response.message || 'Không thể thêm vào giỏ hàng');
        return false;
      }
    } catch (err) {
      console.error('Failed to add item to cart:', err);
      setError(err.message || 'Không thể thêm vào giỏ hàng');
      return false;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, fetchCart]);

  const removeItem = useCallback(async (itemId) => {
    if (!isAuthenticated) {
      setError('Vui lòng đăng nhập');
      return false;
    }

    // Tìm cartItemId từ itemId (carId)
    const item = items.find(i => i.id === itemId);
    if (!item) {
      setError('Không tìm thấy sản phẩm trong giỏ hàng');
      return false;
    }

    setLoading(true);
    try {
      const response = await cartService.removeFromCart(item.cartItemId || itemId);

      if (response.success) {
        await fetchCart();
        setError(null);
        return true;
      } else {
        setError(response.message || 'Không thể xóa khỏi giỏ hàng');
        return false;
      }
    } catch (err) {
      console.error('Failed to remove item from cart:', err);
      setError(err.message || 'Không thể xóa khỏi giỏ hàng');
      return false;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, items, fetchCart]);

  const updateQuantity = useCallback(async (itemId, newQuantity) => {
    if (!isAuthenticated) {
      setError('Vui lòng đăng nhập');
      return false;
    }

    if (newQuantity <= 0) {
      return removeItem(itemId);
    }

    // Tìm cartItemId từ itemId (carId)
    const item = items.find(i => i.id === itemId);
    if (!item) {
      setError('Không tìm thấy sản phẩm trong giỏ hàng');
      return false;
    }

    setLoading(true);
    try {
      const response = await cartService.updateCartItem(item.cartItemId || itemId, {
        quantity: newQuantity
      });

      if (response.success) {
        await fetchCart();
        setError(null);
        return true;
      } else {
        setError(response.message || 'Không thể cập nhật số lượng');
        return false;
      }
    } catch (err) {
      console.error('Failed to update item quantity:', err);
      setError(err.message || 'Không thể cập nhật số lượng');
      return false;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, items, removeItem, fetchCart]);

  const clearCart = useCallback(async () => {
    if (!isAuthenticated) {
      setItems([]);
      return true;
    }

    setLoading(true);
    try {
      const response = await cartService.clearCart();

      if (response.success) {
        setItems([]);
        setError(null);
        return true;
      } else {
        setError(response.message || 'Không thể xóa giỏ hàng');
        return false;
      }
    } catch (err) {
      console.error('Failed to clear cart:', err);
      setError(err.message || 'Không thể xóa giỏ hàng');
      return false;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const getItemQuantity = useCallback((itemId) => {
    const item = items.find((item) => item.id === itemId);
    return item ? item.quantity : 0;
  }, [items]);

  const isInCart = useCallback((itemId) => {
    return items.some((item) => item.id === itemId);
  }, [items]);

  const getCartItem = useCallback((itemId) => {
    return items.find((item) => item.id === itemId) || null;
  }, [items]);

  const getCartSummary = useCallback(() => {
    return {
      totalItems,
      totalAmount,
      itemCount: items.length
    };
  }, [totalItems, totalAmount, items.length]);

  // Refresh cart from server
  const refreshCart = useCallback(async () => {
    await fetchCart();
  }, [fetchCart]);

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
    getItemQuantity,
    isInCart,
    getCartItem,
    getCartSummary,
    refreshCart,
    isAuthenticated
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
