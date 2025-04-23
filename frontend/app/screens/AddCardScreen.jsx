import { View, Text, TextInput, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import TabBar from '../themes/TabBar'
import { CheckIcon, ChevronLeftIcon } from 'react-native-heroicons/outline'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Checkbox from 'expo-checkbox';
import { useNavigation } from '@react-navigation/native';

export default function AddCardScreen() {
    const navigation = useNavigation()

    const [isChecked, setCheck] = useState(false)
    return (
        <View className={`bg-white flex-col`} style={{ height: hp("98%") }}>
            <TabBar
                prefix={""}
                title={"Add Card"}
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
                <View className="bg-green-600 mx-4 mb-7 rounded-xl mt-5" style={{ height: hp('25%') }}></View>
                <View className={`mx-4 mb-5`}>
                    <Text className={`text-xl font-semibold`}>Card Holder Name</Text>
                    <View className={`px-4 border border-gray-300 rounded-xl mt-2`}>
                        <TextInput placeholder='Name'></TextInput>
                    </View>
                </View>
                <View className={`mx-4 mb-5`}>
                    <Text className={`text-xl font-semibold`}>Card Number</Text>
                    <View className={`px-4 border border-gray-300 rounded-xl mt-2`}>
                        <TextInput placeholder='Card number'></TextInput>
                    </View>
                </View>
                <View className={`flex-row justify-between items-center mx-4`}>
                    <View className={`flex-1 justify-between items-center`}>

                    </View>
                </View>
                <View className={`mx-4 mb-3 flex-row gap-4 justify-between items-center`}>
                    <View className={` mt-2 flex-1`}>
                        <Text className={` text-xl font-semibold `}>Expiry Date</Text>
                        <TextInput className={`border border-gray-300 rounded-xl`} placeholder='272'></TextInput>
                    </View>
                    <View className={`mt-2 flex-1`}>
                        <Text className={`text-xl font-semibold`}>CVV</Text>
                        <TextInput className={`border border-gray-300 rounded-xl`} placeholder='30488'></TextInput>
                    </View>
                </View>
                <View className={`mx-4 mt-5 flex-row gap-3 items-center`}>
                    <View className={`bg-primary rounded-lg`}>
                    </View>

                    <View className={`flex-row items-center gap-3`}>
                        <Checkbox className={`rou`} value={isChecked} onValueChange={setCheck} color={'#704f38'} />
                        <Text className={`text-xl `}>Save Card</Text>
                    </View>

                </View>
            </View>
            
                <View className={`⁠ bg-white py-3 rounded-tl-2xl border rounded-tr-2xl gap-3 px-4 h-[90px] border-gray-300`}>
                    <TouchableOpacity className={`border rounded-full bg-primary flex-row justify-center items-center `} style={{ height: hp('5%') }}>
                        <Text className={`text-white text-lg font-semibold`}>Add Card</Text>
                    </TouchableOpacity>
                </View>
            
        </View>
    )
}