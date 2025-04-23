import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { MapPinIcon } from 'react-native-heroicons/solid'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

export default function AccessLocation() {
    return (
        <View className={`bg-white flex-col`} style={{ height: hp("98%") }}>

            <View className={`flex-1 justify-center items-center mx-4`}>
                <View className={`bg-gray-300 p-7 rounded-full`}>
                    <MapPinIcon size={70} color={"#704f38"} />
                </View>
                <View className={`items-center justify-center`}>
                    <Text className={`text-2xl font-bold p-6 mt-3`}>What is Your Location?</Text>
                    <Text className={`text-gray-500`} style={{ width: wp('80%') }}>We need to know your location in order to suggest nearby services.</Text>
                </View>
                <TouchableOpacity className={`bg-primary p-5 w-full items-center rounded-full mt-9`}>
                    <Text className={`text-white text-xl font-bold`}>Allow Location Access</Text>
                </TouchableOpacity>
                <Text className={`text-primary mt-5 text-xl font-medium`}>Enter Location Manually</Text>
            </View>
        </View>
    )
}