import { View, Text, Image, ScrollView, TouchableOpacity, ActivityIndicator, Alert, TextInput } from 'react-native'
import React, { useEffect, useState, useCallback } from 'react'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import TabBar from '../themes/TabBar';
import { ChevronLeftIcon, HeartIcon, ShoppingBagIcon, StarIcon as StarOutlineIcon } from 'react-native-heroicons/outline'
import { StarIcon } from 'react-native-heroicons/solid';
import clothColor from '../constants/clothColor';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { 
  addToCartForCurrentUser, 
  fetchProductById, 
  fetchProductsByCategory, 
  getRecommendationsForCurrentUser, 
  toggleFavorite,
  getFavorites,
  rateProduct
} from '../api';
import ProductQuantityInput from '../components/ProductQuantityInput';
import FavoriteButton from '../components/FavoriteButton';
import { RefreshControl } from 'react-native';

export default function ProductDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { productId } = route.params || {};
  
  const sizes = ["s", "m", "l", "xl", "xxl", "xxxl"];
  const [selectedSize, setSelectedSize] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Load product data and check favorite status
  const loadProductData = useCallback(async () => {
    if (!productId) {
      setError('Product ID is missing');
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      setLoading(true);
      // Fetch product details
      const productData = await fetchProductById(productId);
      setProduct(productData);
      
      // Check favorite status
      const favorites = await getFavorites();
      const isFavorited = favorites.some(fav => fav.id === parseInt(productId));
      setIsFavorite(isFavorited);
      
      // Get related products or recommendations
      let related = [];
      if (productData.category) {
        const categoryProducts = await fetchProductsByCategory(productData.category);
        related = categoryProducts
          .filter(p => p.id !== productData.id)
          .slice(0, 4);
      }
      
      if (related.length < 4) {
        const recommendations = await getRecommendationsForCurrentUser(4 - related.length);
        related = [...related, ...recommendations.filter(r => r.id !== productData.id)];
        related = related.slice(0, 4);
      }
      
      setRelatedProducts(related);
      setError(null);
    } catch (error) {
      console.error('Error loading product data:', error);
      setError('Failed to load product details');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [productId]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadProductData();
  }, [loadProductData]);

  // Load data when screen is focused
  useFocusEffect(
    useCallback(() => {
      loadProductData();
    }, [loadProductData])
  );

  const handleAddToCart = async () => {
    if (!product) return;
    
    try {
      setAddingToCart(true);
      
      const productWithOptions = {
        ...product,
        selectedSize: sizes[selectedSize],
        selectedColor: clothColor[selectedColor].name
      };
      
      await addToCartForCurrentUser(productWithOptions, quantity);
      Alert.alert(
        'Added to Cart',
        `${product.title} has been added to your cart.`,
        [
          {
            text: 'Continue Shopping',
            style: 'cancel',
          },
          {
            text: 'View Cart',
            onPress: () => navigation.navigate('My Cart'),
          },
        ]
      );
    } catch (error) {
      console.error('Error adding to cart:', error);
      Alert.alert('Error', 'Failed to add item to cart. Please try again.');
    } finally {
      setAddingToCart(false);
    }
  };

  // Handle favorite toggle
  const handleToggleFavorite = async (newFavoriteState) => {
    setIsFavorite(newFavoriteState);
  };

  // Increase quantity
  const increaseQuantity = () => {
    setQuantity(prevQuantity => prevQuantity + 1);
  };

  // Decrease quantity (minimum 1)
  const decreaseQuantity = () => {
    setQuantity(prevQuantity => Math.max(1, prevQuantity - 1));
  };

  // Handle rating submission
  const handleSubmitRating = async () => {
    if (userRating === 0) {
      Alert.alert("Error", "Please select a rating");
      return;
    }
    
    try {
      setSubmittingRating(true);
      await rateProduct(productId, userRating, ratingComment);
      Alert.alert("Success", "Your rating has been submitted");
      setUserRating(0);
      setRatingComment('');
      setShowRatingForm(false);
      
      // Refresh product data to show updated rating
      const updatedProduct = await fetchProductById(productId);
      setProduct(updatedProduct);
    } catch (error) {
      console.error('Error submitting rating:', error);
      Alert.alert("Error", "Failed to submit rating. Please try again.");
    } finally {
      setSubmittingRating(false);
    }
  };

  // Display loading state
  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#704f38" />
      </View>
    );
  }

  // Display error state
  if (error || !product) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-red-500 text-lg mb-4">{error || 'Product not found'}</Text>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          className="bg-primary py-2 px-4 rounded-lg"
        >
          <Text className="text-white">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className={`relative`} style={{ height: hp("100%") }}>
      <ScrollView 
        style={{ width: wp("100%") }} 
        className="bg-white" 
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
        <TabBar
          prefix={
            <FavoriteButton 
              isFavorite={isFavorite}
              onToggleFavorite={handleToggleFavorite}
              size={25}
              productId={productId}
              product={product}
              style={{ backgroundColor: 'gray', borderRadius: 8, padding: 6 }}
            />
          }
          title={product.title}
          suffix={<ChevronLeftIcon size={25} color={'black'} />}
          titleStyle={{
            color: "white",
            fontWeight: "bold",
            fontSize: 15
          }}
          prefixStyle={{
            backgroundColor: "transparent"
          }}
          suffixStyle={{
            backgroundColor: "gray"
          }}
          containerStyle="absolute z-[3] top-0"
          suffixAction={() => navigation.goBack()}
        />

        <View className="relative">
          <Image 
            source={{ uri: product.image }} 
            className="h-[300px]" 
            resizeMode="cover"
            defaultSource={require('../../assets/images/favicon.png')}
          />
          <View className="bg-black/30 h-full w-full absolute z-[2]"></View>
        </View>

        <View className="mx-4 my-6">
          <View className="flex-row justify-between">
            <Text className="text-[17px] text-slate-400 capitalize">{product.category}</Text>
            <View className="flex-row items-center gap-1">
              <StarIcon color={"orange"} />
              <Text className="text-[17px] font-medium">{product.rating?.rate || '4.0'}</Text>
            </View>
          </View>
          <Text className="capitalize text-[20px] font-medium my-4">{product.title}</Text>
          <Text className="text-[18px] font-medium my-3">Product Details</Text>

          <Text className="text-[17px]">
            {product.description?.length > 150 
              ? `${product.description.substring(0, 150)}...` 
              : product.description}
            <Text className="text-[17px] text-primary underline"> Read More</Text>
          </Text>

          <View className="bg-black w-full h-[0.6px] my-5" />

          <View>
            <Text className="text-[17px] font-medium">Select Sizes</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="my-2">
              <View className="flex-row items-center gap-3 px-1">
                {
                  sizes.map((item, index) => {
                    let isActive = index == selectedSize;
                    return (
                      <TouchableOpacity
                        key={index}
                        onPress={() => setSelectedSize(index)}
                        className={`px-4 py-2 rounded-xl 
                        ${isActive ? "bg-primary border border-primary" : " border"}`
                        }>
                        <Text
                          className={`text-[17px] font-medium uppercase 
                          ${isActive ? "text-white" : ""}`
                        }>{item}</Text>
                      </TouchableOpacity>
                    );
                  })
                }
              </View>
            </ScrollView>
          </View>

          <View className="my-4">
            <Text className="text-[17px] font-medium">Select Color</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="my-2">
              <View className="flex-row items-center gap-3 px-1">
                {
                  clothColor.map((item, index) => {
                    let isActive = index == selectedColor;
                    return (
                      <TouchableOpacity
                        key={index}
                        onPress={() => setSelectedColor(index)}
                        className={`px-4 py-2 rounded-xl 
                        ${isActive ? "bg-primary border border-primary" : " border"}`
                        }>
                        <Text
                          className={`text-[17px] font-medium uppercase 
                          ${isActive ? "text-white" : ""}`
                        }>{item.name}</Text>
                      </TouchableOpacity>
                    );
                  })
                }
              </View>
            </ScrollView>
          </View>

          <View className="my-4">
            <Text className="text-[17px] font-medium">Quantity</Text>
            <ProductQuantityInput
              quantity={quantity}
              onIncrease={increaseQuantity}
              onDecrease={decreaseQuantity}
            />
          </View>

          <View className="my-4">
            <Text className="text-[17px] font-medium">Related Products</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="my-2">
              <View className="flex-row items-center gap-3 px-1">
                {relatedProducts.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => navigation.navigate('ProductDetails', { productId: item.id })}
                    className="w-[150px] h-[200px] rounded-xl border"
                  >
                    <Image
                      source={{ uri: item.image }}
                      className="w-full h-[120px] rounded-t-xl"
                      resizeMode="cover"
                    />
                    <View className="p-2">
                      <Text className="text-[14px] font-medium">{item.title}</Text>
                      <Text className="text-[14px] text-primary">${item.price}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Rating Section */}
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
            {product.ratings && product.ratings.length > 0 ? (
              <View className="mt-4">
                {product.ratings.map((rating, index) => (
                  <View key={index} className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <View className="flex-row items-center mb-2">
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
          </View>
        </View>
      </ScrollView>

      <View className="absolute bottom-0 w-full bg-white p-4 border-t border-gray-200">
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-[14px] text-slate-400">Total Price</Text>
            <Text className="text-[20px] font-bold text-primary">${(product.price * quantity).toFixed(2)}</Text>
          </View>
          <TouchableOpacity
            onPress={handleAddToCart}
            disabled={addingToCart}
            className="bg-primary px-6 py-3 rounded-xl flex-row items-center gap-2"
          >
            {addingToCart ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <ShoppingBagIcon color="white" size={20} />
                <Text className="text-white font-medium">Add to Cart</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}