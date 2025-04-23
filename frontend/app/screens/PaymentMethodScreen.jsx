import { View, Text, Image } from 'react-native'
import React from 'react'
import TabBar from '../themes/TabBar'
import { ChevronLeftIcon, CreditCardIcon } from 'react-native-heroicons/outline'
import { TextInput } from 'react-native'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useNavigation } from '@react-navigation/native'


export default function PaymentMethodScreen() {
    const navigation = useNavigation()

    return (
        <View className={`bg-white`} style={{ height: hp("99%") }}>
            <TabBar
                prefix={""}
                title={"Payment Methods"}
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
            <View className={`mx-4 mt-5`}>
                <Text className={`text-2xl font-semibold`}>Credit & Debit Card</Text>
            </View>
            <View className={`mx-4 flex-row items-center mt-2 justify-between p-2 border border-gray-300 rounded-2xl`}>
                <View className={`flex-row items-center gap-2 `}>
                    <CreditCardIcon color={"#704f38"} size={24} />
                    <TextInput placeholder='Add New Card ' className={`font-semibold`} />
                </View>
                <View className={`justify-center items-center`}>
                    <Text className={`text-primary`}>Link</Text>
                </View>
            </View>
            <View className={`mx-4 mt-5 mb-3`}>
                <Text className={`font-bold text-2xl`}>More Payment Options</Text>
            </View>
            <View className={`border border-gray-300 rounded-2xl mx-4`}>
                <View className={` flex-row items-center mt-2 justify-between p-4 border-b border-gray-300 gap-4 `}>
                    <Image source={{ uri: "https://cdn-icons-png.flaticon.com/512/174/174861.png" }} className="size-[30px]" />
                    <Text className={`font-semibold flex-1`}>Paypal</Text>
                    <Text className={`text-primary`}>Link</Text>
                </View>
                <View className={` flex-row items-center  justify-between p-4 gap-4 `}>
                    <Image source={{ uri: "https://cdn0.iconfinder.com/data/icons/social-glyph/30/apple-480.png" }} className="size-[30px]  " />
                    <Text className={`font-semibold flex-1`}>Apple Pay</Text>
                    <Text className={`text-primary`}>Link</Text>
                </View>
            </View>
        </View>
    )
}