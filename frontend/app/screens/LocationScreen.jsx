import { View, Text, TextInput } from 'react-native'
import React from 'react'
import TabBar from '../themes/TabBar'
import { ChevronLeftIcon, MagnifyingGlassIcon, XCircleIcon } from 'react-native-heroicons/outline'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Icon from 'react-native-vector-icons/Ionicons'

export default function LocationScreen() {
    return (
        <View className={`bg-white flex-col`} style={{ height: hp("98%") }}>
            <TabBar
                prefix={""}
                title={"Enter Your Location"}
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
            <View className={`mx-4 mt-2`}>
                <View className={` flex-row items-center mb-2 justify-between p-2 border border-gray-300 rounded-full`}>
                    <View className={`flex-row items-center gap-2 `}>
                        <MagnifyingGlassIcon color={"#704f38"} size={25} />
                        <TextInput placeholder=' Golden Avenue' className={`font-medium`} />
                    </View>
                    <View className={`justify-center items-center`}>
                        <XCircleIcon size={24} color={"#704f38"} />
                    </View>
                </View>
                <View className={`flex-row gap-4 mt-5 border-b items-center border-gray-300 pb-8`}>
                    <Icon name='paper-plane' size={25} color={"#704f38"} />
                    <Text className={`text-2xl font-medium`}>Use my current location</Text>
                </View>
                <Text className={`mt-5 text-xl text-gray-500`}>S E A R C H   R E S U L T</Text>
            </View>
            <View className={`mx-4 flex-row gap-3 mt-3  items-center`}>
                <Icon name='paper-plane' size={17} color={"#704f38"} />
                <Text className={`text-2xl font-normal`}>Golden Avenue</Text>
            </View>
            <Text className={`text-gray-500 text-xl mx-4  p-1`}>8502 Preston Rd. Ingl...</Text>
        </View>
    )
}