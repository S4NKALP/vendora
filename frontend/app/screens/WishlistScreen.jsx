import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { getFavorites, toggleFavorite } from '../api';
import { useFocusEffect } from '@react-navigation/native';
import { ChevronLeftIcon, HeartIcon } from 'react-native-heroicons/outline';
import { StarIcon } from 'react-native-heroicons/solid';
import Icon from 'react-native-vector-icons/FontAwesome';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import TabBar from '../themes/TabBar';

const WishlistScreen = ({ navigation }) => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const categories = ["All", "Shirt", "Paint", "T-shirt", "Jacket", "Suite", "Shoes"];

  const loadFavorites = async () => {
    try {
      const data = await getFavorites();
      setFavorites(data || []);
    } catch (error) {
      console.error('Error loading favorites:', error);
      setFavorites([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadFavorites();
    }, [])
  );

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadFavorites();
  }, []);

  const handleFavoriteToggle = async (product) => {
    try {
      await toggleFavorite(product);
      // Reload favorites after toggling
      loadFavorites();
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  // Ensure favorites is always an array
  const safeFavorites = Array.isArray(favorites) ? favorites : [];
  
  const filteredFavorites = activeCategory === "All" 
    ? safeFavorites 
    : safeFavorites.filter(item => item.product && item.product.category_name === activeCategory);

  if (loading && !refreshing) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size={45} color="#704f38" />
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <TabBar
        prefix={""}
        title={"Wishlist"}
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
        suffixAction={() => navigation.goBack()}
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
      >
        {categories.map((category, index) => {
          const isActive = category === activeCategory;
          return (
            <TouchableOpacity
              key={index}
              onPress={() => setActiveCategory(category)}
              style={[
                styles.categoryButton,
                isActive && styles.activeCategoryButton
              ]}
            >
              <Text style={[
                styles.categoryText,
                isActive && styles.activeCategoryText
              ]}>
                {category}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {filteredFavorites.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No items in your wishlist</Text>
        </View>
      ) : (
        <View style={styles.gridContainer}>
          {filteredFavorites.map((item, index) => (
            <View 
              key={item.id} 
              style={[
                styles.cardContainer,
                index % 2 === 0 ? styles.leftCard : styles.rightCard
              ]}
            >
              <TouchableOpacity 
                onPress={() => navigation.navigate('ProductDetails', { id: item.product.id })}
                style={styles.card}
              >
                <View style={styles.imageContainer}>
                  <Image 
                    source={{ uri: item.product.image }} 
                    style={styles.image}
                  />
                  <TouchableOpacity 
                    style={styles.heartButton}
                    onPress={() => handleFavoriteToggle(item.product)}
                  >
                    <Icon 
                      name="heart" 
                      size={16} 
                      color="#ff0000" 
                    />
                  </TouchableOpacity>
                </View>
                <View style={styles.detailsContainer}>
                  <Text style={styles.title}>{item.product.name}</Text>
                  <View style={styles.priceRatingContainer}>
                    <Text style={styles.price}>Rs {item.product.price}</Text>
                    <View style={styles.ratingContainer}>
                      <StarIcon size={16} color="#f5a623" />
                      <Text style={styles.rating}>{item.product.average_rating || 0}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  categoriesContainer: {
    paddingVertical: 10,
  },
  categoryButton: {
    borderWidth: 1,
    borderColor: '#666',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 10,
  },
  activeCategoryButton: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  categoryText: {
    fontWeight: 'bold',
  },
  activeCategoryText: {
    color: '#fff',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
  },
  cardContainer: {
    width: '50%',
    padding: 5,
  },
  leftCard: {
    paddingRight: 2.5,
  },
  rightCard: {
    paddingLeft: 2.5,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 2,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: hp(20),
    resizeMode: 'cover',
  },
  heartButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    padding: 8,
    borderRadius: 20,
  },
  detailsContainer: {
    padding: 10,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  priceRatingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 12,
    marginLeft: 4,
    color: '#666',
  },
});

export default WishlistScreen; 