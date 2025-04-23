import { TouchableOpacity, ActivityIndicator } from 'react-native'
import React, { useState, useEffect } from 'react'
import { HeartIcon } from 'react-native-heroicons/outline'
import { HeartIcon as HeartSolid } from 'react-native-heroicons/solid'
import { getFavorites } from '../api'

/**
 * A reusable favorite/wishlist button component
 * 
 * @param {Object} props Component props
 * @param {boolean} props.isFavorite Whether the item is in favorites
 * @param {Function} props.onToggleFavorite Function to call when toggling favorite state
 * @param {number} props.size Icon size
 * @param {string} props.activeColor Color when active
 * @param {string} props.inactiveColor Color when inactive
 * @param {Object} props.style Additional styles for the container
 * @param {number} props.productId The ID of the product
 * @returns {React.Component} Favorite button component
 */
export default function FavoriteButton({ 
  isFavorite = false,
  onToggleFavorite,
  size = 24,
  activeColor = '#ff3b30',
  inactiveColor = '#000000',
  style = {},
  productId
}) {
  const [loading, setLoading] = useState(false);
  const [favoriteState, setFavoriteState] = useState(isFavorite);

  // Update favorite state when isFavorite prop changes
  useEffect(() => {
    setFavoriteState(isFavorite);
  }, [isFavorite]);

  // Check favorite status when component mounts
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (productId) {
        try {
          const favorites = await getFavorites();
          const isFavorited = favorites.some(fav => fav.id === productId);
          setFavoriteState(isFavorited);
        } catch (error) {
          console.error('Error checking favorite status:', error);
        }
      }
    };

    checkFavoriteStatus();
  }, [productId]);

  const handlePress = async () => {
    if (!onToggleFavorite) return;
    
    try {
      setLoading(true);
      await onToggleFavorite();
      // Update local state after successful toggle
      setFavoriteState(!favoriteState);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={loading}
      style={style}
      className="justify-center items-center"
    >
      {loading ? (
        <ActivityIndicator size="small" color={activeColor} />
      ) : favoriteState ? (
        <HeartSolid size={size} color={activeColor} />
      ) : (
        <HeartIcon size={size} color={inactiveColor} />
      )}
    </TouchableOpacity>
  )
} 