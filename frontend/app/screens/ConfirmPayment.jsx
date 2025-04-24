import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import React, { useState, useEffect } from "react";
import TabBar from "../themes/TabBar";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CreditCardIcon,
  BanknotesIcon,
  CheckCircleIcon,
} from "react-native-heroicons/outline";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Import local assets
const esewaLogo = require("../../assets/images/esewa.jpg");
const khaltiLogo = require("../../assets/images/khalti.jpg");
const imePayLogo = require("../../assets/images/imepay.png");

export default function ConfirmPayment() {
  const navigation = useNavigation();
  const [paymentDataActive, setpaymentData] = useState(null);
  const [linkedMethods, setLinkedMethods] = useState({
    card: false,
    paypal: false,
    applePay: false,
    esewa: false,
    khalti: false,
    ime: false,
  });

  // Load the selected payment method and linked methods from AsyncStorage when the component mounts
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load selected payment method
        const storedMethod = await AsyncStorage.getItem(
          "selectedPaymentMethod",
        );
        if (storedMethod) {
          const method = JSON.parse(storedMethod);
          setpaymentData(method.index);
        }

        // Load linked payment methods
        const savedMethods = await AsyncStorage.getItem("linkedPaymentMethods");
        if (savedMethods) {
          setLinkedMethods(JSON.parse(savedMethods));
        }
      } catch (error) {
        console.error("Error loading payment data:", error);
      }
    };

    loadData();
  }, []);

  const handlePaymentSelect = (index, type) => {
    setpaymentData(index);

    // Create payment method object based on selection
    const selectedMethod = {
      index,
      type,
      name: getPaymentMethodName(type),
    };

    // Store the selected payment method
    AsyncStorage.setItem(
      "selectedPaymentMethod",
      JSON.stringify(selectedMethod),
    );
  };

  const getPaymentMethodName = (type) => {
    switch (type) {
      case "cod":
        return "Cash on Delivery";
      case "card":
        return "Credit/Debit Card";
      case "paypal":
        return "PayPal";
      case "applePay":
        return "Apple Pay";
      case "esewa":
        return "eSewa";
      case "khalti":
        return "Khalti";
      case "ime":
        return "IME Pay";
      default:
        return "Unknown";
    }
  };

  const handleConfirmPayment = async () => {
    try {
      if (paymentDataActive === null) {
        Alert.alert("Error", "Please select a payment method");
        return;
      }

      // Get the selected payment method
      const selectedMethod = {
        index: paymentDataActive,
        type: getPaymentMethodType(paymentDataActive),
        name: getPaymentMethodName(getPaymentMethodType(paymentDataActive)),
      };

      // Store the selected payment method
      await AsyncStorage.setItem(
        "selectedPaymentMethod",
        JSON.stringify(selectedMethod),
      );

      // Navigate to the Checkout screen
      navigation.replace('Checkout');
    } catch (error) {
      console.error("Error confirming payment:", error);
      Alert.alert("Error", "Failed to confirm payment. Please try again.");
    }
  };

  const getPaymentMethodType = (index) => {
    switch (index) {
      case -1:
        return "cod";
      case 0:
        return "card";
      case 1:
        return "paypal";
      case 2:
        return "applePay";
      case 3:
        return "esewa";
      case 4:
        return "khalti";
      case 5:
        return "ime";
      default:
        return "unknown";
    }
  };

  const renderPaymentOption = (index, type, icon, name, isLinked = false) => {
    const isActive = index === paymentDataActive;

    return (
      <TouchableOpacity
        key={index}
        onPress={() => handlePaymentSelect(index, type)}
        className={`border rounded-2xl mb-4 ${isActive ? "border-primary bg-primary/10" : "border-gray-300"}`}
        disabled={!isLinked && type !== "cod"}
      >
        <View className="flex-row items-center justify-between p-4">
          <View className="flex-row items-center gap-3">
            {icon}
            <View>
              <Text className="font-semibold text-lg">{name}</Text>
              {!isLinked && type !== "cod" && (
                <Text className="text-sm text-red-500">Not linked</Text>
              )}
              {type === "cod" && (
                <Text className="text-sm text-gray-500">
                  Additional charge: Rs150
                </Text>
              )}
            </View>
          </View>
          <View
            className={`w-6 h-6 rounded-full border ${isActive ? "border-primary" : "border-gray-500"}`}
          >
            {isActive && (
              <View className="w-full h-full rounded-full bg-primary"></View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View className={`bg-white flex-col`} style={{ height: hp("97%") }}>
      <TabBar
        prefix={""}
        title={"Payment Methods"}
        suffix={<ChevronLeftIcon size={25} color={"black"} />}
        titleStyle={{
          color: "black",
          fontWeight: "bold",
          fontSize: 20,
        }}
        prefixStyle={{
          backgroundColor: "transparent",
        }}
        suffixStyle={{
          backgroundColor: "white",
          borderWidth: 1,
          borderColor: "black",
        }}
        containerStyle=""
        suffixAction={() => navigation.replace('Checkout')}
      />

      <View className="mx-4 mt-5">
        <Text className="text-2xl font-semibold mb-4">
          Select Payment Method
        </Text>

        {/* Cash on Delivery Option */}
        {renderPaymentOption(
          -1,
          "cod",
          <BanknotesIcon color={"#704f38"} size={24} />,
          "Cash on Delivery",
        )}

        {/* Credit/Debit Card */}
        {renderPaymentOption(
          0,
          "card",
          <CreditCardIcon color={"#704f38"} size={24} />,
          "Credit/Debit Card",
          linkedMethods.card,
        )}

        {/* PayPal */}
        {renderPaymentOption(
          1,
          "paypal",
          <Image
            source={{
              uri: "https://cdn-icons-png.flaticon.com/512/174/174861.png",
            }}
            className="w-8 h-8"
          />,
          "PayPal",
          linkedMethods.paypal,
        )}

        {/* Apple Pay */}
        {renderPaymentOption(
          2,
          "applePay",
          <Image
            source={{
              uri: "https://cdn0.iconfinder.com/data/icons/social-glyph/30/apple-480.png",
            }}
            className="w-8 h-8"
          />,
          "Apple Pay",
          linkedMethods.applePay,
        )}

        {/* eSewa */}
        {renderPaymentOption(
          3,
          "esewa",
          <Image source={esewaLogo} className="w-8 h-8" />,
          "eSewa",
          linkedMethods.esewa,
        )}

        {/* Khalti */}
        {renderPaymentOption(
          4,
          "khalti",
          <Image source={khaltiLogo} className="w-8 h-8" />,
          "Khalti",
          linkedMethods.khalti,
        )}

        {/* IME Pay */}
        {renderPaymentOption(
          5,
          "ime",
          <Image source={imePayLogo} className="w-8 h-8" />,
          "IME Pay",
          linkedMethods.ime,
        )}
      </View>

      <View
        className={`bg-white py-3 rounded-tl-2xl border rounded-tr-2xl gap-3 px-4 h-[80px] border-gray-300 mt-auto`}
      >
        <TouchableOpacity
          onPress={handleConfirmPayment}
          className={`border rounded-full ${paymentDataActive === null ? "bg-gray-300" : "bg-primary"} flex-row justify-center items-center`}
          style={{ height: hp("5%") }}
          disabled={paymentDataActive === null}
        >
          <Text className={`text-white text-lg font-semibold`}>
            Confirm Payment
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
