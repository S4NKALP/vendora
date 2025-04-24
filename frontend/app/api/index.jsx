// mock-api.js
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock product data
const mockProducts = [
  {
    id: 1,
    title: "Fjallraven Backpack",
    price: 109.95,
    description: "Your perfect pack for everyday use and walks in the forest.",
    category: "men's clothing",
    image: "http://example.com/backpack.jpg",
    rating: { rate: 3.9, count: 120 }
  },
  {
    id: 2,
    title: "Casual Premium T-Shirt",
    price: 22.3,
    description: "Slim-fitting style, contrast raglan long sleeve.",
    category: "men's clothing",
    image: "http://example.com/tshirt.jpg",
    rating: { rate: 4.1, count: 259 }
  },
  {
    id: 3,
    title: "Cotton Jacket",
    price: 55.99,
    description: "Great outerwear jacket for Spring/Autumn/Winter.",
    category: "men's clothing",
    image: "http://example.com/jacket.jpg",
    rating: { rate: 4.7, count: 500 }
  },
  {
    id: 4,
    title: "Women's Boat Neck T",
    price: 9.85,
    description: "95% RAYON 5% SPANDEX, Made in USA or Imported.",
    category: "women's clothing",
    image: "http://example.com/womenshirt.jpg",
    rating: { rate: 4.5, count: 146 }
  },
  {
    id: 5,
    title: "Women's Snowboard Jacket",
    price: 56.99,
    description: "Note: The Jackets is US standard size.",
    category: "women's clothing",
    image: "http://example.com/snowjacket.jpg",
    rating: { rate: 2.6, count: 235 }
  }
];

// Mock carts data
const mockCarts = [
  {
    id: 1,
    userId: 1,
    date: "2024-04-15T00:00:00.000Z",
    products: [
      { productId: 1, quantity: 2 },
      { productId: 3, quantity: 1 }
    ]
  },
  {
    id: 2,
    userId: 2,
    date: "2024-04-14T00:00:00.000Z",
    products: [
      { productId: 2, quantity: 3 },
      { productId: 5, quantity: 1 }
    ]
  }
];

// Mock users data
const mockUsers = [
  {
    id: 1,
    username: "johndoe",
    email: "john@example.com",
    password: "password123"
  },
  {
    id: 2,
    username: "janedoe",
    email: "jane@example.com",
    password: "securepass"
  }
];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to simulate authentication in mock API
const checkAuthentication = async () => {
  const token = await AsyncStorage.getItem('userToken');
  if (!token) {
    // Simulate 401 error structure
    throw { 
      response: { 
        status: 401, 
        data: { detail: 'Authentication credentials were not provided.' } 
      } 
    };
  }
  return token;
};

// Mock API functions
export const fetchPosts = async () => {
  try {
    // Simulate authentication check
    await checkAuthentication();
    
    // Simulate network delay
    await delay(300);
    return [...mockProducts];
  } catch (error) {
    if (error.response && error.response.status === 401) {
      throw error; // Propagate authentication errors
    }
    throw new Error('Error fetching products');
  }
};

export const fetchPostsById = async (id) => {
  try {
    // Simulate authentication check
    await checkAuthentication();
    
    await delay(200);
    const product = mockProducts.find(p => p.id === parseInt(id));
    if (!product) {
      throw new Error('Product not found');
    }
    return product;
  } catch (error) {
    throw error;
  }
};

export const fetchCarts = async () => {
  try {
    // Simulate authentication check
    await checkAuthentication();
    
    await delay(300);
    return [...mockCarts];
  } catch (error) {
    if (error.response && error.response.status === 401) {
      throw error; // Propagate authentication errors
    }
    throw new Error('Error fetching carts');
  }
};

export const createCarts = async (product, quantity = 1) => {
  try {
    // Simulate authentication check
    await checkAuthentication();
    
    const cartData = await AsyncStorage.getItem('cart');
    let cart = cartData ? JSON.parse(cartData) : { data: [], totalPrice: 0 };

    const existingProductIndex = cart.data.findIndex(item => item.id === product.id);

    if (existingProductIndex !== -1) {
      cart.data[existingProductIndex].quantity = quantity;
      cart.data[existingProductIndex].totalPrice = cart.data[existingProductIndex].quantity * product.price;
    } else {
      cart.data.push({
        id: product.id,
        title: product.title,
        price: product.price,
        description: product.description,
        category: product.category,
        image: product.image,
        rating: {
          rate: product.rating ? product.rating.rate : 0,
          count: product.rating ? product.rating.count : 0,
        },
        quantity,
        totalPrice: quantity * product.price
      });
    }

    cart.totalPrice = cart.data.reduce((sum, item) => sum + item.totalPrice, 0);
    await AsyncStorage.setItem('cart', JSON.stringify(cart));

    await delay(200); // Simulate network delay
    return cart;
  } catch (error) {
    throw error;
  }
};

export const getCart = async () => {
  try {
    // Simulate authentication check
    await checkAuthentication();
    
    const cart = await AsyncStorage.getItem('cart');
    await delay(100);
    return cart ? JSON.parse(cart) : { data: [], totalPrice: 0 };
  } catch (error) {
    console.error('Error retrieving cart:', error);
    throw error;
  }
};

export const deleteCartItem = async (productId) => {
  try {
    // Simulate authentication check
    await checkAuthentication();
    
    const cartData = await AsyncStorage.getItem('cart');
    if (!cartData) {
      return { data: [], totalPrice: 0 };
    }
    
    let cart = JSON.parse(cartData);
    
    // Make sure cart has the expected structure
    if (!cart.data) {
      cart = { data: [], totalPrice: 0 };
    }

    // Filter out the item to be deleted
    cart.data = cart.data.filter(item => item.id !== productId);
    
    // Recalculate total price
    cart.totalPrice = cart.data.reduce((sum, item) => sum + (item.totalPrice || 0), 0);

    // Save updated cart to AsyncStorage
    await AsyncStorage.setItem('cart', JSON.stringify(cart));
    
    await delay(200); // Simulate network delay
    return cart;
  } catch (error) {
    console.error('Error deleting item from cart:', error);
    throw error;
  }
};

// User data with favorites and recent searches
const userData = {
  1: {
    id: 1,
    username: 'john_doe',
    email: 'john@example.com',
    favorites: [1, 4, 6],
    recentSearches: ['jacket', 'shoes', 'watch']
  },
  2: {
    id: 2,
    username: 'jane_smith',
    email: 'jane@example.com',
    favorites: [2, 3, 5],
    recentSearches: ['dress', 'bag', 'sunglasses']
  }
};

// Current user tracking (simpler than token-based auth)
let currentUserId = null;

// User authentication functions
export const loginUser = async (credentials) => {
  try {
    // Simulate network delay
    await delay(500);
    
    const { username, password } = credentials;
    
    // For demo purposes, simply find a user with matching username
    // In a real app, you would verify the password as well
    const userEntry = Object.entries(userData).find(([_, user]) => 
      user.username === username
    );
    
    if (userEntry) {
      const [userId, user] = userEntry;
      currentUserId = parseInt(userId);
      await AsyncStorage.setItem('currentUserId', userId.toString());
      return { success: true, user };
    }
    
    return { success: false, error: 'Invalid credentials' };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: error.message || 'Login failed' };
  }
};

export const logoutUser = async () => {
  try {
    await delay(300);
    currentUserId = null;
    await AsyncStorage.removeItem('currentUserId');
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    return { success: false, error: error.message };
  }
};

export const getCurrentUser = async () => {
  if (!currentUserId) {
    const storedId = await AsyncStorage.getItem('currentUserId');
    if (storedId) {
      currentUserId = parseInt(storedId);
    }
  }
  
  return userData[currentUserId] || null;
};

// Favorite functions
export const checkIsFavoriteForCurrentUser = async (productId) => {
  const user = await getCurrentUser();
  if (!user) return false;
  
  return user.favorites.includes(parseInt(productId));
};

export const toggleFavoriteForCurrentUser = async (productId) => {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not logged in');
  
  const id = parseInt(productId);
  const currentFavorites = [...user.favorites];
  
  const isFavorite = currentFavorites.includes(id);
  if (isFavorite) {
    // Remove from favorites
    userData[user.id].favorites = currentFavorites.filter(favId => favId !== id);
  } else {
    // Add to favorites
    userData[user.id].favorites = [...currentFavorites, id];
  }
  
  return !isFavorite; // Return the new status
};

export const getUserFavorites = async () => {
  const user = await getCurrentUser();
  if (!user) return [];
  
  return Promise.all(
    user.favorites.map(id => fetchProductById(id))
  );
};

// Recent searches functions
export const getUserRecentSearches = async () => {
  const user = await getCurrentUser();
  if (!user) return [];
  
  return user.recentSearches;
};

export const saveUserRecentSearch = async (searchTerm) => {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not logged in');
  
  // Remove if already exists (to move it to the front)
  let searches = user.recentSearches.filter(term => term !== searchTerm);
  
  // Add to beginning
  searches = [searchTerm, ...searches];
  
  // Limit to 5 recent searches
  searches = searches.slice(0, 5);
  
  userData[user.id].recentSearches = searches;
  
  return searches;
};

export const removeUserRecentSearch = async (searchTerm) => {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not logged in');
  
  userData[user.id].recentSearches = user.recentSearches.filter(
    term => term !== searchTerm
  );
  
  return userData[user.id].recentSearches;
};

export const clearAllUserRecentSearches = async () => {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not logged in');
  
  userData[user.id].recentSearches = [];
  
  return [];
};

// Add this function to get current user's favorites
export const getFavorites = async () => {
  try {
    await delay(300);
    
    if (currentUserId === null) {
      const storedId = await AsyncStorage.getItem('currentUserId');
      if (storedId) {
        currentUserId = parseInt(storedId);
      } else {
        return { success: false, error: 'User not logged in' };
      }
    }
    
    const userFavorites = userData[currentUserId]?.favorites || [];
    return { success: true, favorites: userFavorites };
  } catch (error) {
    console.error('Get favorites error:', error);
    return { success: false, error: error.message };
  }
};

// Add function to toggle favorite status
export const toggleFavorite = async (productId) => {
  try {
    await delay(300);
    
    if (currentUserId === null) {
      const storedId = await AsyncStorage.getItem('currentUserId');
      if (storedId) {
        currentUserId = parseInt(storedId);
      } else {
        return { success: false, error: 'User not logged in' };
      }
    }
    
    const favorites = userData[currentUserId]?.favorites || [];
    const index = favorites.indexOf(productId);
    
    if (index !== -1) {
      // Remove from favorites
      favorites.splice(index, 1);
    } else {
      // Add to favorites
      favorites.push(productId);
    }
    
    // Update the user data
    userData[currentUserId].favorites = favorites;
    
    return { success: true, favorites };
  } catch (error) {
    console.error('Toggle favorite error:', error);
    return { success: false, error: error.message };
  }
};

// Add a function to check if a product is favorited
export const isProductFavorited = async (productId) => {
  try {
    const { success, favorites, error } = await getFavorites();
    
    if (!success) {
      return { success: false, error };
    }
    
    return { 
      success: true, 
      isFavorited: favorites.includes(productId)
    };
  } catch (error) {
    console.error('Check favorite error:', error);
    return { success: false, error: error.message };
  }
};

// Update getUserData to use currentUserId
export const getUserData = async () => {
  try {
    await delay(300);
    
    if (currentUserId === null) {
      const storedId = await AsyncStorage.getItem('currentUserId');
      if (storedId) {
        currentUserId = parseInt(storedId);
      } else {
        return { success: false, error: 'User not logged in' };
      }
    }
    
    const user = userData[currentUserId];
    
    if (!user) {
      return { success: false, error: 'User not found' };
    }
    
    return { success: true, user };
  } catch (error) {
    console.error('Get user data error:', error);
    return { success: false, error: error.message };
  }
};

// Search functions
export const fetchProducts = async (searchTerm) => {
  try {
    // Simulate authentication check
    await checkAuthentication();
    
    // Simulate network delay
    await delay(500);
    
    // Filter products based on search term
    const results = mockProducts.filter(product => 
      product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase())
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

export const getInviteMessage = async () => {
  return {
    message: "Hey! I've been shopping on this Shopping App and it's been amazing! They have awesome deals, fast delivery, and quality products. Use my link to sign up and get a special discount on your first order!",
    link: "https://play.google.com/store/apps/details?id=com.vendora.app"
  };
};

// Mock slider data
const mockSliders = [
  {
    id: 1,
    title: "new collection",
    description: "Discount 50% for the first transaction.",
    image: "http://example.com/slider1.jpg",
    is_active: true
  },
  {
    id: 2,
    title: "kids collection",
    description: "Discount 50% for the first transaction.",
    image: "http://example.com/slider2.jpg",
    is_active: true
  },
  {
    id: 3,
    title: "traditional collection",
    description: "Discount 50% for the first transaction.",
    image: "http://example.com/slider3.jpg",
    is_active: true
  }
];

const api = {
  fetchPosts,
  fetchPostsById,
  fetchCarts,
  createCarts,
  getCart,
  deleteCartItem,
  loginUser,
  logoutUser,
  getCurrentUser,
  checkIsFavoriteForCurrentUser,
  toggleFavoriteForCurrentUser,
  getUserFavorites,
  getUserRecentSearches,
  saveUserRecentSearch,
  removeUserRecentSearch,
  clearAllUserRecentSearches,
  getFavorites,
  toggleFavorite,
  isProductFavorited,
  getUserData,
  fetchProducts,
  getInviteMessage
};

export default api;



