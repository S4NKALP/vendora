import { View, Text, ScrollView, TouchableOpacity, Image, RefreshControl } from 'react-native'
import React, { useState, useEffect, useCallback } from 'react'
import { HeartIcon } from 'react-native-heroicons/outline'
import { HeartIcon as SolidHeartIcon } from 'react-native-heroicons/solid'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import flashSalesData from '../constants/flashSalesData'
import { StarIcon } from 'react-native-heroicons/solid'
import { getFavorites, toggleFavorite } from '../api'

export default function FlashSalesScreen() {
    const navigation = useNavigation();
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadFavorites = useCallback(async () => {
        try {
            const favoriteProducts = await getFavorites();
            setFavorites(favoriteProducts);
        } catch (error) {
            console.error('Error loading favorites:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    // Load favorites when component mounts and when screen is focused
    useFocusEffect(
        useCallback(() => {
            loadFavorites();
        }, [loadFavorites])
    );

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadFavorites();
    }, [loadFavorites]);

    const handleFavouriteToggle = async (product) => {
        try {
            const updatedFavorites = await toggleFavorite(product);
            setFavorites(updatedFavorites);
        } catch (error) {
            console.error('Error toggling favorite:', error);
        }
    };

    const isProductFavorited = (productId) => {
        return favorites.some(fav => fav.id === productId);
    };

    const renderItem = ({ item, i }) => {
        const isFavorite = isProductFavorited(item.id);
        
        return (
            <View key={item.id} style={{ width: '48%' }}>
                <TouchableOpacity
                    className={`mb-4 mx-2`}
                    onPress={() => navigation.navigate('ProductDetails', { productId: item.id })}
                >
                    <View className={`flex-1 mb-3 rounded-3xl overflow-hidden relative`}>
                        <Image 
                            source={{ uri: item.image }} 
                            className="w-full h-48 rounded-3xl"
                            resizeMode="cover"
                        />
                        <TouchableOpacity
                            onPress={(e) => {
                                e.stopPropagation();
                                handleFavouriteToggle(item);
                            }}
                            className={`absolute top-3 right-3 z-10 bg-white rounded-full p-1`}
                        >
                            {isFavorite ? (
                                <SolidHeartIcon size={25} color="red" />
                            ) : (
                                <HeartIcon size={25} color="black" />
                            )}
                        </TouchableOpacity>
                    </View>
                    <View className="px-2">
                        <Text className="text-lg font-semibold">{item.name}</Text>
                        <View className="flex-row items-center mt-1">
                            <StarIcon size={20} color="orange" />
                            <Text className="ml-1">{item.rating || 0}</Text>
                        </View>
                        <Text className="text-lg font-bold mt-1">Rs {item.price}</Text>
                    </View>
                </TouchableOpacity>
            </View>
        );
    };

    if (loading && !refreshing) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <Text>Loading...</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-white">
            <ScrollView 
                className="flex-1"
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#000000']}
                        tintColor="#000000"
                    />
                }
            >
                <View className="flex-row flex-wrap justify-between px-4">
                    {flashSalesData.map((item, index) => renderItem({ item, i: index }))}
                </View>
            </ScrollView>
        </View>
    );
} 