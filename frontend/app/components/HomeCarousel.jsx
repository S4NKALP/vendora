import { View, Text, Image } from 'react-native'
import React, { useEffect, useState } from 'react'
import PagerView from 'react-native-pager-view';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const HomeCarousel = ({ setPage, slider }) => {
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
                <View className={`justify-center gap-3 items- w-1/2`}>
                  <Text className={`capitalize font-semibold text-xl`}>{item.title}</Text>
                  <Text className={`capitalize text-[#797979]`}>{item.description}</Text>
                  <View className={`justify-center items-start`}>
                    <View className={`px-3 py-2 bg-primary w-fit rounded-lg`}>
                      <Text className={`text-white font-bold`}>Shop Now</Text>
                    </View>
                  </View>
                </View>
                <Image
                  source={{ uri: "https://cdn.clo3d.com/resource/images/artwork/landing/watermark_landing_sustainably_renewal_1920.png" }}
                  className={`w-1/2 h-full`}
                  style={{}}
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