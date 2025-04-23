import { View, Text, Image, TouchableOpacity } from 'react-native'
import React from 'react'
import TabBar from '../themes/TabBar'
import { ChevronLeftIcon } from 'react-native-heroicons/outline'
import { widthPercentageToDP as wp, heightPercentageToDP as hp, heightPercentageToDP } from 'react-native-responsive-screen';
import usersData from '../constants/usersData';
import { ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function InviteFriendsScreen() {
  const navigation = useNavigation()

  return (
    <View className={`bg-white`} style={{ height: hp('97%') }}>
      <TabBar
        prefix={""}
        title={"Invite Friends"}
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
      <ScrollView showsVerticalScrollIndicator={false} className={``}>
        {
          usersData.map((item, index) => {
            return (
              <View key={index} className={`flex-row items-center justify-between gap-4 border-b-[1px] border-gray-300  px-4 py-3`}>
                <Image source={item.image} className={`size-[70px] rounded-full`} />
                <View className={`flex-1 gap-2`}>
                  <Text className={`text-xl font-semibold`}>{item.name}</Text>
                  <Text className={`font-medium text-gray-600`}>{item.num}</Text>
                </View>
                <TouchableOpacity className={`bg-primary px-5 py-2 rounded-full `}>
                  <Text className={`text-white text-xl font-medium`}>Invite</Text>
                </TouchableOpacity>
              </View>
            )
          })
        }
      </ScrollView>
    </View>
  )
}