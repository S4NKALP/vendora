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

  const handleCategoryPress = (category) => {
    // Ensure we have a valid category ID
    if (!category.id || isNaN(parseInt(category.id))) {
      console.error('Invalid category ID:', category.id);
      return;
    }

    // Navigate to the category screen with the category ID as a number
    navigation.navigate('Category', {
      title: category.name,
      categoryId: parseInt(category.id)
    });
  };

  return (
    <View className="flex-1">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="flex-row gap-4"
      >
        {displayCategories.map((category, index) => (
          <TouchableOpacity
            key={category.id || index}
            onPress={() => handleCategoryPress(category)}
            className="items-center"
          >
            <View className="rounded-full p-4 bg-gray-100">
              <Image
                source={{ uri: category.image }}
                style={{ width: wp(12), height: wp(12) }}
                className="rounded-full"
              />
            </View>
            <Text className="text-sm font-medium mt-2">{category.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}