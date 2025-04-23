import { View, Text, Image, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { widthPercentageToDP as wp, heightPercentageToDP as hp, heightPercentageToDP } from 'react-native-responsive-screen';
import { ChevronLeftIcon, ChevronRightIcon } from 'react-native-heroicons/solid';

export default function OnboardingScreen() {
    const [initialOnBoard, setOnBoard] = useState(0)

    const info = [
        {
            id: 1,
            name: " Seamless Shopping Experience",
            description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Commodi rerum nam facilis excepturi, nemo evenie!"
        },
        {
            id: 2,
            name: "Wishlist:Where Fashion Dreams Begin",
            description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Commodi rerum nam facilis excepturi, nemo eveniet sint nulla delectus earum eius!"
        },
        {
            id: 3,
            name: "Swift and Reliable Delevery",
            description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Commodi rerum nam facilis excepturi, nemo eveniet sint nulla delectus earum eius!"
        },
    ]

    const renderImage = () => {
        switch (initialOnBoard) {
            case 0:
                return <Image source={require("../../assets/images/pic.jpg")} style={{ height: hp("60%") }} className={`w-full`} />
            case 1:
                return <Image source={{ uri: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQoFRQjM-wM_nXMA03AGDXgJK3VeX7vtD3ctA&s" }} style={{ height: hp("60%") }} className={`w-full`} />
            case 2:
                return <Image source={require("../../assets/images/pic.jpg")} style={{ height: hp("60%") }} className={`w-full`} />

            default:
                return
        }
    }

    return (
        <View className={`bg-gray-100 relative`} style={{ height: hp('97%') }}>
            <View className={`flex-row justify-end mx-4 mt-4 ${initialOnBoard == 2 ? "invisible pointer-events-none" : ""}`}>
                <TouchableOpacity className={``}>
                    {
                        initialOnBoard == 2 ?
                            <Text>A</Text>
                            :
                            <Text className={`text-primary`}>Skip</Text>
                    }
                </TouchableOpacity>
            </View>
            <View className={`mx-10 my-4`}>
                {renderImage()}
            </View>
            <View
                className={`absolute bottom-0 bg-white w-full justify-between items-stretch py-10 px-4  `}
                style={{ height: hp('30%'), borderTopStartRadius: hp('5%'), borderTopEndRadius: hp('5%') }}
            >
                <View className={`items-center`}>
                    <Text className={`text-center text-3xl font-bold`} style={{ width: wp('69%') }}>{info[initialOnBoard].name}</Text>
                </View>
                <Text className={`px-4 text-center font-semibold text-gray-400`} >{info[initialOnBoard].description} </Text>
                <View className={`flex-row justify-between items-center`}>
                    <TouchableOpacity
                        onPress={() => {
                            if (initialOnBoard > 0) {
                                setOnBoard(initialOnBoard - 1)
                            }
                        }}
                        className={`bg-white border-2  size-16 justify-center items-center rounded-full    ${initialOnBoard == 0 ? "invisible pointer-events-none" : "border-primary"}`}>
                        {
                            initialOnBoard == 0 ?
                                <ChevronLeftIcon size={30} color={'#fff'} />
                                :
                                <ChevronLeftIcon size={30} color={'#704f38'} />
                        }
                    </TouchableOpacity>
                    <View className={`flex-row gap-4`}>
                        {Array.from({ length: 3 }).map((_, index) => {
                            const isActive = index == initialOnBoard
                            return (
                                <View key={index} className={`size-4 rounded-full ${isActive ? "bg-primary" : "bg-gray-200"} `}></View>
                            )
                        })}
                    </View>
                    <TouchableOpacity
                        onPress={() => {
                            if (initialOnBoard < 2) {
                                setOnBoard(initialOnBoard + 1)
                            }
                        }}
                        className={`bg-primary border-2 border-primary size-16 justify-center items-center rounded-full`}>
                        <ChevronRightIcon size={30} color={'white'} />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    )
}