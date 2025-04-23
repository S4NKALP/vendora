import { View, Text, Image } from 'react-native'
import React from 'react'
import { widthPercentageToDP as wp, heightPercentageToDP as hp, heightPercentageToDP } from 'react-native-responsive-screen';
import TabBar from '../themes/TabBar';
import { ChevronDownIcon, ChevronLeftIcon, PencilSquareIcon } from 'react-native-heroicons/outline';
import pic from "../../assets/images/pic.jpg"
import { TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function CompleteYourProfileScreen() {
    const navigation = useNavigation();
    
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
                <Text className={`text-2xl font-bold`}>Complete Your Profile</Text>
                <Text className={`text-gray-500 text-center`} style={{ width: wp('70%') }}> Don't worry, only you can see your personal data. No one else will be able to see it.</Text>
            </View>
            <View className=" mx-4 mb-8 rounded-xl" >
                <View className={`flex-row justify-center items-center`}>
                    <View className={`relative`}>
                        <Image source={pic} className="size-[110px] rounded-full " />
                        <View className={`absolute bottom-0 right-0 bg-primary border border-white rounded-full justify-center items-center`}>
                            <PencilSquareIcon color={"white"} size={23} />
                        </View>
                    </View>
                </View>
            </View>
            <View className={`mx-4 mb-5`}>
                <Text className={`text-lg`}> Name</Text>
                <View className={`px-4 border border-gray-300 rounded-full mt-2`}>
                    <TextInput placeholder='Name'></TextInput>
                </View>
            </View>
            <View className={`mx-4 mb-5`}>
                <Text className={`text-lg`}> Email</Text>
                <View className={`px-4 border border-gray-300 rounded-full mt-2`}>
                    <TextInput placeholder='example@gmail.com'></TextInput>
                </View>
            </View>
            <View className={`mx-4 mb-2`}>
                <Text className={`text-lg`}> Gender</Text>
            </View>
            <View className={`mx-4 mb-5`}>
                <View className={`px-4 border border-gray-300 rounded-full flex-row justify-between w-full items-center `}>
                    <TextInput placeholder='Select'></TextInput>
                    <View className={`justify-between items-center `}>
                        <ChevronDownIcon size={25} color={"#704f38"} />
                    </View>
                </View>
            </View>

            <View className=" mx-4 mb-4 rounded-full bg-primary flex-row justify-center items-center  mt-4" style={{ height: hp("5%") }}>
                <Text className="text-white text-xl font-semibold">Complete Profile</Text>
            </View>

        </View>
    )
}