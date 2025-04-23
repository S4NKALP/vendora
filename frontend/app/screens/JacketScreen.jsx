import { View, Text, Image, ActivityIndicator } from 'react-native'
import React, { useState, useEffect } from 'react'
import TabBar from '../themes/TabBar'
import { ChevronLeftIcon, HeartIcon } from 'react-native-heroicons/outline'
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
                const data = await fetchProductsByCategory(categoryId);
                setProducts(data);
                setError(null);
            } catch (error) {
                console.error('Error fetching products by category:', error);
                setError(error.message || 'Failed to fetch products');
            } finally {
                setLoading(false);
            }
        };

        getProducts();
    }, [categoryId]);

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <ActivityIndicator size={45} color="#704f38" />
            </View>
        );
    }

    if (error) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <Text className="text-red-500 text-lg">{error}</Text>
                <TouchableOpacity 
                    onPress={() => {
                        setLoading(true);
                        fetchProductsByCategory(categoryId)
                            .then(data => {
                                setProducts(data);
                                setError(null);
                            })
                            .catch(err => setError(err.message || 'Failed to fetch products'))
                            .finally(() => setLoading(false));
                    }}
                    className="mt-4 bg-primary py-2 px-4 rounded-lg"
                >
                    <Text className="text-white">Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView className={`bg-white flex-col`} style={{ height: hp('98%') }}>
            <TabBar
                prefix={""}
                title={title}
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
            
            {products.length === 0 ? (
                <View className="items-center justify-center py-20">
                    <Text className="text-lg text-gray-500">No products found in this category</Text>
                </View>
            ) : (
                <MasonryList
                    data={products}
                    keyExtractor={(item) => item.id.toString()}
                    numColumns={2}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item, index }) => (
                        <CardItem 
                            item={item} 
                            index={index} 
                            isFavorite={favorites[item.id] || false}
                            toggleFavorite={toggleFavorite}
                            navigation={navigation} 
                        />
                    )}
                    className="mx-4"
                />
            )}
        </ScrollView>
    )
}

const CardItem = ({ item, index, toggleFavorite, isFavorite, navigation }) => {
    let isEven = index % 2 === 0;
    
    return (
        <View className={`${isEven ? "pr-4" : "pl-4"} flex-col gap-3 mb-4 mt-5`}>
            <TouchableOpacity 
                onPress={() => { 
                    navigation.navigate('ProductDetails', { id: item.id }) 
                }} 
                className="relative"
            >
                <Image 
                    source={{ uri: item.image }} 
                    height={hp(20)} 
                    className="object-cover rounded-3xl" 
                />
                <TouchableOpacity 
                    onPress={() => toggleFavorite(item.id)} 
                    className="absolute right-4 top-4 bg-white/50 p-2 rounded-full"
                >
                    {isFavorite ? (
                        <Icon name='heart' size={16} color={"red"} />
                    ) : (
                        <HeartIcon size={20} color={"black"} />
                    )}
                </TouchableOpacity>
            </TouchableOpacity>

            <View className="flex-row justify-between px-1">
                <Text>{item.name}</Text>
                <View className="flex-row gap-1">
                    <StarIcon size={20} color={"orange"} />
                    <Text>{item.average_rating || 0}</Text>
                </View>
            </View>
            <View className="px-1 ">
                <Text className="font-medium">Rs {item.price}</Text>
            </View>
        </View>
    )
}
