import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Image } from 'react-native';
import pic from "../../assets/images/pic.jpg"
import { useNavigation } from '@react-navigation/native';

export default function WellcomeScreen() {
    const navigation = useNavigation();

    return (
        <View className={`bg-white flex-col`} style={{ height: hp("98%") }}>
            <TouchableOpacity 
                onPress={() => navigation.navigate('SignIn')}
                className="absolute top-8 right-5 z-10"
            >
                <Text className="text-primary font-semibold text-lg">Skip</Text>
            </TouchableOpacity>
            
            <View className={`mx-4  flex-row gap-6   mt-6`} style={{ height: hp('60%') }}>
                <View className={`flex-1`} style={{ height: hp('60%%') }}>
                    <Image source={pic} className="w-full h-full rounded-full" />
                </View>
                <View className={`flex-1 flex-col h-full `} style={{ gap: hp('2%') }}>
                    <View className={``}>
                        <Image source={pic} className="w-full     rounded-full" style={{ height: hp('37%') }} />
                    </View>
                    <View className={``}>
                        <Image source={pic} className="w-full    rounded-full" style={{ height: hp('21%') }} />
                    </View>
                </View>
            </View>
            <View className={`mx-4 items-center justify-center mt-9 `}>
                <Text className={`text-3xl font-bold text-center`} style={{ width: wp('80%') }}>The Fashion App That Makes You Look Your Best </Text>
            </View>
            <View className={`mt-8`}>
                <Text className={`text-center text-gray-500`} style={{ width: wp('95%') }}>Lorem ipsum dolor, sit amet consectetur adipisicingreprehenderit repellendus! Rem, odio deleniti.</Text>
            </View>
            <TouchableOpacity 
                onPress={() => navigation.navigate('Register')}
                className={`mt-8 bg-primary rounded-full mx-4`}
            >
                <View className={`items-center justify-center py-3`}>
                    <Text className={`text-white text-2xl font-semibold `}>Let's Get Started</Text>
                </View>
            </TouchableOpacity>
            <View className={`mt-5 px-4 flex-row gap-1 items-center justify-center`}>
                <Text className={`text-lg`}>Already have an account?</Text>
                <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
                    <Text className={`text-primary text-lg border-b border-primary`}>Sign in</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}