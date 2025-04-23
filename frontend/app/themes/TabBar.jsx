import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

export default function TabBar({ title, prefix, suffix, titleStyle, suffixStyle, prefixStyle, containerStyle, suffixAction }) {
    return (
        <View className={`flex-row justify-between items-center px-4  py-3  ${containerStyle}`} style={{ width: wp("100%") }}>
            <TouchableOpacity onPress={suffixAction} className="size-12 rounded-full flex-row justify-center items-center" style={suffixStyle}>
                {suffix}
            </TouchableOpacity>
            <Text style={titleStyle}>{title}</Text>
            <View className="size-12 rounded-full flex-row justify-center items-center " style={prefixStyle}>
                {prefix}
            </View>

        </View>
    )
}