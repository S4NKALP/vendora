import { View, Text, Image, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native'
import React, { useState, useEffect } from 'react'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import TabBar from '../themes/TabBar';
import { ChevronLeftIcon, PencilSquareIcon } from 'react-native-heroicons/outline';
import { TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getUserData, updateUserProfile, updateProfilePicture, getGenderOptions } from '../api';
import * as ImagePicker from 'expo-image-picker';
import { Dropdown } from 'react-native-element-dropdown';

const GENDER_OPTIONS = [
    { label: 'Male', value: 'Male' },
    { label: 'Female', value: 'Female' },
    { label: 'Other', value: 'Other' }
];

export default function CompleteYourProfileScreen() {
    const navigation = useNavigation();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [user, setUser] = useState(null);
    const [genderOptions, setGenderOptions] = useState(GENDER_OPTIONS);
    const [formData, setFormData] = useState({
        username: '',
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        gender: '',
        address: ''
    });
    const [showGenderPicker, setShowGenderPicker] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [userData, genderOptions] = await Promise.all([
                getUserData(),
                getGenderOptions()
            ]);
            
            console.log('User Data:', userData);
            console.log('Gender Options:', genderOptions);
            console.log('User Gender:', userData?.gender);
            
            if (userData) {
                setUser(userData);
                setFormData({
                    username: userData.username || '',
                    first_name: userData.first_name || '',
                    last_name: userData.last_name || '',
                    email: userData.email || '',
                    phone: userData.phone || '',
                    gender: userData.gender || '',
                    address: userData.address || ''
                });
            }
            
            setGenderOptions(genderOptions);
        } catch (error) {
            console.error('Error loading data:', error);
            Alert.alert('Error', 'Failed to load profile data');
            setGenderOptions(GENDER_OPTIONS);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async () => {
        setSaving(true);
        try {
            const updatedUser = await updateUserProfile({
                username: formData.username,
                first_name: formData.first_name,
                last_name: formData.last_name,
                email: formData.email,
                phone: formData.phone,
                gender: formData.gender,
                address: formData.address
            });
            setUser(updatedUser);
            Alert.alert('Success', 'Profile updated successfully');
        } catch (error) {
            console.error('Error updating profile:', error);
            Alert.alert('Error', 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const handleImagePick = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission required', 'Please grant permission to access your photos');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaType.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled) {
                setLoading(true);
                try {
                    const updatedUser = await updateProfilePicture(result.assets[0].uri);
                    if (updatedUser) {
                        setUser(updatedUser);
                        Alert.alert('Success', 'Profile picture updated successfully');
                    }
                } catch (error) {
                    console.error('Profile picture update error:', error.response?.data || error);
                    Alert.alert('Error', 'Failed to update profile picture');
                } finally {
                    setLoading(false);
                }
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('Error', 'Failed to pick image');
        }
    };

    const handleGenderSelect = (item) => {
        console.log('Selected gender:', item);
        setFormData(prev => ({
            ...prev,
            gender: item.value
        }));
        setShowGenderPicker(false);
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#704f38" />
            </View>
        );
    }

    return (
        <View className={`bg-white`} style={{ height: hp('97%') }}>
            <TabBar
                prefix={""}
                title={""}
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
            <ScrollView 
                className="flex-1"
                contentContainerStyle={{ paddingBottom: 20 }}
                showsVerticalScrollIndicator={false}
            >
                <View className={`items-center justify-between py-9 mx-4`}>
                    <Text className={`text-2xl font-bold`}>Complete Your Profile</Text>
                    <Text className={`text-gray-500 text-center`} style={{ width: wp('70%') }}> 
                        Don't worry, only you can see your personal data. No one else will be able to see it.
                    </Text>
                </View>
                <View className="mx-4 mb-8 rounded-xl">
                    <View className={`flex-row justify-center items-center`}>
                        <View className={`relative`}>
                            <Image 
                                source={user?.profile_picture ? { uri: user.profile_picture } : require('../../assets/images/pic.jpg')} 
                                className="size-[110px] rounded-full"
                            />
                            <TouchableOpacity 
                                onPress={handleImagePick}
                                className={`absolute bottom-0 right-0 bg-primary border border-white rounded-full justify-center items-center p-2`}
                            >
                                <PencilSquareIcon color={"white"} size={23} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
                <View className={`mx-4 mb-5`}>
                    <Text className={`text-lg`}>Username</Text>
                    <View className={`px-4 border border-gray-300 rounded-full mt-2`}>
                        <TextInput 
                            placeholder='Username'
                            value={formData.username}
                            onChangeText={(text) => setFormData({...formData, username: text})}
                        />
                    </View>
                </View>
                <View className={`mx-4 mb-5`}>
                    <Text className={`text-lg`}>First Name</Text>
                    <View className={`px-4 border border-gray-300 rounded-full mt-2`}>
                        <TextInput 
                            placeholder='First Name'
                            value={formData.first_name}
                            onChangeText={(text) => setFormData({...formData, first_name: text})}
                        />
                    </View>
                </View>
                <View className={`mx-4 mb-5`}>
                    <Text className={`text-lg`}>Last Name</Text>
                    <View className={`px-4 border border-gray-300 rounded-full mt-2`}>
                        <TextInput 
                            placeholder='Last Name'
                            value={formData.last_name}
                            onChangeText={(text) => setFormData({...formData, last_name: text})}
                        />
                    </View>
                </View>
                <View className={`mx-4 mb-5`}>
                    <Text className={`text-lg`}>Gender</Text>
                    <View className="relative">
                        <Dropdown
                            style={styles.dropdown}
                            placeholderStyle={styles.placeholderStyle}
                            selectedTextStyle={styles.selectedTextStyle}
                            inputSearchStyle={styles.inputSearchStyle}
                            iconStyle={styles.iconStyle}
                            data={genderOptions}
                            search={false}
                            maxHeight={300}
                            labelField="label"
                            valueField="value"
                            placeholder="Select Gender"
                            value={formData.gender}
                            onChange={handleGenderSelect}
                            containerStyle={styles.containerStyle}
                            itemContainerStyle={styles.itemContainerStyle}
                            itemTextStyle={styles.itemTextStyle}
                            activeColor="#f3f4f6"
                        />
                    </View>
                </View>
                <View className={`mx-4 mb-5`}>
                    <Text className={`text-lg`}>Email</Text>
                    <View className={`px-4 border border-gray-300 rounded-full mt-2`}>
                        <TextInput 
                            placeholder='Email'
                            value={formData.email}
                            onChangeText={(text) => setFormData({...formData, email: text})}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>
                </View>
                <View className={`mx-4 mb-5`}>
                    <Text className={`text-lg`}>Phone</Text>
                    <View className={`px-4 border border-gray-300 rounded-full mt-2`}>
                        <TextInput 
                            placeholder='Phone'
                            value={formData.phone}
                            onChangeText={(text) => setFormData({...formData, phone: text})}
                            keyboardType="phone-pad"
                        />
                    </View>
                </View>
                <View className={`mx-4 mb-5`}>
                    <Text className={`text-lg`}>Address</Text>
                    <View className={`px-4 border border-gray-300 rounded-full mt-2`}>
                        <TextInput 
                            placeholder='Address'
                            value={formData.address}
                            onChangeText={(text) => setFormData({...formData, address: text})}
                            keyboardType='phone-pad'
                        />
                    </View>
                </View>

                <TouchableOpacity 
                    onPress={handleUpdateProfile}
                    disabled={saving}
                    className="mx-4 mb-4 rounded-full bg-primary flex-row justify-center items-center mt-4" 
                    style={{ height: hp("5%") }}
                >
                    {saving ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className="text-white text-xl font-semibold">Complete Profile</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = {
    dropdown: {
        height: 50,
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 25,
        paddingHorizontal: 16,
        marginTop: 8,
        backgroundColor: 'white',
    },
    placeholderStyle: {
        fontSize: 16,
        color: 'gray',
    },
    selectedTextStyle: {
        fontSize: 16,
        color: 'black',
    },
    iconStyle: {
        width: 20,
        height: 20,
    },
    inputSearchStyle: {
        height: 40,
        fontSize: 16,
    },
    containerStyle: {
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#d1d5db',
        marginTop: 8,
        zIndex: 1000,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        backgroundColor: 'white',
    },
    itemContainerStyle: {
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    itemTextStyle: {
        fontSize: 16,
        color: 'black',
    },
};