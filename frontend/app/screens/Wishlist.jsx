import { View, Text, ScrollView, Image } from 'react-native'
import React, { useState } from 'react'
import { ArrowLeftIcon, ChevronLeftIcon, HeartIcon } from 'react-native-heroicons/outline'
import { TouchableOpacity } from 'react-native'
import TabBar from '../themes/TabBar'
import MasonryList from '@react-native-seoul/masonry-list';
import flashSalesData from '../constants/flashSalesData'
import { widthPercentageToDP as wp, heightPercentageToDP as hp, heightPercentageToDP } from 'react-native-responsive-screen';
import { StarIcon } from 'react-native-heroicons/solid'
import  Icon  from 'react-native-vector-icons/FontAwesome'
import { useNavigation } from '@react-navigation/native'

const Wishlist = () => {
    const navigation = useNavigation()
    const [favorites, setFavorites] = useState({})

    const subWishlist = ["All", "Shirt", "Paint", "T-shirt", "Jacket", "Suite", "Shoes"]
    const [activeSet, setActiveSet] = useState("All")

    const handleSubWishlist = (item) => {
        setActiveSet(item)
    }
    const handleFavouriteToggle = (productId) => {
        setFavorites(prev => ({
            ...prev,
            [productId]: !prev[productId]
        }))
    }

    return (
        <ScrollView className="bg-white">
            <TabBar
                prefix={""}
                title={"Wishlist"}
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

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
            >
                {
                    subWishlist.map((item, index) => {
                        let isActive = item == activeSet;

                        return (
                            <TouchableOpacity
                                onPress={() => handleSubWishlist(item)}
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
            <MasonryList
                    data={flashSalesData}
                    keyExtractor={(item) => item.id}
                    numColumns={2}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item, index }) => <CardItem item={item} index={index} handleFavouriteToggle={handleFavouriteToggle} isFavourite={favorites[item.id] || false} navigation={navigation} />}
                    className="mx-4"
                />

        </ScrollView>


    )
}
const CardItem = ({ item, index, handleFavouriteToggle, isFavourite, navigation }) => {
    let isEven = item.id % 2 == 0
    return (
        <View className={`${isEven ? "pl-4" : " pr-4"} flex-col gap-3 mb-4`}>
            <TouchableOpacity onPress={() => { navigation.navigate('ProductDetails',{title:item.name}) }} className="relative">
                <Image source={{ uri: item.image }} height={hp(20)} className=" object-cover rounded-3xl" />
                <TouchableOpacity onPress={() => handleFavouriteToggle(item.id)} className="absolute right-4 top-4 bg-white/50 p-2 rounded-full">
                    {
                        isFavourite ?
                            <Icon name='heart' size={16} color={"red"} />
                            :
                            <HeartIcon size={20} color={"white"} />
                    }

                </TouchableOpacity>
            </TouchableOpacity>

            <View className="flex-row justify-between px-1">
                <Text>{item.name}</Text>
                <View className="flex-row gap-1">
                    <StarIcon size={20} color={"orange"} />
                    <Text>{item.rating}</Text>
                </View>
            </View>
            <View className="px-1 ">
                <Text className="font-medium">Rs {item.price}</Text>
            </View>

        </View>
    )
}

export default Wishlist