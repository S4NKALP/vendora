import { View, Text, TextInput, ScrollView } from 'react-native'
import React, { useState } from 'react'
import TabBar from '../themes/TabBar'
import { ChevronLeftIcon, MagnifyingGlassIcon } from 'react-native-heroicons/outline'
import { widthPercentageToDP as wp, heightPercentageToDP as hp, heightPercentageToDP } from 'react-native-responsive-screen';
import { TouchableOpacity } from 'react-native'
import ContactUsCenter from '../components/ContactUsCenter'
import FaqCenter from '../components/FaqCenter'
import { useNavigation } from '@react-navigation/native';

export default function HelpCenterScreen() {
    const navigation = useNavigation()

    const helpState = ["FAQ", "Contact Us"]
    const [initialValue, setValue] = useState(0)
    const renderHelpState = () => {
        switch (initialValue) {
            case 0:
                return <FaqCenter />
            case 1:
                return <ContactUsCenter />
            default:
                return <Text>This Help State is not Valid</Text>
        }
    }
    return (
        <View className={`bg-white`} style={{ height: hp('97%') }}>
            <TabBar
                prefix={""}
                title={"Help Center"}
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
            <View className={`px-4 mt-6`}>
                <View className="h-12 w-30 flex-row justify-between items-center gap-3 mb-6 ">
                    <View className="flex-row items-center flex-1 border border-gray-400 px-3 h-14 rounded-2xl">
                        <MagnifyingGlassIcon color={"#704f38"} width={"25"} height={"25"} />
                        <TextInput placeholder="Search" className="font-medium flex-1 h-full" />
                    </View>
                </View>
            </View>
                <View className={`flex-row justify-between border-b border-primary px-4`}>
                    {
                        helpState.map((item, index) => {
                            const isActive = initialValue == index
                            return (
                                <TouchableOpacity onPress={() => setValue(index)} key={index} className={`flex-1 flex-row justify-center items-center py-4 border-b-[4px] rounded-[2px]  ${isActive ? " border-primary" : "border-white"}`}>
                                    <Text className={`capitalize font-bold ${isActive ? "text-primary" : ""}`}>{item}</Text>
                                </TouchableOpacity>
                            )
                        })
                    }

            </View>


            <ScrollView showsVerticalScrollIndicator={false}>
                {renderHelpState()}
            </ScrollView>
        </View>
    )
}