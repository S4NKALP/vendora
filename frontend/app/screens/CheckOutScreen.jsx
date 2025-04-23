import { View, Text, ScrollView, Image, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native'
import React, { useEffect, useState, useCallback } from 'react'
import TabBar from '../themes/TabBar'
import { ChevronLeftIcon } from 'react-native-heroicons/outline'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { MapPinIcon } from 'react-native-heroicons/micro';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import { checkoutCart, getCart } from '../api';

export default function CheckOutScreen() {
    const navigation = useNavigation();
    const [cart, setCart] = useState({ items: [], total_price: 0 });
    const [loading, setLoading] = useState(true);
    const [placingOrder, setPlacingOrder] = useState(false);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    
    // Default shipping address
    const shippingAddress = {
        type: 'Home',
        address: '1901 Thornridge Cir. Shiloh, Hawaii',
        zipCode: '06803'
    };
    
    // Default shipping method
    const shippingMethod = {
        type: 'Economy',
        estimatedArrival: '25 August 2023'
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
            // Calculate subtotal if not provided by the backend
            if (!item.subtotal || typeof item.subtotal !== 'number') {
                item.subtotal = calculateSubtotal(item);
            }
            
            // Ensure other required properties exist
            return {
                ...item,
                id: item.id || Date.now(), // Fallback ID if not provided
                product_name: item.product_name || item.name || item.title || 'Unknown Product',
                product_image: item.product_image || item.image || 'https://via.placeholder.com/150',
                price: typeof item.price === 'number' ? item.price : 0,
                quantity: typeof item.quantity === 'number' ? item.quantity : 1
            };
        });

        // Calculate total price if not provided or if we want to ensure it's correct
        const total_price = processedItems.reduce((total, item) => total + item.subtotal, 0);

        return {
            items: processedItems,
            total_price
        };
    };

    const fetchCartData = async () => {
        try {
            setLoading(true);
            const cartData = await getCart();
            const processedCart = processCartData(cartData);
            setCart(processedCart);
            setError(null);
        } catch (error) {
            console.error('Error fetching cart:', error);
            setError('Failed to load cart data');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchCartData();
    }, []);

    useEffect(() => {
        fetchCartData();
    }, []);

    const handlePlaceOrder = async () => {
        if (!cart.items || cart.items.length === 0) {
            Alert.alert('Empty Cart', 'Your cart is empty. Add some items before checking out.');
            return;
        }

        try {
            setPlacingOrder(true);
            
            // Prepare order data
            const orderData = {
                shipping_address: `${shippingAddress.address}, ${shippingAddress.zipCode}`,
                shipping_method: shippingMethod.type,
            };
            
            // Place the order using checkout endpoint
            const response = await checkoutCart(orderData);
            
            // Navigate to success screen
            navigation.navigate('Payment Success', { orderId: response.id || response.order_id });
        } catch (error) {
            console.error('Error placing order:', error);
            Alert.alert('Checkout Failed', 'Failed to place your order. Please try again.');
        } finally {
            setPlacingOrder(false);
        }
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
                    onPress={() => navigation.navigate('Home')}
                    className="bg-primary py-2 px-4 rounded-lg"
                >
                    <Text className="text-white">Continue Shopping</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // Calculate costs
    const deliveryFee = 10;
    const discountPercentage = 6;
    const discount = (cart.total_price * discountPercentage) / 100;
    const totalCost = cart.total_price + deliveryFee - discount;

    return (
        <View className={`bg-white flex-col`} style={{ height: hp('97%') }}>
            <TabBar
                prefix={""}
                title={"Checkout"}
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
                    <Text className={`text-2xl mb-4`}>Shipping Address</Text>
                    <View className={`flex-row gap-1 items-center`}>
                        <MapPinIcon color={"#704f38"} width={"25"} height={"25"} />
                        <Text className={`font-semibold text-xl`}>{shippingAddress.type}</Text>
                    </View>
                    <View className={`flex-row justify-between items-center`}>
                        <Text className={`px-1 mt-2`}>{shippingAddress.address}</Text>
                        <TouchableOpacity onPress={()=>{navigation.navigate('Shipping Address')}}>
                            <Text className={`text-primary border px-4 py-1 rounded-full border-gray-300`}>CHANGE</Text>
                        </TouchableOpacity>
                    </View>
                    <Text className={`px-7`}>{shippingAddress.zipCode}</Text>
                </View>
                <View className={`mx-4 mt-5 border-b-[1px] pb-7 border-gray-300`}>
                    <Text className={`text-2xl mb-4`}>Choose Shipping Type</Text>
                    <View className={`flex-row gap-1 items-center`}>
                        <Icon name='cube' color={"#704f38"} size={25} />
                        <Text className={`font-semibold text-xl`}>{shippingMethod.type}</Text>
                    </View>
                    <View className={`flex-row justify-between items-center`}>
                        <Text className={`px-2 mt-2`}>Estimated arrival {shippingMethod.estimatedArrival}</Text>
                        <TouchableOpacity onPress={()=>{navigation.navigate('Choose Shipping')}}>
                            <Text className={`text-primary border px-4 py-1 rounded-full border-gray-300`}>CHANGE</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                
                <View className="flex-row justify-between mx-4 mt-5 mb-2">
                    <Text className={`text-2xl font-semibold`}>Order List</Text>
                    <Text className={`text-primary`}>{cart.items.length} item{cart.items.length !== 1 ? 's' : ''}</Text>
                </View>

                {cart.items.map((item, index) => {
                    // Calculate the subtotal for safety
                    const itemSubtotal = calculateSubtotal(item);
                    
                    return (
                        <View key={index} className={`flex-row gap-4 border-b-[1px] border-gray-300`} style={{ padding: hp("1.8%") }}>
                            <Image className={`rounded-2xl`} source={{ uri: item.product_image }} height={hp(13)} width={hp(13)} />
                            <View className={`flex-1 justify-between`}>
                                <View className={`flex-col gap-2 justify-center`}>
                                    <Text>{item.product_name}</Text>
                                    <Text>Quantity: {item.quantity}</Text>
                                    <Text>$ {itemSubtotal.toFixed(2)}</Text>
                                </View>
                            </View>
                        </View>
                    );
                })}
                
                <View className="mx-4 my-4">
                    <View className={`flex-row justify-between items-center mt-2`}>
                        <Text>Sub-Total</Text>
                        <Text>${cart.total_price.toFixed(2)}</Text>
                    </View>
                    <View className={`flex-row justify-between items-center mt-2`}>
                        <Text>Delivery fee</Text>
                        <Text>${deliveryFee.toFixed(2)}</Text>
                    </View>
                    <View className={`flex-row justify-between items-center mt-2`}>
                        <Text>Discount</Text>
                        <Text>{discountPercentage}% (${discount.toFixed(2)})</Text>
                    </View>
                    <View className={`border border-dashed mt-4 mb-4`} />
                    <View className={`flex-row justify-between items-center`}>
                        <Text className="font-bold">Total Cost</Text>
                        <Text className="font-bold">${totalCost.toFixed(2)}</Text>
                    </View>
                </View>
            </ScrollView>

            <TouchableOpacity 
                onPress={handlePlaceOrder}
                disabled={placingOrder} 
                className={`bg-white py-3 rounded-tl-2xl border rounded-tr-2xl gap-3 border-gray-300 absolute bottom-0 w-full`}
            >
                <View className={`border rounded-full bg-primary flex-row justify-center items-center mx-4 mb-4 ${placingOrder ? 'opacity-70' : ''}`} style={{ height: hp('5%') }}>
                    {placingOrder ? (
                        <ActivityIndicator color="white" size="small" />
                    ) : (
                        <Text className={`text-white text-lg font-semibold`}>Continue to Payment</Text>
                    )}
                </View>
            </TouchableOpacity>
        </View>
    );
}