import { View, Text, ScrollView, TextInput, TouchableOpacity, Image, ActivityIndicator, Dimensions } from 'react-native'
import React, { useState, useEffect } from 'react'
import TabBar from '../themes/TabBar'
import { ChevronLeftIcon, HeartIcon, MagnifyingGlassIcon } from 'react-native-heroicons/outline'
import { HeartIcon as SolidHeartIcon, StarIcon } from 'react-native-heroicons/solid'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import MasonryList from '@react-native-seoul/masonry-list';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getCurrentUser, isProductFavorited, toggleFavorite, getFavorites } from '../api';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../constants/clothColor';
import Icon from "react-native-vector-icons/FontAwesome";

const { width } = Dimensions.get('window');

const SearchResultScreen = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { products, searchTerm } = route.params;
    const [user, setUser] = useState(null);
    const [favorites, setFavorites] = useState([]);
    const [productList, setProductList] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadCurrentUser();
        setProductList(products || []);
        loadFavorites();
    }, [products]);

    const loadCurrentUser = async () => {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
    };

    const loadFavorites = async () => {
        try {
            setLoading(true);
            const favoriteProducts = await getFavorites();
            setFavorites(favoriteProducts || []);
        } catch (error) {
            console.error('Error loading favorites:', error);
            setFavorites([]);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleFavorite = async (product) => {
        try {
            const updatedFavorites = await toggleFavorite(product);
            setFavorites(updatedFavorites || []);
        } catch (error) {
            console.error('Error toggling favorite:', error);
        }
    };

    const isProductFavorited = (productId) => {
        if (!Array.isArray(favorites)) return false;
        return favorites.some(fav => fav.id === productId);
    };

    const getRating = (item) => {
        if (item.rating) {
            if (typeof item.rating === 'object' && item.rating.rate !== undefined) {
                return item.rating.rate;
            }
            if (typeof item.rating === 'number') {
                return item.rating;
            }
        }
        
        if (item.average_rating !== undefined) {
            return item.average_rating;
        }
        
        return 0;
    };

    const renderItem = ({ item, i }) => {
        if (!item) return null;
        
        const isFavorite = isProductFavorited(item.id);
        const isEven = item.id % 2 === 0;
        
        return (
            <View className={`${isEven ? "pl-4" : "pr-4"} flex-col gap-3 mb-4`}>
                <TouchableOpacity 
                    onPress={() => navigation.navigate('ProductDetails', { id: item.id })} 
                    className="relative"
                >
                    <Image 
                        source={{ uri: item.image || 'https://via.placeholder.com/150' }} 
                        height={hp(20)} 
                        className="object-cover rounded-3xl" 
                    />
                    <TouchableOpacity 
                        onPress={(e) => {
                            e.stopPropagation();
                            handleToggleFavorite(item);
                        }} 
                        className="absolute right-4 top-4 bg-white/50 p-2 rounded-full"
                    >
                        {isFavorite ? (
                            <Icon name='heart' size={16} color={"red"} />
                        ) : (
                            <HeartIcon size={20} color={"white"} />
                        )}
                    </TouchableOpacity>
                </TouchableOpacity>
                <View className="flex-row justify-between px-1">
                    <Text className="flex-1">{item.name || item.title}</Text>
                    <View className="flex-row gap-1">
                        <StarIcon size={20} color={"orange"} />
                        <Text>{getRating(item)}</Text>
                    </View>
                </View>
                <View className="px-1">
                    <Text className="font-medium">Rs {item.price || 0}</Text>
                </View>
            </View>
        );
    };

    return (
        <View className={`bg-white flex-col`} style={{ height: hp('98%') }}>
            <TabBar
                prefix={""}
                title={searchTerm || "Search Results"}
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
            <View className={`mx-4 mt-6`}>
                <View className="h-12 w-30 rounded-3xl flex-row justify-between items-center gap-3 mb-6 ">
                    <View className="flex-row items-center flex-1 border border-gray-400 px-3 h-14 rounded-full">
                        <MagnifyingGlassIcon color={"#704f38"} width={"25"} height={"25"} />
                        <TextInput placeholder="Search" className="font-medium flex-1 h-full" />
                    </View>
                </View>
                <View className={`flex-row justify-between items-center`}>
                    <Text className={`text-xl font-bold`}>Result for "{searchTerm}"</Text>
                    <Text className={`text-xl font-bold`}>{productList?.length || 0} founds</Text>
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} className={`mt-4`}>
                {loading ? (
                    <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
                ) : !productList || productList.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="search-outline" size={64} color={COLORS.grey} />
                        <Text style={styles.emptyText}>No products found</Text>
                        <Text style={styles.emptySubtext}>Try a different search term</Text>
                    </View>
                ) : (
                    <MasonryList
                        data={productList}
                        keyExtractor={(item) => item?.id?.toString() || Math.random().toString()}
                        numColumns={2}
                        showsVerticalScrollIndicator={false}
                        renderItem={renderItem}
                        contentContainerStyle={styles.listContent}
                    />
                )}
            </ScrollView>
        </View>
    )
}

const styles = {
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    emptySubtext: {
        fontSize: 14,
        color: COLORS.grey,
    },
    listContent: {
        padding: 5,
    },
}

export default SearchResultScreen