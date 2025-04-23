import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const ItemCard = ({ item, onPress, onFavoritePress, isFavourite }) => (
  <View style={styles.card}>
    <TouchableOpacity onPress={onPress}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <TouchableOpacity 
        style={styles.heartButton}
        onPress={onFavoritePress}
      >
        <Icon 
          name={isFavourite ? "heart" : "heart-o"} 
          size={20} 
          color={isFavourite ? "#ff0000" : "#333"} 
        />
      </TouchableOpacity>
    </TouchableOpacity>
    <Text style={styles.title}>{item.title}</Text>
    <Text style={styles.price}>${item.price}</Text>
    <View style={styles.ratingContainer}>
      <Text style={styles.rating}>{item.rating}</Text>
      <Icon name="star" size={16} color="#f5a623" />
    </View>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    margin: 10,
    borderRadius: 10,
    elevation: 2,
    flex: 1,
    alignItems: 'center',
    padding: 10,
  },
  image: {
    width: '100%',
    height: 150,
    borderRadius: 8,
  },
  heartButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 5,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
  },
  price: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#555',
    marginTop: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  rating: {
    fontSize: 14,
    marginRight: 4,
    color: '#f5a623',
  },
});

export default ItemCard;
