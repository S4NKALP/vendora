import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { getCart } from '../api';
import { setGlobalRefreshCart } from '../api';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartCount, setCartCount] = useState(0);
  const navigation = useNavigation();

  const updateCartCount = useCallback(async () => {
    try {
      const cart = await getCart();
      setCartCount(cart?.items?.length || 0);
    } catch (error) {
      console.error('Error updating cart count:', error);
      // Don't set cart count to 0 on error, keep previous value
    }
  }, []);

  useEffect(() => {
    // Set the global refresh function
    setGlobalRefreshCart(updateCartCount);
    
    // Initial cart count update
    updateCartCount();

    // Update cart count when navigation state changes
    const unsubscribe = navigation.addListener('state', () => {
      updateCartCount();
    });

    return () => {
      unsubscribe();
      setGlobalRefreshCart(null);
    };
  }, [navigation, updateCartCount]);

  return (
    <CartContext.Provider value={{ cartCount, refreshCart: updateCartCount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}; 