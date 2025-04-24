import { View, Text, TextInput, TouchableOpacity, Image, ActivityIndicator } from 'react-native'
import React, { useState } from 'react'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { EyeIcon, EyeSlashIcon } from 'react-native-heroicons/outline';
import { login } from '../api';
import { useNavigation } from '@react-navigation/native';
import { STORAGE_KEYS } from '../constants/storageKeys';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SignInScreen() {
    const navigation = useNavigation();
    
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    // Form validation
    const validateForm = () => {
        if (!username.trim()) {
            setError('Username is required');
            return false;
        }
        
        if (!password) {
            setError('Password is required');
            return false;
        }
        
        return true;
    };
    
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };
    
    const auth = async () => {
        // Clear previous errors
        setError(null);
        
        // Validate form before submission
        if (!validateForm()) {
            return;
        }
        
        setLoading(true);
        
        try {
            // Call login with credentials
            const result = await login({ username, password });
            
            if (result && result.token) {
                console.log('Login successful');
                navigation.navigate("Main");
            } else {
                // Display the error message returned from the API
                setError(result.error || 'Login failed. Please try again.');
            }
        } catch (error) {
            console.error('Login error:', error);
            // Extract error message if available
            const errorMessage = error.response?.data?.message || 
                                error.message || 
                                'Login failed. Please try again.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="bg-white" style={{ height: hp("98%") }}>
            <View className="py-9 my-6 items-center">
                <Text className="text-2xl font-bold my-4">Sign In</Text>
                <Text>Hi! Welcome Back, you've been missed</Text>
            </View>

            {error && (
                <View className="mx-4 p-3 bg-red-100 rounded-lg mb-4">
                    <Text className="text-red-500 text-center">{error}</Text>
                </View>
            )}

            <View className="mx-4">
                <Text className="font-semibold">Username</Text>
                <View className={`border ${error && !username.trim() ? 'border-red-500' : 'border-gray-300'} rounded-full p-2 mt-3`}>
                    <TextInput
                        placeholder='Enter your username'
                        value={username}
                        onChangeText={(text) => {
                            setUsername(text);
                            if (error) setError(null);
                        }}
                        autoCapitalize="none"
                    />
                </View>
            </View>

            <View className="mx-4 mt-5">
                <Text className="font-semibold">Password</Text>
            </View>
            <View className={`mx-4 flex-row items-center mt-2 justify-between p-2 border ${error && !password ? 'border-red-500' : 'border-gray-300'} rounded-full`}>
                <View className="flex-row items-center flex-1">
                    <TextInput
                        secureTextEntry={!showPassword}
                        value={password}
                        placeholder='Enter your password'
                        onChangeText={(text) => {
                            setPassword(text);
                            if (error) setError(null);
                        }}
                        className="font-semibold flex-1"
                    />
                </View>
                <TouchableOpacity onPress={togglePasswordVisibility} className="justify-center items-center p-2">
                    {showPassword ? (
                        <EyeIcon size={25} color={"black"} />
                    ) : (
                        <EyeSlashIcon size={25} color={"black"} />
                    )}
                </TouchableOpacity>
            </View>

            <View className="mt-3 mx-4 flex-row justify-end my-4">
                <TouchableOpacity>
                    <Text className="text-left border-b text-primary border-primary font-semibold">
                        Forgot Password?
                    </Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity
                onPress={auth}
                className={`${loading ? 'bg-primary/70' : 'bg-primary'} mx-4 p-5 items-center rounded-full mt-6`}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator size="small" color="#fff" />
                ) : (
                    <Text className="text-2xl text-white">Sign In</Text>
                )}
            </TouchableOpacity>

            <View className="items-center mt-8">
                <Text className="text-gray-500">Or sign in with</Text>
            </View>

            <View className="mb-4 flex-row justify-center items-center gap-4 p-4">
                <TouchableOpacity>
                    <Image
                        source={{ uri: "https://1000logos.net/wp-content/uploads/2016/10/Apple-Logo.png" }}
                        className="w-10 h-10 border rounded-full border-gray-300"
                    />
                </TouchableOpacity>
                <TouchableOpacity>
                    <Image
                        source={{ uri: "https://e7.pngegg.com/pngimages/168/533/png-clipart-google-logo-google-logo-google-home-google-now-google-plus-company-text-thumbnail.png" }}
                        className="w-10 h-10 border rounded-full border-gray-300"
                    />
                </TouchableOpacity>
                <TouchableOpacity>
                    <Image
                        source={{ uri: "https://downloadr2.apkmirror.com/wp-content/uploads/2023/09/90/650c50b6190bf_com.facebook.lite.png" }}
                        className="w-10 h-10 border rounded-full border-gray-300"
                    />
                </TouchableOpacity>
            </View>
            
            <View className="flex-row justify-center mt-2 mb-6">
                <Text className="text-gray-500">Don't have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                    <Text className="text-primary font-semibold">Sign Up</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}