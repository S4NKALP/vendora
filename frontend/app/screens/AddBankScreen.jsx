import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native'
import React, { useState } from 'react'
import TabBar from '../themes/TabBar'
import { ChevronLeftIcon } from 'react-native-heroicons/outline'
import { useNavigation, useRoute } from '@react-navigation/native'

export default function AddBankScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { method } = route.params;

    const [bankDetails, setBankDetails] = useState({
        bankName: '',
        accountNumber: '',
        accountHolderName: '',
        phoneNumber: '',
        email: ''
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleAddBank = () => {
        if (!bankDetails.bankName || !bankDetails.accountNumber || !bankDetails.accountHolderName) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        Alert.alert(
            'Confirm Bank Details',
            `You will transfer money to:\n\nBank: ${bankDetails.bankName}\nAccount Number: ${bankDetails.accountNumber}\nAccount Holder: ${bankDetails.accountHolderName}\n\nPlease make sure the details are correct.`,
            [
                {
                    text: 'Cancel',
                    style: 'cancel'
                },
                {
                    text: 'Proceed',
                    onPress: () => {
                        // Here you would typically save the bank details
                        Alert.alert(
                            'Success',
                            'Bank details added successfully. Please complete the transfer and upload the receipt.',
                            [{ text: 'OK' }]
                        );
                        navigation.goBack();
                    }
                }
            ]
        );
    };

    return (
        <View className="bg-white flex-1">
            <TabBar
                prefix={""}
                title={"Add Bank Details"}
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

            <View className="flex-1 p-4">
                <Text className="text-2xl font-semibold mb-6">Enter Bank Details</Text>

                <View className="space-y-4">
                    <View>
                        <Text className="text-gray-600 mb-1">Bank Name *</Text>
                        <TextInput
                            className="border border-gray-300 rounded-lg p-3"
                            placeholder="Enter bank name"
                            value={bankDetails.bankName}
                            onChangeText={(text) => setBankDetails({...bankDetails, bankName: text})}
                        />
                    </View>

                    <View>
                        <Text className="text-gray-600 mb-1">Account Number *</Text>
                        <TextInput
                            className="border border-gray-300 rounded-lg p-3"
                            placeholder="Enter account number"
                            value={bankDetails.accountNumber}
                            onChangeText={(text) => setBankDetails({...bankDetails, accountNumber: text})}
                            keyboardType="numeric"
                        />
                    </View>

                    <View>
                        <Text className="text-gray-600 mb-1">Account Holder Name *</Text>
                        <TextInput
                            className="border border-gray-300 rounded-lg p-3"
                            placeholder="Enter account holder name"
                            value={bankDetails.accountHolderName}
                            onChangeText={(text) => setBankDetails({...bankDetails, accountHolderName: text})}
                        />
                    </View>

                    <View>
                        <Text className="text-gray-600 mb-1">Phone Number</Text>
                        <TextInput
                            className="border border-gray-300 rounded-lg p-3"
                            placeholder="Enter phone number"
                            value={bankDetails.phoneNumber}
                            onChangeText={(text) => setBankDetails({...bankDetails, phoneNumber: text})}
                            keyboardType="phone-pad"
                        />
                    </View>

                    <View>
                        <Text className="text-gray-600 mb-1">Email</Text>
                        <TextInput
                            className="border border-gray-300 rounded-lg p-3"
                            placeholder="Enter email"
                            value={bankDetails.email}
                            onChangeText={(text) => setBankDetails({...bankDetails, email: text})}
                            keyboardType="email-address"
                        />
                    </View>

                    <TouchableOpacity
                        className="bg-primary py-3 rounded-lg mt-6"
                        onPress={handleAddBank}
                        disabled={isLoading}
                    >
                        <Text className="text-white text-center font-semibold">Add Bank Details</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    )
} 