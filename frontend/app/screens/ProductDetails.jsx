import { View, Text, TouchableOpacity, Image, ScrollView, ActivityIndicator, TextInput, Alert, RefreshControl } from 'react-native'
import React, { useEffect, useState, useCallback } from 'react'
import { ArrowLeftIcon, HeartIcon, ShoppingBagIcon, StarIcon as StarOutlineIcon } from 'react-native-heroicons/outline'
// import { ImageBackground } from 'react-native'
import pic from "../../assets/images/pic.jpg"
import clothColor from "../constants/clothColor"
import { StarIcon } from 'react-native-heroicons/solid';
import { useNavigation, useRoute } from '@react-navigation/native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { addToCart, BASE_URL, fetchProductById, processImageUrl, rateProduct, getCurrentUser } from '../api'


export default function ProductDetails() {
    const route = useRoute();
    const { id } = route.params;
    const navigation = useNavigation();
    const [product, setProduct] = useState(null);
    const [productImageUrl, setProductImageUrl] = useState(null);
    const [ratings, setRatings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [addingToCart, setAddingToCart] = useState(false);
    const [userRating, setUserRating] = useState(0);
    const [ratingComment, setRatingComment] = useState('');
    const [submittingRating, setSubmittingRating] = useState(false);
    const [showRatingForm, setShowRatingForm] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [editingRating, setEditingRating] = useState(null);
    const [editRatingValue, setEditRatingValue] = useState(0);
    const [editComment, setEditComment] = useState('');
    const [editing, setEditing] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        fetchProductData();
        fetchCurrentUser();
    }, [id]);

    const fetchProductData = async () => {
        try {
            setLoading(true);
            const productData = await fetchProductById(id);
            setProduct(productData);
            
            // Process the image URL
            if (productData?.image) {
                const processedUrl = await processImageUrl(productData.image);
                setProductImageUrl(processedUrl);
            }

            // Set ratings if available
            if (productData.ratings) {
                setRatings(productData.ratings);
            }
            
            setError(null);
        } catch (error) {
            console.error('Error fetching product details:', error);
            setError(error.message || 'Failed to load product details');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const fetchCurrentUser = async () => {
        try {
            const user = await getCurrentUser();
            setCurrentUser(user);
        } catch (error) {
            console.error('Error fetching current user:', error);
        }
    };

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchProductData();
    }, []);

    const handleAddToCart = async () => {
        if (!product) return;
        
        try {
            setAddingToCart(true);
            await addToCart(product.id, quantity);
            Alert.alert("Success", "Product added to cart successfully");
            navigation.navigate("MyCart");
        } catch (error) {
            console.error('Error adding to cart:', error);
            setError(error.message || 'Failed to add item to cart');
            Alert.alert("Error", "Failed to add product to cart");
        } finally {
            setAddingToCart(false);
        }
    };

    const handleSubmitRating = async () => {
        if (userRating === 0) {
            Alert.alert("Error", "Please select a rating");
            return;
        }
        
        try {
            setSubmittingRating(true);
            await rateProduct(id, userRating, ratingComment);
            Alert.alert("Success", "Your rating has been submitted");
            setUserRating(0);
            setRatingComment('');
            setShowRatingForm(false);
            
            // Refresh product data to show updated rating
            const updatedProduct = await fetchProductById(id);
            setProduct(updatedProduct);
        } catch (error) {
            console.error('Error submitting rating:', error);
            Alert.alert("Error", "Failed to submit rating. Please try again.");
        } finally {
            setSubmittingRating(false);
        }
    };

    const [isFavourite, setIsFavourite] = useState(false)
    const handleFavouriteToggle = () => {
        setIsFavourite(!isFavourite)
    }

    // size toggle
    const subSize = ["S", "M", "L", "XL", "XXL", "XXXL"]
    const [activeSet, setActiveSet] = useState("S")

    const handleSubSize = (item) => {
        setActiveSet(item)
    }

    const [initialColor, setColor] = useState(0)
    const toggleColor = (index) => {
        setColor(index)
    }

    const incrementQuantity = () => setQuantity(prev => prev + 1);
    const decrementQuantity = () => setQuantity(prev => Math.max(1, prev - 1));

    const handleEditRating = async () => {
        if (editRatingValue === 0) {
            Alert.alert("Error", "Please select a rating");
            return;
        }
        
        try {
            setEditing(true);
            await rateProduct(id, editRatingValue, editComment);
            Alert.alert("Success", "Your rating has been updated");
            setEditingRating(null);
            setEditRatingValue(0);
            setEditComment('');
            
            // Refresh product data to show updated rating
            const updatedProduct = await fetchProductById(id);
            setProduct(updatedProduct);
            if (updatedProduct.ratings) {
                setRatings(updatedProduct.ratings);
            }
        } catch (error) {
            console.error('Error updating rating:', error);
            Alert.alert("Error", "Failed to update rating. Please try again.");
        } finally {
            setEditing(false);
        }
    };

    const startEditing = (rating) => {
        setEditingRating(rating);
        setEditRatingValue(rating.rating);
        setEditComment(rating.comment || '');
    };

    const cancelEditing = () => {
        setEditingRating(null);
        setEditRatingValue(0);
        setEditComment('');
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center">
                <ActivityIndicator size={45} color="#704f38" />
            </View>
        );
    }

    if (error) {
        return (
            <View className="flex-1 justify-center items-center">
                <Text className="text-red-500 text-lg">{error}</Text>
                <TouchableOpacity 
                    onPress={fetchProductData}
                    className="mt-4 bg-primary py-2 px-4 rounded-lg"
                >
                    <Text className="text-white">Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    if (!product) {
        return (
            <View className="flex-1 justify-center items-center">
                <Text className="text-lg">Product not found</Text>
            </View>
        );
    }

    return (
        <View style={{ height: hp("100%") }}>
            <ScrollView 
                className="mb-[110px] bg-white" 
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#704f38']}
                        tintColor="#704f38"
                    />
                }
            >
                <View className="flex-row justify-between items-center mx-4 gap-9 my-5 absolute top-0 z-20">
                    <TouchableOpacity onPress={() => navigation.goBack()} className="bg-gray-400 rounded-full flex-row justify-center items-center size-16">
                        <ArrowLeftIcon color={"black"} size={24} />
                    </TouchableOpacity>
                    <View className="flex-1 flex-row justify-center items-center">
                        <Text className="font-semibold text-2xl text-white">{product.name}</Text>
                    </View>
                    <TouchableOpacity onPress={handleFavouriteToggle} className="bg-gray-400 rounded-full flex items-center justify-center size-16">
                        <HeartIcon size={24} color={isFavourite ? "red" : "black"} />
                    </TouchableOpacity>
                </View>
                <View>
                    <Image 
                        source={{ uri: productImageUrl || 'https://via.placeholder.com/150' }} 
                        style={{ objectFit: 'contain' }} 
                        className="w-full h-[300px]" 
                    />
                    <View className={`absolute top-0 left-0 bg-black/20 h-full w-full`} />
                </View>

                <View className="mx-4 my-3 flex-col gap-3">
                    <View className="flex-row justify-between">
                        <Text className="text-black font-light text-lg">{product.category_name}</Text>
                        <View className="items-center gap-1 flex-row">
                            <StarIcon size={20} color={"orange"} />
                            <Text className="text-black text-lg">{product.average_rating || 0}</Text>
                        </View>
                    </View>
                    <Text className="font-bold text-2xl">{product.name}</Text>
                    <Text className="text-xl">Product Details</Text>
                    <Text>{product.description}</Text>
                    
                    {/* Quantity Selector */}
                    <View className="flex-row items-center mt-2">
                        <Text className="text-2xl font-semibold mr-4">Quantity:</Text>
                        <TouchableOpacity 
                            onPress={decrementQuantity}
                            className="bg-primary/40 rounded-lg p-1"
                            disabled={quantity <= 1}
                        >
                            <Text className="text-xl font-bold px-2" style={{color: quantity <= 1 ? 'gray' : 'black'}}>-</Text>
                        </TouchableOpacity>
                        <Text className="text-xl font-medium mx-4">{quantity}</Text>
                        <TouchableOpacity 
                            onPress={incrementQuantity}
                            className="bg-primary rounded-lg p-1"
                        >
                            <Text className="text-xl font-bold px-2 text-white">+</Text>
                        </TouchableOpacity>
                    </View>
                    
                    {/* Product details */}
                    <View className="flex-row mt-4">
                        <View className="flex-1">
                            <Text className="text-gray-500">Color</Text>
                            <Text className="font-semibold">{product.color || 'N/A'}</Text>
                        </View>
                        <View className="flex-1">
                            <Text className="text-gray-500">Size</Text>
                            <Text className="font-semibold">{product.size || 'N/A'}</Text>
                        </View>
                        <View className="flex-1">
                            <Text className="text-gray-500">Stock</Text>
                            <Text className="font-semibold">{product.stock || 0} items</Text>
                        </View>
                    </View>
                    
                    {/* Ratings Section */}
                    <View className="mt-6">
                        <View className="flex-row justify-between items-center">
                            <Text className="text-2xl font-semibold">Ratings & Reviews</Text>
                            <TouchableOpacity 
                                onPress={() => setShowRatingForm(!showRatingForm)}
                                className="bg-primary px-3 py-1 rounded-full"
                            >
                                <Text className="text-white">Rate this product</Text>
                            </TouchableOpacity>
                        </View>

                        {showRatingForm && (
                            <View className="mt-4 p-4 bg-gray-100 rounded-lg">
                                <Text className="font-semibold mb-2">Your Rating</Text>
                                <View className="flex-row mb-4">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <TouchableOpacity 
                                            key={star} 
                                            onPress={() => setUserRating(star)}
                                            className="mr-2"
                                        >
                                            {userRating >= star ? (
                                                <StarIcon size={30} color="orange" />
                                            ) : (
                                                <StarOutlineIcon size={30} color="gray" />
                                            )}
                                        </TouchableOpacity>
                                    ))}
                                </View>
                                <Text className="font-semibold mb-2">Comment (optional)</Text>
                                <TextInput
                                    className="bg-white p-2 rounded border border-gray-300 mb-4"
                                    placeholder="Write your review here"
                                    multiline
                                    numberOfLines={3}
                                    value={ratingComment}
                                    onChangeText={setRatingComment}
                                />
                                <TouchableOpacity 
                                    onPress={handleSubmitRating} 
                                    disabled={submittingRating}
                                    className={`bg-primary py-2 rounded-full ${submittingRating ? 'opacity-70' : ''}`}
                                >
                                    {submittingRating ? (
                                        <ActivityIndicator color="white" size="small" />
                                    ) : (
                                        <Text className="text-white text-center font-semibold">Submit Rating</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        )}

                        {/* Display existing ratings */}
                        {ratings && ratings.length > 0 ? (
                            <View className="mt-4">
                                {ratings.map((rating, index) => (
                                    <View key={index} className="mb-4 p-4 bg-gray-50 rounded-lg">
                                        <View className="flex-row items-center justify-between mb-2">
                                            <View className="flex-row items-center">
                                                <View className="flex-row">
                                                    {[1, 2, 3, 4, 5].map(star => (
                                                        <StarIcon 
                                                            key={star} 
                                                            size={20} 
                                                            color={star <= rating.rating ? "orange" : "gray"} 
                                                            className="mr-1"
                                                        />
                                                    ))}
                                                </View>
                                                <Text className="ml-2 text-gray-600">{rating.username}</Text>
                                                <Text className="ml-2 text-gray-400 text-xs">
                                                    {new Date(rating.created_at).toLocaleDateString()}
                                                </Text>
                                            </View>
                                            {rating.username === currentUser?.username && (
                                                <TouchableOpacity 
                                                    onPress={() => startEditing(rating)}
                                                    className="bg-primary px-3 py-1 rounded-full"
                                                >
                                                    <Text className="text-white text-xs">Edit</Text>
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                        {rating.comment && (
                                            <Text className="text-gray-700 mt-2">{rating.comment}</Text>
                                        )}
                                    </View>
                                ))}
                            </View>
                        ) : (
                            <View className="mt-4 p-4 bg-gray-50 rounded-lg">
                                <Text className="text-gray-500 text-center">No ratings yet. Be the first to rate this product!</Text>
                            </View>
                        )}

                        {/* Edit Rating Form */}
                        {editingRating && (
                            <View className="mt-4 p-4 bg-gray-100 rounded-lg">
                                <Text className="font-semibold mb-2">Edit Your Rating</Text>
                                <View className="flex-row mb-4">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <TouchableOpacity 
                                            key={star} 
                                            onPress={() => setEditRatingValue(star)}
                                            className="mr-2"
                                        >
                                            {editRatingValue >= star ? (
                                                <StarIcon size={30} color="orange" />
                                            ) : (
                                                <StarOutlineIcon size={30} color="gray" />
                                            )}
                                        </TouchableOpacity>
                                    ))}
                                </View>
                                <Text className="font-semibold mb-2">Comment (optional)</Text>
                                <TextInput
                                    className="bg-white p-2 rounded border border-gray-300 mb-4"
                                    placeholder="Write your review here"
                                    multiline
                                    numberOfLines={3}
                                    value={editComment}
                                    onChangeText={setEditComment}
                                />
                                <View className="flex-row justify-between">
                                    <TouchableOpacity 
                                        onPress={cancelEditing}
                                        className="bg-gray-300 px-4 py-2 rounded-full"
                                    >
                                        <Text className="text-gray-700 font-semibold">Cancel</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity 
                                        onPress={handleEditRating} 
                                        disabled={editing}
                                        className={`bg-primary px-4 py-2 rounded-full ${editing ? 'opacity-70' : ''}`}
                                    >
                                        {editing ? (
                                            <ActivityIndicator color="white" size="small" />
                                        ) : (
                                            <Text className="text-white font-semibold">Update Rating</Text>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
                    </View>
                </View>
            </ScrollView>
            <View className="flex-row items-center justify-between gap-1 p-3 absolute bottom-7 h-[110px] border border-gray-300 w-full rounded-tl-2xl rounded-tr-2xl bg-white">
                <View className="flex-col justify-start">
                    <Text className="text-xl font-semibold mx-1 text-gray-400">Total Price</Text>
                    <Text className="text-xl justify-end font-semibold">${(product.price * quantity).toFixed(2)}</Text>
                </View>
                <TouchableOpacity 
                    onPress={handleAddToCart} 
                    disabled={addingToCart}
                    className={`bg-primary flex-row gap-2 items-center px-6 py-4 rounded-full ${addingToCart ? 'opacity-70' : ''}`}
                >
                    {addingToCart ? (
                        <ActivityIndicator color="white" size="small" />
                    ) : (
                        <ShoppingBagIcon size={25} color={"white"} />
                    )}
                    <Text className={`font-semibold text-white capitalize`}>
                        {addingToCart ? 'Adding...' : 'Add to Cart'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

