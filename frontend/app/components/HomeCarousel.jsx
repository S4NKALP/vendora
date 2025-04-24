import { View, Text, Image, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import PagerView from 'react-native-pager-view';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useNavigation } from '@react-navigation/native';

const HomeCarousel = ({ setPage, slider }) => {
  const navigation = useNavigation();

  const handleShopNow = (category) => {
    // Handle both category object and direct category ID
    let categoryId;
    let categoryName;

    if (typeof category === 'object' && category !== null) {
      // If category is an object
      if (!category.id) {
        console.error('Invalid category data:', category);
        return;
      }
      categoryId = parseInt(category.id);
      categoryName = category.name || 'Category';
    } else {
      // If category is a direct ID
      categoryId = parseInt(category);
      categoryName = 'Category';
    }

    if (isNaN(categoryId)) {
      console.error('Invalid category ID:', category);
      return;
    }

    // Navigate to the category screen with the category ID as a number
    navigation.navigate('Category', {
      title: categoryName,
      categoryId: categoryId
    });
  };

  return (
    <PagerView
      style={{ flex: 1 }}
      initialPage={0}
      scrollEnabled={true}
      
      // overdrag={true}
      // overScrollMode={'always'}
      onPageSelected={(e) => setPage(e.nativeEvent.position)}
    >
      {
        slider.map((item, index) => {
          return (
            <View key={index} className={`justify-center items-center  bg-[#ece4da] mx-4 mb-3 rounded-xl flex-1`} >
              <View className={`flex-row justify-between flex-1 p-4`}>
                <View style={{ width: wp('45%') }} className={`justify-center gap-3 items-start`}>
                  <Text style={{ fontSize: wp('5%') }} className={`capitalize font-semibold`}>{item.title}</Text>
                  <Text style={{ fontSize: wp('3.5%') }} className={`capitalize text-[#797979]`}>{item.description}</Text>
                  <TouchableOpacity 
                    onPress={() => handleShopNow(item.category || item.category_id)}
                    className={`justify-center items-start`}
                  >
                    <View style={{ paddingHorizontal: wp('3%'), paddingVertical: hp('1%') }} className={`bg-primary w-fit rounded-lg`}>
                      <Text style={{ fontSize: wp('3.5%') }} className={`text-white font-bold`}>Shop Now</Text>
                    </View>
                  </TouchableOpacity>
                </View>
                <Image
                  source={{ uri: item.image_url || "https://cdn.clo3d.com/resource/images/artwork/landing/watermark_landing_sustainably_renewal_1920.png" }}
                  style={{ width: wp('45%'), height: hp('20%') }}
                />
              </View>
            </View>
          )
        })
      }

    </PagerView>


  );
}

export default HomeCarousel