import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { HeartIcon } from 'react-native-heroicons/outline';
import { HeartIcon as SolidHeartIcon, StarIcon } from 'react-native-heroicons/solid';
import { useNavigation } from '@react-navigation/native';

const ItemCard = ({ item, isFavorite, onToggleFavorite }) => {
  const navigation = useNavigation();

  return (
    <TouchableOpacity
      onPress={() => navigation.navigate('ProductDetails', { id: item.id })}
      className="relative"
      style={{ width: wp('45%') }}
    >
      <Image 
        source={{ uri: item.image || 'https://via.placeholder.com/150' }} 
        style={{ height: hp('20%') }}
        className="object-cover rounded-3xl" 
      />
      <TouchableOpacity 
        onPress={(e) => {
          e.stopPropagation();
          onToggleFavorite(item);
        }} 
        className="absolute right-4 top-4 bg-white/50 p-2 rounded-full"
      >
        {isFavorite ? (
          <SolidHeartIcon size={wp('5%')} color="red" />
        ) : (
          <HeartIcon size={wp('5%')} color="black" />
        )}
      </TouchableOpacity>
      <View className="flex-row justify-between px-1 mt-2">
        <Text style={{ fontSize: wp('3.5%') }} className="flex-1">{item.name || item.title}</Text>
        <View className="flex-row gap-1">
          <StarIcon size={wp('4%')} color={"orange"} />
          <Text style={{ fontSize: wp('3.5%') }}>{item.rating || 0}</Text>
        </View>
      </View>
      <View className="px-1">
        <Text style={{ fontSize: wp('4%') }} className="font-medium">Rs {item.price || 0}</Text>
      </View>
    </TouchableOpacity>
  );
}

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
