import { View, Text, TouchableOpacity, Alert, TextInput, ActivityIndicator, Modal } from 'react-native'
import React, { useState } from 'react'
import TabBar from '../themes/TabBar'
import { ChevronLeftIcon, ChevronRightIcon, CreditCardIcon, KeyIcon, UserCircleIcon, EyeIcon, EyeSlashIcon } from 'react-native-heroicons/outline'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useNavigation } from '@react-navigation/native';
import { deleteAccount, logout } from '../api';

export default function SettingScreen() {
    const navigation = useNavigation();
    const [loading, setLoading] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleDeleteAccount = async () => {
        if (!password) {
            Alert.alert('Error', 'Please enter your password');
            return;
        }

        Alert.alert(
            'Delete Account',
            'Are you sure you want to delete your account? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'Delete', 
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setLoading(true);
                            await deleteAccount(password);
                            await logout();
                            Alert.alert('Success', 'Your account has been deleted');
                            navigation.navigate('SignIn');
                        } catch (error) {
                            console.error('Delete account error:', error);
                            Alert.alert('Error', error.response?.data?.error || 'Failed to delete account');
                        } finally {
                            setLoading(false);
                            setShowDeleteModal(false);
                            setPassword('');
                        }
                    }
                }
            ]
        );
    };

    return (
        <View className="flex-1 bg-white">
            <TabBar
                prefix={""}
                title={"Settings"}
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
            
            <View className="px-4 pt-6">
                <TouchableOpacity className="flex-row items-center justify-between py-3">
                    <View className="flex-row items-center gap-2">
                        <UserCircleIcon color={"#704f38"} size={25} />
                        <Text className="text-lg font-semibold">Notification Settings</Text>
                    </View>
                    <ChevronRightIcon color={"#704f38"} size={24} />
                </TouchableOpacity>
                <View className="h-[0.4px] bg-black/20" />

                <TouchableOpacity 
                    onPress={() => navigation.navigate('Password Manager')} 
                    className="flex-row items-center justify-between py-3"
                >
                    <View className="flex-row items-center gap-2">
                        <KeyIcon color={"#704f38"} size={25} />
                        <Text className="text-lg font-semibold">Password Manager</Text>
                    </View>
                    <ChevronRightIcon color={"#704f38"} size={24} />
                </TouchableOpacity>
                <View className="h-[0.4px] bg-black/20" />

                <TouchableOpacity 
                    onPress={() => setShowDeleteModal(true)} 
                    className="flex-row items-center justify-between py-3"
                >
                    <View className="flex-row items-center gap-2">
                        <CreditCardIcon color={"#704f38"} size={25} />
                        <Text className="text-lg font-semibold text-red-500">Delete Account</Text>
                    </View>
                    <ChevronRightIcon color={"#704f38"} size={24} />
                </TouchableOpacity>
                <View className="h-[0.4px] bg-black/20" />
            </View>

            {/* Delete Account Modal */}
            <Modal
                visible={showDeleteModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowDeleteModal(false)}
            >
                <View className="flex-1 justify-center items-center bg-black/50">
                    <View className="bg-white w-[90%] rounded-2xl p-5">
                        <Text className="text-xl font-bold text-center mb-3">Delete Account</Text>
                        <Text className="text-center mb-4 text-gray-600">
                            This action cannot be undone. Please enter your password to confirm.
                        </Text>
                        
                        <View className="flex-row items-center justify-between p-3 border border-gray-300 rounded-xl mb-4">
                            <TextInput
                                placeholder="Enter your password"
                                secureTextEntry={!showPassword}
                                value={password}
                                onChangeText={setPassword}
                                className="flex-1 font-semibold"
                            />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                {showPassword ? (
                                    <EyeIcon size={25} color={"black"} />
                                ) : (
                                    <EyeSlashIcon size={25} color={"black"} />
                                )}
                            </TouchableOpacity>
                        </View>
                        
                        <View className="flex-row justify-between gap-3">
                            <TouchableOpacity 
                                onPress={() => {
                                    setShowDeleteModal(false);
                                    setPassword('');
                                }}
                                className="flex-1 bg-gray-200 py-3 rounded-xl"
                            >
                                <Text className="text-center font-semibold">Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                onPress={handleDeleteAccount}
                                disabled={loading}
                                className="flex-1 bg-red-500 py-3 rounded-xl"
                            >
                                {loading ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <Text className="text-center text-white font-semibold">Delete</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    )
}