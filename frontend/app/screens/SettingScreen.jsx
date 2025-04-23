import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import TabBar from '../themes/TabBar'
import { ChevronLeftIcon, ChevronRightIcon, CreditCardIcon, KeyIcon, UserCircleIcon } from 'react-native-heroicons/outline'
import { widthPercentageToDP as wp, heightPercentageToDP as hp, heightPercentageToDP } from 'react-native-responsive-screen';
import { useNavigation } from '@react-navigation/native';

export default function SettingScreen() {
    const navigation = useNavigation()

    return (
        <View className={`bg-white`} style={{ height: hp('97%') }}>
            <TabBar
                prefix={""}
                title={"Settings"}
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
            <View className={`mx-4 flex-row items-center justify-between mt-6`}>
                <View className={`flex-row items-center gap-2 `}>
                    <UserCircleIcon color={"#704f38"} size={25} />
                    <Text className={`text-lg font-semibold`}>Notification Settings</Text>
                </View>
                <View className={`justify-center items-center`}>
                    <ChevronRightIcon color={"#704f38"} size={24} />
                </View>
            </View>
            <View className="bg-black h-[0.4px] my-5 m-4 " />

            <TouchableOpacity onPress={()=>{navigation.navigate('Password Manager')}} className={`mx-4 flex-row items-center justify-between`}>
                <View className={`flex-row items-center gap-2 `}>
                    <KeyIcon color={"#704f38"} size={25} />
                    <Text className={`text-lg font-semibold`}>Password Manager</Text>
                </View>
                <View className={`justify-center items-center`}>
                    <ChevronRightIcon color={"#704f38"} size={24} />
                </View>
            </TouchableOpacity>
            <View className="bg-black h-[0.4px] my-5 m-4 " />

            <View className={`mx-4 flex-row items-center justify-between`}>
                <View className={`flex-row items-center gap-2 `}>
                    <CreditCardIcon color={"#704f38"} size={25} />
                    <Text className={`text-lg font-semibold`}>Delete Account</Text>
                </View>
                <View className={`justify-center items-center`}>
                    <ChevronRightIcon color={"#704f38"} size={24} />
                </View>
            </View>
            <View className="bg-black h-[0.4px] my-5 m-4 " />
        </View>
    )
}