import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native'
import React, { useState } from 'react'
import { useNavigation, useRoute } from '@react-navigation/native'
import { StarIcon } from 'react-native-heroicons/solid'
import { StarIcon as StarOutlineIcon } from 'react-native-heroicons/outline'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen'
import { rateProduct } from '../api'

export default function LeaveReviewScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { productId } = route.params;
    
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (rating === 0) {
            Alert.alert('Error', 'Please select a rating');
            return;
        }

        try {
            setLoading(true);
            await rateProduct(productId, rating, comment);
            Alert.alert('Success', 'Thank you for your review!');
            navigation.goBack(); // Go back to previous screen
        } catch (error) {
            console.error('Error submitting review:', error);
            Alert.alert('Error', 'Failed to submit review. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="flex-1 bg-white">
            <View className="flex-row justify-between items-center mx-4 my-5">
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text className="text-lg text-primary">Cancel</Text>
                </TouchableOpacity>
                <Text className="text-xl font-semibold">Leave a Review</Text>
                <TouchableOpacity 
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    <Text className={`text-lg ${loading ? 'text-gray-400' : 'text-primary'}`}>
                        {loading ? 'Submitting...' : 'Submit'}
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
                <View className="items-center my-6">
                    <Text className="text-xl font-semibold mb-4">How would you rate this product?</Text>
                    <View className="flex-row">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <TouchableOpacity
                                key={star}
                                onPress={() => setRating(star)}
                                className="mx-1"
                            >
                                {star <= rating ? (
                                    <StarIcon size={40} color="#FFD700" />
                                ) : (
                                    <StarOutlineIcon size={40} color="#FFD700" />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View className="mb-6">
                    <Text className="text-lg font-semibold mb-2">Your Review</Text>
                    <TextInput
                        className="border border-gray-300 rounded-lg p-4 h-40 text-base"
                        placeholder="Share your experience with this product..."
                        multiline
                        value={comment}
                        onChangeText={setComment}
                    />
                </View>
            </ScrollView>

            {loading && (
                <View className="absolute inset-0 bg-black/20 justify-center items-center">
                    <ActivityIndicator size="large" color="#704f38" />
                </View>
            )}
        </View>
    );
}