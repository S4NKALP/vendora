import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { View, Text } from 'react-native';

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

// Storage Keys
const STORAGE_KEYS = {
  CART: 'cart',
  USER_TOKEN: 'userToken',
  USER_DATA: 'userData',
  FAVORITES: 'favorites',
  CSRF_TOKEN: 'csrfToken'
};

// API Configuration8000
export const MEDIA_BASE_URL = 'http://192.168.18.3:8000';
export const BASE_URL = `${MEDIA_BASE_URL}/api`;

// Create axios instance with consistent configuration
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  withCredentials: true, // Important for CSRF cookie handling
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Function to fetch CSRF token
export const fetchCSRFToken = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/get-csrf-token/`, {
      withCredentials: true,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    if (response.data && response.data.csrfToken) {
      await AsyncStorage.setItem(STORAGE_KEYS.CSRF_TOKEN, response.data.csrfToken);
      // Also set it in the default headers
      apiClient.defaults.headers.common['X-CSRFToken'] = response.data.csrfToken;
      return response.data.csrfToken;
    }
    
    console.error('No CSRF token in response:', response.data);
    return null;
  } catch (error) {
    console.error('Failed to fetch CSRF token:', error.response || error);
    return null;
  }
};

// Helper function to get stored CSRF token
const getCSRFToken = async () => {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.CSRF_TOKEN);
  } catch (error) {
    console.error('Error getting CSRF token from storage:', error);
    return null;
  }
};

// Add token and CSRF token to requests when available
apiClient.interceptors.request.use(
  async (config) => {
    // Add auth token if available
    const token = await AsyncStorage.getItem(STORAGE_KEYS.USER_TOKEN);
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    
    // Add CSRF token if available
    const csrfToken = await getCSRFToken();
    if (csrfToken) {
      config.headers['X-CSRFToken'] = csrfToken;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle response errors, especially auth errors
apiClient.interceptors.response.use(
  response => response,
  async (error) => {
    // Handle 403 CSRF errors
    if (error.response && error.response.status === 403) {
      const errorDetail = error.response.data?.detail || '';
      if (errorDetail.includes('CSRF') || 
          (typeof error.response.data === 'string' && error.response.data.includes('CSRF'))) {
        console.log('CSRF token missing or invalid. Fetching new token...');
        
        try {
          // Get a new CSRF token
          await fetchCSRFToken();
          
          // Retry the original request with new CSRF token
          const originalRequest = error.config;
          const csrfToken = await getCSRFToken();
          if (csrfToken) {
            originalRequest.headers['X-CSRFToken'] = csrfToken;
            return axios(originalRequest);
          }
        } catch (csrfError) {
          console.error('Failed to refresh CSRF token:', csrfError);
        }
      }
    }
    
    // Handle 401 unauthorized errors
    if (error.response && error.response.status === 401) {
      // Clear auth data
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_TOKEN);
      delete apiClient.defaults.headers.common['Authorization'];
    }
    
    return Promise.reject(error);
  }
);

// Process image URLs with authentication if needed
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

// CATEGORIES
export const fetchCategories = async () => {
  try {
    const { data } = await apiClient.get('/categories/');
    const processedData = await Promise.all(data.map(async category => ({
      ...category,
      image: await processImageUrl(category.image)
    })));
    return processedData;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

export const fetchCategoryById = async (id) => {
  try {
    const { data } = await apiClient.get(`/categories/${id}/`);
    return {
      ...data,
      image: await processImageUrl(data.image)
    };
  } catch (error) {
    console.error('Error fetching category:', error);
    throw error;
  }
};

export const fetchProductsByCategory = async (categoryId) => {
  try {
    const { data } = await apiClient.get(`/categories/${categoryId}/products/`);
    const processedData = await Promise.all(
      data.map(async (product) => ({
        ...product,
        image: await processImageUrl(product.image)
      }))
    );
    return processedData;
  } catch (error) {
    console.error('Error fetching products by category:', error);
    throw error;
  }
};

// PRODUCTS
export const fetchProducts = async (searchTerm = '') => {
  try {
    // Ensure searchTerm is a string
    const searchQuery = String(searchTerm || '').trim();
    
    // Simulate authentication check
    await checkAuthentication();
    
    // Make API call to fetch products
    const { data } = await apiClient.get('/products/', {
      params: {
        search: searchQuery
      }
    });
    
    // Process product images
    const processedData = await Promise.all(
      data.map(async (product) => ({
        ...product,
        image: await processImageUrl(product.image)
      }))
    );
    
    // Save to recent searches if user is logged in and search term is not empty
    if (searchQuery) {
      try {
        await saveUserRecentSearch(searchQuery);
      } catch (error) {
        // Silently fail if user is not logged in
        console.log('User not logged in, not saving search');
      }
    }
    
    return processedData;
  } catch (error) {
    console.error('Error fetching products:', error);
    // Return empty array instead of throwing error
    return [];
  }
};

export const fetchProductById = async (id) => {
  try {
    // First try the products endpoint
    try {
      const { data } = await apiClient.get(`/products/${id}/`);
      return {
        ...data,
        image: await processImageUrl(data.image)
      };
    } catch (productsError) {
      // If products endpoint fails, try the posts endpoint
      if (productsError.response?.status === 404) {
        const { data } = await apiClient.get(`/posts/${id}/`);
        return {
          ...data,
          image: await processImageUrl(data.image),
          // Map post fields to product fields if needed
          name: data.title,
          price: data.price || 0,
          rating: data.rating || 0
        };
      }
      throw productsError;
    }
  } catch (error) {
    console.error('Error fetching product:', error);
    if (error.response?.status === 404) {
      throw new Error('Product not found');
    }
    throw error;
  }
};

// CART
export const getCart = async () => {
  try {
    const token = await AsyncStorage.getItem(STORAGE_KEYS.USER_TOKEN);
    if (!token) {
      // If not logged in, get from local storage
      const localCart = await AsyncStorage.getItem(STORAGE_KEYS.CART);
      return localCart ? JSON.parse(localCart) : { items: [] };
    }
    
    const { data } = await apiClient.get('/cart/items/');
    
    // Process product images and prices
    if (data && data.items) {
      const processedItems = await Promise.all(
        data.items.map(async (item) => {
          const price = parseFloat(item.product_price);
          return {
            ...item,
            product_image: await processImageUrl(item.product_image),
            product_price: !isNaN(price) ? price : 0,
            price: !isNaN(price) ? price : 0
          };
        })
      );
      return {
        ...data,
        items: processedItems
      };
    }
    return data;
  } catch (error) {
    console.error('Error getting cart:', error);
    if (error.response?.status === 401) {
      // If unauthorized, try to get from local storage
      const localCart = await AsyncStorage.getItem(STORAGE_KEYS.CART);
      return localCart ? JSON.parse(localCart) : { items: [] };
    }
    throw error;
  }
};

// Global refresh function
let globalRefreshCart = null;

export const setGlobalRefreshCart = (refreshFunction) => {
  globalRefreshCart = refreshFunction;
};

export const addToCart = async (productId, quantity = 1) => {
  try {
    const token = await AsyncStorage.getItem(STORAGE_KEYS.USER_TOKEN);
    if (!token) {
      // If not logged in, use local storage
      const localCart = await AsyncStorage.getItem(STORAGE_KEYS.CART);
      const currentCart = localCart ? JSON.parse(localCart) : { items: [] };
      
      // Check if product already exists in cart
      const existingItem = currentCart.items.find(item => item.product === productId);
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        currentCart.items.push({
          product: productId,
          quantity,
          product_price: 0, // Will be updated when user logs in
          product_image: null
        });
      }
      
      await AsyncStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(currentCart));
      
      // Trigger cart refresh if available
      if (globalRefreshCart) {
        globalRefreshCart();
      }
      
      return currentCart;
    }

    const { data } = await apiClient.post('/cart/add_item/', {
      product_id: productId,
      quantity
    });
    
    // Process product images and prices
    if (data && data.items) {
      const processedItems = await Promise.all(
        data.items.map(async (item) => {
          const price = parseFloat(item.product_price);
          return {
            ...item,
            product_image: await processImageUrl(item.product_image),
            product_price: !isNaN(price) ? price : 0,
            price: !isNaN(price) ? price : 0
          };
        })
      );
      
      // Trigger cart refresh if available
      if (globalRefreshCart) {
        globalRefreshCart();
      }
      
      return {
        ...data,
        items: processedItems
      };
    }
    return data;
  } catch (error) {
    console.error('Error adding to cart:', error);
    if (error.response?.status === 401) {
      // If unauthorized, try to add to local storage
      return await addToCart(productId, quantity);
    }
    throw error;
  }
};

export const updateCartItemQuantity = async (itemId, quantity) => {
  try {
    const { data } = await apiClient.post('/cart/update_quantity/', {
      item_id: itemId,
      quantity: quantity
    });
    return data;
  } catch (error) {
    console.error('Error updating cart quantity:', error);
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_TOKEN);
      delete apiClient.defaults.headers.common['Authorization'];
      throw new Error('Session expired. Please login again.');
    }
    throw error;
  }
};

export const deleteCartItem = async (itemId) => {
  try {
    console.log('Attempting to delete cart item with ID:', itemId);
    // First get the cart item to get the product ID
    const cartResponse = await apiClient.get('/cart/items/');
    const cartItem = cartResponse.data.items.find(item => item.id === itemId);
    
    if (!cartItem) {
      throw new Error('Cart item not found');
    }

    const response = await apiClient.post('/cart/remove_item/', {
      product_id: cartItem.product
    });
    console.log('Delete response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error removing cart item:', error);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_TOKEN);
      delete apiClient.defaults.headers.common['Authorization'];
      throw new Error('Session expired. Please login again.');
    }
    throw error;
  }
};

export const checkoutCart = async (shippingDetails) => {
  try {
    const { data } = await apiClient.post('/cart/checkout/', shippingDetails);
    return data;
  } catch (error) {
    console.error('Error checking out:', error);
    throw error;
  }
};

// AUTH - Fixed to match Django URLs
export const loginUser = async (credentials) => {
  try {
    // First ensure we have a CSRF token
    const csrfToken = await fetchCSRFToken();
    if (!csrfToken) {
      console.error('Failed to get CSRF token before login');
      return { success: false, error: 'Failed to establish secure connection' };
    }
    
    // Use the correct endpoint from your Django URLs
    const response = await apiClient.post('/token-auth/', credentials);
    const data = response.data;
    
    if (data && data.token) {
      // Store token
      await AsyncStorage.setItem(STORAGE_KEYS.USER_TOKEN, data.token);
      
      // Set the token in axios defaults
      apiClient.defaults.headers.common['Authorization'] = `Token ${data.token}`;
      
      // Store user data
      if (data.user) {
        await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(data.user));
      }
      
      return { success: true, user: data.user };
    }
    
    return { success: false, error: data?.message || 'Invalid credentials' };
  } catch (error) {
    console.error('Login Error:', error.response?.data || error);
    
    // Handle specific error cases
    if (error.response) {
      if (error.response.status === 401) {
        return { success: false, error: 'Invalid username or password' };
      } else if (error.response.status === 403) {
        // CSRF token might be invalid, try to refresh it
        await fetchCSRFToken();
        return { success: false, error: 'Please try again' };
      }
      return { 
        success: false, 
        error: error.response.data?.message || 'Login failed'
      };
    }
    
    // Network or other errors
    return { 
      success: false, 
      error: error.message || 'Network error. Please check your connection.'
    };
  }
};

export const registerUser = async (userData) => {
  try {
    // Ensure we have a CSRF token
    await fetchCSRFToken();
    
    const { data } = await apiClient.post('/users/', userData);
    return data;
  } catch (error) {
    console.error('Registration Error:', error);
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    // Try to logout on server using the correct endpoint
    try {
      await apiClient.post('/logout/');
    } catch (apiError) {
      console.log('API logout failed, continuing with local logout:', apiError);
    }
    
    // Clear local storage
    await AsyncStorage.removeItem(STORAGE_KEYS.USER_TOKEN);
    await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
    
    // Clear API client headers
    delete apiClient.defaults.headers.common['Authorization'];
    
    return { success: true };
  } catch (error) {
    console.error('Error during logout:', error);
    return { success: false, error: error.message };
  }
};

export const getCurrentUser = async () => {
  try {
    // Check if we have a token
    const token = await AsyncStorage.getItem(STORAGE_KEYS.USER_TOKEN);
    if (!token) return null;
    
    // Get user data from API
    const { data } = await apiClient.get('/users/me/');
    
    // Store updated data
    await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(data));
    
    return data;
  } catch (error) {
    console.error('Error getting current user:', error);
    
    // Fallback to cached data
    const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
    return userData ? JSON.parse(userData) : null;
  }
};

// ORDERS
export const getOrders = async () => {
  try {
    const { data } = await apiClient.get('/orders/');
    return data;
  } catch (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
};

export const getOrderById = async (orderId) => {
  try {
    const { data } = await apiClient.get(`/orders/${orderId}/`);
    return data;
  } catch (error) {
    console.error('Error fetching order details:', error);
    throw error;
  }
};

export const placeOrder = async (orderData) => {
  try {
    const { data } = await apiClient.post('/orders/', orderData);
    return data;
  } catch (error) {
    console.error('Error placing order:', error);
    throw error;
  }
};

// FAVORITES
export const getFavorites = async () => {
  try {
    const token = await AsyncStorage.getItem(STORAGE_KEYS.USER_TOKEN);
    if (!token) {
      // If not logged in, get from local storage
      const localFavorites = await AsyncStorage.getItem(STORAGE_KEYS.FAVORITES);
      return localFavorites ? JSON.parse(localFavorites) : [];
    }
    
    const { data } = await apiClient.get('/favorites/');
    
    // Process images
    if (Array.isArray(data)) {
      const processedData = await Promise.all(
        data.map(async (favorite) => {
          const product = favorite.product || favorite;
          return {
            ...product,
            image: await processImageUrl(product.image)
          };
        })
      );
      return processedData;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error getting favorites:', error);
    return [];
  }
};

export const toggleFavorite = async (product) => {
  try {
    const token = await AsyncStorage.getItem(STORAGE_KEYS.USER_TOKEN);
    if (!token) {
      // If not logged in, use local storage
      const localFavorites = await AsyncStorage.getItem(STORAGE_KEYS.FAVORITES);
      const currentFavorites = localFavorites ? JSON.parse(localFavorites) : [];
      
      // Check if product exists in favorites
      const exists = currentFavorites.some(item => item.id === product.id);
      let updatedFavorites;
      
      if (exists) {
        // Remove from favorites
        updatedFavorites = currentFavorites.filter(item => item.id !== product.id);
      } else {
        // Add to favorites
        const processedProduct = {
          ...product,
          image: await processImageUrl(product.image)
        };
        updatedFavorites = [...currentFavorites, processedProduct];
      }
      
      // Save to local storage
      await AsyncStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(updatedFavorites));
      return updatedFavorites;
    }

    // If logged in, use API
    await apiClient.post('/favorites/toggle/', {
      product_id: product.id
    });

    // Get updated favorites list
    return await getFavorites();
  } catch (error) {
    console.error('Error toggling favorite:', error);
    return [];
  }
};

// RATINGS
export const rateProduct = async (productId, rating, comment = '') => {
  try {
    const { data } = await apiClient.post(`/products/${productId}/rate/`, {
      rating,
      comment
    });
    return data;
  } catch (error) {
    console.error('Error rating product:', error);
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_TOKEN);
      delete apiClient.defaults.headers.common['Authorization'];
      throw new Error('Session expired. Please login again.');
    }
    throw error;
  }
};

// Initialize API - Updated to handle CSRF token
export const initializeAPI = async () => {
  try {
    console.log('Initializing API...');
    
    // First fetch CSRF token
    const csrfToken = await fetchCSRFToken();
    if (!csrfToken) {
      console.error('Failed to fetch CSRF token during initialization');
      return false;
    }
    console.log('CSRF token fetched successfully');
    
    // Then check auth token
    const token = await AsyncStorage.getItem(STORAGE_KEYS.USER_TOKEN);
    if (token) {
      apiClient.defaults.headers.common['Authorization'] = `Token ${token}`;
      console.log('Auth token loaded');
      
      // Verify token is valid
      try {
        const response = await apiClient.get('/users/me/');
        console.log('User authenticated:', response.data);
        return true;
      } catch (error) {
        console.error('Token validation error:', error.response?.data || error);
        if (error.response?.status === 401) {
          // Token invalid, clear it
          await AsyncStorage.removeItem(STORAGE_KEYS.USER_TOKEN);
          delete apiClient.defaults.headers.common['Authorization'];
          console.log('Invalid token cleared');
        }
      }
    } else {
      console.log('No auth token found');
    }
    return false;
  } catch (error) {
    console.error('Failed to initialize API:', error.response?.data || error);
    return false;
  }
};

// For backwards compatibility
export const fetchPosts = async (searchTerm) => {
  try {
    // Simulate authentication check
    await checkAuthentication();
    
    // Simulate network delay
    await delay(500);
    
    // Filter products based on search term
    const results = await Promise.all(
      mockProducts
        .filter(product => 
          product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.category.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .map(async product => ({
          ...product,
          image: await processImageUrl(product.image)
        }))
    );
    
    // Save to recent searches if user is logged in
    try {
      await saveUserRecentSearch(searchTerm);
    } catch (error) {
      // Silently fail if user is not logged in
      console.log('User not logged in, not saving search');
    }
    
    return results;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

export const fetchPostById = async (id) => {
  try {
    // Simulate authentication check
    await checkAuthentication();
    
    await delay(200);
    const product = mockProducts.find(p => p.id === parseInt(id));
    if (!product) {
      throw new Error('Product not found');
    }
    return {
      ...product,
      image: await processImageUrl(product.image)
    };
  } catch (error) {
    throw error;
  }
};

export const getUserData = async () => {
  try {
    const token = await AsyncStorage.getItem(STORAGE_KEYS.USER_TOKEN);
    if (!token) return null;
    
    const { data } = await apiClient.get('/users/me/');
    return data;
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
};

// RECENT SEARCHES
export const getUserRecentSearches = async () => {
  try {
    const searches = await AsyncStorage.getItem('recentSearches');
    return searches ? JSON.parse(searches) : [];
  } catch (error) {
    console.error('Error getting recent searches:', error);
    return [];
  }
};

export const saveUserRecentSearch = async (searchTerm) => {
  try {
    const searches = await getUserRecentSearches();
    const updatedSearches = [searchTerm, ...searches.filter(term => term !== searchTerm)].slice(0, 10);
    await AsyncStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
    return updatedSearches;
  } catch (error) {
    console.error('Error saving recent search:', error);
    return [];
  }
};

export const removeUserRecentSearch = async (searchTerm) => {
  try {
    const searches = await getUserRecentSearches();
    const updatedSearches = searches.filter(term => term !== searchTerm);
    await AsyncStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
    return updatedSearches;
  } catch (error) {
    console.error('Error removing recent search:', error);
    return [];
  }
};

export const clearAllUserRecentSearches = async () => {
  try {
    await AsyncStorage.removeItem('recentSearches');
    return [];
  } catch (error) {
    console.error('Error clearing recent searches:', error);
    return [];
  }
};

// FAVORITES
export const isProductFavorited = async (productId) => {
  try {
    const token = await AsyncStorage.getItem(STORAGE_KEYS.USER_TOKEN);
    if (!token) {
      // If not logged in, check local storage
      const localFavorites = await AsyncStorage.getItem(STORAGE_KEYS.FAVORITES);
      const favorites = localFavorites ? JSON.parse(localFavorites) : [];
      return { 
        success: true, 
        isFavorited: favorites.some(item => item.id === productId) 
      };
    }

    // If logged in, check API
    const { data } = await apiClient.get(`/favorites/check/${productId}/`);
    return { 
      success: true, 
      isFavorited: data.is_favorited 
    };
  } catch (error) {
    console.error('Error checking favorite status:', error);
    return { 
      success: false, 
      isFavorited: false 
    };
  }
};

// Authentication check function
export const checkAuthentication = async () => {
  try {
    const token = await AsyncStorage.getItem(STORAGE_KEYS.USER_TOKEN);
    if (!token) {
      throw { 
        response: { 
          status: 401, 
          data: { detail: 'Authentication credentials were not provided.' } 
        } 
      };
    }
    return token;
  } catch (error) {
    console.error('Authentication check failed:', error);
    throw error;
  }
};