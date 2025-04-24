import { View, Text, ScrollView, TouchableOpacity, Image, RefreshControl, ActivityIndicator } from 'react-native'
import React, { useState, useEffect, useCallback } from 'react'
import { HeartIcon } from 'react-native-heroicons/outline'
import { HeartIcon as SolidHeartIcon } from 'react-native-heroicons/solid'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import { StarIcon } from 'react-native-heroicons/solid'
import { getFavorites, toggleFavorite, fetchProducts } from '../api'
import TabBar from '../themes/TabBar'

export default function FlashSalesScreen() {
    const navigation = useNavigation();
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [flashSales, setFlashSales] = useState([]);
    const [error, setError] = useState(null);

    const loadFlashSales = useCallback(async () => {
        try {
            // Fetch products from API with a 'flash_sale' filter if your API supports it
            // This is an example - modify this to match your actual API
            const products = await fetchProducts('flash_sale');
            setFlashSales(products);
            setError(null);
        } catch (error) {
            console.error('Error loading flash sales:', error);
            setError('Failed to load flash sales. Please try again.');
        }
    }, []);

    const loadFavorites = useCallback(async () => {
        try {
            const favoriteProducts = await getFavorites();
            setFavorites(favoriteProducts);
        } catch (error) {
            console.error('Error loading favorites:', error);
        }
    }, []);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            await Promise.all([loadFlashSales(), loadFavorites()]);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [loadFlashSales, loadFavorites]);

    // Load data when component mounts and when screen is focused
    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [loadData])
    );

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadData();
    }, [loadData]);

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

    const renderItem = (item, index) => {
        const isFavorite = isProductFavorited(item.id);
        
        return (
            <View key={item.id} style={{ width: wp('48%') }}>
                <TouchableOpacity
                    className={`mb-4 mx-2`}
                    onPress={() => navigation.navigate('ProductDetails', { productId: item.id })}
                >
                    <View className={`flex-1 mb-3 rounded-3xl overflow-hidden relative`}>
                        <Image 
                            source={{ uri: item.image }} 
                            style={{ width: '100%', height: hp('24%') }}
                            className="rounded-3xl"
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
                                <SolidHeartIcon size={wp('6%')} color="red" />
                            ) : (
                                <HeartIcon size={wp('6%')} color="black" />
                            )}
                        </TouchableOpacity>
                    </View>
                    <View className="px-2">
                        <Text style={{ fontSize: wp('4%') }} className="font-semibold">{item.name || item.title}</Text>
                        <View className="flex-row items-center mt-1">
                            <StarIcon size={wp('5%')} color="orange" />
                            <Text style={{ fontSize: wp('3.5%') }} className="ml-1">{item.rating || 0}</Text>
                        </View>
                        <Text style={{ fontSize: wp('4%') }} className="font-bold mt-1">Rs {item.price}</Text>
                    </View>
                </TouchableOpacity>
            </View>
        );
    };

    if (loading && !refreshing) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <ActivityIndicator size="large" color="#000000" />
                <Text className="mt-2">Loading...</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-white">
            <TabBar
                prefix={""}
                title={"Flash Sales"}
                suffix={""}
                titleStyle={{
                    color: "black",
                    fontWeight: "bold",
                    fontSize: wp('5%')
                }}
                prefixStyle={{
                    backgroundColor: "transparent"
                }}
                suffixStyle={{
                    backgroundColor: "transparent"
                }}
                containerStyle=""
            />
            <ScrollView 
                className="flex-1"
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
                {error ? (
                    <View className="p-4 justify-center items-center">
                        <Text className="text-red-500">{error}</Text>
                        <TouchableOpacity 
                            className="mt-3 bg-black px-4 py-2 rounded-full"
                            onPress={onRefresh}
                        >
                            <Text className="text-white">Try Again</Text>
                        </TouchableOpacity>
                    </View>
                ) : flashSales.length === 0 && !loading ? (
                    <View className="p-4 justify-center items-center">
                        <Text className="text-lg">No flash sales available at the moment.</Text>
                    </View>
                ) : (
                    <View className="flex-row flex-wrap justify-center">
                        {flashSales.map((item, index) => renderItem(item, index))}
                    </View>
                )}
            </ScrollView>
        </View>
    );
} 
