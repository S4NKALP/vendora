import { View, Text, TouchableOpacity, ScrollView } from 'react-native'
import React, { useState, useEffect } from 'react'
import { ChevronLeftIcon } from 'react-native-heroicons/outline'
import TabBar from '../themes/TabBar'
import { StarIcon } from 'react-native-heroicons/solid'
import { widthPercentageToDP as wp, heightPercentageToDP as hp, heightPercentageToDP } from 'react-native-responsive-screen';
import MultiSlider from '@ptomasroos/react-native-multi-slider'
import { useNavigation, useRoute } from '@react-navigation/native'
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function FilterScreen() {
    const navigation = useNavigation()
    const route = useRoute()
    const { activeFilters } = route.params || {};

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

    // Initialize filters from activeFilters if available
    useEffect(() => {
        if (activeFilters) {
            // Set brand filter
            if (activeFilters.brand) {
                const brandIndex = brand.findIndex(b => b.toLowerCase() === activeFilters.brand.toLowerCase());
                if (brandIndex !== -1) setbrandActive(brandIndex);
            }
            
            // Set gender filter
            if (activeFilters.gender) {
                const genderIndex = gender.findIndex(g => g.toLowerCase() === activeFilters.gender.toLowerCase());
                if (genderIndex !== -1) setgenderActive(genderIndex);
            }
            
            // Set sort by filter
            if (activeFilters.sortBy) {
                const sortIndex = sortBy.findIndex(s => s === activeFilters.sortBy);
                if (sortIndex !== -1) setsortByActive(sortIndex);
            }
            
            // Set review filter
            if (activeFilters.subReview) {
                const reviewIndex = subReview.findIndex(r => r === activeFilters.subReview);
                if (reviewIndex !== -1) setsubReview(reviewIndex);
            }
            
            // Set price range
            if (activeFilters.range) {
                setRange(activeFilters.range);
            }
        }
    }, [activeFilters]);

    const handleReset = () => {
        setbrandActive(0);
        setgenderActive(0);
        setsortByActive(0);
        setsubReview(0);
        setRange([10, 2000]);
    };

    const handleApply = async () => {
        // Save filter settings to AsyncStorage
        const filterSettings = {
            brand: brand[brandActive],
            gender: gender[genderActive],
            sortBy: sortBy[sortByActive],
            subReview: subReview[subReviewActive]
        };
        
        try {
            await AsyncStorage.setItem('filterSettings', JSON.stringify(filterSettings));
            // Navigate back to HomeScreen
            navigation.goBack();
        } catch (error) {
            console.error('Error saving filter settings:', error);
            navigation.goBack();
        }
    };

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
                <TouchableOpacity 
                    onPress={handleReset}
                    className={` rounded-full bg-gray-300 flex-row justify-center items-center py-3 flex-1 `} 
                >
                    <Text className={`text-primary text-lg font-bold`}>Reset Filter</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    onPress={handleApply}
                    className={` rounded-full bg-primary flex-row justify-center items-center py-3 flex-1`} 
                >
                    <Text className={`text-white text-lg font-bold`}>Apply</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}