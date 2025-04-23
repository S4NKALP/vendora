import { View, Text, TextInput, TouchableOpacity } from 'react-native'
import React from 'react'
import TabBar from '../themes/TabBar'
import { ChevronLeftIcon, EyeSlashIcon } from 'react-native-heroicons/outline'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useNavigation } from '@react-navigation/native';

export default function PasswordManagerScreen() {
    const navigation = useNavigation()

    return (
        <View className={`bg-white flex-col`} style={{ height: hp("98%") }}>
            <TabBar
                prefix={""}
                title={"Password Manager"}
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
                <View className={`mx-4 mt-5`}>
                    <Text className={` font-semibold`}>Current Password</Text>
                </View>
                <View className={`mx-4 flex-row items-center mt-2 justify-between p-2 border border-gray-300 rounded-2xl`}>
                    <View className={`flex-row items-center gap-2 `}>
                        <TextInput placeholder='******************* ' className={`font-semibold`} />
                    </View>
                    <View className={`justify-center items-center`}>
                        <EyeSlashIcon size={25} color={"black"} />
                    </View>
                </View>
                <View className={`mt-3 mx-4 flex-row justify-end`}>
                    <Text className={`text-left border-b text-primary border-primary font-semibold`}>Forgot Passwords ?</Text>
                </View>
                <View className={`mx-4 mt-5`}>
                    <Text className={` font-semibold`}>New Password</Text>
                </View>
                <View className={`mx-4 flex-row items-center mt-2 justify-between p-2 border border-gray-300 rounded-2xl`}>
                    <View className={`flex-row items-center gap-2 `}>
                        <TextInput placeholder='******************* ' className={`font-semibold`} />
                    </View>
                    <View className={`justify-center items-center`}>
                        <EyeSlashIcon size={25} color={"black"} />
                    </View>
                </View>
                <View className={`mx-4 mt-5`}>
                    <Text className={` font-semibold`}>Conform New Password</Text>
                </View>
                <View className={`mx-4 flex-row items-center mt-2 justify-between p-2 border border-gray-300 rounded-2xl`}>
                    <View className={`flex-row items-center gap-2 `}>
                        <TextInput placeholder='******************* ' className={`font-semibold`} />
                    </View>
                    <View className={`justify-center items-center`}>
                        <EyeSlashIcon size={25} color={"black"} />
                    </View>
                </View>
            </View>
                <View className={`⁠ bg-white  px-4 rounded-tl-2xl border rounded-tr-2xl gap-3 py-3 border-gray-300`}>
                    <TouchableOpacity className={`border rounded-full bg-primary flex-row justify-center items-center `} style={{ height: hp('5%') }}>
                        <Text className={`text-white text-lg font-semibold`}>Change Password</Text>
                    </TouchableOpacity>
                </View>
        </View>
    )
}