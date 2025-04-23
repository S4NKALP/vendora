import { View, Text, ScrollView, Image, TextInput, TouchableOpacity, Pressable, ActivityIndicator, Alert, RefreshControl } from 'react-native'
import React, { useEffect, useState, useCallback } from 'react'
import TabBar from '../themes/TabBar'
import { ChevronLeftIcon, HeartIcon, MinusIcon, PlusIcon } from 'react-native-heroicons/outline'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import { deleteCartItem, getCart, updateCartItemQuantity, processImageUrl } from '../api'
import EvIcons from "react-native-vector-icons/EvilIcons"
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function MyCartScreen() {
  const navigation = useNavigation();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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

      // Ensure all required properties exist
      return {
        id: item.id,
        product_id: item.product,
        product_name: item.product_name,
        product_image: processedImageUrl,
        price: parseFloat(item.product_price || 0),
        quantity: parseInt(item.quantity || 1),
        subtotal: parseFloat(item.subtotal || 0)
      };
    }));

    return {
      items: processedItems,
      total: parseFloat(cartData.total || 0)
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

    // Optimistic update
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );

    try {
      await updateCartItemQuantity(itemId, newQuantity);
      // Refresh cart data in background
      fetchCartData();
    } catch (error) {
      console.error('Error updating quantity:', error);
      // Revert optimistic update on error
      fetchCartData();
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
      // This would normally call an API endpoint to apply the promo code
      // For now, just show a message
      Alert.alert('Success', 'Promo code applied successfully!');
      setPromoCode('');
    } catch (error) {
      console.error('Error applying promo code:', error);
      Alert.alert('Error', error.message || 'Failed to apply promo code');
    } finally {
      setLoading(false);
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

  const CartItem = ({ item, onUpdateQuantity, onDelete }) => {
    const [imageError, setImageError] = useState(false);
    const [imageLoading, setImageLoading] = useState(true);

    // Use local fallback image if no image URL or error
    const imageSource = !item.product_image || imageError 
      ? require('../../assets/images/favicon.png')
      : { uri: item.product_image, cache: 'force-cache' };

    return (
      <View className="flex-row items-center p-4 border-b border-gray-200">
        <View className="relative">
          <Image
            source={imageSource}
            style={{ 
              width: 80, 
              height: 80,
              resizeMode: 'cover'
            }}
            className="rounded-lg"
            onError={(e) => {
              console.error('Error loading image for product:', item.product_image);
              console.error('Error details:', e.nativeEvent);
              setImageError(true);
            }}
            onLoadStart={() => {
              if (item.product_image) {
                console.log('Loading image:', item.product_image);
                setImageLoading(true);
              }
            }}
            onLoadEnd={() => {
              if (item.product_image) {
                console.log('Image loaded successfully:', item.product_image);
                setImageLoading(false);
              }
            }}
            onLoad={() => {
              if (item.product_image) {
                console.log('Image loaded and rendered:', item.product_image);
                setImageLoading(false);
              }
            }}
          />
          {imageLoading && item.product_image && (
            <View className="absolute inset-0 justify-center items-center bg-gray-100 rounded-lg">
              <ActivityIndicator size="small" color="#704f38" />
            </View>
          )}
        </View>
        <View className="flex-1 ml-4">
          <Text className="font-medium text-base" numberOfLines={2}>{item.product_name}</Text>
          <Text className="text-gray-500 text-sm mt-1">
            ${typeof item.price === 'number' ? item.price.toFixed(2) : '0.00'}
          </Text>
          <View className="flex-row items-center mt-2">
            <TouchableOpacity
              onPress={() => onUpdateQuantity(item.id, item.quantity - 1)}
              className="bg-gray-200 p-2 rounded-full"
            >
              <MinusIcon size={16} color="black" />
            </TouchableOpacity>
            <Text className="mx-4">{item.quantity}</Text>
            <TouchableOpacity
              onPress={() => onUpdateQuantity(item.id, item.quantity + 1)}
              className="bg-gray-200 p-2 rounded-full"
            >
              <PlusIcon size={16} color="black" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onDelete(item.id)}
              className="ml-auto"
            >
              <EvIcons name="trash" size={24} color="red" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

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
  const totalCost = subtotal + deliveryFee - discount;

  return (
    <View className="bg-white flex-col " style={{ height: hp('97%') }} >
      <TabBar
        prefix={""}
        title={"My Cart"}
        suffix={<ChevronLeftIcon size={25} color={'black'} />}
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
          <Text className="text-xl text-gray-500">Your cart is empty</Text>
          <TouchableOpacity 
            onPress={() => navigation.navigate('Home')}
            className="mt-4 bg-primary py-2 px-4 rounded-lg"
          >
            <Text className="text-white">Continue Shopping</Text>
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
          >
            {cartItems.map((item, index) => (
              <CartItem
                key={index}
                item={item}
                onUpdateQuantity={handleUpdateQuantity}
                onDelete={handleDeleteItem}
              />
            ))}
          </ScrollView>

          <View className="bg-white py-5 px-4 rounded-tl-2xl">
            <View className="border rounded-full flex-row overflow-hidden p-2 pl-6">
              <TextInput 
                placeholder='Promo Code' 
                className="text-lg flex-1" 
                value={promoCode}
                onChangeText={setPromoCode}
              />
              <TouchableOpacity 
                className="bg-primary rounded-full px-6 items-center flex-row"
                onPress={handleApplyPromoCode}
              >
                <Text className="text-white font-bold">Apply</Text>
              </TouchableOpacity>
            </View>
            <View className="flex-row justify-between items-center mt-4">
              <Text>Sub-Total</Text>
              <Text>${subtotal.toFixed(2)}</Text>
            </View>
            <View className="flex-row justify-between items-center mt-4">
              <Text>Delivery fee</Text>
              <Text>${deliveryFee.toFixed(2)}</Text>
            </View>
            <View className="flex-row justify-between items-center mt-4">
              <Text>Discount</Text>
              <Text>{discountPercentage}% (${discount.toFixed(2)})</Text>
            </View>
            <View className="border border-dashed mt-4" />
            <View className="flex-row justify-between items-center mt-4">
              <Text>Total Cost</Text>
              <Text>${totalCost.toFixed(2)}</Text>
            </View>
            <TouchableOpacity 
              onPress={handleCheckout} 
              className="border rounded-full bg-primary flex-row justify-center items-center mb-3"
              style={{ height: hp('5%') }}
            >
              <Text className="text-white text-lg font-semibold">Proceed To Checkout</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}