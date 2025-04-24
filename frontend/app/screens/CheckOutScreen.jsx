import { View, Text, ScrollView, Image, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native'
import React, { useEffect, useState, useCallback } from 'react'
import TabBar from '../themes/TabBar'
import { ChevronLeftIcon } from 'react-native-heroicons/outline'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { MapPinIcon } from 'react-native-heroicons/micro';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import { checkoutCart, getCart } from '../api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import LocationModal from '../components/LocationModal';
import { useCart } from '../context/CartContext';
import ConfirmPayment from './ConfirmPayment';

export default function CheckOutScreen() {
    const navigation = useNavigation();
    const [cart, setCart] = useState({ items: [], total_price: 0 });
    const [loading, setIsLoading] = useState(true);
    const [placingOrder, setPlacingOrder] = useState(false);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
    const [shippingAddress, setShippingAddress] = useState({
        type: 'Home',
        address: 'Loading address...',
        zipCode: ''
    });
    const [isLocationModalVisible, setIsLocationModalVisible] = useState(false);
    const { appliedCoupon, couponDiscount, discount } = useCart();
    const [showPaymentSection, setShowPaymentSection] = useState(false);
    
    // Calculate final total
    const finalTotal = cart.total_price - discount - couponDiscount + (selectedPaymentMethod?.type === 'cod' ? 150 : 0);
    
    // Default shipping method
    const shippingMethod = {
        type: 'Economy',
        estimatedArrival: '25 August 2023'
    };

    // Fetch saved location from AsyncStorage
    const fetchSavedLocation = useCallback(async () => {
        try {
            const savedLocation = await AsyncStorage.getItem('userLocation');
            if (savedLocation) {
                const locationData = JSON.parse(savedLocation);
                setShippingAddress({
                    type: 'Current Location',
                    address: locationData.address,
                    zipCode: locationData.coordinates ? `${locationData.coordinates.latitude}, ${locationData.coordinates.longitude}` : ''
                });
            } else {
                // If no saved location, try to get current location
                await getCurrentLocation();
            }
        } catch (error) {
            console.error('Error fetching saved location:', error);
            setShippingAddress({
                type: 'Home',
                address: 'Address not available',
                zipCode: ''
            });
        }
    }, []);

    // Get current location
    const getCurrentLocation = useCallback(async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Please enable location services to use this feature.');
                return;
            }

            const location = await Location.getCurrentPositionAsync({});
            const { latitude, longitude } = location.coords;
            
            // Get address from coordinates using reverse geocoding
            const [address] = await Location.reverseGeocodeAsync({
                latitude,
                longitude
            });

            if (address) {
                const formattedAddress = `${address.street || ''} ${address.name || ''}, ${address.city || ''}, ${address.region || ''} ${address.postalCode || ''}`.trim();
                setShippingAddress({
                    type: 'Current Location',
                    address: formattedAddress,
                    zipCode: address.postalCode || `${latitude}, ${longitude}`
                });

                // Save to AsyncStorage
                await AsyncStorage.setItem('userLocation', JSON.stringify({
                    name: 'Current Location',
                    address: formattedAddress,
                    coordinates: { latitude, longitude }
                }));
            }
        } catch (error) {
            console.error('Error getting current location:', error);
            Alert.alert('Error', 'Failed to get your location. Please try again.');
        }
    }, []);

    // Handle location selection from modal
    const handleLocationSelected = (locationData) => {
        setShippingAddress({
            type: 'Selected Location',
            address: locationData.address,
            zipCode: locationData.coordinates ? `${locationData.coordinates.latitude}, ${locationData.coordinates.longitude}` : ''
        });
    };

    // Calculate item subtotal
    const calculateSubtotal = (item) => {
        // Ensure price and quantity exist and are numbers
        const price = typeof item.price === 'number' ? item.price : 0;
        const quantity = typeof item.quantity === 'number' ? item.quantity : 0;
        return price * quantity;
    };

    // Process cart data to ensure all items have the required properties
    const processCartData = (cartData) => {
        if (!cartData || !cartData.items) {
            return { items: [], total_price: 0 };
        }

        // Process each item to ensure it has the required properties
        const processedItems = cartData.items.map(item => {
            // Get price from the correct field (product_price from API)
            const price = typeof item.product_price === 'number' ? item.product_price :
                         typeof item.price === 'number' ? item.price :
                         parseFloat(item.product_price || item.price || 0);
            
            const quantity = parseInt(item.quantity) || 1;
            const subtotal = price * quantity;
            
            return {
                ...item,
                id: item.id || Date.now(),
                product_name: item.product_name || item.name || item.title || 'Unknown Product',
                product_image: item.product_image || item.image || 'https://via.placeholder.com/150',
                price: price,
                quantity: quantity,
                subtotal: subtotal
            };
        });

        // Calculate total price from processed items
        const total_price = processedItems.reduce((total, item) => total + item.subtotal, 0);

        return {
            items: processedItems,
            total_price
        };
    };

    const fetchCartData = useCallback(async () => {
        try {
            setIsLoading(true);
            const cartData = await getCart();
            const processedCart = processCartData(cartData);
            setCart(processedCart);
            setError(null);
        } catch (error) {
            console.error('Error fetching cart:', error);
            setError('Failed to load cart data');
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchCartData();
    }, [fetchCartData]);

    // Initialize data
    useEffect(() => {
        const initializeData = async () => {
            try {
                await fetchCartData();
                await fetchSavedLocation();
            } catch (error) {
                console.error('Error initializing data:', error);
            }
        };

        initializeData();
    }, [fetchCartData, fetchSavedLocation]);

    const handlePlaceOrder = async () => {
        if (!cart.items || cart.items.length === 0) {
            Alert.alert('Empty Cart', 'Your cart is empty. Add some items before checking out.');
            return;
        }

        if (!shippingAddress.address || shippingAddress.address === 'Loading address...' || shippingAddress.address === 'Address not available') {
            Alert.alert('Address Required', 'Please set a valid shipping address before proceeding.');
            return;
        }

        if (!selectedPaymentMethod) {
            Alert.alert('Payment Method Required', 'Please select a payment method before proceeding.');
            return;
        }

        try {
            setPlacingOrder(true);
            
            // Calculate final total with coupon discount
            const subtotal = cart.total_price;
            const deliveryFee = 10; // Fixed delivery fee
            const discountPercentage = 6;
            const discount = (subtotal * discountPercentage) / 100;
            const finalTotal = subtotal + deliveryFee - discount - (couponDiscount || 0);

            const orderData = {
                items: cart.items.map(item => ({
                    id: item.id,
                    quantity: item.quantity,
                    price: item.price
                })),
                shipping_address: {
                    address: shippingAddress.address,
                    latitude: shippingAddress.latitude,
                    longitude: shippingAddress.longitude
                },
                payment_method: selectedPaymentMethod,
                shipping_method: shippingMethod,
                subtotal: subtotal,
                delivery_fee: deliveryFee,
                discount: discount,
                coupon_discount: couponDiscount || 0,
                coupon_code: appliedCoupon?.code || null,
                total: finalTotal
            };

            const response = await checkoutCart(orderData);
            
            if (response && response.order_id) {
                // Clear the cart after successful order
                await AsyncStorage.removeItem('cart');
                
                // Navigate to Payment Success screen
                navigation.navigate('Payment Success');
            } else {
                throw new Error('Invalid response from server');
            }
        } catch (error) {
            console.error('Error placing order:', error);
            Alert.alert(
                'Error',
                error.response?.data?.message || error.message || 'Failed to place order. Please try again.'
            );
        } finally {
            setPlacingOrder(false);
        }
    };

    // Handle payment method selection result
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            // Check if payment method was selected and stored
            AsyncStorage.getItem('selectedPaymentMethod').then(method => {
                if (method) {
                    setSelectedPaymentMethod(JSON.parse(method));
                }
            });
        });

        return unsubscribe;
    }, [navigation]);

    const handlePaymentMethodSelect = (method) => {
        setSelectedPaymentMethod(method);
        setShowPaymentSection(false);
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <ActivityIndicator size="large" color="#704f38" />
            </View>
        );
    }

    if (error) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <Text className="text-red-500 text-lg mb-4">{error}</Text>
                <TouchableOpacity 
                    onPress={fetchCartData}
                    className="bg-primary py-2 px-4 rounded-lg"
                >
                    <Text className="text-white">Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    if (!cart.items || cart.items.length === 0) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <Text className="text-xl text-gray-500 mb-4">Your cart is empty</Text>
                <TouchableOpacity 
                    onPress={() => navigation.navigate('Main')}
                    className="bg-primary py-2 px-4 rounded-lg"
                >
                    <Text className="text-white">Continue Shopping</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View className={`bg-white flex-col`} style={{ height: hp("97%") }}>
            <TabBar
                prefix={""}
                title={"Checkout"}
                suffix={<ChevronLeftIcon size={wp('6%')} color={'black'} />}
                titleStyle={{
                    color: "black",
                    fontWeight: "bold",
                    fontSize: wp('5%')
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
            <ScrollView 
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#704f38']}
                        tintColor="#704f38"
                    />
                }
            >
                <View className={`mx-4 mt-5 border-b-[1px] pb-7 border-gray-300`}>
                    <Text style={{ fontSize: wp('5%'), marginBottom: hp('2%') }}>Shipping Address</Text>
                    <View className={`flex-row gap-1 items-center`}>
                        <MapPinIcon color={"#704f38"} width={wp('6%')} height={wp('6%')} />
                        <Text style={{ fontSize: wp('4.5%'), fontWeight: '600' }}>{shippingAddress.type}</Text>
                    </View>
                    <View className={`flex-row justify-between items-start mt-2`}>
                        <View style={{ flex: 1, marginRight: wp('2%') }}>
                            <Text 
                                style={{ 
                                    fontSize: wp('3.8%'),
                                    paddingHorizontal: wp('2%'),
                                    lineHeight: wp('5%')
                                }}
                                numberOfLines={2}
                                ellipsizeMode="tail"
                            >
                                {shippingAddress.address}
                            </Text>
                            <Text 
                                style={{ 
                                    fontSize: wp('3.8%'),
                                    paddingHorizontal: wp('2%'),
                                    marginTop: hp('0.5%')
                                }}
                                numberOfLines={1}
                                ellipsizeMode="tail"
                            >
                                {shippingAddress.zipCode}
                            </Text>
                        </View>
                        <TouchableOpacity 
                            onPress={() => setIsLocationModalVisible(true)}
                            style={{
                                paddingHorizontal: wp('2%'),
                                paddingVertical: hp('0.5%')
                            }}
                        >
                            <Text style={{ 
                                fontSize: wp('3.5%'), 
                                color: '#704f38', 
                                borderWidth: 1, 
                                borderColor: '#d1d5db', 
                                paddingHorizontal: wp('4%'), 
                                paddingVertical: hp('1%'), 
                                borderRadius: 9999 
                            }}>
                                CHANGE
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <View className={`mx-4 mt-5 border-b-[1px] pb-7 border-gray-300`}>
                    <Text style={{ fontSize: wp('5%'), marginBottom: hp('2%') }}>Choose Shipping Type</Text>
                    <View className={`flex-row gap-1 items-center`}>
                        <Icon name='cube' color={"#704f38"} size={wp('6%')} />
                        <Text style={{ fontSize: wp('4.5%'), fontWeight: '600' }}>{shippingMethod.type}</Text>
                    </View>
                    <View className={`flex-row justify-between items-start mt-2`}>
                        <View style={{ flex: 1, marginRight: wp('2%') }}>
                            <Text 
                                style={{ 
                                    fontSize: wp('3.8%'),
                                    paddingHorizontal: wp('2%'),
                                    lineHeight: wp('5%')
                                }}
                                numberOfLines={1}
                                ellipsizeMode="tail"
                            >
                                Estimated arrival {shippingMethod.estimatedArrival}
                            </Text>
                        </View>
                        <TouchableOpacity 
                            onPress={()=>{navigation.navigate('Choose Shipping')}}
                            style={{
                                paddingHorizontal: wp('2%'),
                                paddingVertical: hp('0.5%')
                            }}
                        >
                            <Text style={{ 
                                fontSize: wp('3.5%'), 
                                color: '#704f38', 
                                borderWidth: 1, 
                                borderColor: '#d1d5db', 
                                paddingHorizontal: wp('4%'), 
                                paddingVertical: hp('1%'), 
                                borderRadius: 9999 
                            }}>
                                CHANGE
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
                
                <View className={`mx-4 mt-5 border-b-[1px] pb-7 border-gray-300`}>
                    <Text style={{ fontSize: wp('5%'), marginBottom: hp('2%') }}>Payment Method</Text>
                    <View className={`flex-row justify-between items-center`}>
                        <Text style={{ fontSize: wp('3.8%'), marginTop: hp('1%'), paddingHorizontal: wp('2%') }}>
                            {selectedPaymentMethod ? selectedPaymentMethod.name : 'Select payment method'}
                        </Text>
                        <TouchableOpacity onPress={() => setShowPaymentSection(true)}>
                            <Text style={{ fontSize: wp('3.5%'), color: '#704f38', borderWidth: 1, borderColor: '#d1d5db', paddingHorizontal: wp('4%'), paddingVertical: hp('1%'), borderRadius: 9999 }}>
                                {selectedPaymentMethod ? 'CHANGE' : 'SELECT'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                    {selectedPaymentMethod?.type === 'cod' && (
                        <Text style={{ fontSize: wp('3.8%'), color: '#704f38', marginTop: hp('1%'), paddingHorizontal: wp('2%') }}>
                            Additional COD charge: Rs150
                        </Text>
                    )}
                </View>
                
                <View className="flex-row justify-between mx-4 mt-5 mb-2">
                    <Text style={{ fontSize: wp('4.5%'), fontWeight: '600' }}>Order List</Text>
                    <Text style={{ fontSize: wp('3.5%'), color: '#704f38' }}>{cart.items.length} item{cart.items.length !== 1 ? 's' : ''}</Text>
                </View>

                {cart.items.map((item, index) => {
                    // Calculate the subtotal for safety
                    const itemSubtotal = calculateSubtotal(item);
                    
                    return (
                        <View key={index} className={`flex-row gap-4 border-b-[1px] border-gray-300`} style={{ padding: hp("1.8%") }}>
                            <Image className={`rounded-2xl`} source={{ uri: item.product_image }} height={hp(13)} width={hp(13)} />
                            <View className={`flex-1 justify-between`}>
                                <View className={`flex-col gap-2 justify-center`}>
                                    <Text style={{ fontSize: wp('4%') }}>{item.product_name}</Text>
                                    <Text style={{ fontSize: wp('3.5%') }}>Quantity: {item.quantity}</Text>
                                    <Text style={{ fontSize: wp('3.5%') }}>Rs{itemSubtotal.toFixed(2)}</Text>
                                </View>
                            </View>
                        </View>
                    );
                })}
                
                <View className="mx-4 my-4">
                    <View className={`flex-row justify-between items-center mt-2`}>
                        <Text style={{ fontSize: wp('3.8%') }}>Sub-Total</Text>
                        <Text style={{ fontSize: wp('3.5%') }}>Rs{cart.total_price.toFixed(2)}</Text>
                    </View>
                    <View className={`flex-row justify-between items-center mt-2`}>
                        <Text style={{ fontSize: wp('3.8%') }}>Delivery fee</Text>
                        <Text style={{ fontSize: wp('3.5%') }}>Rs{10.00}</Text>
                    </View>
                    {couponDiscount > 0 && (
                        <View className={`flex-row justify-between items-center mt-2`}>
                            <Text style={{ fontSize: wp('3.8%') }}>Coupon Discount</Text>
                            <Text style={{ fontSize: wp('3.5%') }}>- Rs {couponDiscount.toFixed(2)}</Text>
                        </View>
                    )}
                    <View className={`flex-row justify-between items-center mt-2`}>
                        <Text style={{ fontSize: wp('3.8%') }}>Discount</Text>
                        <Text style={{ fontSize: wp('3.5%') }}>{6}% (Rs{discount.toFixed(2)})</Text>
                    </View>
                    {selectedPaymentMethod?.type === 'cod' && (
                        <View className={`flex-row justify-between items-center mt-2`}>
                            <Text style={{ fontSize: wp('3.8%') }}>COD Fee</Text>
                            <Text style={{ fontSize: wp('3.5%') }}>Rs{150.00}</Text>
                        </View>
                    )}
                    <View className={`border border-dashed mt-4 mb-4`} />
                    <View className={`flex-row justify-between items-center`}>
                        <Text style={{ fontSize: wp('4.5%'), fontWeight: '600' }}>Total Cost</Text>
                        <Text style={{ fontSize: wp('4.5%'), fontWeight: '600' }}>Rs{finalTotal.toFixed(2)}</Text>
                    </View>
                </View>
                {/* Add padding at the bottom to prevent content from being hidden behind the button */}
                <View style={{ height: hp('15%') }} />
            </ScrollView>

            <TouchableOpacity 
                onPress={() => {
                    if (!selectedPaymentMethod) {
                        Alert.alert('Payment Method Required', 'Please select a payment method to continue.');
                        return;
                    }
                    handlePlaceOrder();
                }}
                disabled={placingOrder || !selectedPaymentMethod} 
                style={{
                    backgroundColor: 'white',
                    paddingVertical: hp('1.5%'),
                    borderTopLeftRadius: wp('4%'),
                    borderTopRightRadius: wp('4%'),
                    borderWidth: 1,
                    borderColor: '#d1d5db',
                    position: 'absolute',
                    bottom: 0,
                    width: '100%',
                    shadowColor: "#000",
                    shadowOffset: {
                        width: 0,
                        height: -2,
                    },
                    shadowOpacity: 0.1,
                    shadowRadius: 3,
                    elevation: 5,
                }}
            >
                <View style={{
                    borderWidth: 1,
                    borderRadius: 9999,
                    backgroundColor: '#704f38',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginHorizontal: wp('4%'),
                    marginBottom: hp('1%'),
                    height: hp('5%'),
                    opacity: (placingOrder || !selectedPaymentMethod) ? 0.7 : 1
                }}>
                    {placingOrder ? (
                        <ActivityIndicator color="white" size="small" />
                    ) : (
                        <Text style={{ 
                            color: 'white',
                            fontWeight: '600',
                            fontSize: wp('4%')
                        }}>
                            {selectedPaymentMethod ? 'Place Order' : 'Select Payment Method'}
                        </Text>
                    )}
                </View>
            </TouchableOpacity>

            <LocationModal
                visible={isLocationModalVisible}
                onClose={() => setIsLocationModalVisible(false)}
                onLocationSelected={handleLocationSelected}
            />

            {/* Payment Modal */}
            {showPaymentSection && (
                <View className="absolute inset-0 bg-white">
                    <ConfirmPayment />
                </View>
            )}
        </View>
    );
}