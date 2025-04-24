import { View, Text, Image, ActivityIndicator } from 'react-native'
import React, { useState, useEffect } from 'react'
import TabBar from '../themes/TabBar'
import { ChevronLeftIcon, HeartIcon } from 'react-native-heroicons/outline'
import { HeartIcon as SolidHeartIcon } from 'react-native-heroicons/solid'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import MasonryList from '@react-native-seoul/masonry-list';
import { TouchableOpacity } from 'react-native';
import { StarIcon } from 'react-native-heroicons/solid';
import Icon from 'react-native-vector-icons/FontAwesome'
import { ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { fetchProductsByCategory } from '../api';

export default function JacketScreen() {
    const route = useRoute();
    const { title, categoryId } = route.params;
    const navigation = useNavigation();
    
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [favorites, setFavorites] = useState({});

    const toggleFavorite = (productId) => {
        setFavorites(prev => ({
            ...prev,
            [productId]: !prev[productId]
        }));
    };

    useEffect(() => {
        const getProducts = async () => {
            try {
                setLoading(true);
                setError(null);
                
                // Validate categoryId
                if (!categoryId) {
                    throw new Error('Category ID is required');
                }
                
                // Ensure categoryId is a number
                const parsedCategoryId = parseInt(categoryId);
                if (isNaN(parsedCategoryId)) {
                    throw new Error('Category ID must be a valid number');
                }
                
                console.log('Fetching products for category:', parsedCategoryId);
                const data = await fetchProductsByCategory(parsedCategoryId);
                
                // Validate response data
                if (!data) {
                    throw new Error('No data received from server');
                }
                
                if (!Array.isArray(data)) {
                    throw new Error('Invalid response format from server');
                }
                
                setProducts(data);
            } catch (error) {
                console.error('Error fetching products:', error);
                setError(error.message || 'Failed to fetch products');
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };

        getProducts();
    }, [categoryId]);

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#0000ff" />
                <Text className="mt-4 text-gray-500">Loading products...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View className="flex-1 justify-center items-center">
                <Text className="text-red-500 text-lg">{error}</Text>
                <TouchableOpacity 
                    onPress={() => navigation.goBack()}
                    className="mt-4 bg-blue-500 px-4 py-2 rounded-lg"
                >
                    <Text className="text-white">Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-white">
            <View className="flex-row justify-between items-center p-4">
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <ChevronLeftIcon size={30} color="black" />
                </TouchableOpacity>
                <Text className="text-xl font-bold">{title}</Text>
                <View style={{ width: 30 }} />
            </View>

            {products.length === 0 ? (
                <View className="flex-1 justify-center items-center">
                    <Text className="text-gray-500 text-lg">No products found in this category</Text>
                </View>
            ) : (
                <MasonryList
                    data={products}
                    keyExtractor={(item) => item.id.toString()}
                    numColumns={2}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            className="m-2"
                            onPress={() => navigation.navigate('Product', { product: item })}
                        >
                            <View className="bg-gray-100 rounded-lg overflow-hidden">
                                <Image
                                    source={{ uri: item.image }}
                                    style={{ width: '100%', height: 200 }}
                                    className="rounded-t-lg"
                                />
                                <View className="p-2">
                                    <Text className="font-bold text-lg">{item.name}</Text>
                                    <Text className="text-gray-500">${item.price}</Text>
                                    <View className="flex-row items-center mt-1">
                                        <StarIcon size={16} color="#FFD700" />
                                        <Text className="ml-1">{item.average_rating || 0}</Text>
                                    </View>
                                </View>
                                <TouchableOpacity
                                    className="absolute top-2 right-2"
                                    onPress={() => toggleFavorite(item.id)}
                                >
                                    {favorites[item.id] ? (
                                        <SolidHeartIcon size={24} color="red" />
                                    ) : (
                                        <HeartIcon size={24} color="black" />
                                    )}
                                </TouchableOpacity>
                            </View>
                        </TouchableOpacity>
                    )}
                />
            )}
            <TabBar />
        </View>
    );
}
