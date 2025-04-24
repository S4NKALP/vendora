import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native'
import React, { useState, useEffect } from 'react'
import { widthPercentageToDP as wp, heightPercentageToDP as hp, heightPercentageToDP } from 'react-native-responsive-screen';
import TabBar from '../themes/TabBar';
import { ChevronLeftIcon } from 'react-native-heroicons/outline';
import Icon from "react-native-vector-icons/MaterialCommunityIcons"
import { getCoupons, validateCoupon } from '../api';
import { useNavigation } from '@react-navigation/native';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function CouponScreen() {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation();
    const { cartTotal } = useCart();
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        try {
            setLoading(true);
            const data = await getCoupons();
            setCoupons(data);
        } catch (error) {
            console.error('Error fetching coupons:', error);
            Alert.alert('Error', 'Failed to load coupons. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleCopyCode = async (coupon) => {
        try {
            if (!isAuthenticated) {
                Alert.alert('Login Required', 'Please login to use coupons');
                navigation.navigate('Login');
                return;
            }

            const result = await validateCoupon(coupon.code, cartTotal);
            
            if (result.valid) {
                // Copy the code to clipboard
                // You might want to use Clipboard API here
                Alert.alert('Success', `Coupon code ${coupon.code} copied to clipboard!`);
            } else {
                Alert.alert('Invalid Coupon', result.message || 'This coupon cannot be applied to your cart.');
            }
        } catch (error) {
            console.error('Error validating coupon:', error);
            Alert.alert('Error', 'Failed to validate coupon. Please try again later.');
        }
    };

    return (
        <View className={`bg-white flex-col`} style={{ height: hp('98%') }}>

            <TabBar
                prefix={""}
                title={"Coupon"}
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
            <ScrollView showsVerticalScrollIndicator={false} className={`mx-4 `}>
                <Text className={`font-medium text-xl my-5`}>Best offers for you</Text>
                <View className={``}>
                    {loading ? (
                        <Text className="text-center py-4">Loading coupons...</Text>
                    ) : coupons.length > 0 ? (
                        coupons.map((item, index) => {
                            return (
                                <View key={index} className={`w-full border border-gray-500 rounded-2xl mb-7 `}>
                                    <View className={`px-8 py-6 flex-col gap-2`}>
                                        <Text className={`text-2xl font-medium`}>{item.code}</Text>
                                        <Text className={`text-gray-500 text-lg`}>Add items worth ${item.min_purchase} more to unlock</Text>
                                        <View className={`flex-row items-center gap-3`}>
                                            <Icon name='brightness-percent' color={`#704f38`} size={24} />
                                            <Text className={`capitalize font-bold text-lg`}>
                                                {item.discount_type === 'percentage' 
                                                    ? `${item.discount_value}% OFF` 
                                                    : `$${item.discount_value} OFF`}
                                            </Text>
                                        </View>
                                    </View>
                                    <TouchableOpacity 
                                        className={`bg-gray-200 w-full flex-row justify-center items-center py-4 rounded-b-2xl`}
                                        onPress={() => handleCopyCode(item)}
                                    >
                                        <Text className={`text-primary text-2xl font-bold`}>COPY CODE</Text>
                                    </TouchableOpacity>

                                    {/* this line of code make the semicircle i both side of container */}
                                    <View className={`absolute top-14 flex-row  w-full  `}>
                                        <View className={`flex-row justify-between w-full `}>
                                            <View className={`size-10 absolute -left-5 border rounded-t-full flex justify-center items-center bg-white transform rotate-90`}></View>
                                            <View className={`size-10 absolute -right-5 border rounded-t-full flex justify-center items-center bg-white transform -rotate-90`}></View>
                                        </View>
                                    </View>
                                </View>
                            )
                        })
                    ) : (
                        <Text className="text-center py-4">No coupons available at the moment.</Text>
                    )}
                </View>
            </ScrollView>
        </View>
    )
}