import { View, Text, TextInput } from 'react-native'
import React from 'react'
import { widthPercentageToDP as wp, heightPercentageToDP as hp, heightPercentageToDP } from 'react-native-responsive-screen';
import TabBar from '../themes/TabBar';
import { ChevronLeftIcon } from 'react-native-heroicons/outline';

export default function VerifyCodeScreen() {
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
            <View className={`items-center py-9`}>
                <Text className={`text-2xl font-bold`}>Verify Code</Text>
                <Text className={`text-gray-500`}>Please enter the code we just sent to email</Text>
                <Text className={`text-primary`}>example@email.com</Text>
            </View>
            <View className=" mx-8 p-4 flex-row justify-center items-center gap-4">
                <View className=" px-8 border rounded-full border-gray-300">
                    <TextInput placeholder='-' className={`text-2xl`} />
                </View>
                <View className=" px-8 border rounded-full border-gray-300">
                    <TextInput placeholder='-' className={`text-2xl`} />
                </View>
                <View className=" px-8 border rounded-full border-gray-300">
                    <TextInput placeholder='-' className={`text-2xl`} />
                </View>
                <View className=" px-8 border rounded-full border-gray-300">
                    <TextInput placeholder='-' className={`text-2xl`} />
                </View>
            </View>
            <View className="py-5 justify-center items-center">
                <Text className={`text-gray-500`}>Didn't recive OTP?</Text>
                <Text className="text-primary border-b border-primary font-semibold">Resend Code</Text>
            </View>

            <View className=" mx-4 rounded-full bg-primary flex-row justify-center items-center  mt-4" style={{ height: hp("5%") }}>
                <Text className="text-white text-xl font-bold">Verify</Text>
            </View>
        </View>
    )
}