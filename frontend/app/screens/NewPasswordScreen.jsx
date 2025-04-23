import { View, Text } from 'react-native'
import React from 'react'
import { widthPercentageToDP as wp, heightPercentageToDP as hp, heightPercentageToDP } from 'react-native-responsive-screen';
import TabBar from '../themes/TabBar';
import { ChevronLeftIcon, EyeSlashIcon } from 'react-native-heroicons/outline';

export default function NewPasswordScreen() {
    return (
        <View className={`bg-white`} style={{ height: hp('97%') }}>
            <TabBar
                prefix={""}
                title={""}
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
            <View className={`items-center justify-between py-9 mx-4`}>
                <Text className={`text-2xl font-bold`}>New Password</Text>
                <Text className={`text-gray-500 text-center`} style={{ width: wp('70%') }}> Your new password must be different       from Previously used passwords.</Text>
            </View>
            <View className="mb-4 mx-4">
                <Text className="text-lg font-semibold "> Password</Text>
            </View>
            <View className=" mx-4 flex-row justify-between items-center  border border-gray-300 rounded-full mb-4 p-4">
                <View className="flex-row items-center gap-2">
                    <Text className="text-2xl">****</Text>
                </View>
                <View>
                    < EyeSlashIcon size={24} color={"black"} />
                </View>
            </View>
            <View className="mb-4">
                <Text className="text-lg font-semibold mx-4">Confirm Password</Text>
            </View>
            <View className=" mx-4 flex-row justify-between items-center  border border-gray-300 rounded-full mb-4 p-4">
                <View className="flex-row items-center gap-2">
                    <Text className="text-2xl">****</Text>
                </View>
                <View>
                    < EyeSlashIcon size={24} color={"black"} />
                </View>
            </View>


            <View className=" mx-4 mb-4 rounded-full bg-primary flex-row justify-center items-center  mt-4" style={{ height: hp("5%") }}>
                <Text className="text-white text-xl">Create New Password</Text>
            </View>

        </View>
    )
}