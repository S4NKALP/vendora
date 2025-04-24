import React, { useEffect, useState } from "react";
import HomeScreen from "./screens/HomeScreen";
import ProductDetailsScreen from "./screens/ProductDetails";
import WishlistScreen from "./screens/WishlistScreen";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MyCartScreen from "./screens/MyCartScreen";
import CheckOutScreen from "./screens/CheckOutScreen";
import FilterScreen from "./screens/FilterScreen";
import CouponScreen from "./screens/CouponScreen";
import SearchScreen from "./screens/SearchScreen";
import SearchResultScreen from "./screens/SearchResultScreen";
import OrderScreen from "./screens/OrderScreen";
import ProfileScreen from "./screens/ProfileScreen";
import SettingScreen from "./screens/SettingScreen";
import LeaveReviewScreen from "./screens/LeaveReviewScreen";
import PaymentMethodScreen from "./screens/PaymentMethodScreen";
import PasswordManagerScreen from "./screens/PasswordManagerScreen";
import HelpCenterScreen from "./screens/HelpCenterScreen";
import PrivacyPolicyScreen from "./screens/PrivacyPolicyScreen";
import InviteFriendsScreen from "./screens/InviteFriendsScreen";
import JacketScreen from "./screens/JacketScreen";
import ShippingAddressScreen from "./screens/ShippingAddressScreen";
import ChooseShippingScreen from "./screens/ChooseShippingScreen";
import ConfirmPayment from "./screens/ConfirmPayment";
import AddCardScreen from "./screens/AddCardScreen";
import AddBankScreen from "./screens/AddBankScreen";
import LocationScreen from "./screens/LocationScreen";
import AccessLocation from "./screens/AccessLocation";
import SignInScreen from "./screens/SignInScreen";
import RegisterScreen from "./screens/RegisterScreen";
import PaymentSuccess from "./screens/PaymentSuccess";
import VerifyCodeScreen from "./screens/VerifyCodeScreen";
import NewPasswordScreen from "./screens/NewPasswordScreen";
import CompleteYourProfileScreen from "./screens/CompleteYourProfileScreen";
import WellcomeScreen from "./screens/WellcomeScreen";
import OnboardingScreen from "./screens/OnboardingScreen";
import BottomTabBar from "./themes/BottomTabBar";
import NotificationScreen from "./screens/NotificationScreen";
import TrackOrderScreen from "./screens/TrackOrderScreen";
import { ActivityIndicator, Text, View } from "react-native";
import { getCurrentUser } from "./api";
import { useNavigation } from "@react-navigation/native";

const Stack = createNativeStackNavigator();

export default function Index() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        const user = await getCurrentUser();

        if (user) {
          setIsLoggedIn(true);
          setUserData(user);
          console.log("User is logged in:", user.username);
        } else {
          setIsLoggedIn(false);
          setUserData(null);
          console.log("No user logged in");
        }
        setError(null);
      } catch (error) {
        console.error("Error checking user status:", error);
        setError("Failed to check login status");
        setIsLoggedIn(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#704f38" />
        <Text style={{ marginTop: 10 }}>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: "red", marginBottom: 20 }}>{error}</Text>
        <Text>Please restart the app and try again.</Text>
      </View>
    );
  }

  const initialRoute = isLoggedIn ? "Main" : "SignIn";

  return (
    <Stack.Navigator
      initialRouteName={initialRoute}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="SignIn" component={SignInScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Main" component={BottomTabBar} />
      <Stack.Screen name="Track Order" component={TrackOrderScreen} />
      <Stack.Screen name="Notification" component={NotificationScreen} />
      <Stack.Screen name="Shipping Address" component={ShippingAddressScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Filter" component={FilterScreen} />
      <Stack.Screen name="MyCart" component={MyCartScreen} />
      <Stack.Screen name="Wellcome" component={WellcomeScreen} />
      <Stack.Screen name="Access Location" component={AccessLocation} />
      <Stack.Screen
        name="Complete your Profile"
        component={CompleteYourProfileScreen}
      />
      <Stack.Screen name="New Password" component={NewPasswordScreen} />
      <Stack.Screen name="Verify Screen" component={VerifyCodeScreen} />
      <Stack.Screen name="Location" component={LocationScreen} />
      <Stack.Screen name="Payment Success" component={PaymentSuccess} />
      <Stack.Screen name="Add Card" component={AddCardScreen} />
      <Stack.Screen name="Add Bank" component={AddBankScreen} />
      <Stack.Screen name="Confirm Payment" component={ConfirmPayment} />
      <Stack.Screen name="Choose Shipping" component={ChooseShippingScreen} />
      <Stack.Screen name="Checkout" component={CheckOutScreen} />
      <Stack.Screen name="Category" component={JacketScreen} />
      <Stack.Screen name="Invite Friends" component={InviteFriendsScreen} />
      <Stack.Screen name="Help Center" component={HelpCenterScreen} />
      <Stack.Screen name="Privacy Policy" component={PrivacyPolicyScreen} />
      <Stack.Screen name="Password Manager" component={PasswordManagerScreen} />
      <Stack.Screen name="Payment Method" component={PaymentMethodScreen} />
      <Stack.Screen name="Leave Review" component={LeaveReviewScreen} />
      <Stack.Screen name="Setting" component={SettingScreen} />
      <Stack.Screen name="Order" component={OrderScreen} />
      <Stack.Screen name="SearchResult" component={SearchResultScreen} />
      <Stack.Screen name="Search" component={SearchScreen} />
      <Stack.Screen name="Coupon" component={CouponScreen} />
      <Stack.Screen
        name="ProductDetailsScreen"
        component={ProductDetailsScreen}
      />
      <Stack.Screen name="Wishlist" component={WishlistScreen} />
    </Stack.Navigator>
  );
}
