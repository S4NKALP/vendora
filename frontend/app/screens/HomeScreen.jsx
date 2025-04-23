import { ActivityIndicator, ScrollView, Text, TextInput, View, RefreshControl } from "react-native";
import { AdjustmentsHorizontalIcon, BellIcon, ChevronDownIcon, MagnifyingGlassIcon } from "react-native-heroicons/outline"
import { MapPinIcon } from "react-native-heroicons/micro"
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Category from "../components/Category";
import FlashSales from "../components/FlashSales";
import { TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import HomeCarousel from "../components/HomeCarousel";
import { useEffect, useState, useCallback } from "react";
import { fetchCategories, fetchProducts } from "../api";

export default function HomeScreen() {
  const navigation = useNavigation()
  const [page, setPage] = useState(0);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadData = async () => {
    try {
      // Fetch both products and categories
      const [productsData, categoriesData] = await Promise.all([
        fetchProducts(),
        fetchCategories()
      ]);
      
      setProducts(productsData);
      setCategories(categoriesData);
      setError(null);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, []);

  if(loading && !refreshing){
    return (
      <View className={`justify-center items-center flex-1`}>
        <ActivityIndicator size={45} color="#704f38"/>
      </View>
    )
  }

  if(error){
    return (
      <View className={`justify-center items-center flex-1`}>
        <Text className="text-red-500 text-lg">{error}</Text>
        <TouchableOpacity 
          onPress={() => {
            setLoading(true);
            loadData();
          }}
          className="mt-4 bg-primary py-2 px-4 rounded-lg"
        >
          <Text className="text-white">Retry</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const slider = [
    {
      title: "new collection",
      description: "Discount 50% for the first transaction."
    },
    {
      title: "kids collection",
      description: "Discount 50% for the first transaction."
    },
    {
      title: "traditional collection",
      description: "Discount 50% for the first transaction."
    },
    {
      title: "traditional collection",
      description: "Discount 50% for the first transaction."
    },
    {
      title: "traditional collection",
      description: "Discount 50% for the first transaction."
    },
  ]

  return (
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
        <View className="flex-col gap-1 ">
          <Text className="text-2xl font-bold">Location</Text>
          <View />

          <View className=" flex-row gap-1 justify-center items-center">
            <MapPinIcon color={"#704f38"} width={"25"} height={"25"} />
            <Text className="text-lg font-semibold">Kohalpur-11,Banke</Text>
            <ChevronDownIcon color={"#704f38"} width={"25"} height={"25"} />
          </View>
        </View>
        <TouchableOpacity onPress={() => { navigation.navigate('Notification') }} className="bg-gray-300 h-14 w-14 rounded-full flex justify-center items-center">
          <BellIcon color={"black"} width={25} height={25} />
          <View className="bg-red-600 size-3 absolute top-1 right-1 rounded-full "></View>
        </TouchableOpacity>
      </View>
      {/* header end */}
      {/* search bar start */}
      <View className="h-12 w-30 rounded-3xl flex-row justify-between items-center gap-3 mx-4 mb-8 ">
        <TouchableOpacity 
          onPress={() => navigation.navigate('Search')} 
          className="flex-row items-center flex-1 border border-primary px-3 h-14 rounded-full"
        >
          <MagnifyingGlassIcon color={"black"} width={"25"} height={"25"} />
          <Text className="font-medium flex-1 h-full text-gray-500">Search products</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => { navigation.navigate('Filter') }} className="bg-primary h-14 w-14 rounded-full flex justify-center items-center">
          <AdjustmentsHorizontalIcon color={"white"} width={"25"} height={"25"} />
        </TouchableOpacity>
      </View>
      {/* search bar start */}

      {/* ads component start */}
      <View className=" rounded-xl mb-4" style={{ height: hp('25%') }}>
        <HomeCarousel setPage={setPage} slider={slider} />
        <View className={`flex-row justify-center items-center gap-3`}>
          {Array.from({ length: slider.length }).map((_, index) => {
            const isActive = index == page
            return (
              <View key={index} className={`size-3 rounded-full ${isActive ? "bg-primary" : "bg-gray-200"} `}/>
            )
          })}
        </View>
      </View>
      {/* ads component end */}
      
      {/* Pass categories data to the Category component */}
      <Category categories={categories} />
      
      {products.length > 0 ? (
        <FlashSales data={products}/>
      ) : (
        <View className="py-8 items-center">
          <Text className="text-gray-500">No products available</Text>
        </View>
      )}

    </ScrollView>
  );
}

