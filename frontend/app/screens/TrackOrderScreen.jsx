import { View, Text } from 'react-native'
import React from 'react'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import TabBar from '../themes/TabBar';
import { ChevronLeftIcon } from 'react-native-heroicons/outline';
import { Image } from 'react-native';
import Timeline from 'react-native-timeline-flatlist'
import { Box, FileText, Package, Truck } from 'lucide-react';

export default function TrackOrderScreen() {
    return (
        <View className={`bg-white flex-col`} style={{ height: hp("97%") }}>
            <TabBar
                prefix={""}
                title={"Track Order"}
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
            <View className={`mx-4 `}>
                <View className={`flex-row items-center gap-6 py-5 border-b border-gray-300 mb-2`}>
                    <Image source={{ uri: "https://devotedstore.com/cdn/shop/files/1000074562.jpg?v=1725134987" }} className={`size-[110px] rounded-2xl`} />
                    <View className={` flex-1 flex-col gap-2`}>
                        <Text className={`font-medium text-lg`}>Brown Jacket</Text>
                        <Text className={`text-lg`}>Size: XXL| Qty: 10pcs </Text>
                        <View className={`flex-row justify-between items-start`}>
                            <Text className={`text-lg font-bold`}>Rs:3000 </Text>
                        </View>
                    </View>
                </View>
            </View>
            <View className={`mx-4 border-b flex-col gap-1 border-gray-300 py-5`}>
                <Text className={`font-bold text-2xl`}>Order Details</Text>
                <View className={`flex-row justify-between items-center`}>
                    <Text>Expected Delivery Date</Text>
                    <Text>03 Sep 2023</Text>
                </View>
                <View className={`flex-row justify-between items-center`}>
                    <Text>Tracking ID</Text>
                    <Text>TRK38438783</Text>
                </View>
            </View>
            {/* Order Status */}
        <View className={``}>
          <Text className="text-xl font-semibold mb-4">Order Status</Text>
          <View className="relative">

            {/* Timeline Items */}
            {/* <View className="space-y-8">
              <Timeline
                icon={<FileText size={16} color="704f38" />}
                title="Order Placed"
                date="23 Aug 2023, 04:25 PM"
                isCompleted={true}
                isFirst={true}
              />
              <Timeline
                icon={<Box size={16} color="704f38" />}
                title="In Progress"
                date="23 Aug 2023, 03:54 PM"
                isCompleted={true}
              />
              <Timeline
                icon={<Truck size={16} color="704f38" />}
                title="Shipped"
                date="Expected 02 Sep 2023"
                isCompleted={false}
              />
              <Timeline
                icon={<Package size={16} color="704f38" />}
                title="Delivered"
                date="23 Aug 2023, 2023"
                isCompleted={false}
                isLast={true}
              />
            </View> */}
          </View>
        </View>
        </View>
    )
}

