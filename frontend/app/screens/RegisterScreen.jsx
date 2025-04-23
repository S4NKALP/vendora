import { View, Text, TextInput, TouchableOpacity, Image, ActivityIndicator, ScrollView } from 'react-native'
import React, { useState } from 'react'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { EyeIcon, EyeSlashIcon } from 'react-native-heroicons/outline';
import { registerUser } from '../api';
import { useNavigation } from '@react-navigation/native';

export default function RegisterScreen() {
    const navigation = useNavigation();
    
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        first_name: "",
        last_name: "",
        phone: "",
        address: ""
    });
    
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    const validateForm = () => {
        if (!formData.username.trim()) {
            setError('Username is required');
            return false;
        }
        
        if (!formData.email.trim()) {
            setError('Email is required');
            return false;
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError('Invalid email address');
            return false;
        }
        
        if (!formData.password) {
            setError('Password is required');
            return false;
        }
        
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long');
            return false;
        }
        
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return false;
        }
        
        if (!formData.first_name.trim() || !formData.last_name.trim()) {
            setError('First and last name are required');
            return false;
        }
        
        return true;
    };
    
    const handleChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        
        if (error) setError(null);
    };
    
    const handleRegister = async () => {
        // Clear previous errors
        setError(null);
        
        // Validate form before submission
        if (!validateForm()) {
            return;
        }
        
        setLoading(true);
        
        try {
            // Create data object excluding confirmPassword which isn't needed for API
            const userData = {
                username: formData.username,
                email: formData.email,
                password: formData.password,
                first_name: formData.first_name,
                last_name: formData.last_name,
                phone: formData.phone || null,
                address: formData.address || ""
            };
            
            const response = await registerUser(userData);
            navigation.navigate("SignIn");
        } catch (error) {
            // Handle different error types
            if (error.response) {
                // Server responded with an error status code
                if (error.response.status === 400) {
                    if (error.response.data?.username) {
                        setError('Username already exists');
                    } else if (error.response.data?.email) {
                        setError('Email already exists');
                    } else {
                        setError(error.response.data?.message || 'Invalid registration data');
                    }
                } else if (error.response.status >= 500) {
                    setError('Server error. Please try again later');
                } else {
                    setError(`Registration failed: ${error.response.data?.message || 'Unknown error'}`);
                }
            } else if (error.request) {
                // Request was made but no response received
                setError('Network error. Please check your connection');
            } else {
                // Something happened in setting up the request
                setError(`Registration failed: ${error.message || 'Unknown error'}`);
            }
            
            console.error('Registration error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView className="bg-white" contentContainerStyle={{ paddingBottom: 30 }}>
            <View className="py-6 items-center">
                <Text className="text-2xl font-bold my-4">Create Account</Text>
                <Text>Fill the details and create your account</Text>
            </View>

            {error && (
                <View className="mx-4 p-3 bg-red-100 rounded-lg mb-4">
                    <Text className="text-red-500 text-center">{error}</Text>
                </View>
            )}

            <View className="mx-4 mt-2">
                <Text className="font-semibold">First Name</Text>
                <View className={`border ${error && !formData.first_name.trim() ? 'border-red-500' : 'border-gray-300'} rounded-full p-2 mt-2`}>
                    <TextInput
                        placeholder='Enter your first name'
                        value={formData.first_name}
                        onChangeText={(text) => handleChange('first_name', text)}
                    />
                </View>
            </View>

            <View className="mx-4 mt-3">
                <Text className="font-semibold">Last Name</Text>
                <View className={`border ${error && !formData.last_name.trim() ? 'border-red-500' : 'border-gray-300'} rounded-full p-2 mt-2`}>
                    <TextInput
                        placeholder='Enter your last name'
                        value={formData.last_name}
                        onChangeText={(text) => handleChange('last_name', text)}
                    />
                </View>
            </View>

            <View className="mx-4 mt-3">
                <Text className="font-semibold">Username</Text>
                <View className={`border ${error && !formData.username.trim() ? 'border-red-500' : 'border-gray-300'} rounded-full p-2 mt-2`}>
                    <TextInput
                        placeholder='Enter your username'
                        value={formData.username}
                        onChangeText={(text) => handleChange('username', text)}
                        autoCapitalize="none"
                    />
                </View>
            </View>

            <View className="mx-4 mt-3">
                <Text className="font-semibold">Email</Text>
                <View className={`border ${error && (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) ? 'border-red-500' : 'border-gray-300'} rounded-full p-2 mt-2`}>
                    <TextInput
                        placeholder='Enter your email'
                        value={formData.email}
                        onChangeText={(text) => handleChange('email', text)}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                </View>
            </View>

            <View className="mx-4 mt-3">
                <Text className="font-semibold">Phone (optional)</Text>
                <View className={`border border-gray-300 rounded-full p-2 mt-2`}>
                    <TextInput
                        placeholder='Enter your phone number'
                        value={formData.phone}
                        onChangeText={(text) => handleChange('phone', text)}
                        keyboardType="phone-pad"
                    />
                </View>
            </View>

            <View className="mx-4 mt-3">
                <Text className="font-semibold">Address (optional)</Text>
                <View className={`border border-gray-300 rounded-full p-2 mt-2`}>
                    <TextInput
                        placeholder='Enter your address'
                        value={formData.address}
                        onChangeText={(text) => handleChange('address', text)}
                    />
                </View>
            </View>

            <View className="mx-4 mt-3">
                <Text className="font-semibold">Password</Text>
                <View className={`flex-row items-center mt-2 justify-between p-2 border ${error && (!formData.password || formData.password.length < 6) ? 'border-red-500' : 'border-gray-300'} rounded-full`}>
                    <View className="flex-row items-center flex-1">
                        <TextInput
                            secureTextEntry={!showPassword}
                            value={formData.password}
                            placeholder='Enter your password'
                            onChangeText={(text) => handleChange('password', text)}
                            className="font-semibold flex-1"
                        />
                    </View>
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="justify-center items-center p-2">
                        {showPassword ? (
                            <EyeIcon size={25} color={"black"} />
                        ) : (
                            <EyeSlashIcon size={25} color={"black"} />
                        )}
                    </TouchableOpacity>
                </View>
            </View>

            <View className="mx-4 mt-3">
                <Text className="font-semibold">Confirm Password</Text>
                <View className={`flex-row items-center mt-2 justify-between p-2 border ${error && formData.password !== formData.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-full`}>
                    <View className="flex-row items-center flex-1">
                        <TextInput
                            secureTextEntry={!showConfirmPassword}
                            value={formData.confirmPassword}
                            placeholder='Confirm your password'
                            onChangeText={(text) => handleChange('confirmPassword', text)}
                            className="font-semibold flex-1"
                        />
                    </View>
                    <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} className="justify-center items-center p-2">
                        {showConfirmPassword ? (
                            <EyeIcon size={25} color={"black"} />
                        ) : (
                            <EyeSlashIcon size={25} color={"black"} />
                        )}
                    </TouchableOpacity>
                </View>
            </View>

            <TouchableOpacity
                onPress={handleRegister}
                className={`${loading ? 'bg-primary/70' : 'bg-primary'} mx-4 p-5 items-center rounded-full mt-6`}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator size="small" color="#fff" />
                ) : (
                    <Text className="text-2xl text-white">Sign Up</Text>
                )}
            </TouchableOpacity>

            <View className="flex-row justify-center mt-4">
                <Text className="text-gray-500">Already have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
                    <Text className="text-primary font-semibold">Sign In</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
} 