import { ActivityIndicator, ScrollView, Text, TextInput, View, RefreshControl } from "react-native";
import { AdjustmentsHorizontalIcon, BellIcon, ChevronDownIcon, MagnifyingGlassIcon } from "react-native-heroicons/outline"
import { MapPinIcon } from "react-native-heroicons/micro"
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Category from "../components/Category";
import FlashSales from "../components/FlashSales";
import { TouchableOpacity } from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import HomeCarousel from "../components/HomeCarousel";
import { useEffect, useState, useCallback, useRef } from "react";
import { fetchCategories, fetchProducts, fetchSliders } from "../api";
import AsyncStorage from '@react-native-async-storage/async-storage';
import LocationModal from "../components/LocationModal";
import { useNotifications } from '../context/NotificationContext';

export default function HomeScreen() {
  const navigation = useNavigation()
  const [page, setPage] = useState(0);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [sliders, setSliders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState(null);
  const [isLocationModalVisible, setIsLocationModalVisible] = useState(false);
  const flashSalesRef = useRef(null);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [activeFilters, setActiveFilters] = useState(null);
  const { getUnreadCount } = useNotifications();
  const [unreadCount, setUnreadCount] = useState(0);

  // Update unread count when component mounts and when screen is focused
  useEffect(() => {
    updateUnreadCount();
  }, []);

  useFocusEffect(
    useCallback(() => {
      updateUnreadCount();
    }, [])
  );

  const updateUnreadCount = () => {
    try {
      const count = getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Error getting unread count:', error);
      setUnreadCount(0);
    }
  };

  const loadData = async () => {
    try {
      // Fetch products, categories, and sliders
      const [productsData, categoriesData, slidersData] = await Promise.all([
        fetchProducts(),
        fetchCategories(),
        fetchSliders()
      ]);
      
      setProducts(productsData);
      setFilteredProducts(productsData);
      setCategories(categoriesData);
      setSliders(slidersData);
      setError(null);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadLocation = async () => {
    try {
      const savedLocation = await AsyncStorage.getItem('userLocation');
      if (savedLocation) {
        setLocation(JSON.parse(savedLocation));
      }
    } catch (error) {
      console.error('Error loading location:', error);
    }
  };

  useEffect(() => {
    loadData();
    loadLocation();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
    loadLocation();
  }, []);

  const handleLocationSelected = (newLocation) => {
    setLocation(newLocation);
  };

  useFocusEffect(
    useCallback(() => {
      // Check if we should scroll to Flash Sales
      const shouldScrollToFlashSales = navigation.getState().routes.find(
        route => route.name === 'Main' && route.params?.scrollToFlashSales
      );

      if (shouldScrollToFlashSales && flashSalesRef.current) {
        // Reset the navigation params to prevent scrolling on subsequent focuses
        navigation.setParams({ scrollToFlashSales: false });
        
        // Scroll to Flash Sales section
        flashSalesRef.current.scrollTo({ y: 0, animated: true });
      }
    }, [navigation])
  );

  // Check for filter settings when screen is focused
  useFocusEffect(
    useCallback(() => {
      const checkFilters = async () => {
        try {
          const filterSettingsStr = await AsyncStorage.getItem('filterSettings');
          if (filterSettingsStr) {
            const filterSettings = JSON.parse(filterSettingsStr);
            handleFilterResults(filterSettings);
            // Clear the filter settings after applying them
            await AsyncStorage.removeItem('filterSettings');
          }
        } catch (error) {
          console.error('Error checking filter settings:', error);
        }
      };
      
      checkFilters();
    }, [])
  );

  // Handle filter results
  const handleFilterResults = (filters) => {
    setActiveFilters(filters);
    
    // Apply filters to products
    let filtered = [...products];
    
    // Filter by brand
    if (filters.brand && filters.brand !== 'all') {
      filtered = filtered.filter(product => 
        product.brand?.toLowerCase() === filters.brand.toLowerCase()
      );
    }
    
    // Filter by gender
    if (filters.gender && filters.gender !== 'All') {
      filtered = filtered.filter(product => 
        product.gender?.toLowerCase() === filters.gender.toLowerCase()
      );
    }
    
    // Filter by rating
    if (filters.subReview) {
      const [minRating] = filters.subReview.split(' ')[0].split('.');
      filtered = filtered.filter(product => {
        const rating = parseFloat(product.rating || 0);
        return rating >= parseFloat(minRating);
      });
    }
    
    // Sort products
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'Most Recent':
          filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          break;
        case 'Populor':
          filtered.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
          break;
        case 'Price High':
          filtered.sort((a, b) => {
            const priceA = parseFloat(a.price || a.product_price || 0);
            const priceB = parseFloat(b.price || b.product_price || 0);
            return priceB - priceA;
          });
          break;
        case 'Price Low':
          filtered.sort((a, b) => {
            const priceA = parseFloat(a.price || a.product_price || 0);
            const priceB = parseFloat(b.price || b.product_price || 0);
            return priceA - priceB;
          });
          break;
        default:
          break;
      }
    }
    
    setFilteredProducts(filtered);
  };

  if(loading && !refreshing){
    return (
      <View className={`justify-center items-center flex-1`}>
        <ActivityIndicator size={wp('10%')} color="#704f38"/>
      </View>
    )
  }

  if(error){
    return (
      <View className={`justify-center items-center flex-1`}>
        <Text style={{ fontSize: wp('4%') }} className="text-red-500">{error}</Text>
        <TouchableOpacity 
          onPress={() => {
            setLoading(true);
            loadData();
          }}
          className="mt-4 bg-primary py-2 px-4 rounded-lg"
        >
          <Text style={{ fontSize: wp('4%') }} className="text-white">Retry</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <>
      <ScrollView 
        className={`bg-white`} 
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
        {/* header start */}
        <View className="flex-row justify-between items-center mx-[10px] py-6">
          <TouchableOpacity 
            onPress={() => setIsLocationModalVisible(true)}
            className="flex-col gap-1"
            style={{ maxWidth: wp('60%') }}
          >
            <Text style={{ fontSize: wp('5%') }} className="font-bold">Location</Text>
            <View />

            <View className="flex-row gap-1 items-center">
              <MapPinIcon color={"#704f38"} size={wp('6%')} />
              <Text 
                style={{ fontSize: wp('4%') }} 
                className="font-semibold"
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {location ? location.address : "Select Location"}
              </Text>
              <ChevronDownIcon color={"#704f38"} size={wp('6%')} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => { navigation.navigate('Notification') }} 
            className="bg-gray-300 rounded-full flex justify-center items-center"
            style={{ width: wp('14%'), height: wp('14%') }}
          >
            <BellIcon color={"black"} size={wp('6%')} />
            {unreadCount > 0 && (
              <View className="bg-red-600 absolute top-1 right-1 rounded-full" style={{ width: wp('3%'), height: wp('3%') }}></View>
            )}
          </TouchableOpacity>
        </View>
        {/* header end */}
        {/* search bar start */}
        <View className="h-12 w-30 rounded-3xl flex-row justify-between items-center gap-3 mx-4 mb-8 ">
        <View className="flex-row items-center flex-1 border border-primary px-3 h-14 rounded-full">
          <MagnifyingGlassIcon color={"black"} width={"25"} height={"25"} />
          <TextInput placeholder="Search" className="font-medium flex-1 h-full" />
        </View>

        <TouchableOpacity onPress={() => { navigator.navigate('Filter') }} className="bg-primary h-14 w-14 rounded-full flex justify-center items-center">
          <AdjustmentsHorizontalIcon color={"white"} width={"25"} height={"25"} />
        </TouchableOpacity>
      </View>

        {/* search bar end */}

        {/* ads component start */}
        <View className="rounded-xl mb-4" style={{ height: hp('25%') }}>
          <HomeCarousel setPage={setPage} slider={sliders} />
          <View className={`flex-row justify-center items-center gap-3`}>
            {Array.from({ length: sliders.length }).map((_, index) => {
              const isActive = index == page
              return (
                <View 
                  key={index} 
                  className={`rounded-full ${isActive ? "bg-primary" : "bg-gray-200"}`}
                  style={{ width: wp('3%'), height: wp('3%') }}
                />
              )
            })}
          </View>
        </View>
        {/* ads component end */}
        
        {/* Pass categories data to the Category component */}
        <Category categories={categories} />
        
        {/* Pass filtered products to FlashSales */}
        {filteredProducts.length > 0 ? (
          <FlashSales ref={flashSalesRef} data={filteredProducts}/>
        ) : (
          <View className="py-8 items-center">
            <Text style={{ fontSize: wp('4%') }} className="text-gray-500">No products available</Text>
          </View>
        )}
      </ScrollView>

      <LocationModal 
        visible={isLocationModalVisible}
        onClose={() => setIsLocationModalVisible(false)}
        onLocationSelected={handleLocationSelected}
      />
    </>
  );
}

