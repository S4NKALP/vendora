import { View, Text, TextInput, Image } from 'react-native'
import React, { useState } from 'react'
import TabBar from '../themes/TabBar'
import { ChevronLeftIcon, ChevronRightIcon, CreditCardIcon } from 'react-native-heroicons/outline'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import paymentData from '../constants/paymentData';
import { TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function ConfirmPayment() {
  const navigation = useNavigation()

  const [paymentDataActive, setpaymentData] = useState(0)

  return (
    <View className={`bg-white flex-col`} style={{ height: hp("97%") }}>
      <TabBar
        prefix={""}
        title={"Payment Methods"}
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
      <View className={`mx-4 mt-5`}>
        <Text className={`text-2xl font-semibold`}>Credit & Debit Card</Text>
      </View>
      <View className={`mx-4 flex-row items-center mt-2 justify-between p-2 border border-gray-300 rounded-2xl`}>
        <View className={`flex-row items-center gap-2 `}>
          <CreditCardIcon color={"#704f38"} size={24} />
          <TextInput placeholder=' Add Card ' className={`font-semibold`} />
        </View>
        <TouchableOpacity onPress={()=>{navigation.navigate('Add Card')}} className={`justify-center items-center`}>
          <ChevronRightIcon color={"#704f38"} size={24} />
        </TouchableOpacity>
      </View>
      <View className={`mx-4 mt-5 mb-3`}>
        <Text className={`font-bold text-2xl`}>More Payment Options</Text>
      </View>
      <View className={`flex-1`}>

        {
          paymentData.map((item, index) => {
            let isActive = index == paymentDataActive;
            return (
              <TouchableOpacity key={index} onPress={() => setpaymentData(index)} className={`border border-gray-300  rounded-2xl mx-4`}>
                <View className={` flex-row items-center mt-2 justify-between p-4   gap-4 `}>
                  <Image source={{ uri: item.image }} className="size-[30px]" />
                  <Text className={`font-semibold flex-1`}>{item.name}</Text>
                  <View className={`justify-center items-center`}>
                    <View className={`flex-row items-center gap-2 border ${isActive ? "border-primary" : "border-gray-500"} rounded-full p-1 size-6`}>
                      <View className={`${isActive ? "bg-primary" : "bg-white"} w-full h-full rounded-full`}></View>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            )
          })
        }
      </View>
        <View className={`⁠ bg-white py-3 rounded-tl-2xl border rounded-tr-2xl gap-3 px-4 h-[80px] border-gray-300`}>
          <TouchableOpacity onPress={()=>{navigation.navigate('Payment Success')}} className={`border rounded-full bg-primary flex-row justify-center items-center `} style={{ height: hp('5%') }}>
            <Text className={`text-white text-lg font-semibold`}>Confirm Payment</Text>
          </TouchableOpacity>
        </View>

    </View>
  )
}