import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl } from 'react-native'
import React, { useState, useEffect } from 'react'
import TabBar from '../themes/TabBar'
import { ChevronLeftIcon } from 'react-native-heroicons/outline'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import ActiveOrder from '../components/ActiveOrder'
import CompletedOrder from '../components/CompletedOrder'
import CancelledOrder from '../components/CancelledOrder'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import { getOrders } from '../api'

export default function OrderScreen() {
    const navigation = useNavigation();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const orderState = ["active", "completed", "cancelled"];
    const [initialValue, setValue] = useState(0);

    // Process order data to ensure consistent structure
    const processOrderData = (orderData) => {
        if (!Array.isArray(orderData)) {
            console.warn('Expected orders to be an array, got:', typeof orderData);
            return [];
        }
        
        return orderData.map(order => ({
            ...order,
            // Keep status as is (case-sensitive)
            status: order.status || 'Pending',
            // Ensure items array exists
            items: Array.isArray(order.items) ? order.items : [],
            // Ensure order has an ID
            id: order.id || Math.floor(Math.random() * 10000)
        }));
    };

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const orderData = await getOrders();
            const processedOrders = processOrderData(orderData);
            setOrders(processedOrders);
            setError(null);
        } catch (error) {
            console.error('Error fetching orders:', error);
            setError('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    // Initial fetch
    useEffect(() => {
        fetchOrders();
    }, []);

    // Refresh when screen is focused
    useFocusEffect(
        React.useCallback(() => {
            fetchOrders();
        }, [])
    );

    // Handle pull-to-refresh
    const onRefresh = async () => {
        setRefreshing(true);
        try {
            await fetchOrders();
        } catch (error) {
            console.error('Error refreshing orders:', error);
        } finally {
            setRefreshing(false);
        }
    };

    const renderOrderState = () => {
        if (loading && !refreshing) {
            return (
                <View className="flex-1 justify-center items-center py-20">
                    <ActivityIndicator size="large" color="#704f38" />
                </View>
            );
        }

        if (error) {
            return (
                <View className="flex-1 justify-center items-center py-20">
                    <Text className="text-red-500 text-lg mb-4">{error}</Text>
                    <TouchableOpacity 
                        onPress={fetchOrders}
                        className="bg-primary py-2 px-4 rounded-lg"
                    >
                        <Text className="text-white">Retry</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        // Filter orders based on state
        const filteredOrders = orders.filter(order => {
            const status = order.status;
            if (initialValue === 0) {
                // Active orders are pending, processing, and shipped
                return ['Pending', 'Processing', 'Shipped'].includes(status);
            } else if (initialValue === 1) {
                // Completed orders
                return ['Delivered'].includes(status);
            } else {
                // Cancelled orders
                return status === 'Cancelled';
            }
        });

        if (filteredOrders.length === 0) {
            return (
                <View className="flex-1 justify-center items-center py-20">
                    <Text className="text-gray-500 text-lg">No {orderState[initialValue]} orders found</Text>
                </View>
            );
        }

        switch (initialValue) {
            case 0:
                return <ActiveOrder orders={filteredOrders} navigation={navigation} />;
            case 1:
                return <CompletedOrder orders={filteredOrders} navigation={navigation} />;
            case 2:
                return <CancelledOrder orders={filteredOrders} navigation={navigation} />;
            default:
                return <Text>This Order State is not Valid</Text>;
        }
    };

    return (
        <View className={`bg-white `} style={{ height: hp('97%') }}>
            <TabBar
                prefix={""}
                title={"My Orders"}
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
            <View className={`mx-4 mt-3`}>
                <View className={`flex-row justify-between border-b border-primary`}>
                    {
                        orderState.map((item, index) => {
                            const isActive = initialValue == index;
                            return (
                                <TouchableOpacity 
                                    onPress={() => setValue(index)} 
                                    key={index} 
                                    className={`flex-1 flex-row justify-center items-center py-4 border-b-[4px] rounded-[2px]
                                    ${isActive ? " border-primary" : "border-white"}
                                    `}
                                >
                                    <Text className={`capitalize font-bold ${isActive ? "text-primary" : ""}`}>{item}</Text>
                                </TouchableOpacity>
                            );
                        })
                    }
                </View>
            </View>
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
                {renderOrderState()}
            </ScrollView>
        </View>
    );
}