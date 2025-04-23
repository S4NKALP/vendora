import { View, Text } from 'react-native'
import React from 'react'
import { ChevronDownIcon, ChevronUpIcon, GlobeAltIcon } from 'react-native-heroicons/outline'
import Icon from 'react-native-vector-icons/FontAwesome6';

export default function ContactUsCenter() {
  return (
    <View className={` mt-4 mx-4 `}>
      <View className={` flex-row items-center justify-between p-4 border rounded-xl border-gray-300 mb-3`}>
        <View className={`flex-row items-center gap-4 `}>
          <Icon name='headset' color={"#704f38"} size={25} />
          <Text className={`text-lg font-semibold`}>Customer Service</Text>
        </View>
        <View className={`justify-center items-center`}>
          <ChevronDownIcon color={"#704f38"} size={24} />
        </View>
      </View>
      <View className={`border mb-3 rounded-xl border-gray-300`}>
        <View className={` flex-row items-center justify-between p-4 border-b border-b-gray-300 mb-3`}>
          <View className={`flex-row items-center gap-4 `}>
            <Icon name='whatsapp' color={"#704f38"} size={25} />
            <Text className={`text-lg font-semibold`}>WhatsApp</Text>
          </View>
          <View className={`justify-center items-center`}>
            <ChevronUpIcon color={"#704f38"} size={24} />
          </View>
        </View>
        <Text className={`p-4 text-left mx-9 text-gray-500`}>(480)555-0103</Text>
      </View>
      <View className={` flex-row items-center justify-between p-4 border rounded-xl border-gray-300 mb-3`}>
        <View className={`flex-row items-center gap-4 `}>
          <GlobeAltIcon color={"#704f38"} size={26} />
          <Text className={`text-lg font-semibold`}>Website</Text>
        </View>
        <View className={`justify-center items-center`}>
          <ChevronDownIcon color={"#704f38"} size={24} />
        </View>
      </View>
      <View className={` flex-row items-center justify-between p-4 border rounded-xl border-gray-300 mb-3`}>
        <View className={`flex-row items-center gap-4 `}>
          <Icon name='facebook' color={"#704f38"} size={26} />
          <Text className={`text-lg font-semibold`}>Facebook</Text>
        </View>
        <View className={`justify-center items-center`}>
          <ChevronDownIcon color={"#704f38"} size={24} />
        </View>
      </View>
      <View className={` flex-row items-center justify-between p-4 border rounded-xl border-gray-300 mb-3`}>
        <View className={`flex-row items-center gap-4 `}>
          <Icon name='instagram' color={"#704f38"} size={26} />
          <Text className={`text-lg font-semibold`}>Instagram</Text>
        </View>
        <View className={`justify-center items-center`}>
          <ChevronDownIcon color={"#704f38"} size={24} />
        </View>
      </View>
      <View className={` flex-row items-center justify-between p-4 border rounded-xl border-gray-300 mb-3`}>
        <View className={`flex-row items-center gap-4 `}>
          <Icon name='twitter' color={"#704f38"} size={26} />
          <Text className={`text-lg font-semibold`}>Twitter</Text>
        </View>
        <View className={`justify-center items-center`}>
          <ChevronDownIcon color={"#704f38"} size={24} />
        </View>
      </View>
    </View>
  )
}