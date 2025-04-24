// demodata   //normal case
// demoData  //camel case   ex:iAmAGoodBBoy
// demo_data  // snake case ex:i_am_a_good_boy

import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native'
import React, { useEffect, useState, forwardRef } from 'react'
import MasonryList from '@react-native-seoul/masonry-list';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { StarIcon } from 'react-native-heroicons/solid';
import { HeartIcon } from 'react-native-heroicons/outline';
import { HeartIcon as SolidHeartIcon } from 'react-native-heroicons/solid';
import Icon from "react-native-vector-icons/FontAwesome"
import { useNavigation } from '@react-navigation/native';
import { getFavorites, toggleFavorite, fetchProducts } from '../api';
import TabBar from '../themes/TabBar'
import { ArrowLeftIcon, ChevronLeftIcon } from 'react-native-heroicons/outline'

const FlashSales = forwardRef((props, ref) => {
  const navigation = useNavigation()
  const saleEnd = "2024-12-20T23:45:30";
  const [endDate, setEndDate] = useState(calenderLastDate(saleEnd))
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => {
      const remainigTime = calenderLastDate(saleEnd)
      if (remainigTime.total <= 0) {
        clearInterval(timer)
      }
      setEndDate(remainigTime)
    }, 1000)
    return () => clearInterval(timer)
  }, [saleEnd])

  // Load products and favorites when component mounts
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [productsData, favoriteProducts] = await Promise.all([
          fetchProducts(),
          getFavorites()
        ]);
        setProducts(productsData || []);
        setFavorites(favoriteProducts || []);
        setError(null);
      } catch (error) {
        console.error('Error loading data:', error);
        setError('Failed to load products');
        setProducts([]);
        setFavorites([]);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  //Category toggle
  const subCategory = ["All", "Newest", "Popular", "Mens", "Kids", "Womens"]
  const [activeSet, setActiveSet] = useState("All")

  const handleSubCategory = (item) => {
    setActiveSet(item)
  }

  const handleFavouriteToggle = async (productId) => {
    try {
      const product = products.find(p => p.id === productId);
      if (!product) {
        console.error('Product not found:', productId);
        return;
      }
      const updatedFavorites = await toggleFavorite(product);
      setFavorites(updatedFavorites || []);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const isProductFavorited = (productId) => {
    return favorites.some(fav => fav.id === productId);
  };

  const navigateToProductDetails = (productId) => {
    navigation.navigate('ProductDetails', { id: productId });
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
        <Text className="text-red-500 text-lg">{error}</Text>
        <TouchableOpacity 
          onPress={() => {
            setLoading(true);
            fetchProducts()
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
    <ScrollView ref={ref} className="bg-white">
      <TabBar
        prefix={""}
        title={"Flash Sales"}
        titleStyle={{
          color: "black",
          fontWeight: "bold",
          fontSize: 20
        }}
        prefixStyle={{
          backgroundColor: "transparent"
        }}
        
      />

      <View className="flex-row justify-between items-center px-1 mx-4 mb-4">
        <Text className="text-xl font-semibold">FlashSales</Text>
        {
          endDate.total >= 0 ? <View className="flex-row items-center gap-2">
            <Text className="font-medium text-gray-500">Closing in :</Text>
            <View className="bg-btnPrimary h-8 w-8 flex justify-center items-center rounded-lg">
              <Text className="text-primary">{endDate.hours}</Text>
            </View>
            <Text>:</Text>
            <View className="bg-btnPrimary h-8 w-8 flex justify-center items-center rounded-lg">
              <Text className="text-primary">{endDate.minutes}</Text>
            </View>
            <Text>:</Text>
            <View className="bg-btnPrimary h-8 w-8 flex justify-center items-center rounded-lg">
              <Text className="text-primary">{endDate.seconds}</Text>
            </View>
          </View> : <></>
        }
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        {
          subCategory.map((item, index) => {
            let isActive = item == activeSet;
            return (
              <TouchableOpacity
                onPress={() => handleSubCategory(item)}
                key={index}
                className={`
               border border-gray-500 px-4 ml-4 mb-4 rounded-full py-2 
              ${isActive ? "bg-primary" : ""}
              `}>
                <Text className={`font-bold ${isActive ? "text-white" : ""}`}>
                  {item}
                </Text>
              </TouchableOpacity>
            )
          })
        }
      </ScrollView>
      {products.length === 0 ? (
        <View className="items-center justify-center py-20">
          <Text className="text-lg text-gray-500">No products available</Text>
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
              handleFavouriteToggle={() => handleFavouriteToggle(item.id)} 
              isFavourite={isProductFavorited(item.id)} 
              onProductPress={() => navigateToProductDetails(item.id)}
            />
          )}
          className="mx-4"
        />
      )}
    </ScrollView>
  )
})

const calenderLastDate = (saleEnd) => {
  const nowDate = new Date();
  const saleEndDate = new Date(saleEnd)
  const total = Math.floor(saleEndDate - nowDate)

  const days = Math.floor(total / (1000 * 60 * 60 * 24))
  const hours = Math.floor(total / (1000 * 60 * 60) % 24)
  const minutes = Math.floor(total / (1000 * 60) % 60)
  const seconds = Math.floor(total / (1000) % 60)

  return {
    total: total,
    days: Math.max(0, days),
    hours: Math.max(0, hours),
    minutes: Math.max(0, minutes),
    seconds: Math.max(0, seconds),
  }
}

const CardItem = ({ item, index, handleFavouriteToggle, isFavourite, onProductPress }) => {
  const navigation = useNavigation();
  let isEven = item.id % 2 == 0
  
  const getRating = () => {
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
  }
  
  return (
    <View className={`${isEven ? "pl-4" : " pr-4"} flex-col gap-3 mb-4`}>
      <TouchableOpacity onPress={onProductPress} className="relative">
        <Image source={{ uri: item.image }} height={hp(20)} className=" object-cover rounded-3xl" />
        <TouchableOpacity 
          onPress={(e) => {
            e.stopPropagation();
            handleFavouriteToggle();
          }} 
          className="absolute right-4 top-4 bg-white/50 p-2 rounded-full"
        >
          {isFavourite ? (
            <SolidHeartIcon size={20} color="red" />
          ) : (
            <HeartIcon size={20} color="black" />
          )}
        </TouchableOpacity>
      </TouchableOpacity>
      <View className="flex-row justify-between px-1">
        <Text className={`flex-1`}>{item.name || item.title}</Text>
        <View className="flex-row gap-1 ">
          <StarIcon size={20} color={"orange"} />
          <Text>{getRating()}</Text>
        </View>
      </View>
      <View className="px-1 ">
        <Text className="font-medium">Rs {item.price}</Text>
      </View>
    </View>
  )
}

export default FlashSales
