import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text } from 'react-native';
import { getApiBaseUrl } from './config';
import { STORAGE_KEYS } from './constants/storageKeys';

// Utility function to simulate network delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Mock products data for development
const mockProducts = [
  {
    id: 1,
    title: "Wireless Headphones",
    description: "High-quality wireless headphones with noise cancellation",
    price: 199.99,
    rating: 4.5,
    category: "Electronics",
    image: "headphones.jpg"
  },
  {
    id: 2,
    title: "Smart Watch",
    description: "Latest smart watch with fitness tracking",
    price: 299.99,
    rating: 4.2,
    category: "Electronics",
    image: "smartwatch.jpg"
  },
  {
    id: 3,
    title: "Running Shoes",
    description: "Comfortable running shoes for all terrains",
    price: 89.99,
    rating: 4.7,
    category: "Sports",
    image: "shoes.jpg"
  },
  {
    id: 4,
    title: "Backpack",
    description: "Durable backpack with laptop compartment",
    price: 49.99,
    rating: 4.3,
    category: "Accessories",
    image: "backpack.jpg"
  },
  {
    id: 5,
    title: "Coffee Maker",
    description: "Programmable coffee maker with timer",
    price: 79.99,
    rating: 4.1,
    category: "Home",
    image: "coffeemaker.jpg"
  }
];

// Dummy component to fix Expo Router error
export default function Api() {
  return (
    <View style={{ display: 'none' }}>
      <Text>API Service - This component is only to prevent Expo Router errors</Text>
    </View>
  );
}
// API Configuration
export const MEDIA_BASE_URL = getApiBaseUrl();
export const BASE_URL = `${MEDIA_BASE_URL}/api`;

// Create axios instance with default config
const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  // Ensure cookies are included in cross-origin requests
  xsrfCookieName: 'csrftoken',
  xsrfHeaderName: 'X-CSRFToken',
});

// Function to update base URL
export const updateBaseURL = (newURL) => {
  api.defaults.baseURL = newURL;
};

// Function to get CSRF token
export const getCSRFToken = async () => {
  try {
    // First check if we already have a token stored
    const storedToken = await getStoredCSRFToken();
    if (storedToken) {
      return storedToken;
    }
    
    // If not, fetch a new token
    const response = await api.get('/csrf-token/');
    
    // Extract token from response
    let csrfToken = null;
    if (response.data && response.data.csrfToken) {
      csrfToken = response.data.csrfToken;
    } else if (response.headers && response.headers['x-csrf-token']) {
      csrfToken = response.headers['x-csrf-token'];
    }
    
    // Store the token if we got one
    if (csrfToken) {
      await AsyncStorage.setItem(STORAGE_KEYS.CSRF_TOKEN, csrfToken);
      return csrfToken;
    }
    
    console.warn('No CSRF token found in response');
    return null;
  } catch (error) {
    console.error('Error fetching CSRF token:', error);
    return null;
  }
};

// Function to get stored CSRF token
export const getStoredCSRFToken = async () => {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.CSRF_TOKEN);
  } catch (error) {
    console.error('Error getting stored CSRF token:', error);
    return null;
  }
};

// Initialize API and fetch CSRF token
export const initializeAPI = async () => {
  try {
    // Get stored auth token
    const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (token) {
      api.defaults.headers.common['Authorization'] = `Token ${token}`;
    }

    // Get CSRF token
    await getCSRFToken();
  } catch (error) {
    console.error('Error initializing API:', error);
  }
};

// Request interceptor
api.interceptors.request.use(
  async (config) => {
    try {
      // Add auth token to headers
      const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      if (token) {
        config.headers['Authorization'] = `Token ${token}`;
      }
    } catch (error) {
      console.error('Error in request interceptor:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
        delete api.defaults.headers.common['Authorization'];
      } catch (storageError) {
        console.error('Error clearing auth data:', storageError);
      }
    }
    return Promise.reject(error);
  }
);

// Auth functions
export const login = async (credentials) => {
  try {
    const response = await api.post('/token-auth/', credentials);
    if (response.data.token) {
      // Set the auth token in the API instance
      api.defaults.headers.common['Authorization'] = `Token ${response.data.token}`;
      // Store the token and user data
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.data.token);
      if (response.data.user_id) {
        // Get user data
        const userResponse = await api.get(`/users/${response.data.user_id}/`);
        if (userResponse.data) {
          await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userResponse.data));
        }
      }
    }
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const register = async (userData) => {
  try {
    // First, get a CSRF token
    const csrfToken = await getCSRFToken();
    
    // Make the registration request with the CSRF token in headers
    const response = await api.post('/auth/register/', userData, {
      headers: {
        'X-CSRFToken': csrfToken
      }
    });
    
    // If registration is successful and we get a token, store it
    if (response.data && response.data.token) {
      // Set the auth token in the API instance
      api.defaults.headers.common['Authorization'] = `Token ${response.data.token}`;
      // Store the token
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.data.token);
      
      // If we have user data, store it
      if (response.data.user_id) {
        const userData = {
          id: response.data.user_id,
          username: response.data.username,
          email: response.data.email,
          first_name: response.data.first_name,
          last_name: response.data.last_name
        };
        await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
      }
    }
    
    return response.data;
  } catch (error) {
    console.error('Registration error:', error.response?.data || error);
    throw error;
  }
};

export const logout = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
    delete api.defaults.headers.common['Authorization'];
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

// User functions
export const getCurrentUser = async () => {
  try {
    // Check if we have a token
    const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (!token) return null;
    
    // Get user data from API
    const response = await api.get('/users/me/');
    
    // Store updated data
    if (response.data) {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(response.data));
    }
    
    return response.data;
  } catch (error) {
    console.error('Error getting current user:', error);
    
    // Fallback to cached data
    const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
    return userData ? JSON.parse(userData) : null;
  }
};

export const getUserData = async () => {
  try {
    // First try to get from API
    const currentUser = await getCurrentUser();
    if (currentUser) return currentUser;
    
    // If API fails, try to get from storage
    const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};

export const updateUserProfile = async (profileData) => {
  try {
    const response = await api.post('/users/update_profile/', profileData);
    if (response.data) {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(response.data));
    }
    return response.data;
  } catch (error) {
    console.error('Profile update error:', error.response?.data || error);
    throw error;
  }
};

export const updateProfilePicture = async (imageUri) => {
  try {
    const formData = new FormData();
    formData.append('profile_picture', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'profile_picture.jpg',
    });

    const response = await api.post('/users/update_profile_picture/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Accept': 'application/json',
      },
    });

    if (response.data && response.data.profile_picture) {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(response.data));
    }
    return response.data;
  } catch (error) {
    console.error('Profile picture update error:', error.response?.data || error);
    throw error;
  }
};

export const getGenderOptions = async () => {
  try {
    const response = await api.get('/users/gender_options/');
    // Transform the response to match the backend values
    return response.data.map(option => ({
      value: option.value.charAt(0).toUpperCase() + option.value.slice(1),
      label: option.label
    }));
  } catch (error) {
    // Return default options if API fails
    return [
      { value: 'Male', label: 'Male' },
      { value: 'Female', label: 'Female' },
      { value: 'Other', label: 'Other' }
    ];
  }
};

// Cart functions
export const getCart = async () => {
  try {
    const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (!token) {
      // If not logged in, get from local storage
      const cartData = await AsyncStorage.getItem(STORAGE_KEYS.CART);
      return cartData ? JSON.parse(cartData) : { items: [] };
    }
    
    // Set the auth token in headers
    api.defaults.headers.common['Authorization'] = `Token ${token}`;
    
    const { data } = await api.get('/cart/items/');
    
    return data;
  } catch (error) {
    console.error('Error getting cart:', error);
    
    if (error.response?.status === 401) {
      // Clear auth data on 401
      await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      delete api.defaults.headers.common['Authorization'];
      throw new Error('Session expired. Please login again.');
    }
    
    throw error;
  }
};

// Add global refresh cart callback
let globalRefreshCartCallback = null;

export const setGlobalRefreshCart = (callback) => {
  globalRefreshCartCallback = callback;
};

// Update cart functions to use the callback
export const addToCart = async (productId, quantity = 1) => {
  try {
    const response = await api.post('/cart/add_item/', {
      product_id: productId,
      quantity: quantity
    });
    if (globalRefreshCartCallback) {
      globalRefreshCartCallback();
    }
    return response.data;
  } catch (error) {
    console.error('Error adding to cart:', error);
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      delete api.defaults.headers.common['Authorization'];
      throw new Error('Session expired. Please login again.');
    }
    throw error;
  }
};

export const removeFromCart = async (cartItemId) => {
  try {
    // Ensure we have a valid token and set it in headers
    const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (!token) {
      // If no token, fall back to local storage cart handling
      console.log('No auth token found, using local storage for cart');
      const cartData = await AsyncStorage.getItem(STORAGE_KEYS.CART);
      let cart = cartData ? JSON.parse(cartData) : { items: [] };
      
      // Filter out the item
      cart.items = cart.items.filter(item => item.id !== cartItemId);
      await AsyncStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
      return cart;
    }

    // First, get the cart to find the correct product_id
    const cartResponse = await api.get('/cart/items/');
    const cartItems = cartResponse.data.items || [];
    
    // Find the cart item that matches the ID we want to delete
    const cartItem = cartItems.find(item => item.id === cartItemId);
    
    if (!cartItem) {
      throw new Error('Cart item not found');
    }
    
    // Use the product_id from the cart item
    const productId = cartItem.product_id || cartItem.product;
    console.log(`Found product_id: ${productId} for cart item: ${cartItemId}`);
    
    // Use the correct endpoint and method with the product_id
    const response = await api.post('/cart/remove_item/', {
      product_id: productId
    });
    
    console.log('Item removed successfully');
    if (globalRefreshCartCallback) globalRefreshCartCallback();
    return response.data;
  } catch (error) {
    
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      delete api.defaults.headers.common['Authorization'];
      throw new Error('Session expired. Please login again.');
    }
    
    if (error.response?.status === 403) {
      throw new Error('You do not have permission to remove this item from cart.');
    }
    
    if (error.response?.status === 404) {
      throw new Error('Cart item not found');
    }
    
    throw error;
  }
};

// Make deleteCartItem directly handle the delete functionality rather than just being an alias
export const deleteCartItem = async (itemId) => {
  try {
    return await removeFromCart(itemId);
  } catch (error) {
    console.error('Error in deleteCartItem:', error);
    throw error;
  }
};

export const updateCartItemQuantity = async (cartItemId, quantity) => {
  try {
    // Get the auth token
    const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (!token) {
      throw new Error('Please login to update cart');
    }

    // Set the auth token in headers
    api.defaults.headers.common['Authorization'] = `Token ${token}`;

    // Make the API call to update quantity
    const response = await api.post('/cart/update_quantity/', {
      product_id: cartItemId,
      quantity: quantity
    });

    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      // Clear auth data on 401
      await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      delete api.defaults.headers.common['Authorization'];
      throw new Error('Session expired. Please login again.');
    }
    if (error.response?.status === 403) {
      throw new Error('You do not have permission to update this cart item.');
    }
    if (error.response?.status === 404) {
      throw new Error('Cart item not found');
    }
    throw error;
  }
};

export const checkoutCart = async (shippingDetails) => {
  try {
    const { data } = await api.post('/cart/checkout/', shippingDetails);
    return data;
  } catch (error) {
    console.error('Error during checkout:', error);
    throw error;
  }
};

// Product functions
export const fetchProducts = async (searchQuery = '') => {
  try {
    const { data } = await api.get('/products/', {
      params: {
        search: searchQuery
      }
    });
    return data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

export const fetchProductById = async (id) => {
  try {
    // First try the products endpoint
    try {
      const { data } = await api.get(`/products/${id}/`);
      return { 
        ...data,
        image: data.image ? await processImageUrl(data.image) : null
      };
    } catch (productsError) {
      // If products endpoint fails, try the posts endpoint
      if (productsError.response?.status === 404) {
        const { data } = await api.get(`/posts/${id}/`);
        return {
          ...data,
          image: data.image ? await processImageUrl(data.image) : null
        };
      }
      throw productsError;
    }
  } catch (error) {
    throw error;
  }
};

// Category functions
export const fetchCategories = async () => {
  try {
    const { data } = await api.get('/categories/');
    return data;
  } catch (error) {
    throw error;
  }
};

export const fetchCategoryById = async (id) => {
  try {
    const { data } = await api.get(`/categories/${id}/`);
    return data;
  } catch (error) {
    throw error;
  }
};

export const fetchProductsByCategory = async (categoryId) => {
  try {
    // Validate categoryId
    if (!categoryId || categoryId === 'undefined' || isNaN(parseInt(categoryId))) {
      throw new Error('Invalid category ID');
    }

    const { data } = await api.get(`/categories/${categoryId}/products/`);
    
    // Validate response data
    if (!data) {
      throw new Error('No data received from server');
    }
    
    if (!Array.isArray(data)) {
      throw new Error('Invalid response format from server');
    }
    
    return data;
  } catch (error) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      throw {
        response: {
          data: error.response.data,
          status: error.response.status
        }
      };
    } else if (error.request) {
      // The request was made but no response was received
      throw new Error('No response from server');
    } else {
      // Something happened in setting up the request that triggered an Error
      throw error;
    }
  }
};

// Order functions
export const getOrders = async () => {
  try {
    const { data } = await api.get('/orders/');
    return data;
  } catch (error) {
    throw error;
  }
};

export const getOrderById = async (orderId) => {
  try {
    const { data } = await api.get(`/orders/${orderId}/`);
    return data;
  } catch (error) {
    throw error;
  }
};

export const placeOrder = async (orderData) => {
  try {
    const { data } = await api.post('/orders/', orderData);
    return data;
  } catch (error) {
    console.error('Error placing order:', error);
    throw error;
  }
};

// New order status management functions
export const updateOrderStatus = async (orderId, status) => {
  try {
    const { data } = await api.put(`/orders/${orderId}/`, { status });
    return data;
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

export const shipOrder = async (orderId) => {
  try {
    const { data } = await api.post(`/orders/${orderId}/ship/`);
    return data;
  } catch (error) {
    console.error('Error shipping order:', error);
    throw error;
  }
};

export const deliverOrder = async (orderId) => {
  try {
    const { data } = await api.post(`/orders/${orderId}/deliver/`);
    return data;
  } catch (error) {
    console.error('Error delivering order:', error);
    throw error;
  }
};

export const cancelOrder = async (orderId) => {
  try {
    const { data } = await api.post(`/orders/${orderId}/cancel/`);
    return data;
  } catch (error) {
    console.error('Error cancelling order:', error);
    throw error;
  }
};

// Favorite functions
export const getFavorites = async () => {
  try {
    const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (!token) {
      // If not logged in, get from local storage
      const favoritesData = await AsyncStorage.getItem(STORAGE_KEYS.FAVORITES);
      return favoritesData ? JSON.parse(favoritesData) : [];
    }
    
    const { data } = await api.get('/favorites/');
    return Array.isArray(data) ? data : [];
  } catch (error) {
    return [];
  }
};

export const toggleFavorite = async (product) => {
  try {
    const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (!token) {
      // If not logged in, use local storage
      const favoritesData = await AsyncStorage.getItem(STORAGE_KEYS.FAVORITES);
      const favorites = favoritesData ? JSON.parse(favoritesData) : [];
      
      const index = favorites.findIndex(fav => fav.id === product.id);
      if (index === -1) {
        favorites.push(product);
      } else {
        favorites.splice(index, 1);
      }
      
      await AsyncStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
      return favorites;
    }

    // If logged in, use API
    const response = await api.post('/favorites/toggle/', {
      product_id: product.id
    });
    console.log('API toggleFavorite response:', response.data);

    // The response should contain the updated favorites list
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('Error toggling favorite:', error);
    return [];
  }
};

export const isProductFavorited = async (productId) => {
  try {
    const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (!token) {
      // If not logged in, check local storage
      const favoritesData = await AsyncStorage.getItem(STORAGE_KEYS.FAVORITES);
      const favorites = favoritesData ? JSON.parse(favoritesData) : [];
      return favorites.some(fav => fav.id === productId);
    }

    // If logged in, check API
    const { data } = await api.get(`/favorites/check/${productId}/`);
    return data.is_favorited;
  } catch (error) {
    console.error('Error checking favorite status:', error);
    return false;
  }
};

// Rating functions
export const rateProduct = async (productId, rating, comment = '') => {
  try {
    const { data } = await api.post(`/products/${productId}/rate/`, {
      rating,
      comment
    });
    return data;
  } catch (error) {
    console.error('Error rating product:', error);
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      delete api.defaults.headers.common['Authorization'];
      throw new Error('Session expired. Please login again.');
    }
    throw error;
  }
};

// Utility functions
export const processImageUrl = async (url) => {
  if (!url) {
    console.log('No image URL provided, using local fallback');
    return null; // Return null to indicate no image
  }

  try {
    // If the URL is already absolute, use it as is
    if (url.startsWith('http')) {
      console.log('Using absolute URL:', url);
      return url;
    }

    // Remove any leading / or media/ from url
    const cleanedUrl = url
      .replace(/^\/?media\/?/, '') // remove leading "media/" if exists
      .replace(/^\/+/, ''); // remove any other leading slashes

    // Construct the URL without double-prefixing
    const finalUrl = `${MEDIA_BASE_URL}/media/${cleanedUrl}`;
    console.log('Processed image URL:', finalUrl);
    return finalUrl;
  } catch (error) {
    console.error('Error processing image URL:', error);
    console.error('Original URL:', url);
    return null; // Return null to indicate error
  }
};

export const updatePassword = async (currentPassword, newPassword) => {
  try {
    const response = await api.post('/users/update_password/', {
      current_password: currentPassword,
      new_password: newPassword
    });
    return response.data;
  } catch (error) {
    console.error('Error updating password:', error);
    throw error;
  }
};

export const deleteAccount = async (password) => {
  try {
    const response = await api.post('/users/delete_account/', {
      password: password
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting account:', error);
    throw error;
  }
};

// Recent searches functions
export const getUserRecentSearches = async () => {
  try {
    // Always use local storage for recent searches since the API endpoint doesn't exist
    const recentSearchesData = await AsyncStorage.getItem(STORAGE_KEYS.RECENT_SEARCHES);
    return recentSearchesData ? JSON.parse(recentSearchesData) : [];
  } catch (error) {
    console.error('Error getting recent searches:', error);
    return [];
  }
};

export const saveUserRecentSearch = async (searchTerm) => {
  try {
    if (!searchTerm || typeof searchTerm !== 'string') {
      console.warn('Invalid search term provided to saveUserRecentSearch');
      return [];
    }
    
    // Always use local storage for recent searches
    const recentSearchesData = await AsyncStorage.getItem(STORAGE_KEYS.RECENT_SEARCHES);
    const recentSearches = recentSearchesData ? JSON.parse(recentSearchesData) : [];
    
    // Remove if already exists (to move it to the front)
    const filteredSearches = recentSearches.filter(term => term !== searchTerm);
    
    // Add to beginning and limit to 5 recent searches
    const updatedSearches = [searchTerm, ...filteredSearches].slice(0, 5);
    
    await AsyncStorage.setItem(STORAGE_KEYS.RECENT_SEARCHES, JSON.stringify(updatedSearches));
    return updatedSearches;
  } catch (error) {
    console.error('Error saving recent search:', error);
    return [];
  }
};

export const removeUserRecentSearch = async (searchTerm) => {
  try {
    if (!searchTerm || typeof searchTerm !== 'string') {
      console.warn('Invalid search term provided to removeUserRecentSearch');
      return [];
    }
    
    // Always use local storage for recent searches
    const recentSearchesData = await AsyncStorage.getItem(STORAGE_KEYS.RECENT_SEARCHES);
    const recentSearches = recentSearchesData ? JSON.parse(recentSearchesData) : [];
    
    const updatedSearches = recentSearches.filter(term => term !== searchTerm);
    await AsyncStorage.setItem(STORAGE_KEYS.RECENT_SEARCHES, JSON.stringify(updatedSearches));
    return updatedSearches;
  } catch (error) {
    console.error('Error removing recent search:', error);
    return [];
  }
};

export const clearAllUserRecentSearches = async () => {
  try {
    // Always use local storage for recent searches
    await AsyncStorage.removeItem(STORAGE_KEYS.RECENT_SEARCHES);
    return [];
  } catch (error) {
    console.error('Error clearing recent searches:', error);
    return [];
  }
};

export const getPrivacyPolicy = async () => {
    try {
        const response = await api.get('/privacy-policies/');
        return response.data; // Return all policies
    } catch (error) {
        console.error('Error fetching privacy policy:', error);
        throw error;
    }
};

export const getFAQs = async (category = 'All') => {
    try {
        const { data } = await api.get('/faqs/', {
            params: {
                category: category
            }
        });
        return data;
    } catch (error) {
        console.error('Error fetching FAQs:', error);
        throw error;
    }
};

export const getFAQCategories = async () => {
    try {
        const { data } = await api.get('/faqs/categories/');
        return data.map(category => category.value);
    } catch (error) {
        console.error('Error fetching FAQ categories:', error);
        // Return default categories if API fails
        return ['All', 'Services', 'General', 'Account'];
    }
};

export const getContacts = async () => {
  try {
    const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (!token) {
      // Return default contacts if not logged in
      return [
        {
          id: 1,
          contact_type: 'customer_service',
          title: 'Customer Service',
          value: '(480)555-0103',
          is_active: true
        },
        {
          id: 2,
          contact_type: 'whatsapp',
          title: 'WhatsApp',
          value: '(480)555-0103',
          is_active: true
        },
        {
          id: 3,
          contact_type: 'website',
          title: 'Website',
          value: 'www.example.com',
          is_active: true
        },
        {
          id: 4,
          contact_type: 'facebook',
          title: 'Facebook',
          value: '@example',
          is_active: true
        },
        {
          id: 5,
          contact_type: 'instagram',
          title: 'Instagram',
          value: '@example',
          is_active: true
        },
        {
          id: 6,
          contact_type: 'twitter',
          title: 'Twitter',
          value: '@example',
          is_active: true
        }
      ];
    }

    // Set the auth token in headers
    api.defaults.headers.common['Authorization'] = `Token ${token}`;
    
    const { data } = await api.get('/contacts/');
    return data;
  } catch (error) {
    console.error('Error fetching contacts:', error);
    // Return default contacts on error
    return [
      {
        id: 1,
        contact_type: 'customer_service',
        title: 'Customer Service',
        value: '(480)555-0103',
        is_active: true
      },
      {
        id: 2,
        contact_type: 'whatsapp',
        title: 'WhatsApp',
        value: '(480)555-0103',
        is_active: true
      },
      {
        id: 3,
        contact_type: 'website',
        title: 'Website',
        value: 'www.example.com',
        is_active: true
      },
      {
        id: 4,
        contact_type: 'facebook',
        title: 'Facebook',
        value: '@example',
        is_active: true
      },
      {
        id: 5,
        contact_type: 'instagram',
        title: 'Instagram',
        value: '@example',
        is_active: true
      },
      {
        id: 6,
        contact_type: 'twitter',
        title: 'Twitter',
        value: '@example',
        is_active: true
      }
    ];
  }
};

export const getInviteMessage = async () => {
  return {
    message: "Hey! I've been shopping on Vendora App and it's been amazing! They have awesome deals, fast delivery, and quality products. Use my link to sign up and get a special discount on your first order!",
    link: "https://play.google.com/store/apps/details?id=com.vendora.app"
  };
};

export const fetchSliders = async () => {
  try {
    const { data } = await api.get('/sliders/');
    return data;
  } catch (error) {
    console.error('Error fetching sliders:', error);
    throw error;
  }
};

// Coupon functions
export const getCoupons = async () => {
  try {
    const { data } = await api.get('/coupons/');
    return data;
  } catch (error) {
    console.error('Error fetching coupons:', error);
    throw error;
  }
};

export const validateCoupon = async (code, cartTotal) => {
  try {
    const { data } = await api.post('/validate-coupon/', {
      code,
      cart_total: cartTotal
    });
    return data;
  } catch (error) {
    console.error('Error validating coupon:', error);
    if (error.response?.data) {
      // Return the error response data with a valid property set to false
      return {
        valid: false,
        message: error.response.data.message || 'Invalid coupon code',
        ...error.response.data
      };
    }
    throw error;
  }
};

export const getNotifications = async () => {
  try {
    const { data } = await api.get('/notifications/');
    return data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

export const markNotificationAsRead = async (notificationId) => {
  try {
    const { data } = await api.put(`/notifications/${notificationId}/read/`);
    return data;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

export const deleteNotification = async (notificationId) => {
  try {
    const { data } = await api.delete(`/notifications/${notificationId}/`);
    return data;
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};

export const clearAllNotifications = async () => {
  try {
    const { data } = await api.delete('/notifications/clear_all/');
    return data;
  } catch (error) {
    console.error('Error clearing notifications:', error);
    throw error;
  }
};
