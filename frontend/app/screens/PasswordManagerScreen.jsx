import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native'
import React, { useState } from 'react'
import TabBar from '../themes/TabBar'
import { ChevronLeftIcon, EyeSlashIcon, EyeIcon } from 'react-native-heroicons/outline'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useNavigation } from '@react-navigation/native';
import { updatePassword } from '../api';

export default function PasswordManagerScreen() {
    const navigation = useNavigation();
    const [loading, setLoading] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const handlePasswordChange = async () => {
        // Validate passwords
        if (!passwords.currentPassword || !passwords.newPassword || !passwords.confirmPassword) {
            Alert.alert('Error', 'Please fill in all password fields');
            return;
        }

        if (passwords.newPassword !== passwords.confirmPassword) {
            Alert.alert('Error', 'New passwords do not match');
            return;
        }

        if (passwords.newPassword.length < 8) {
            Alert.alert('Error', 'New password must be at least 8 characters long');
            return;
        }

        try {
            setLoading(true);
            await updatePassword(passwords.currentPassword, passwords.newPassword);
            Alert.alert('Success', 'Password updated successfully');
            navigation.goBack();
        } catch (error) {
            console.error('Password update error:', error);
            Alert.alert('Error', error.response?.data?.error || 'Failed to update password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className={`bg-white flex-col`} style={{ height: hp("98%") }}>
            <TabBar
                prefix={""}
                title={"Password Manager"}
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
            <View className={`flex-1`}>
                <View className={`mx-4 mt-5`}>
                    <Text className={`font-semibold`}>Current Password</Text>
                </View>
                <View className={`mx-4 flex-row items-center mt-2 justify-between p-2 border border-gray-300 rounded-2xl`}>
                    <View className={`flex-row items-center gap-2 flex-1`}>
                        <TextInput 
                            placeholder='Enter current password'
                            className={`font-semibold flex-1`}
                            secureTextEntry={!showCurrentPassword}
                            value={passwords.currentPassword}
                            onChangeText={(text) => setPasswords(prev => ({...prev, currentPassword: text}))}
                        />
                    </View>
                    <TouchableOpacity onPress={() => setShowCurrentPassword(!showCurrentPassword)}>
                        {showCurrentPassword ? (
                            <EyeIcon size={25} color={"black"} />
                        ) : (
                            <EyeSlashIcon size={25} color={"black"} />
                        )}
                    </TouchableOpacity>
                </View>

                <View className={`mx-4 mt-5`}>
                    <Text className={`font-semibold`}>New Password</Text>
                </View>
                <View className={`mx-4 flex-row items-center mt-2 justify-between p-2 border border-gray-300 rounded-2xl`}>
                    <View className={`flex-row items-center gap-2 flex-1`}>
                        <TextInput 
                            placeholder='Enter new password'
                            className={`font-semibold flex-1`}
                            secureTextEntry={!showNewPassword}
                            value={passwords.newPassword}
                            onChangeText={(text) => setPasswords(prev => ({...prev, newPassword: text}))}
                        />
                    </View>
                    <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
                        {showNewPassword ? (
                            <EyeIcon size={25} color={"black"} />
                        ) : (
                            <EyeSlashIcon size={25} color={"black"} />
                        )}
                    </TouchableOpacity>
                </View>

                <View className={`mx-4 mt-5`}>
                    <Text className={`font-semibold`}>Confirm New Password</Text>
                </View>
                <View className={`mx-4 flex-row items-center mt-2 justify-between p-2 border border-gray-300 rounded-2xl`}>
                    <View className={`flex-row items-center gap-2 flex-1`}>
                        <TextInput 
                            placeholder='Confirm new password'
                            className={`font-semibold flex-1`}
                            secureTextEntry={!showConfirmPassword}
                            value={passwords.confirmPassword}
                            onChangeText={(text) => setPasswords(prev => ({...prev, confirmPassword: text}))}
                        />
                    </View>
                    <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                        {showConfirmPassword ? (
                            <EyeIcon size={25} color={"black"} />
                        ) : (
                            <EyeSlashIcon size={25} color={"black"} />
                        )}
                    </TouchableOpacity>
                </View>
            </View>

            <View className={`bg-white px-4 rounded-tl-2xl border rounded-tr-2xl gap-3 py-3 border-gray-300`}>
                <TouchableOpacity 
                    className={`border rounded-full bg-primary flex-row justify-center items-center`} 
                    style={{ height: hp('5%') }}
                    onPress={handlePasswordChange}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className={`text-white text-lg font-semibold`}>Change Password</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    )
}