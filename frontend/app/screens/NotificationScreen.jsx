import { View, Text, ScrollView, RefreshControl, ActivityIndicator } from 'react-native'
import React, { useState, useEffect } from 'react'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import TabBar from '../themes/TabBar';
import { 
  ChevronLeftIcon, 
  ShoppingCartIcon, 
  TruckIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  TagIcon, 
  BellIcon 
} from 'react-native-heroicons/outline';
import { useNavigation } from '@react-navigation/native';
import { useNotifications } from '../context/NotificationContext';

const NotificationScreen = () => {
    const navigation = useNavigation();
    const { notifications, loading, error, fetchNotifications } = useNotifications();
    const [refreshing, setRefreshing] = useState(false);
    const [groupedNotifications, setGroupedNotifications] = useState({ today: [], yesterday: [] });

    useEffect(() => {
        fetchNotifications();
    }, []);

    useEffect(() => {
        groupNotifications();
    }, [notifications]);

    const groupNotifications = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        const todayNotifications = [];
        const yesterdayNotifications = [];
        
        notifications.forEach(notification => {
            const notificationDate = new Date(notification.created_at);
            notificationDate.setHours(0, 0, 0, 0);
            
            if (notificationDate.getTime() === today.getTime()) {
                todayNotifications.push(notification);
            } else if (notificationDate.getTime() === yesterday.getTime()) {
                yesterdayNotifications.push(notification);
            }
        });
        
        setGroupedNotifications({
            today: todayNotifications,
            yesterday: yesterdayNotifications
        });
    };

    const onRefresh = async () => {
        setRefreshing(true);
        try {
            await fetchNotifications();
        } finally {
            setRefreshing(false);
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'order_placed':
                return <ShoppingCartIcon size={30} color="#704f38" />;
            case 'order_shipped':
                return <TruckIcon size={30} color="#704f38" />;
            case 'order_delivered':
                return <CheckCircleIcon size={30} color="#704f38" />;
            case 'order_cancelled':
                return <XCircleIcon size={30} color="#704f38" />;
            case 'coupon':
                return <TagIcon size={30} color="#704f38" />;
            default:
                return <BellIcon size={30} color="#704f38" />;
        }
    };

    const formatTimeAgo = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
        
        if (diffInHours < 1) {
            return 'Just now';
        } else if (diffInHours < 24) {
            return `${diffInHours}h`;
        } else {
            const diffInDays = Math.floor(diffInHours / 24);
            return `${diffInDays}d`;
        }
    };

    const renderNotificationGroup = (notifications, title) => {
        if (notifications.length === 0) return null;
        
        return (
            <>
                <View className="flex-row justify-between item-center mb-4 ">
                    <Text className="text-lg">{title}</Text>
                </View>
                {notifications.map((notification, index) => (
                    <View key={notification.id} className="flex-row justify-center items-center mx-4 mb-4">
                        <View className={`rounded-full p-4 mx-4 ${notification.read ? 'bg-gray-300' : 'bg-primary bg-opacity-20'}`}>
                            {getNotificationIcon(notification.type)}
                        </View>
                        <View className="">
                            <View className="flex-row justify-between items-center mr-4">
                                <Text className={`text-lg ${notification.read ? 'font-semibold' : 'font-bold'}`}>
                                    {notification.type.split('_').map(word => 
                                        word.charAt(0).toUpperCase() + word.slice(1)
                                    ).join(' ')}
                                </Text>
                                <Text>{formatTimeAgo(notification.created_at)}</Text>
                            </View>
                            <Text className='m-3'>{notification.message}</Text>
                        </View>
                    </View>
                ))}
            </>
        );
    };

    if (loading && !refreshing) {
        return (
            <View className="bg-white flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#704f38" />
            </View>
        );
    }

    if (error) {
        return (
            <View className="bg-white flex-1 justify-center items-center">
                <Text className="text-red-500 text-lg">{error}</Text>
            </View>
        );
    }

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <View className={'bg-white flex-1'} style={{ height: hp('97%') }} >
            <TabBar
                prefix={
                    unreadCount > 0 ? (
                        <View className="flex-row gap-1 justify-center items-center">
                            <Text className="text-white">{unreadCount}</Text>
                            <Text className="text-white">NEW</Text>
                        </View>
                    ) : null
                }
                title={"Notification "}
                suffix={<ChevronLeftIcon size={25} color={'black'} />}
                titleStyle={{
                    color: "black",
                    fontWeight: "bold",
                    fontSize: 20
                }}
                prefixStyle={{
                    backgroundColor: "white",
                    borderWidth: 1,
                    primary: "#704f38",
                    backgroundColor: "#704f38",
                    height: 40,
                    width: 60,
                    paddingHorizontal: 10
                }}
                suffixStyle={{
                    backgroundColor: "white",
                    borderWidth: 1,
                    borderColor: "black",
                    height: 40,
                    width: 40,
                }}
                containerStyle=""
                suffixAction={() => navigation.goBack()}
            />
            <ScrollView 
                className="mx-8 flex-col"
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {notifications.length === 0 ? (
                    <View className="flex-1 justify-center items-center py-10">
                        <Text className="text-lg text-gray-500">No notifications yet</Text>
                    </View>
                ) : (
                    <>
                        {renderNotificationGroup(groupedNotifications.today, "T O D A Y")}
                        {renderNotificationGroup(groupedNotifications.yesterday, "Y E S T E R D A Y")}
                    </>
                )}
            </ScrollView>
        </View>
    )
}

export default NotificationScreen
