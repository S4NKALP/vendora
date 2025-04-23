import { View, Text, ScrollView } from 'react-native'
import React, { useState } from 'react'
import { TouchableOpacity } from 'react-native';
import { ChevronDownIcon, ChevronUpIcon } from 'react-native-heroicons/outline';

export default function FaqCenter() {
  const faq = ["All", "Services", "General", "Account"]
  const [faqActive, setfaqActive] = useState(0);
  return (
    <View className={`mx-4 mt-5 `} >
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {
          faq.map((item, index) => {
            let isActive = index == faqActive;
            return (
              <TouchableOpacity
                key={index}
                onPress={() => setfaqActive(index)}
                className={`
            border border-gray-200 bg-gray-200 px-5 mr-4 mb-4 rounded-full py-3 
            ${isActive ? "bg-primary" : ""}
            `}>
                <Text className={`${isActive ? "text-white " : ""} capitalize font-bold`}>
                  {item}
                </Text>
              </TouchableOpacity>
            )
          })
        }
      </ScrollView>
      <View className={`border border-gray-300 rounded-2xl mb-5`}>
        <View className={`flex-row justify-between items-center p-3 border-b border-b-gray-300 `}>
          <Text className={`font-semibold text-lg`}>Can i track my order's delevery status ?</Text>
          <ChevronUpIcon color={"#704f38"} />
        </View>
        <Text className={`p-3`}>Lorem ipsum dolor sit amet consectetur adipisicing elit. Ab distinctio nihil assumenda nostrum laboriosam quo,
          officia eligendi obcaecati accusamus aliquam debitis, voluptatibus excepturi consequatur expedita eius quisquam velit. Rerum, officia?</Text>
      </View>
      <View className={`mb-`}>
        <View className={`flex-row justify-between items-center p-3 border rounded-2xl border-gray-300 mb-2 `}>
          <Text className={`font-semibold text-lg`}>Is there a return policy ?</Text>
          <ChevronDownIcon color={"#704f38"} />
        </View>
        <View className={`flex-row justify-between items-center p-3 border rounded-2xl border-gray-300 mb-2 `}>
          <Text className={`font-semibold text-lg`}>Can i save my favorite item for later ?</Text>
          <ChevronDownIcon color={"#704f38"} />
        </View>
        <View className={`flex-row justify-between items-center p-3 border rounded-2xl border-gray-300 mb-2`}>
          <Text className={`font-semibold text-lg`}>Can i share products with my friends ?</Text>
          <ChevronDownIcon color={"#704f38"} />
        </View>
        <View className={`flex-row justify-between items-center p-3 border rounded-2xl border-gray-300 mb-2`}>
          <Text className={`font-semibold text-lg`}>How do i contact customer support ?</Text>
          <ChevronDownIcon color={"#704f38"} />
        </View>
        <View className={`flex-row justify-between items-center p-3 border rounded-2xl border-gray-300 mb-2`}>
          <Text className={`font-semibold text-lg`}>What payment methods are accepted ?</Text>
          <ChevronDownIcon color={"#704f38"} />
        </View>
        <View className={`flex-row justify-between items-center p-3 border rounded-2xl border-gray-300 mb-2`}>
          <Text className={`font-semibold text-lg`}>How to add review ?</Text>
          <ChevronDownIcon color={"#704f38"} />
        </View>
      </View>

    </View>
  )
}