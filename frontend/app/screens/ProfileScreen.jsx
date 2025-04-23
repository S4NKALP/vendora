import { View, Text, Image, TouchableOpacity, Pressable, ActivityIndicator } from 'react-native'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import TabBar from '../themes/TabBar'
import { ArrowRightStartOnRectangleIcon, ChevronLeftIcon, ChevronRightIcon, ClipboardDocumentListIcon, Cog6ToothIcon, CreditCardIcon, ExclamationCircleIcon, LockClosedIcon, PencilSquareIcon, UserIcon, UserPlusIcon } from 'react-native-heroicons/outline'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import pic from "../../assets/images/pic.jpg"
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
    BottomSheetModal,
    BottomSheetView,
    BottomSheetModalProvider,
} from '@gorhom/bottom-sheet';
import { BackHandler, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getUserData, logoutUser } from '../api';

export default function ProfileScreen() {
    const navigation = useNavigation();
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch user data when the screen loads
    useEffect(() => {
        const fetchUser = async () => {
            try {
                setLoading(true);
                const user = await getUserData();
                setUserData(user);
                setError(null);
            } catch (error) {
                console.error('Error fetching user data:', error);
                setError('Failed to load user profile');
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    const logout = async () => {
        try {
            setLoading(true);
            await logoutUser();
            navigation.navigate("SignIn");
        } catch (error) {
            Alert.alert('Logout Failed', 'Could not log out. Please try again.');
            console.error('Logout error:', error);
        } finally {
            setLoading(false);
        }
    };

    // ref
    const bottomSheetModalRef = useRef(null);

    // callbacks
    const handlePresentModalPress = useCallback(() => {
        bottomSheetModalRef.current?.present();
    }, []);

    useEffect(() => {
        const onBackPress = () => {
            if (bottomSheetModalRef.current) {
                bottomSheetModalRef.current.close(); // Dismiss the BottomSheetModal
                return true; // Prevent default back button behavior
            }
            return false; // Allow default back button behavior if modal is not open
        };

        const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);

        return () => backHandler.remove(); // Cleanup
    }, []);

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
                <ActivityIndicator size="large" color="#704f38" />
            </View>
        );
    }

    if (error) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
                <Text style={{ color: 'red', marginBottom: 20 }}>{error}</Text>
                <TouchableOpacity 
                    onPress={() => {
                        setLoading(true);
                        getUserData()
                            .then(user => {
                                setUserData(user);
                                setError(null);
                            })
                            .catch(err => setError('Failed to load user profile'))
                            .finally(() => setLoading(false));
                    }}
                    style={{ backgroundColor: '#704f38', padding: 10, borderRadius: 20 }}
                >
                    <Text style={{ color: 'white' }}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // Format user's name
    const fullName = userData ? 
        `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || userData.username : 
        'User';

    return (
        <GestureHandlerRootView>
            <View className={`bg-white `} style={{ height: hp('97%'), backgroundColor: 'white' }}>
                <TabBar
                    prefix={""}
                    title={"Profile"}
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
                <View className=" mx-4 mb-8 rounded-xl" >
                    <View className={`flex-row justify-center items-center`}>
                        <View className={`relative`}>
                            <Image source={pic} className="size-[110px] rounded-full " />
                            <View className={`absolute bottom-0 right-0 bg-primary border border-white rounded-full justify-center items-center`}>
                                <PencilSquareIcon color={"white"} size={23} />
                            </View>
                        </View>
                    </View>
                    <Text className={`text-center mt-3 font-bold text-xl`}>
                        {fullName}
                    </Text>
                    {userData?.email && (
                        <Text className={`text-center text-gray-500`}>
                            {userData.email}
                        </Text>
                    )}
                    {userData?.phone && (
                        <Text className={`text-center text-gray-500`}>
                            {userData.phone}
                        </Text>
                    )}
                    {userData?.address && (
                        <Text className={`text-center text-gray-500 mt-1`}>
                            {userData.address}
                        </Text>
                    )}
                </View>
                <TouchableOpacity 
                    onPress={() => { navigation.navigate('Complete your Profile') }}
                    className={`mx-4 flex-row items-center justify-between py-4 border-b border-gray-300`}
                >
                    <View className={`flex-row items-center gap-2 `}>
                        <UserIcon color={"#704f38"} size={24} />
                        <Text className={`text-lg font-semibold`}>Your Profile</Text>
                    </View>
                    <View className={`justify-center items-center`}>
                        <ChevronRightIcon color={"#704f38"} size={24} />
                    </View>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => { navigation.navigate('Payment Method') }} className={`mx-4 flex-row items-center justify-between py-4 border-b border-gray-300`}>
                    <View className={`flex-row items-center gap-2 `}>
                        <CreditCardIcon color={"#704f38"} size={24} />
                        <Text className={`text-lg font-semibold`}>Payment Methods</Text>
                    </View>
                    <View className={`justify-center items-center`}>
                        <ChevronRightIcon color={"#704f38"} size={24} />
                    </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { navigation.navigate('Order') }} className={`mx-4 flex-row items-center justify-between py-4 border-b border-gray-300`}>
                    <View className={`flex-row items-center gap-2 `}>
                        <ClipboardDocumentListIcon color={"#704f38"} size={24} />
                        <Text className={`text-lg font-semibold`}>My Order</Text>
                    </View>
                    <View className={`justify-center items-center`}>
                        <ChevronRightIcon color={"#704f38"} size={24} />
                    </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { navigation.navigate('Setting') }} className={`mx-4 flex-row items-center justify-between py-4 border-b border-gray-300`}>
                    <View className={`flex-row items-center gap-2 `}>
                        <Cog6ToothIcon color={"#704f38"} size={24} />
                        <Text className={`text-lg font-semibold`}>Settings</Text>
                    </View>
                    <View className={`justify-center items-center`}>
                        <ChevronRightIcon color={"#704f38"} size={24} />
                    </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { navigation.navigate('Help Center') }} className={`mx-4 flex-row items-center justify-between py-4 border-b border-gray-300`}>
                    <View className={`flex-row items-center gap-2 `}>
                        <ExclamationCircleIcon color={"#704f38"} size={24} />
                        <Text className={`text-lg font-semibold`}>Help Center</Text>
                    </View>
                    <View className={`justify-center items-center`}>
                        <ChevronRightIcon color={"#704f38"} size={24} />
                    </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { navigation.navigate('Privacy Policy') }} className={`mx-4 flex-row items-center justify-between py-4 border-b border-gray-300`}>
                    <View className={`flex-row items-center gap-2 `}>
                        <LockClosedIcon color={"#704f38"} size={24} />
                        <Text className={`text-lg font-semibold`}>Privacy Policy</Text>
                    </View>
                    <View className={`justify-center items-center`}>
                        <ChevronRightIcon color={"#704f38"} size={24} />
                    </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { navigation.navigate('Invite Friends') }} className={`mx-4 flex-row items-center justify-between py-4 border-b border-gray-300`}>
                    <View className={`flex-row items-center gap-2 `}>
                        <UserPlusIcon color={"#704f38"} size={24} />
                        <Text className={`text-lg font-semibold`}>Invites Friends</Text>
                    </View>
                    <View className={`justify-center items-center`}>
                        <ChevronRightIcon color={"#704f38"} size={24} />
                    </View>
                </TouchableOpacity>
                <BottomSheetModalProvider >
                    <TouchableOpacity onPress={handlePresentModalPress} className={`mx-4 flex-row items-center justify-between py-4 border-b border-gray-300`}>
                        <View className={`flex-row items-center gap-2 `}>
                            <ArrowRightStartOnRectangleIcon color={"#704f38"} size={24} />
                            <Text className={`text-lg font-semibold`}>Log Out</Text>
                        </View>
                        <View className={`justify-center items-center`}>
                            <ChevronRightIcon color={"#704f38"} size={24} />
                        </View>
                    </TouchableOpacity>
                    <BottomSheetModal
                        ref={bottomSheetModalRef}
                        handleIndicatorStyle={{
                            backgroundColor: "#e3e3e3",
                        }}
                        style={{
                            borderWidth: 2,
                            borderColor: "#e3e3e3",
                            borderRadius: 15
                        }}>
                        <BottomSheetView className={`items-center px-5 py-4 `}>
                            <View className={`w-full  items-center py-4 border-b border-gray-400`}>
                                <Text className={`text-xl font-semibold`}>LOG OUT</Text>
                            </View>
                            <View className={`py-4 gap-4`}>
                                <Text className={`text-center`}>Are you sure you want to Log Out?</Text>
                                <View className={`flex-row items-center w-full gap-2`}>
                                    <TouchableOpacity 
                                        onPress={() => bottomSheetModalRef.current?.close()}
                                        className={`flex-1 bg-white border border-primary flex-row items-center justify-center py-3 rounded-full`}
                                    >
                                        <Text className={`font-medium`}>Cancel</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity 
                                        onPress={logout} 
                                        disabled={loading}
                                        className={`flex-1 bg-primary border border-primary flex-row items-center justify-center py-3 rounded-full`}
                                    >
                                        {loading ? (
                                            <ActivityIndicator size="small" color="white" />
                                        ) : (
                                            <Text className={`text-white font-medium`}>Yes, Logout</Text>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </BottomSheetView>
                    </BottomSheetModal>
                </BottomSheetModalProvider>
            </View>
        </GestureHandlerRootView>
    );
}