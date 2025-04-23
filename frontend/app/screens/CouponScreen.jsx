import { View, Text, ScrollView } from 'react-native'
import React from 'react'
import { widthPercentageToDP as wp, heightPercentageToDP as hp, heightPercentageToDP } from 'react-native-responsive-screen';
import TabBar from '../themes/TabBar';
import { ChevronLeftIcon } from 'react-native-heroicons/outline';
import Icon from "react-native-vector-icons/MaterialCommunityIcons"
import couponData from '../constants/couponData';

export default function CouponScreen() {

    return (
        <View className={`bg-white flex-col`} style={{ height: hp('98%') }}>

            <TabBar
                prefix={""}
                title={"Coupon"}
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
            <ScrollView showsVerticalScrollIndicator={false} className={`mx-4 `}>
                <Text className={`font-medium text-xl my-5`}>Best offers for you</Text>
                <View className={``}>
                    {
                        couponData.map((item, index) => {
                            return (
                                <View key={index} className={`w-full border border-gray-500 rounded-2xl mb-7 `}>
                                    <View className={`px-8 py-6 flex-col gap-2`}>
                                        <Text className={`text-2xl font-medium`}>{item.couponCode}</Text>
                                        <Text className={`text-gray-500 text-lg`}>Add items worth ${item.price} more to unlock</Text>
                                        <View className={`flex-row items-center gap-3`}>
                                            <Icon name='brightness-percent' color={`#704f38`} size={24} />
                                            <Text className={`capitalize font-bold text-lg`}>{item.discount}</Text>
                                        </View>
                                    </View>
                                    <View className={`bg-gray-200 w-full flex-row justify-center items-center py-4 rounded-b-2xl`}>
                                        <Text className={`text-primary text-2xl font-bold`}>COPY CODE</Text>
                                    </View>

                                    {/* this line of code make the semicircle i both side of container */}
                                    <View className={`absolute top-14 flex-row  w-full  `}>
                                        <View className={`flex-row justify-between w-full `}>
                                            <View className={`size-10 absolute -left-5 border rounded-t-full flex justify-center items-center bg-white transform rotate-90`}></View>
                                            <View className={`size-10 absolute -right-5 border rounded-t-full flex justify-center items-center bg-white transform -rotate-90`}></View>
                                        </View>
                                    </View>
                                </View>
                            )
                        })
                    }



                </View>
            </ScrollView>
        </View>
    )
}