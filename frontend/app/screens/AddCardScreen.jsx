import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native'
import React, { useState } from 'react'
import TabBar from '../themes/TabBar'
import { ChevronLeftIcon } from 'react-native-heroicons/outline'
import { useNavigation, useRoute } from '@react-navigation/native'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen'

export default function AddCardScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { method } = route.params;

    const [cardNumber, setCardNumber] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [cvv, setCvv] = useState('');
    const [cardholderName, setCardholderName] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const formatCardNumber = (text) => {
        // Remove all non-digit characters
        const cleaned = text.replace(/\D/g, '');
        // Add space after every 4 digits
        const formatted = cleaned.replace(/(\d{4})/g, '$1 ').trim();
        setCardNumber(formatted);
    };

    const formatExpiryDate = (text) => {
        // Remove all non-digit characters
        const cleaned = text.replace(/\D/g, '');
        // Add slash after 2 digits
        if (cleaned.length >= 2) {
            const formatted = cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
            setExpiryDate(formatted);
        } else {
            setExpiryDate(cleaned);
        }
    };

    const handleAddCard = async () => {
        try {
            setIsLoading(true);
            
            // Basic validation
            if (!cardNumber || !expiryDate || !cvv || !cardholderName) {
                Alert.alert('Error', 'Please fill in all card details');
                return;
            }

            if (cardNumber.replace(/\s/g, '').length !== 16) {
                Alert.alert('Error', 'Please enter a valid 16-digit card number');
                return;
            }

            if (cvv.length < 3) {
                Alert.alert('Error', 'Please enter a valid CVV');
                return;
            }

            // Here you would typically make an API call to save the card
            // For now, we'll just show a success message
            Alert.alert(
                'Success',
                'Card added successfully!',
                [
                    {
                        text: 'OK',
                        onPress: () => navigation.goBack()
                    }
                ]
            );
        } catch (error) {
            console.error('Error adding card:', error);
            Alert.alert('Error', 'Failed to add card. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View className="bg-white flex-1">
            <TabBar
                prefix={""}
                title={"Add Card"}
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
                <View className="mb-6">
                    <Text className="text-lg font-semibold mb-2">Card Details</Text>
                    <Text className="text-gray-500">Enter your card information securely</Text>
                </View>

                <View className="space-y-4">
                    <View>
                        <Text className="text-sm font-medium mb-1">Cardholder Name</Text>
                        <TextInput
                            className="border border-gray-300 rounded-lg p-3"
                            placeholder="John Doe"
                            value={cardholderName}
                            onChangeText={setCardholderName}
                        />
                    </View>

                    <View>
                        <Text className="text-sm font-medium mb-1">Card Number</Text>
                        <TextInput
                            className="border border-gray-300 rounded-lg p-3"
                            placeholder="1234 5678 9012 3456"
                            value={cardNumber}
                            onChangeText={formatCardNumber}
                            keyboardType="numeric"
                            maxLength={19}
                        />
                    </View>

                    <View className="flex-row space-x-4">
                        <View className="flex-1">
                            <Text className="text-sm font-medium mb-1">Expiry Date</Text>
                            <TextInput
                                className="border border-gray-300 rounded-lg p-3"
                                placeholder="MM/YY"
                                value={expiryDate}
                                onChangeText={formatExpiryDate}
                                keyboardType="numeric"
                                maxLength={5}
                            />
                        </View>
                        <View className="flex-1">
                            <Text className="text-sm font-medium mb-1">CVV</Text>
                            <TextInput
                                className="border border-gray-300 rounded-lg p-3"
                                placeholder="123"
                                value={cvv}
                                onChangeText={setCvv}
                                keyboardType="numeric"
                                maxLength={4}
                                secureTextEntry
                            />
                        </View>
                    </View>
                </View>

                <TouchableOpacity
                    className="bg-primary mt-8 p-4 rounded-lg"
                    onPress={handleAddCard}
                    disabled={isLoading}
                >
                    <Text className="text-white text-center font-semibold">
                        {isLoading ? 'Adding Card...' : 'Add Card'}
                    </Text>
                </TouchableOpacity>

                <View className="mt-4">
                    <Text className="text-xs text-gray-500 text-center">
                        Your card details are encrypted and secure. We never store your full card number.
                    </Text>
                </View>
            </View>
        </View>
    )
}