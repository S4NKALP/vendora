import { View, Text } from 'react-native'
import React from 'react'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import TabBar from '../themes/TabBar';
import { ChevronLeftIcon, FolderMinusIcon, StarIcon } from 'react-native-heroicons/outline';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';


const NotificationScreen = () => {
    const navigation = useNavigation()

    return (
        <View className={'bg-white flex-1'} style={{ height: hp('97%') }} >

            <TabBar
                prefix={
                    <View className="flex-row gap-1 justify-center items-center  ">
                        <Text className="text-white">2</Text>
                        <Text className="text-white">NEW</Text>
                    </View>
                }
                title={"Notification "}
                suffix={<ChevronLeftIcon size={25} color={'black'} />}
                titleStyle={{
                    color: "black",
                    fontWeight: "bold",
                    fontSize: 20
                }}
                prefixStyle={{
                    backgroundColor: "white",
                    borderWidth: 1,
                    primary: "#704f38",
                    backgroundColor: "#704f38",
                    height: 40,
                    width: 60,
                    paddingHorizontal: 10
                }}
                suffixStyle={{
                    backgroundColor: "white",
                    borderWidth: 1,
                    borderColor: "black",
                    height: 40,
                    width: 40,
                }}
                containerStyle=""
                suffixAction={() => navigation.goBack()}
            />
            <View className="mx-8 flex-col">
                <View className="flex-row justify-between item-center mb-4 ">
                    <Text className="text-lg">T O D A Y</Text>
                    <Text className="text-lg text-primary ">Mark all as read</Text>
                </View>
                <View className="flex-row justify-center items-center mx-4 mb-4">
                    <View className="bg-gray-300 rounded-full p-4 mx-4">
                        <Icon name='truck-cargo-container' size={30} color={"#704f38"} />
                    </View>
                    <View className="">
                        <View className="flex-row justify-between items-center mr-4">
                            <Text className="text-lg font-semibold">Order Sipped </Text>
                            <Text>1h</Text>
                        </View>
                        <Text className='m-3'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Eius, minus veniam. Veritatis nisi sequi tempore facere.</Text>
                    </View>
                </View>
                <View className="flex-row justify-center items-center mx-4 mb-4">
                    <View className="bg-gray-300 rounded-full p-4 mx-4">
                        <Icon name='brightness-percent' size={30} color={"#704f38"} />
                    </View>
                    <View className="">
                        <View className="flex-row justify-between items-center mr-4 ">
                            <Text className="text-lg font-semibold">Flash Sale Alert</Text>
                            <Text>1h</Text>
                        </View>
                        <Text className='m-3' >Lorem ipsum dolor sit amet consectetur adipisicing elit. Eius, minus veniam. Veritatis nisi sequi tempore facere.</Text>
                    </View>
                </View>
                <View className="flex-row justify-center items-center mx-4 mb-8">
                    <View className="bg-gray-300 rounded-full p-4 mx-4">
                        <StarIcon size={30} color={"#704f38"} />
                    </View>
                    <View className="">
                        <View className="flex-row justify-between items-center mr-4  ">
                            <Text className="text-lg font-semibold">Product Review Request </Text>
                            <Text>1h</Text>
                        </View>
                        <Text className='m-3'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Eius, minus veniam. Veritatis nisi sequi tempore facere.</Text>
                    </View>
                </View>
                <View className="flex-row justify-between item center mb-4 ">
                    <Text className="text-lg">Y E S T E R D A Y</Text>
                    <Text className="text-lg text-primary ">Mark all as read</Text>
                </View>
                <View className="flex-row justify-center items-center mx-4 mb-4">
                    <View className="bg-gray-300 rounded-full p-4 mx-4">
                        <Icon name='truck-cargo-container' size={30} color={"#704f38"} />
                    </View>
                    <View className="">
                        <View className="flex-row justify-between items-center mr-4 ">
                            <Text className="text-lg font-semibold">Order Sipped </Text>
                            <Text>1d</Text>
                        </View>
                        <Text className='m-3'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Eius, minus veniam. Veritatis nisi sequi tempore facere.</Text>
                    </View>
                </View>
                <View className="flex-row justify-center items-center mx-4 mb-4">
                    <View className="bg-gray-300 rounded-full p-4 mx-4">
                        <FolderMinusIcon size={30} color={"#704f38"} />
                    </View>
                    <View className="">
                        <View className="flex-row justify-between items-center mr-4 ">
                            <Text className="text-lg font-semibold">New Paypal Added</Text>
                            <Text>1d</Text>
                        </View>
                        <Text className='m-3'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Eius, minus veniam. Veritatis nisi sequi tempore facere.</Text>
                    </View>
                </View>
                <View className="flex-row justify-center items-center mx-4">
                    <View className="bg-gray-300 rounded-full p-4 mx-4">
                        <Icon name='brightness-percent' size={30} color={"#704f38"} />
                    </View>
                    <View className="">
                        <View className="flex-row justify-between items-center mr-4 ">
                            <Text className="text-lg font-semibold">Flash Sale Alert </Text>
                            <Text>1d</Text>
                        </View>
                        <Text className='m-3'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Eius, minus veniam. Veritatis nisi sequi tempore facere.</Text>
                    </View>
                </View>
            </View>
        </View>
    )
}
export default NotificationScreen