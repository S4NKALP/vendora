import { View, Text, Image, TouchableOpacity, Alert, ScrollView } from 'react-native'
import React, { useState, useEffect } from 'react'
import TabBar from '../themes/TabBar'
import { ChevronLeftIcon, CreditCardIcon, CheckCircleIcon, TrashIcon } from 'react-native-heroicons/outline'
import { TextInput } from 'react-native'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useNavigation } from '@react-navigation/native'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Linking } from 'react-native';

// Import local assets
const esewaLogo = require('../../assets/images/esewa.jpg');
const khaltiLogo = require('../../assets/images/khalti.jpg');
const imePayLogo = require('../../assets/images/imepay.png');

export default function PaymentMethodScreen() {
    const navigator = useNavigation()
    const [cardNumber, setCardNumber] = useState('')
    const [cardName, setCardName] = useState('')
    const [expiryDate, setExpiryDate] = useState('')
    const [cvv, setCvv] = useState('')
    const [paypalEmail, setPaypalEmail] = useState('')
    const [paypalPassword, setPaypalPassword] = useState('')
    const [esewaPhone, setEsewaPhone] = useState('')
    const [esewaPin, setEsewaPin] = useState('')
    const [khaltiPhone, setKhaltiPhone] = useState('')
    const [khaltiPin, setKhaltiPin] = useState('')
    const [imePhone, setImePhone] = useState('')
    const [imePin, setImePin] = useState('')
    const [showCardDetails, setShowCardDetails] = useState(false)
    const [showPaypalDetails, setShowPaypalDetails] = useState(false)
    const [showApplePayDetails, setShowApplePayDetails] = useState(false)
    const [showEsewaDetails, setShowEsewaDetails] = useState(false)
    const [showKhaltiDetails, setShowKhaltiDetails] = useState(false)
    const [showImeDetails, setShowImeDetails] = useState(false)
    const [linkedMethods, setLinkedMethods] = useState({
        card: false,
        paypal: false,
        applePay: false,
        esewa: false,
        khalti: false,
        ime: false
    })

    // Load saved payment methods on component mount
    useEffect(() => {
        loadSavedPaymentMethods();
    }, []);

    const loadSavedPaymentMethods = async () => {
        try {
            const savedMethods = await AsyncStorage.getItem('linkedPaymentMethods');
            if (savedMethods) {
                setLinkedMethods(JSON.parse(savedMethods));
            }
        } catch (error) {
            console.error('Error loading saved payment methods:', error);
        }
    };

    const saveLinkedMethods = async (methods) => {
        try {
            await AsyncStorage.setItem('linkedPaymentMethods', JSON.stringify(methods));
        } catch (error) {
            console.error('Error saving payment methods:', error);
        }
    };

    const handleUnlink = (method) => {
        Alert.alert(
            'Unlink Account',
            'Are you sure you want to unlink this account?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel'
                },
                {
                    text: 'Unlink',
                    style: 'destructive',
                    onPress: () => {
                        const updatedMethods = { ...linkedMethods, [method]: false };
                        setLinkedMethods(updatedMethods);
                        saveLinkedMethods(updatedMethods);
                    }
                }
            ]
        )
    }

    const handleCardLink = () => {
        if (!cardNumber.trim() || !cardName.trim() || !expiryDate.trim() || !cvv.trim()) {
            Alert.alert('Error', 'Please fill in all card details')
            return
        }
        // Here you would typically validate the card details
        // For now, we'll just show a success message
        Alert.alert('Success', 'Card linked successfully', [
            {
                text: 'OK',
                onPress: () => {
                    setShowCardDetails(false)
                    setCardNumber('')
                    setCardName('')
                    setExpiryDate('')
                    setCvv('')
                    const updatedMethods = { ...linkedMethods, card: true };
                    setLinkedMethods(updatedMethods);
                    saveLinkedMethods(updatedMethods);
                }
            }
        ])
    }

    const handlePaypalLink = () => {
        if (!paypalEmail.trim() || !paypalPassword.trim()) {
            Alert.alert('Error', 'Please fill in all PayPal details')
            return
        }
        // Here you would typically validate the PayPal credentials
        Alert.alert('Success', 'PayPal account linked successfully', [
            {
                text: 'OK',
                onPress: () => {
                    setShowPaypalDetails(false)
                    setPaypalEmail('')
                    setPaypalPassword('')
                    const updatedMethods = { ...linkedMethods, paypal: true };
                    setLinkedMethods(updatedMethods);
                    saveLinkedMethods(updatedMethods);
                }
            }
        ])
    }

    const handleApplePayLink = () => {
        // Apple Pay typically uses the device's built-in authentication
        Alert.alert('Success', 'Apple Pay account linked successfully', [
            {
                text: 'OK',
                onPress: () => {
                    setShowApplePayDetails(false)
                    const updatedMethods = { ...linkedMethods, applePay: true };
                    setLinkedMethods(updatedMethods);
                    saveLinkedMethods(updatedMethods);
                }
            }
        ])
    }

    const handleEsewaLink = () => {
        if (!esewaPhone.trim() || !esewaPin.trim()) {
            Alert.alert('Error', 'Please fill in all eSewa details')
            return
        }
        // Here you would typically validate the eSewa credentials
        Alert.alert('Success', 'eSewa account linked successfully', [
            {
                text: 'OK',
                onPress: () => {
                    setShowEsewaDetails(false)
                    setEsewaPhone('')
                    setEsewaPin('')
                    const updatedMethods = { ...linkedMethods, esewa: true };
                    setLinkedMethods(updatedMethods);
                    saveLinkedMethods(updatedMethods);
                }
            }
        ])
    }

    const handleKhaltiLink = () => {
        if (!khaltiPhone.trim() || !khaltiPin.trim()) {
            Alert.alert('Error', 'Please fill in all Khalti details')
            return
        }
        // Here you would typically validate the Khalti credentials
        Alert.alert('Success', 'Khalti account linked successfully', [
            {
                text: 'OK',
                onPress: () => {
                    setShowKhaltiDetails(false)
                    setKhaltiPhone('')
                    setKhaltiPin('')
                    const updatedMethods = { ...linkedMethods, khalti: true };
                    setLinkedMethods(updatedMethods);
                    saveLinkedMethods(updatedMethods);
                }
            }
        ])
    }

    const handleImeLink = () => {
        if (!imePhone.trim() || !imePin.trim()) {
            Alert.alert('Error', 'Please fill in all IME Pay details')
            return
        }
        // Here you would typically validate the IME Pay credentials
        Alert.alert('Success', 'IME Pay account linked successfully', [
            {
                text: 'OK',
                onPress: () => {
                    setShowImeDetails(false)
                    setImePhone('')
                    setImePin('')
                    const updatedMethods = { ...linkedMethods, ime: true };
                    setLinkedMethods(updatedMethods);
                    saveLinkedMethods(updatedMethods);
                }
            }
        ])
    }

    const openEsewaApp = async () => {
        try {
            const esewaUrl = 'esewa://';
            const supported = await Linking.canOpenURL(esewaUrl);
            
            if (supported) {
                await Linking.openURL(esewaUrl);
            } else {
                Alert.alert(
                    'eSewa App Not Found',
                    'Please install eSewa app to continue',
                    [
                        {
                            text: 'Install',
                            onPress: () => Linking.openURL('https://play.google.com/store/apps/details?id=com.f1soft.esewa&hl=en')
                        },
                        {
                            text: 'Cancel',
                            style: 'cancel'
                        }
                    ]
                );
            }
        } catch (error) {
            Alert.alert('Error', 'Could not open eSewa app');
        }
    };

    const openKhaltiApp = async () => {
        try {
            const khaltiUrl = 'khalti://';
            const supported = await Linking.canOpenURL(khaltiUrl);
            
            if (supported) {
                await Linking.openURL(khaltiUrl);
            } else {
                Alert.alert(
                    'Khalti App Not Found',
                    'Please install Khalti app to continue',
                    [
                        {
                            text: 'Install',
                            onPress: () => Linking.openURL('https://play.google.com/store/apps/details?id=com.khalti&hl=en')
                        },
                        {
                            text: 'Cancel',
                            style: 'cancel'
                        }
                    ]
                );
            }
        } catch (error) {
            Alert.alert('Error', 'Could not open Khalti app');
        }
    };

    const openImeApp = async () => {
        try {
            const imeUrl = 'imepay://';
            const supported = await Linking.canOpenURL(imeUrl);
            
            if (supported) {
                await Linking.openURL(imeUrl);
            } else {
                Alert.alert(
                    'IME Pay App Not Found',
                    'Please install IME Pay app to continue',
                    [
                        {
                            text: 'Install',
                            onPress: () => Linking.openURL('https://play.google.com/store/apps/details?id=com.swifttechnology.imepay&hl=en')
                        },
                        {
                            text: 'Cancel',
                            style: 'cancel'
                        }
                    ]
                );
            }
        } catch (error) {
            Alert.alert('Error', 'Could not open IME Pay app');
        }
    };

    const renderLinkStatus = (isLinked) => {
        if (isLinked) {
            return (
                <View className="flex-row items-center">
                    <CheckCircleIcon color="#704f38" size={20} />
                    <Text className="text-primary ml-1">Linked</Text>
                </View>
            )
        }
        return <Text className="text-primary">Link</Text>
    }

    const renderLinkedCardDetails = () => (
        <View className={`mx-4 mt-2 p-4 border border-gray-300 rounded-2xl`}>
            <View className="flex-row justify-between items-center mb-4">
                <Text className="font-semibold text-lg">Card Details</Text>
                <TouchableOpacity onPress={() => handleUnlink('card')}>
                    <TrashIcon color="red" size={20} />
                </TouchableOpacity>
            </View>
            <Text className="text-gray-600">Card ending in 1234</Text>
            <Text className="text-gray-600">Expires: 12/25</Text>
            <Text className="text-gray-600">John Doe</Text>
        </View>
    )

    const renderLinkedPaypalDetails = () => (
        <View className={`p-4 border-t border-gray-300`}>
            <View className="flex-row justify-between items-center mb-4">
                <Text className="font-semibold text-lg">PayPal Account</Text>
                <TouchableOpacity onPress={() => handleUnlink('paypal')}>
                    <TrashIcon color="red" size={20} />
                </TouchableOpacity>
            </View>
            <Text className="text-gray-600">user@example.com</Text>
        </View>
    )

    const renderLinkedApplePayDetails = () => (
        <View className={`p-4 border-t border-gray-300`}>
            <View className="flex-row justify-between items-center mb-4">
                <Text className="font-semibold text-lg">Apple Pay</Text>
                <TouchableOpacity onPress={() => handleUnlink('applePay')}>
                    <TrashIcon color="red" size={20} />
                </TouchableOpacity>
            </View>
            <Text className="text-gray-600">Using device's Apple Pay</Text>
        </View>
    )

    const renderLinkedEsewaDetails = () => (
        <View className={`p-4 border-t border-gray-300`}>
            <View className="flex-row justify-between items-center mb-4">
                <Text className="font-semibold text-lg">eSewa Account</Text>
                <TouchableOpacity onPress={() => handleUnlink('esewa')}>
                    <TrashIcon color="red" size={20} />
                </TouchableOpacity>
            </View>
            <Text className="text-gray-600">Phone: 98XXXXXXXX</Text>
            <TouchableOpacity 
                onPress={openEsewaApp}
                className={`mt-2 p-3 border border-primary rounded-xl`}
            >
                <Text className={`text-primary text-center font-semibold`}>Open eSewa App</Text>
            </TouchableOpacity>
        </View>
    )

    const renderLinkedKhaltiDetails = () => (
        <View className={`p-4 border-t border-gray-300`}>
            <View className="flex-row justify-between items-center mb-4">
                <Text className="font-semibold text-lg">Khalti Account</Text>
                <TouchableOpacity onPress={() => handleUnlink('khalti')}>
                    <TrashIcon color="red" size={20} />
                </TouchableOpacity>
            </View>
            <Text className="text-gray-600">Phone: 98XXXXXXXX</Text>
            <TouchableOpacity 
                onPress={openKhaltiApp}
                className={`mt-2 p-3 border border-primary rounded-xl`}
            >
                <Text className={`text-primary text-center font-semibold`}>Open Khalti App</Text>
            </TouchableOpacity>
        </View>
    )

    const renderLinkedImeDetails = () => (
        <View className={`p-4 border-t border-gray-300`}>
            <View className="flex-row justify-between items-center mb-4">
                <Text className="font-semibold text-lg">IME Pay Account</Text>
                <TouchableOpacity onPress={() => handleUnlink('ime')}>
                    <TrashIcon color="red" size={20} />
                </TouchableOpacity>
            </View>
            <Text className="text-gray-600">Phone: 98XXXXXXXX</Text>
            <TouchableOpacity 
                onPress={openImeApp}
                className={`mt-2 p-3 border border-primary rounded-xl`}
            >
                <Text className={`text-primary text-center font-semibold`}>Open IME Pay App</Text>
            </TouchableOpacity>
        </View>
    )

    return (
        <ScrollView className={`bg-white`} style={{ height: hp("99%") }}>
            <TabBar
                prefix={""}
                title={"Payment Methods"}
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
                suffixAction={() => navigator.goBack()}
            />
            <View className={`mx-4 mt-5`}>
                <Text className={`text-2xl font-semibold`}>Credit & Debit Card</Text>
            </View>
            <TouchableOpacity 
                onPress={() => setShowCardDetails(!showCardDetails)}
                className={`mx-4 flex-row items-center mt-2 justify-between p-2 border border-gray-300 rounded-2xl`}
            >
                <View className={`flex-row items-center gap-2`}>
                    <CreditCardIcon color={"#704f38"} size={24} />
                    <Text className={`font-semibold`}>Add New Card</Text>
                </View>
                {renderLinkStatus(linkedMethods.card)}
            </TouchableOpacity>

            {showCardDetails && !linkedMethods.card && (
                <View className={`mx-4 mt-2 p-4 border border-gray-300 rounded-2xl`}>
                    <TextInput 
                        placeholder='Card Number' 
                        className={`font-semibold border-b border-gray-300 p-2 mb-2`}
                        value={cardNumber}
                        onChangeText={setCardNumber}
                        keyboardType="numeric"
                        maxLength={16}
                    />
                    <TextInput 
                        placeholder='Card Holder Name' 
                        className={`font-semibold border-b border-gray-300 p-2 mb-2`}
                        value={cardName}
                        onChangeText={setCardName}
                    />
                    <View className={`flex-row gap-2`}>
                        <TextInput 
                            placeholder='MM/YY' 
                            className={`font-semibold border-b border-gray-300 p-2 flex-1`}
                            value={expiryDate}
                            onChangeText={setExpiryDate}
                            maxLength={5}
                        />
                        <TextInput 
                            placeholder='CVV' 
                            className={`font-semibold border-b border-gray-300 p-2 w-20`}
                            value={cvv}
                            onChangeText={setCvv}
                            keyboardType="numeric"
                            maxLength={3}
                        />
                    </View>
                    <TouchableOpacity 
                        onPress={handleCardLink}
                        className={`bg-primary mt-4 p-3 rounded-xl`}
                    >
                        <Text className={`text-white text-center font-semibold`}>Link Card</Text>
                    </TouchableOpacity>
                </View>
            )}

            {showCardDetails && linkedMethods.card && renderLinkedCardDetails()}

            <View className={`mx-4 mt-5 mb-3`}>
                <Text className={`font-bold text-2xl`}>More Payment Options</Text>
            </View>
            <View className={`border border-gray-300 rounded-2xl mx-4`}>
                <TouchableOpacity 
                    onPress={() => setShowPaypalDetails(!showPaypalDetails)}
                    className={`flex-row items-center mt-2 justify-between p-4 border-b border-gray-300 gap-4`}
                >
                    <Image source={{ uri: "https://cdn-icons-png.flaticon.com/512/174/174861.png" }} className="size-[30px]" />
                    <Text className={`font-semibold flex-1`}>Paypal</Text>
                    {renderLinkStatus(linkedMethods.paypal)}
                </TouchableOpacity>

                {showPaypalDetails && !linkedMethods.paypal && (
                    <View className={`p-4 border-t border-gray-300`}>
                        <TextInput 
                            placeholder='PayPal Email' 
                            className={`font-semibold border-b border-gray-300 p-2 mb-2`}
                            value={paypalEmail}
                            onChangeText={setPaypalEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                        <TextInput 
                            placeholder='PayPal Password' 
                            className={`font-semibold border-b border-gray-300 p-2 mb-2`}
                            value={paypalPassword}
                            onChangeText={setPaypalPassword}
                            secureTextEntry
                        />
                        <TouchableOpacity 
                            onPress={handlePaypalLink}
                            className={`bg-primary mt-4 p-3 rounded-xl`}
                        >
                            <Text className={`text-white text-center font-semibold`}>Link PayPal</Text>
                        </TouchableOpacity>
                </View>
                )}

                {showPaypalDetails && linkedMethods.paypal && renderLinkedPaypalDetails()}

                <TouchableOpacity 
                    onPress={() => setShowApplePayDetails(!showApplePayDetails)}
                    className={`flex-row items-center justify-between p-4 border-b border-gray-300 gap-4`}
                >
                    <Image source={{ uri: "https://cdn0.iconfinder.com/data/icons/social-glyph/30/apple-480.png" }} className="size-[30px]" />
                    <Text className={`font-semibold flex-1`}>Apple Pay</Text>
                    {renderLinkStatus(linkedMethods.applePay)}
                </TouchableOpacity>

                {showApplePayDetails && !linkedMethods.applePay && (
                    <View className={`p-4 border-t border-gray-300`}>
                        <Text className={`text-gray-600 mb-4`}>
                            Apple Pay will use your device's built-in authentication to securely link your account.
                        </Text>
                        <TouchableOpacity 
                            onPress={handleApplePayLink}
                            className={`bg-primary p-3 rounded-xl`}
                        >
                            <Text className={`text-white text-center font-semibold`}>Link Apple Pay</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {showApplePayDetails && linkedMethods.applePay && renderLinkedApplePayDetails()}

                <TouchableOpacity 
                    onPress={() => setShowEsewaDetails(!showEsewaDetails)}
                    className={`flex-row items-center justify-between p-4 gap-4`}
                >
                    <Image 
                        source={esewaLogo}
                        className="size-[30px]"
                        style={{ width: 30, height: 30 }}
                    />
                    <Text className={`font-semibold flex-1`}>eSewa</Text>
                    {renderLinkStatus(linkedMethods.esewa)}
                </TouchableOpacity>

                {showEsewaDetails && !linkedMethods.esewa && (
                    <View className={`p-4 border-t border-gray-300`}>
                        <TextInput 
                            placeholder='eSewa Phone Number' 
                            className={`font-semibold border-b border-gray-300 p-2 mb-2`}
                            value={esewaPhone}
                            onChangeText={setEsewaPhone}
                            keyboardType="phone-pad"
                            maxLength={10}
                        />
                        <TextInput 
                            placeholder='eSewa PIN' 
                            className={`font-semibold border-b border-gray-300 p-2 mb-2`}
                            value={esewaPin}
                            onChangeText={setEsewaPin}
                            secureTextEntry
                            maxLength={4}
                        />
                        <TouchableOpacity 
                            onPress={handleEsewaLink}
                            className={`bg-primary mt-4 p-3 rounded-xl`}
                        >
                            <Text className={`text-white text-center font-semibold`}>Link eSewa</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            onPress={openEsewaApp}
                            className={`mt-2 p-3 border border-primary rounded-xl`}
                        >
                            <Text className={`text-primary text-center font-semibold`}>Open eSewa App</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {showEsewaDetails && linkedMethods.esewa && renderLinkedEsewaDetails()}

                <TouchableOpacity 
                    onPress={() => setShowKhaltiDetails(!showKhaltiDetails)}
                    className={`flex-row items-center justify-between p-4 border-b border-gray-300 gap-4`}
                >
                    <Image 
                        source={khaltiLogo}
                        className="size-[30px]"
                        style={{ width: 30, height: 30 }}
                    />
                    <Text className={`font-semibold flex-1`}>Khalti</Text>
                    {renderLinkStatus(linkedMethods.khalti)}
                </TouchableOpacity>

                {showKhaltiDetails && !linkedMethods.khalti && (
                    <View className={`p-4 border-t border-gray-300`}>
                        <TextInput 
                            placeholder='Khalti Phone Number' 
                            className={`font-semibold border-b border-gray-300 p-2 mb-2`}
                            value={khaltiPhone}
                            onChangeText={setKhaltiPhone}
                            keyboardType="phone-pad"
                            maxLength={10}
                        />
                        <TextInput 
                            placeholder='Khalti PIN' 
                            className={`font-semibold border-b border-gray-300 p-2 mb-2`}
                            value={khaltiPin}
                            onChangeText={setKhaltiPin}
                            secureTextEntry
                            maxLength={4}
                        />
                        <TouchableOpacity 
                            onPress={handleKhaltiLink}
                            className={`bg-primary mt-4 p-3 rounded-xl`}
                        >
                            <Text className={`text-white text-center font-semibold`}>Link Khalti</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            onPress={openKhaltiApp}
                            className={`mt-2 p-3 border border-primary rounded-xl`}
                        >
                            <Text className={`text-primary text-center font-semibold`}>Open Khalti App</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {showKhaltiDetails && linkedMethods.khalti && renderLinkedKhaltiDetails()}

                <TouchableOpacity 
                    onPress={() => setShowImeDetails(!showImeDetails)}
                    className={`flex-row items-center justify-between p-4 gap-4`}
                >
                    <Image 
                        source={imePayLogo}
                        className="size-[30px]"
                        style={{ width: 30, height: 30 }}
                    />
                    <Text className={`font-semibold flex-1`}>IME Pay</Text>
                    {renderLinkStatus(linkedMethods.ime)}
                </TouchableOpacity>

                {showImeDetails && !linkedMethods.ime && (
                    <View className={`p-4 border-t border-gray-300`}>
                        <TextInput 
                            placeholder='IME Pay Phone Number' 
                            className={`font-semibold border-b border-gray-300 p-2 mb-2`}
                            value={imePhone}
                            onChangeText={setImePhone}
                            keyboardType="phone-pad"
                            maxLength={10}
                        />
                        <TextInput 
                            placeholder='IME Pay PIN' 
                            className={`font-semibold border-b border-gray-300 p-2 mb-2`}
                            value={imePin}
                            onChangeText={setImePin}
                            secureTextEntry
                            maxLength={4}
                        />
                        <TouchableOpacity 
                            onPress={handleImeLink}
                            className={`bg-primary mt-4 p-3 rounded-xl`}
                        >
                            <Text className={`text-white text-center font-semibold`}>Link IME Pay</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            onPress={openImeApp}
                            className={`mt-2 p-3 border border-primary rounded-xl`}
                        >
                            <Text className={`text-primary text-center font-semibold`}>Open IME Pay App</Text>
                        </TouchableOpacity>
                </View>
                )}

                {showImeDetails && linkedMethods.ime && renderLinkedImeDetails()}
            </View>
        </ScrollView>
    )
}
