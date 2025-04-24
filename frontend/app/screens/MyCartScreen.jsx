import { View, Text, ScrollView, Image, TextInput, TouchableOpacity, Pressable, ActivityIndicator, Alert, RefreshControl, KeyboardAvoidingView, Platform } from 'react-native'
import React, { useEffect, useState, useCallback } from 'react'
import TabBar from '../themes/TabBar'
import { ChevronLeftIcon, HeartIcon, MinusIcon, PlusIcon, XMarkIcon } from 'react-native-heroicons/outline'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import { deleteCartItem, getCart, updateCartItemQuantity, processImageUrl } from '../api'
import EvIcons from "react-native-vector-icons/EvilIcons"
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCart } from '../context/CartContext';

export default function MyCartScreen() {
  const navigation = useNavigation();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { cartTotal, appliedCoupon, couponDiscount, applyCoupon, removeCoupon, refreshCart } = useCart();

  // Check authentication status
  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const isAuth = !!token;
      setIsAuthenticated(isAuth);
      
      if (!isAuth) {
        setError('Please log in to view your cart');
        setLoading(false);
        setRefreshing(false);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  };

  // Process cart data to ensure all items have the required properties
  const processCartData = async (cartData) => {
    if (!cartData || !cartData.items) {
      return { items: [], total: 0 };
    }

    // Process each item to ensure all required properties exist
    const processedItems = await Promise.all(cartData.items.map(async item => {
      // Process the image URL
      let processedImageUrl = null;
      if (item.product_image) {
        try {
          console.log('Original image URL:', item.product_image);
          // If the URL is already absolute, use it as is
          if (item.product_image.startsWith('http')) {
            processedImageUrl = item.product_image;
          } else {
            // Otherwise, process it through the API
            processedImageUrl = await processImageUrl(item.product_image);
          }
          console.log('Processed image URL:', processedImageUrl);
        } catch (error) {
          console.error('Error processing image URL:', error);
        }
      }

      // Get the price from the correct field
      const price = typeof item.product_price === 'number' ? item.product_price :
                   typeof item.price === 'number' ? item.price :
                   parseFloat(item.product_price || item.price || 0);

      // Calculate subtotal based on price and quantity
      const quantity = parseInt(item.quantity || 1);
      const subtotal = price * quantity;

      // Ensure all required properties exist
      return {
        id: item.id,
        product_id: item.product,
        product_name: item.product_name,
        product_image: processedImageUrl,
        price: price,
        quantity: quantity,
        subtotal: subtotal
      };
    }));

    // Calculate total from processed items
    const total = processedItems.reduce((sum, item) => sum + item.subtotal, 0);

    return {
      items: processedItems,
      total: total
    };
  };

  const fetchCartData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCart();
      setCartItems(data.items || []);
    } catch (error) {
      console.error('Error fetching cart:', error);
      if (error.message === 'Session expired. Please login again.') {
        Alert.alert(
          'Session Expired',
          'Your session has expired. Please login again.',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Login')
            }
          ]
        );
      } else {
        setError('Failed to load cart items. Please try again.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;

    // Find the cart item to get the product ID
    const cartItem = cartItems.find(item => item.id === itemId);
    if (!cartItem) {
      Alert.alert('Error', 'Cart item not found');
      return;
    }

    // Optimistic update
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );

    try {
      await updateCartItemQuantity(cartItem.product, newQuantity);
      // Refresh cart data in background
      fetchCartData();
    } catch (error) {
      console.error('Error updating quantity:', error);
      // Revert optimistic update on error
      fetchCartData();
      
      // Handle different types of errors
      if (error.message === 'Session expired. Please login again.') {
        Alert.alert(
          'Session Expired',
          'Your session has expired. Please login again.',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('SignIn')
            }
          ]
        );
      } else if (error.message === 'You do not have permission to update this cart item.') {
        Alert.alert(
          'Permission Error',
          'You do not have permission to update this cart item. Please try again later.'
        );
      } else if (error.message === 'Cart item not found') {
        Alert.alert(
          'Error',
          'This item is no longer in your cart. The cart will be refreshed.'
        );
        fetchCartData(); // Refresh the cart to get the current state
      } else {
        Alert.alert(
          'Error',
          'Failed to update quantity. Please try again.'
        );
      }
    }
  };

  const handleDeleteItem = async (itemId) => {
    try {
      await deleteCartItem(itemId);
      // Optimistic update
      setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
      // Refresh cart data in background
      fetchCartData();
    } catch (error) {
      console.error('Error deleting item:', error);
      // Revert optimistic update on error
      fetchCartData();
    }
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      Alert.alert('Empty Cart', 'Your cart is empty. Add some items first.');
      return;
    }
    navigation.navigate('Checkout');
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchCartData();
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchCartData();
    });

    return unsubscribe;
  }, [navigation]);

  const handleApplyPromoCode = async () => {
    if (!promoCode.trim()) {
      Alert.alert('Error', 'Please enter a promo code');
      return;
    }
    
    try {
      setLoading(true);
      const result = await applyCoupon(promoCode);
      
      if (result.success) {
        Alert.alert('Success', `Coupon applied! You saved ${result.discount.toFixed(2)}`);
        setPromoCode('');
      } else {
        // Display the specific error message from the server
        Alert.alert('Invalid Coupon', result.message || 'This coupon cannot be applied to your cart.');
      }
    } catch (error) {
      console.error('Error applying promo code:', error);
      // Check if the error has a response with a message
      const errorMessage = error.response?.data?.message || error.message || 'Failed to apply promo code';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCoupon = async () => {
    try {
      setLoading(true);
      
      // Remove the coupon from context
      removeCoupon();
      
      // Clear the promo code input
      setPromoCode('');
      
      // Fetch fresh cart data and wait for it to complete
      await fetchCartData();
      
      // Force a refresh of the cart context
      refreshCart();
      
      setLoading(false);
      Alert.alert('Success', 'Coupon removed successfully');
    } catch (error) {
      console.error('Error removing coupon:', error);
      setLoading(false);
      Alert.alert('Error', 'Failed to remove coupon. Please try again.');
    }
  };

  // Error banner component for non-blocking errors
  const ErrorBanner = ({ message, onDismiss }) => (
    <View className="bg-red-100 p-3 mx-4 my-2 rounded-lg flex-row justify-between items-center">
      <Text className="text-red-600 flex-1">{message}</Text>
      <TouchableOpacity onPress={onDismiss} className="ml-2">
        <Text className="text-primary font-bold">Dismiss</Text>
      </TouchableOpacity>
    </View>
  );

  // Move CartItem outside of the main component and memoize it
  const CartItem = React.memo(({ item, onUpdateQuantity, onDelete }) => {
    // Calculate the price, ensuring it's a number
    const price = typeof item.price === 'number' ? item.price : 
                 typeof item.product_price === 'number' ? item.product_price :
                 parseFloat(item.price || item.product_price || 0);

    return (
      <View style={{ 
        flexDirection: 'row', 
        alignItems: 'center', 
        padding: wp('4%'),
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb'
      }}>
        <View style={{ position: 'relative' }}>
          <Image
            source={{ uri: item.product_image }}
            style={{ 
              width: wp('20%'),
              height: wp('20%'),
              resizeMode: 'cover',
              borderRadius: wp('2%')
            }}
          />
        </View>
        <View style={{ flex: 1, marginLeft: wp('4%') }}>
          <Text style={{ 
            fontWeight: '500', 
            fontSize: wp('4%'),
            marginBottom: hp('0.5%')
          }} numberOfLines={2}>{item.product_name}</Text>
          <Text style={{ 
            color: '#6b7280', 
            fontSize: wp('3.5%'),
            marginTop: hp('0.5%')
          }}>
            Rs {price.toFixed(2)}
          </Text>
          <View style={{ 
            flexDirection: 'row', 
            alignItems: 'center', 
            marginTop: hp('1%')
          }}>
            <TouchableOpacity
              onPress={() => onUpdateQuantity(item.id, item.quantity - 1)}
              style={{
                backgroundColor: '#e5e7eb',
                padding: wp('2%'),
                borderRadius: 9999
              }}
            >
              <MinusIcon size={wp('4%')} color="black" />
            </TouchableOpacity>
            <Text style={{ 
              marginHorizontal: wp('4%'),
              fontSize: wp('3.8%')
            }}>{item.quantity}</Text>
            <TouchableOpacity
              onPress={() => onUpdateQuantity(item.id, item.quantity + 1)}
              style={{
                backgroundColor: '#e5e7eb',
                padding: wp('2%'),
                borderRadius: 9999
              }}
            >
              <PlusIcon size={wp('4%')} color="black" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onDelete(item.id)}
              style={{ marginLeft: 'auto' }}
            >
              <EvIcons name="trash" size={wp('6%')} color="red" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }, (prevProps, nextProps) => {
    // Only re-render if these props change
    return (
      prevProps.item.id === nextProps.item.id &&
      prevProps.item.quantity === nextProps.item.quantity &&
      prevProps.item.product_image === nextProps.item.product_image
    );
  });

  if (loading && !refreshing) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size={45} color="#704f38" />
      </View>
    );
  }

  if (error && cartItems.length === 0) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-red-500 text-lg">{error}</Text>
        <TouchableOpacity 
          onPress={fetchCartData}
          className="mt-4 bg-primary py-2 px-4 rounded-lg"
        >
          <Text className="text-white">Retry</Text>
        </TouchableOpacity>
        {!isAuthenticated && (
          <TouchableOpacity 
            onPress={() => navigation.navigate('SignIn')}
            className="mt-4 bg-primary py-2 px-4 rounded-lg"
          >
            <Text className="text-white">Sign In</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  const deliveryFee = cartItems.length > 0 ? 10 : 0;
  const discountPercentage = 6;
  const subtotal = cartItems.reduce((total, item) => {
    const itemSubtotal = parseFloat(item.subtotal || 0);
    return total + (isNaN(itemSubtotal) ? 0 : itemSubtotal);
  }, 0);
  const discount = (subtotal * discountPercentage) / 100;
  const totalCost = subtotal + deliveryFee - discount - couponDiscount;

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <TabBar
        prefix={""}
        title={"My Cart"}
        suffix={<ChevronLeftIcon size={wp('6%')} color={'black'} />}
        titleStyle={{
          color: "black",
          fontWeight: "bold",
          fontSize: 20
        }}
        prefixStyle={{
          backgroundColor: "transparent"
        }}
        suffixStyle={{
          backgroundColor: "white",
          borderWidth: 1,
          borderColor: "black"
        }}
        containerStyle=""
        suffixAction={() => navigation.goBack()}
      />

      {/* Error banner for non-blocking errors */}
      {error && cartItems.length > 0 && (
        <ErrorBanner 
          message={error} 
          onDismiss={() => setError(null)} 
        />
      )}

      {!cartItems || cartItems.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <Text style={{ fontSize: wp('5%'), color: '#6b7280' }}>Your cart is empty</Text>
          <TouchableOpacity
            onPress={() => {
              // Navigate to Main (BottomTabBar) and then to Home tab
              navigation.goBack();
            }}
            style={{
              marginTop: hp('2%'),
              backgroundColor: '#704f38',
              paddingVertical: hp('1%'),
              paddingHorizontal: wp('4%'),
              borderRadius: wp('2%')
            }}
          >
            <Text style={{ color: 'white', fontSize: wp('4%') }}>Continue Shopping</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView 
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={["#704f38"]}
                tintColor="#704f38"
              />
            }
            className="flex-1"
          >
            {cartItems.map((item, index) => (
              <CartItem
                key={index}
                item={item}
                onUpdateQuantity={handleUpdateQuantity}
                onDelete={handleDeleteItem}
              />
            ))}
            
            <View className="p-4">
              <Text className="text-lg font-bold mb-2">Promo Code</Text>
              <View className="flex-row items-center">
                <TextInput
                  className="flex-1 border border-gray-300 rounded-lg p-3 mr-2"
                  placeholder="Enter promo code"
                  value={promoCode}
                  onChangeText={setPromoCode}
                  editable={!appliedCoupon}
                />
                <TouchableOpacity 
                  className="bg-primary p-3 rounded-lg"
                  onPress={handleApplyPromoCode}
                  disabled={!!loading || !!appliedCoupon}
                >
                  <Text className="text-white font-bold">Apply</Text>
                </TouchableOpacity>
              </View>
              {appliedCoupon && (
                <View className="mt-2">
                  <View className="bg-green-100 p-2 rounded-lg mb-2">
                    <Text className="text-green-800">
                      Coupon "{appliedCoupon.code}" applied! You saved {couponDiscount.toFixed(2)}
                    </Text>
                  </View>
                  <TouchableOpacity 
                    onPress={handleRemoveCoupon}
                    className="bg-red-500 p-2 rounded-lg"
                  >
                    <Text className="text-white text-center font-bold">Remove Coupon</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <View className="p-4 bg-gray-50 mx-4 rounded-lg mb-4">
              <Text className="text-lg font-bold mb-4">Order Summary</Text>
              
              <View className="flex-row justify-between mb-2">
                <Text className="text-gray-600">Subtotal</Text>
                <Text>Rs {subtotal.toFixed(2)}</Text>
              </View>
              
              <View className="flex-row justify-between mb-2">
                <Text className="text-gray-600">Delivery Fee</Text>
                <Text>Rs {deliveryFee.toFixed(2)}</Text>
              </View>
              
              <View className="flex-row justify-between mb-2">
                <Text className="text-gray-600">Discount</Text>
                <Text className="text-green-600">- Rs {discount.toFixed(2)}</Text>
              </View>
              
              {couponDiscount > 0 && (
                <View className="flex-row justify-between mb-2">
                  <Text className="text-gray-600">Coupon Discount</Text>
                  <Text className="text-green-600">- Rs {couponDiscount.toFixed(2)}</Text>
                </View>
              )}
              
              <View className="h-0.5 bg-gray-300 my-2" />
              
              <View className="flex-row justify-between mb-4">
                <Text className="font-bold">Total</Text>
                <Text className="font-bold">Rs {totalCost.toFixed(2)}</Text>
              </View>
              
              <TouchableOpacity 
                className="bg-primary py-3 rounded-lg"
                onPress={handleCheckout}
              >
                <Text className="text-white text-center font-bold">Proceed to Checkout</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </>
      )}
    </KeyboardAvoidingView>
  );
}
