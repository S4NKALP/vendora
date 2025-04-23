import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import TabBar from '../themes/TabBar'
import { ChevronLeftIcon } from 'react-native-heroicons/outline'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { CheckIcon } from 'react-native-heroicons/solid';
import { useNavigation } from '@react-navigation/native';

export default function PaymentSuccess() {
  const navigation = useNavigation()

  return (
    <View className={`bg-white flex-col`} style={{ height: hp("97%") }}>
      <TabBar
        prefix={""}
        title={" Payment"}
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
      <View className={`flex-1 justify-center`}>
        <View className={`justify-center items-center mx-4`}>
          <View className={`bg-primary p-7 rounded-full`}>
            <CheckIcon size={70} color={"white"} />
          </View>
          <View className={`items-center justify-center`}>
            <Text className={`text-3xl font-bold p-6 mt-3`}>Payment Successful !</Text>
            <Text className={`text-gray-500`} style={{ width: wp('50%') }}>Thank you for your purchase.</Text>
          </View>
        </View>
      </View>
        <View className={`⁠ bg-white py-6 rounded-tl-2xl border rounded-tr-2xl gap-3 px-4  border-gray-300`}>
      <TouchableOpacity className={``}>
          <TouchableOpacity onPress={()=>{navigation.navigate('Order')}} className={` rounded-full bg-primary flex-row justify-center items-center `} style={{ height: hp('5%') }}>
            <Text className={`text-white text-lg font-semibold`}>View Order</Text>
          </TouchableOpacity>
      </TouchableOpacity>
      <View className={`mx-4 items-center`}>
        <Text className={`text-primary text-xl`}>View E-Reciept</Text>
      </View>
        </View>
    </View>
  )
}