import { View, Text } from 'react-native'
import React from 'react'
import Icon from 'react-native-vector-icons/FontAwesome'
import { widthPercentageToDP as wp, heightPercentageToDP as hp, heightPercentageToDP } from 'react-native-responsive-screen';

export default function FashionScreen() {
    return (
        <View className={`bg-white flex-col`} style={{ height: hp("98%") }}>
            <View className={`flex-1 flex-row gap-2  items-center justify-center`}>
                <View className={`bg-primary p-6 py-4 rounded-full`}>
                    <Icon name='facebook' size={45} color={"white"} />
                </View>
                <Text className={`text-3xl font-bold`}>fashion.</Text>
            </View>
        </View>

    )
}