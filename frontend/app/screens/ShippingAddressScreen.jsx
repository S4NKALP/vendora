import { View, Text, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import TabBar from '../themes/TabBar'
import { ChevronLeftIcon, MapPinIcon } from 'react-native-heroicons/outline'
import { widthPercentageToDP as wp, heightPercentageToDP as hp, heightPercentageToDP } from 'react-native-responsive-screen';
import subShipping from '../constants/subShipping';
import { useNavigation } from '@react-navigation/native';

export default function ShippingAddressScreen() {
    const navigation = useNavigation()


    const [subShippingActive, setsubShipping] = useState(0)
    return (
        <View className={`bg-white flex-col`} style={{ height: hp('98%') }}>

            <TabBar
                prefix={""}
                title={"Shipping Address"}
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
            <View className={`flex-1`}>
                {
                    subShipping.map((item, index) => {
                        let isActive = index == subShippingActive;
                        return (
                            <TouchableOpacity key={index} onPress={() => setsubShipping(index)} className={`mx-4 mt-5  pb-7 ${index == subShipping.length - 1 ? "" : "border-b border-gray-200"} flex-row gap-3 `}>
                                <View className={`flex-col gap-1 items-center`}>
                                    <MapPinIcon color={"#704f38"} width={"25"} height={"25"} />
                                </View>
                                <View className={`flex-1`}>
                                    <Text className={`font-semibold text-xl capitalize`}>{item.name}</Text>
                                    <Text className={``} style={{ width: wp('60%') }}>{item.describe} </Text>
                                </View>
                                <View className={`justify-center items-center`}>
                                    <View className={`flex-row items-center gap-2 border ${isActive ? "border-primary" : "border-gray-500"} rounded-full p-1 size-6`}>
                                        <View className={`${isActive ? "bg-primary" : "bg-white"} w-full h-full rounded-full`}></View>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        )
                    })
                }
                <View className={`justify-between mx-4 p-5 items-center mt-9 border border-primary- rounded-2xl border-dashed bg-gray-200`}>
                    <Text className={`text-primary text-lg`}>+ Add New Shipping Address</Text>
                </View>
            </View>
            <TouchableOpacity className={``}>
                <View className={`⁠ bg-white py-3 rounded-tl-2xl border rounded-tr-2xl gap-3 px-4 h-[90px] border-gray-300`}>
                    <View className={`border rounded-full bg-primary flex-row justify-center items-center `} style={{ height: hp('5%') }}>
                        <Text className={`text-white text-lg font-semibold`}>Apply</Text>
                    </View>
                </View>
            </TouchableOpacity>
        </View>
    )
}