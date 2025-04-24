import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { getCart, validateCoupon } from '../api';
import { setGlobalRefreshCart } from '../api';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartCount, setCartCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [discount, setDiscount] = useState(0);
  const navigation = useNavigation();

  const updateCartCount = useCallback(async () => {
    try {
      const cart = await getCart();
      setCartCount(cart?.items?.length || 0);
      
      // Calculate cart total
      const total = cart?.items?.reduce((sum, item) => {
        const price = parseFloat(item.product_price || item.price || 0);
        const quantity = parseInt(item.quantity || 1);
        return sum + (price * quantity);
      }, 0) || 0;
      
      setCartTotal(total);
      
      // Calculate discount (6% of total)
      const calculatedDiscount = (total * 6) / 100;
      setDiscount(calculatedDiscount);
      
      // If there's an applied coupon, recalculate the discount
      if (appliedCoupon) {
        applyCoupon(appliedCoupon.code);
      }
    } catch (error) {
      console.error('Error updating cart count:', error);
    }
  }, [appliedCoupon]);

  const applyCoupon = async (code) => {
    try {
      if (!code) return;
      
      const result = await validateCoupon(code, cartTotal);
      
      if (result.valid) {
        setAppliedCoupon(result.coupon);
        setCouponDiscount(result.discount);
        return { success: true, discount: result.discount };
      } else {
        setAppliedCoupon(null);
        setCouponDiscount(0);
        return { success: false, message: result.message };
      }
    } catch (error) {
      console.error('Error applying coupon:', error);
      setAppliedCoupon(null);
      setCouponDiscount(0);
      
      // Extract the error message from the response if available
      const errorMessage = error.response?.data?.message || 'Failed to apply coupon';
      return { success: false, message: errorMessage };
    }
  };

  const removeCoupon = useCallback(() => {
    // Clear all coupon-related state
    setAppliedCoupon(null);
    setCouponDiscount(0);
    
    // Force a cart refresh to update totals
    updateCartCount();
  }, [updateCartCount]);

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
    <CartContext.Provider value={{ 
      cartCount, 
      cartTotal,
      appliedCoupon,
      couponDiscount,
      discount,
      refreshCart: updateCartCount,
      applyCoupon,
      removeCoupon
    }}>
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

export default CartContext; 