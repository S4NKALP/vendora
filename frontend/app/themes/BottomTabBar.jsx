import { View, Text } from 'react-native'
import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import HomeScreen from '../screens/HomeScreen'
import ProfileScreen from '../screens/ProfileScreen'
import WishlistScreen from '../screens/WishlistScreen'
import MyCartScreen from '../screens/MyCartScreen'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Ionicons from 'react-native-vector-icons/Ionicons'; // For icons
import { BlurView } from 'expo-blur'
import { useNavigation } from '@react-navigation/native'
import { useCart } from '../context/CartContext'

const Tab = createBottomTabNavigator()

const BottomTabBar = () => {
    const navigator = useNavigation()
    const { cartCount } = useCart()

    return (
        // <BlurView
        //     style={{ flex: 1 }}
        //     blurType="dark"
        //     blurAmount={10}
        //     reducedTransparencyFallbackColor="#1f2029"
        // >
        <Tab.Navigator  screenOptions={({ route }) => ({
            headerShown: false,
            
            tabBarStyle: {
                // position: 'absolute',
                // backgroundColor: 'transparent', 
                backgroundColor: "#1f2029",
                marginHorizontal: 10,
                borderRadius: 40,
                height: 80,
                display: route.name === 'MyCart'|| route.name === "Profile" ? "none" : "flex",
                marginBottom: 8,
            },
           
            // freezeOnBlur:200,                
            tabBarShowLabel: false,
            tabBarActiveTintColor: "#704f38",
            tabBarInactiveTintColor: "gray",



            tabBarIcon: ({ focused, color }) => {
                let iconName;
                if (route.name === 'Home') {
                    iconName = focused ? 'home' : 'home-outline';
                } else if (route.name === 'Wishlist') {
                    iconName = focused ? 'heart' : 'heart-outline';
                } else if (route.name === 'Profile') {
                    iconName = focused ? 'person' : 'person-outline';
                }
                else if (route.name === 'MyCart') {
                    iconName = focused ? 'cart' : 'cart-outline';
                }
                return (

                    <View
                        className={` ${focused ? "bg-white" : ""}  rounded-full justify-center items-center relative`}
                        style={{ height: 60, width: 60, marginTop: 40 }}
                    >
                        <Ionicons name={iconName} size={35} color={color} />
                        {route.name === "MyCart" && cartCount > 0 && (
                            <View className="absolute top-0 right-0 bg-red-500 rounded-full px-2 py-1">
                                <Text className="text-white text-xs font-bold">
                                    {cartCount}
                                </Text>
                            </View>
                        )}
                    </View>
                )
            },
        })}
        >
            <Tab.Screen name='Home' component={HomeScreen} />
            <Tab.Screen name='Wishlist' component={WishlistScreen} />
            <Tab.Screen name='MyCart' component={MyCartScreen} />
            <Tab.Screen name='Profile' component={ProfileScreen} />
        </Tab.Navigator>
        // </BlurView>
    )
}

export default BottomTabBar