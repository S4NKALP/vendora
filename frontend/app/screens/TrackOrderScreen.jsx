import { View, Text, ActivityIndicator, RefreshControl, FlatList, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import TabBar from '../themes/TabBar';
import { ChevronLeftIcon } from 'react-native-heroicons/outline';
import { Image } from 'react-native';
import Timeline from 'react-native-timeline-flatlist'
import { Box, FileText, Package, Truck } from 'lucide-react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getOrderById, updateOrderStatus, shipOrder, deliverOrder, cancelOrder } from '../api';

const getStatusColor = (timelineStatus, orderStatus) => {
    const statusOrder = ['Pending', 'Shipped', 'Delivered'];
    const timelineIndex = statusOrder.indexOf(timelineStatus);
    const orderIndex = statusOrder.indexOf(orderStatus);
    
    // If order is pending, only show first dot as active
    if (orderStatus === 'Pending') {
        return timelineStatus === 'Pending' ? '#22c55e' : '#d1d5db';
    }
    
    if (timelineIndex < orderIndex) {
        return '#22c55e'; // Completed status - green-500
    } else if (timelineIndex === orderIndex) {
        return '#22c55e'; // Current status - green-500
    } else {
        return '#d1d5db'; // Pending status - gray-300
    }
};

export default function TrackOrderScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { orderId } = route.params || {};
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);

    const fetchOrder = async () => {
        try {
            setLoading(true);
            const orderData = await getOrderById(orderId);
            
            // Check if the order status has changed
            if (order && orderData.status !== order.status) {
                setLastUpdated(new Date());
            }
            
            setOrder(orderData);
        } catch (err) {
            setError('Failed to fetch order details');
            console.error('Error fetching order:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        if (orderId) {
            fetchOrder();
            
            // Set up polling interval to check for status updates every 30 seconds
            const intervalId = setInterval(() => {
                fetchOrder();
            }, 30000);
            
            // Clean up interval on component unmount
            return () => clearInterval(intervalId);
        }
    }, [orderId]);
    
    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        fetchOrder();
    }, [orderId]);

    const handleBack = () => {
        navigation.goBack();
    };

    const handleStatusUpdate = async (newStatus) => {
        try {
            setUpdating(true);
            let updatedOrder;
            
            switch (newStatus) {
                case 'shipped':
                    updatedOrder = await shipOrder(orderId);
                    break;
                case 'delivered':
                    updatedOrder = await deliverOrder(orderId);
                    break;
                case 'cancelled':
                    updatedOrder = await cancelOrder(orderId);
                    break;
                default:
                    updatedOrder = await updateOrderStatus(orderId, newStatus.charAt(0).toUpperCase() + newStatus.slice(1));
            }
            
            setOrder(updatedOrder);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to update order status');
            console.error('Error updating order status:', err);
        } finally {
            setUpdating(false);
        }
    };

    if (loading && !refreshing) {
        return (
            <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#704f38" />
            </View>
        );
    }

    if (error || !order) {
        return (
            <View className="flex-1 justify-center items-center">
                <Text className="text-red-500">{error || 'Order not found'}</Text>
            </View>
        );
    }

    const orderItems = (order.order_items && order.order_items.length > 0) ? order.order_items : order.items;
    const firstItem = orderItems?.[0];

    const formatCurrency = (value) => {
        if (value === undefined || value === null) return '0.00';
        if (typeof value === 'number') return value.toFixed(2);
        if (typeof value === 'string') {
            const num = parseFloat(value);
            return isNaN(num) ? '0.00' : num.toFixed(2);
        }
        return '0.00';
    };
    
    const renderOrderDetails = () => {
        return (
            <>
                <View className={`mx-4 `}>
                    <View className={`flex-row items-center gap-6 py-5 border-b border-gray-300 mb-2`}>
                        <Image 
                            source={{ uri: firstItem?.product_image || firstItem?.product?.image || 'https://via.placeholder.com/100' }} 
                            className={`size-[110px] rounded-2xl`}
                            defaultSource={require('../../assets/images/favicon.png')}
                        />
                        <View className={`flex-1 flex-col gap-2`}>
                            <Text className={`font-medium text-lg`}>{firstItem?.product_name || firstItem?.product?.title || 'Product'}</Text>
                            <Text className={`text-lg`}>Qty: {firstItem?.quantity || 1}</Text>
                            <View className={`flex-row justify-between items-start`}>
                                <Text className={`text-lg font-bold`}>${formatCurrency(firstItem?.price || firstItem?.subtotal)}</Text>
                            </View>
                        </View>
                    </View>
                </View>
                <View className={`mx-4 border-b flex-col gap-1 border-gray-300 py-5`}>
                    <Text className={`font-bold text-2xl`}>Order Details</Text>
                    <View className={`flex-row justify-between items-center`}>
                        <Text>Expected Delivery Date</Text>
                        <Text>{new Date(order.expected_delivery_date || new Date().setDate(new Date().getDate() + 7)).toLocaleDateString()}</Text>
                    </View>
                    <View className={`flex-row justify-between items-center`}>
                        <Text>Tracking ID</Text>
                        <Text>{order.tracking_id || orderId || 'N/A'}</Text>
                    </View>
                    {lastUpdated && (
                        <View className={`flex-row justify-between items-center mt-2`}>
                            <Text className="text-green-600">Status Updated</Text>
                            <Text className="text-gray-500">{lastUpdated.toLocaleTimeString()}</Text>
                        </View>
                    )}
                </View>
                <View className={`mx-4 mt-4 mb-6`}>
                    <Text className="text-xl font-semibold mb-4">Order Status</Text>
                    <Timeline
                        data={[
                            {
                                time: new Date(order.created_at || order.date).toLocaleString(),
                                title: 'Order Placed',
                                description: 'Your order has been placed successfully',
                                icon: <FileText size={16} color={getStatusColor('Pending', order.status)} />,
                                status: 'Pending'
                            },
                            {
                                time: new Date(order.shipped_at || new Date(order.created_at).setDate(new Date(order.created_at).getDate() + 2)).toLocaleString(),
                                title: 'Shipped',
                                description: 'Your order is on the way',
                                icon: <Truck size={16} color={getStatusColor('Shipped', order.status)} />,
                                status: 'Shipped'
                            },
                            {
                                time: new Date(order.delivered_at || new Date(order.created_at).setDate(new Date(order.created_at).getDate() + 5)).toLocaleString(),
                                title: 'Delivered',
                                description: 'Your order has been delivered',
                                icon: <Package size={16} color={getStatusColor('Delivered', order.status)} />,
                                status: 'Delivered'
                            }
                        ].map(item => ({
                            ...item,
                            circleColor: getStatusColor(item.status, order.status),
                            lineColor: getStatusColor(item.status, order.status),
                            titleStyle: { color: getStatusColor(item.status, order.status) }
                        }))}
                        circleSize={20}
                        timeContainerStyle={{ minWidth: 52 }}
                        descriptionStyle={{ color: 'gray' }}
                    />
                    
                    {updating && (
                        <View className="mt-4 items-center">
                            <ActivityIndicator size="small" color="#22c55e" />
                        </View>
                    )}
                </View>
            </>
        );
    };

    return (
        <View className={`bg-white flex-col`} style={{ height: hp("97%") }}>
            <TabBar
                prefix={""}
                title={"Track Order"}
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
                suffixAction={handleBack}
            />
            <View className="flex-1">
                <FlatList
                    data={[{ key: 'orderDetails' }]}
                    renderItem={() => renderOrderDetails()}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={['#22c55e']}
                            tintColor="#22c55e"
                        />
                    }
                    contentContainerStyle={{ flexGrow: 1 }}
                />
            </View>
        </View>
    )
}

