import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import TabBar from '../themes/TabBar'
import { ChevronLeftIcon } from 'react-native-heroicons/outline'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { CheckIcon } from 'react-native-heroicons/solid';
import { useNavigation } from '@react-navigation/native';

export default function PaymentSuccess() {
  const navigation = useNavigation()

  const handleBack = () => {
    // Navigate to Main screen instead of going back
    navigation.goBack();
  };

  const handleViewOrder = () => {
    navigation.navigate('Order');
  };

  return (
    <View className={`bg-white flex-col`} style={{ height: hp("97%") }}>
      <TabBar
        prefix={""}
        title={"Order Status"}
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
        suffixAction={handleBack}
      />
      <View className={`flex-1 justify-center`}>
        <View className={`justify-center items-center mx-4`}>
          <View className={`bg-primary p-7 rounded-full`}>
            <CheckIcon size={70} color={"white"} />
          </View>
          <View className={`items-center justify-center`}>
            <Text className={`text-3xl font-bold p-6 mt-3`}>Order Successful!</Text>
            <Text className={`text-gray-500 text-center`} style={{ width: wp('70%') }}>
              Thank you for your order. Your order has been placed successfully and will be processed soon.
            </Text>
          </View>
          
          <TouchableOpacity
            onPress={handleViewOrder}
            className="bg-primary py-3 px-6 rounded-full mt-8"
          >
            <Text className="text-white font-semibold text-lg">View Order</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}