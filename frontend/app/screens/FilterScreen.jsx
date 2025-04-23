import { View, Text, TouchableOpacity, ScrollView } from 'react-native'
import React, { useState } from 'react'
import { ChevronLeftIcon } from 'react-native-heroicons/outline'
import TabBar from '../themes/TabBar'
import { StarIcon } from 'react-native-heroicons/solid'
import { widthPercentageToDP as wp, heightPercentageToDP as hp, heightPercentageToDP } from 'react-native-responsive-screen';
import MultiSlider from '@ptomasroos/react-native-multi-slider'
import { useNavigation } from '@react-navigation/native'


export default function FilterScreen() {
    const navigation = useNavigation()

    const brand = ["all", "adidas", "nike", "puma", "gucci", "parada", "ogiy", "reebook"]
    const [brandActive, setbrandActive] = useState(0)

    const gender = ["All", "Men", "Women"]
    const [genderActive, setgenderActive] = useState(0)

    const sortBy = ["Most Recent", "Populor", "Price High", "Price Low"]
    const [sortByActive, setsortByActive] = useState(0);

    const subReview = ["4.5 and above", "4.0-4.5", "3.5-4.0", "3.0-3.5", "2.5-3.0", "2.0-2.5", "1.5-2.0", "0.5-1.0", "0-0.5"]
    const [subReviewActive, setsubReview] = useState(0)

    const [range, setRange] = useState([10, 2000])
    const handleRangeValue = (values) => {
        setRange(values)
    }

    return (
        <View className={`bg-white flex-col`} style={{ height: hp('98%') }}>
            <TabBar
                prefix={""}
                title={"Filter"}
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
            <ScrollView showsVerticalScrollIndicator={false}>

                <View className={`ml-4 my-5 `}>
                    <Text className={`font-semibold text-2xl pb-4`}>Brands</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>

                        {
                            brand.map((item, index) => {
                                let isActive = index == brandActive;
                                return (
                                    <TouchableOpacity
                                        key={index}
                                        onPress={() => setbrandActive(index)}
                                        className={`
                                    border border-gray-500 px-4 mr-4 mb-4 rounded-full py-2 
                                    ${isActive ? "bg-primary" : ""}
                                    `}>

                                        <Text className={`${isActive ? "text-white " : ""} capitalize font-bold`}>
                                            {item}

                                        </Text>

                                    </TouchableOpacity>
                                )
                            })
                        }
                    </ScrollView>
                </View>
                <View className={`ml-4 mb-5 `}>
                    <Text className={`font-semibold text-2xl pb-4`}>Gender</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>

                        {
                            gender.map((item, index) => {
                                let isActive = index == genderActive;
                                return (
                                    <TouchableOpacity
                                        key={index}
                                        onPress={() => setgenderActive(index)}
                                        className={`
                                    border border-gray-500 px-4 mr-4 mb-4 rounded-full py-2 
                                    ${isActive ? "bg-primary" : ""}
                                    `}>

                                        <Text className={`${isActive ? "text-white " : ""} capitalize font-bold`}>
                                            {item}

                                        </Text>

                                    </TouchableOpacity>
                                )
                            })
                        }
                    </ScrollView>
                </View>
                <View className={`ml-4 mb-5 `}>
                    <Text className={`font-semibold text-2xl pb-4`}>Sort By</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>

                        {
                            sortBy.map((item, index) => {
                                let isActive = index == sortByActive;
                                return (
                                    <TouchableOpacity
                                        key={index}
                                        onPress={() => setsortByActive(index)}
                                        className={`
                                    border border-gray-500 px-4 mr-4 mb-4 rounded-full py-2 
                                    ${isActive ? "bg-primary" : ""}
                                    `}>

                                        <Text className={`${isActive ? "text-white " : ""} capitalize font-bold`}>
                                            {item}

                                        </Text>


                                    </TouchableOpacity>
                                )
                            })
                        }
                    </ScrollView>
                </View>
                <View className={`mx-4 mb-5 `}>
                    <Text className={`font-semibold text-2xl pb-4`}>Pricing Range : <Text className={`text-xl`}>Rs {range[0]} to Rs {range[1]}</Text></Text>
                    <View className={`flex-col items-center`}>
                        <MultiSlider
                            values={range}
                            min={0}
                            max={range[1]}
                            step={30}
                            onValuesChange={handleRangeValue}
                            selectedStyle={{
                                backgroundColor: "#704f38"
                            }}
                            unselectedStyle={{
                                backgroundColor: "#eee5d8",
                                borderRadius: 4,
                            }}
                            trackStyle={{
                                height: 8,
                            }}
                            markerStyle={{
                                backgroundColor: '#704f38',
                                height: 20,
                                width: 20,
                                borderRadius: 10,
                                marginTop: 6,
                                borderWidth: 2,
                                borderColor: 'white'
                            }}
                        />
                        {/* Indicator below tthe slider*/}
                        <View className={`flex-row justify-between w-4/5`}>
                            {
                                Array.from({ length: 6 }, (_, index) => {
                                    // Calculate the value dynamically within the range
                                    const min = 10;
                                    const max = range[2000];
                                    const step = (max - min) / 5; // 5 steps for 6 values
                                    const value = Math.round(min + index * step);

                                    return (
                                        <Text key={index} className={`text-sm text-gray-500`}>
                                            Rs {value}
                                        </Text>
                                    )
                                })
                            }
                        </View>
                    </View>
                </View>
                <View className={`ml-4 `}>
                    <Text className={`font-semibold text-2xl pb-4`}>Reveiws</Text>
                </View>
                <View className={``}>
                    {
                        subReview.map((item, index) => {
                            let isActive = index == subReviewActive;
                            return (
                                <TouchableOpacity
                                    key={index}
                                    onPress={() => setsubReview(index)}
                                    className={`
                                 px-4 mr-4 mb-4 rounded-full py-2 items-center justify-between gap-2 flex-row                               
                                `}>
                                    <View className={`flex-row items-center gap-2 `}>
                                        <View className={`flex-row`}>

                                            <StarIcon size={24} color={"orange"} />
                                            <StarIcon size={24} color={"orange"} />
                                            <StarIcon size={24} color={"orange"} />
                                            <StarIcon size={24} color={"orange"} />
                                        </View>
                                        <Text className={` capitalize font-bold`}>
                                            {item}
                                        </Text>
                                    </View>
                                    <View className={`flex-row items-center gap-2 border ${isActive ? "border-primary" : "border-gray-500"} rounded-full p-1 size-6`}>
                                        <View className={`${isActive ? "bg-primary" : "bg-white"} w-full h-full rounded-full`}></View>
                                    </View>


                                </TouchableOpacity>

                            )
                        })
                    }
                </View>
            </ScrollView>

            <View className={`bg-white py-6 px-4 rounded-l-2xl border border-gray-300 rounded-r-2xl flex-row justify-between items-center gap-3 `}>
                <View className={` rounded-full bg-gray-300 flex-row justify-center items-center py-3 flex-1 `} >
                    <Text className={`text-primary text-lg font-bold`}>Reset Filter</Text>
                </View>
                <View className={` rounded-full bg-primary flex-row justify-center items-center py-3 flex-1`} >
                    <Text className={`text-white text-lg font-bold`}>Apply</Text>
                </View>
            </View>
        </View>
    )
}