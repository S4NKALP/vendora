import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import TabBar from '../themes/TabBar'
import { ChevronLeftIcon } from 'react-native-heroicons/outline'
import { widthPercentageToDP as wp, heightPercentageToDP as hp, heightPercentageToDP } from 'react-native-responsive-screen';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const renderIcon = (library, name, size = 45, color = "#704f38") => {
    switch (library) {
        case "Feather":
            return <Feather name={name} size={size} color={color} />;
        case "Ionicons":
            return <Ionicons name={name} size={size} color={color} />;
        case "MaterialCommunityIcons":
            return <MaterialCommunityIcons name={name} size={size} color={color} />;
        default:
            return null; // Fallback if no matching library is found
    }
};

export default function ChooseShippingScreen() {
    const navigation = useNavigation()

const [activeShipping, setActiveShipping] = useState(0)
    return (
        <View className={`bg-white flex-col`} style={{ height: hp('98%') }}>
            <TabBar
                prefix={""}
                title={"Choose Shipping"}
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
            <ScrollView showsVerticalScrollIndicator={false}>

                {
                    ChooseSippingData.map((item, index) => {
                        const isActive = index == activeShipping
                        return (
                            <TouchableOpacity key={index} onPress={() => setActiveShipping(index)} className={`mx-4  py-10  flex-row gap-3 ${index == ChooseSippingData.length - 1 ? "" : "border-b border-gray-200"}`}>

                                {renderIcon(item.icon.library, item.icon.name)}

                                <View className={`flex-1 gap-2`}>
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
            </ScrollView>
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

const ChooseSippingData = [
    {
        id: 1,
        name: "Economy",
        describe: "Estimated Arrival 25 August 2023",
        icon: {
            library: "Feather",
            name: "box",
        },
    },
    {
        id: 2,
        name: "Regular",
        describe: "Estimated Arrival 25 August 2023",
        icon: {
            library: "Ionicons",
            name: "cube-outline",
        },
    },
    {
        id: 3,
        name: "Cargo",
        describe: "Estimated Arrival 25 August 2023",
        icon: {
            library: "MaterialCommunityIcons",
            name: "truck-check-outline",
        },
    },
    {
        id: 4,
        name: "Friend's House",
        describe: "2464 Royal Ln.Mesa, New Jersey 45463",
        icon: {
            library: "MaterialCommunityIcons",
            name: "truck-fast-outline",
        },
    },
];
