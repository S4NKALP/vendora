import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native'
import React from 'react'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useNavigation } from '@react-navigation/native';

export default function Category({ categories = [] }) {
  const navigation = useNavigation()
  
  // Use fallback demo data if no categories are provided
  const displayCategories = categories.length > 0 ? categories : [
    {
      id: 1,
      name: "T-shirt",
      image: "https://www.iconarchive.com/download/i97169/iconsmind/outline/T-Shirt.ico"
    },
    {
      id: 2,
      name: "Pant",
      image: "https://static.vecteezy.com/system/resources/previews/010/347/283/non_2x/pants-boy-garment-line-icon-illustration-vector.jpg"
    },
    {
      id: 3,
      name: "Dress",
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRQdRkx2psjWSnEJnmPy1-8c40UVYLtDtTINA&s"
    },
    {
      id: 4,
      name: "Jacket",
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTskcACyLVW4kXqpz2KGOAPyoQ7LKURrafxLw&s"
    },
    {
      id: 5,
      name: "Kids",
      image: "https://cdn-icons-png.flaticon.com/512/2934/2934315.png"
    }
  ]
  
  return (
    <View className=" flex-col gap-4 mb-6">
      <View className="flex-row justify-between items-center px-1 mx-4" >
        <Text className="text-xl font-semibold">Category</Text>
        <Text className="text-secondary font-medium">See All</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="ml-4"
      >
        {
          displayCategories.map((item, index) => {
            return (
              <TouchableOpacity 
                key={item.id} 
                onPress={() => { 
                  navigation.navigate('Category', {
                    categoryId: item.id,
                    title: item.name
                  })
                }} 
                className={`${index + 1 == displayCategories.length ? "mr-4" : " mr-4"} flex-col items-center gap-2`}
              >
                <View className="bg-secondary flex justify-center items-center rounded-full" style={{ height: hp('8%'), width: hp('8%') }}>
                  <Image 
                    source={{ uri: item.image }} 
                    className="size-10"
                    style={{ width: hp('6%'), height: hp('6%'), borderRadius: 30 }}
                  />
                </View>
                <Text className="text-center">{item.name}</Text>
              </TouchableOpacity>
            )
          })
        }
      </ScrollView>
    </View>
  )
}