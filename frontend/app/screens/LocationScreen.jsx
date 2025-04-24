import { View, Text, TextInput } from 'react-native'
import React from 'react'
import TabBar from '../themes/TabBar'
import { ChevronLeftIcon, MagnifyingGlassIcon, XCircleIcon } from 'react-native-heroicons/outline'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Icon from 'react-native-vector-icons/Ionicons'
import { useNavigation } from '@react-navigation/native';

export default function LocationScreen() {
    const navigation = useNavigation();

    return (
        <View className={`bg-white flex-col`} style={{ height: hp("98%") }}>
            <TabBar
                prefix={""}
                title={"Enter Your Location"}
                suffix={<ChevronLeftIcon size={wp('6%')} color={'black'} />}
                titleStyle={{
                    color: "black",
                    fontWeight: "bold",
                    fontSize: wp('5%')
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
            <View className={`mx-4 mt-2`}>
                <View className={`flex-row items-center mb-2 justify-between p-2 border border-gray-300 rounded-full`}>
                    <View className={`flex-row items-center gap-2`}>
                        <MagnifyingGlassIcon color={"#704f38"} size={wp('6%')} />
                        <TextInput 
                            placeholder=' Golden Avenue' 
                            className={`font-medium`}
                            style={{ fontSize: wp('4%') }}
                        />
                    </View>
                    <View className={`justify-center items-center`}>
                        <XCircleIcon size={wp('6%')} color={"#704f38"} />
                    </View>
                </View>
                <View className={`flex-row gap-4 mt-5 border-b items-center border-gray-300 pb-8`}>
                    <Icon name='paper-plane' size={wp('6%')} color={"#704f38"} />
                    <Text style={{ fontSize: wp('5%') }} className={`font-medium`}>Use my current location</Text>
                </View>
                <Text style={{ fontSize: wp('4.5%') }} className={`mt-5 text-gray-500`}>S E A R C H   R E S U L T</Text>
            </View>
            <View className={`mx-4 flex-row gap-3 mt-3 items-center`}>
                <Icon name='paper-plane' size={wp('4%')} color={"#704f38"} />
                <Text style={{ fontSize: wp('5%') }} className={`font-normal`}>Golden Avenue</Text>
            </View>
            <Text style={{ fontSize: wp('4.5%') }} className={`text-gray-500 mx-4 p-1`}>8502 Preston Rd. Ingl...</Text>
        </View>
    )
}