import { createContext, useContext, useReducer, useEffect } from 'react';

const CartContext = createContext();

// Load cart from localStorage
const loadCartFromStorage = () => {
  try {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  } catch (error) {
    console.error('Failed to load cart from storage:', error);
    return [];
  }
};

// Initial state
const initialState = {
  items: loadCartFromStorage(),
  totalItems: 0,
  totalAmount: 0,
};

// Action types
const CART_ACTIONS = {
  ADD_ITEM: 'ADD_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  UPDATE_QUANTITY: 'UPDATE_QUANTITY',
  CLEAR_CART: 'CLEAR_CART',
  LOAD_CART: 'LOAD_CART',
};

// Helper function to calculate totals
const calculateTotals = (items) => {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  return { totalItems, totalAmount };
};

// Reducer function
const cartReducer = (state, action) => {
  let newItems;
  let totals;

  switch (action.type) {
    case CART_ACTIONS.ADD_ITEM:
      const existingItemIndex = state.items.findIndex(
        (item) => item.id === action.payload.id
      );

      if (existingItemIndex >= 0) {
        // Item already exists, update quantity
        newItems = [...state.items];
        newItems[existingItemIndex] = {
          ...newItems[existingItemIndex],
          quantity: newItems[existingItemIndex].quantity + (action.payload.quantity || 1),
        };
      } else {
        // Add new item
        newItems = [
          ...state.items,
          {
            id: action.payload.id,
            name: action.payload.name,
            price: action.payload.price,
            image: action.payload.image || (action.payload.images && action.payload.images[0]) || null,
            color: action.payload.color,
            quantity: action.payload.quantity || 1,
          },
        ];
      }

      totals = calculateTotals(newItems);
      return {
        ...state,
        items: newItems,
        totalItems: totals.totalItems,
        totalAmount: totals.totalAmount,
      };

    case CART_ACTIONS.REMOVE_ITEM:
      newItems = state.items.filter((item) => item.id !== action.payload);
      totals = calculateTotals(newItems);
      return {
        ...state,
        items: newItems,
        totalItems: totals.totalItems,
        totalAmount: totals.totalAmount,
      };

    case CART_ACTIONS.UPDATE_QUANTITY:
      newItems = state.items.map((item) =>
        item.id === action.payload.id
          ? { ...item, quantity: action.payload.quantity }
          : item
      );
      totals = calculateTotals(newItems);
      return {
        ...state,
        items: newItems,
        totalItems: totals.totalItems,
        totalAmount: totals.totalAmount,
      };

    case CART_ACTIONS.CLEAR_CART:
      return {
        ...state,
        items: [],
        totalItems: 0,
        totalAmount: 0,
      };

    case CART_ACTIONS.LOAD_CART:
      totals = calculateTotals(action.payload);
      return {
        ...state,
        items: action.payload,
        totalItems: totals.totalItems,
        totalAmount: totals.totalAmount,
      };

    default:
      return state;
  }
};

// Provider component
export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState, (initial) => {
    const totals = calculateTotals(initial.items);
    return { ...initial, ...totals };
  });

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(state.items));
  }, [state.items]);

  // Add item to cart
  const addItem = (item) => {
    dispatch({ type: CART_ACTIONS.ADD_ITEM, payload: item });
  };

  // Remove item from cart
  const removeItem = (itemId) => {
    dispatch({ type: CART_ACTIONS.REMOVE_ITEM, payload: itemId });
  };

  // Update item quantity
  const updateQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      removeItem(itemId);
    } else {
      dispatch({
        type: CART_ACTIONS.UPDATE_QUANTITY,
        payload: { id: itemId, quantity },
      });
    }
  };

  // Clear entire cart
  const clearCart = () => {
    dispatch({ type: CART_ACTIONS.CLEAR_CART });
  };

  // Check if item is in cart
  const isInCart = (itemId) => {
    return state.items.some((item) => item.id === itemId);
  };

  // Get item quantity
  const getItemQuantity = (itemId) => {
    const item = state.items.find((item) => item.id === itemId);
    return item ? item.quantity : 0;
  };

  const value = {
    items: state.items,
    totalItems: state.totalItems,
    totalAmount: state.totalAmount,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    isInCart,
    getItemQuantity,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// Custom hook to use cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;
