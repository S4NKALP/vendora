import { View, Text, TouchableOpacity, Alert, Modal, TextInput, FlatList, ActivityIndicator } from 'react-native'
import React, { useState, useEffect, useRef } from 'react'
import { ChevronLeftIcon, MagnifyingGlassIcon, XMarkIcon } from 'react-native-heroicons/outline'
import Icon from 'react-native-vector-icons/Ionicons'
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LocationModal({ visible, onClose, onLocationSelected }) {
    const [isLoading, setIsLoading] = useState(false);
    const [currentLocation, setCurrentLocation] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const searchTimeoutRef = useRef(null);
    const isMounted = useRef(true);

    // Cleanup function to prevent memory leaks and state updates after unmount
    useEffect(() => {
        return () => {
            isMounted.current = false;
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, []);

    // Reset state when modal becomes visible
    useEffect(() => {
        if (visible) {
            isMounted.current = true;
            setSearchQuery('');
            setSearchResults([]);
            setIsSearching(false);
        }
    }, [visible]);

    useEffect(() => {
        if (searchQuery.length > 2) {
            // Clear any existing timeout
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
            
            // Debounce the search to prevent too many API calls
            searchTimeoutRef.current = setTimeout(() => {
                if (isMounted.current) {
                    searchLocations();
                }
            }, 300);
        } else {
            setSearchResults([]);
        }
        
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [searchQuery]);

    const searchLocations = async () => {
        if (!isMounted.current) return;
        
        setIsSearching(true);
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
                    searchQuery
                )}&limit=10`,
                {
                    headers: {
                        'Accept': 'application/json',
                        'User-Agent': 'ShopingApp/1.0' // Replace with your app name
                    }
                }
            );
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (!isMounted.current) return;
            
            if (data && Array.isArray(data)) {
                setSearchResults(data);
            } else {
                setSearchResults([]);
            }
        } catch (error) {
            if (isMounted.current) {
                console.error('Search error:', error);
                if (error.message.includes('429')) {
                    Alert.alert('Error', 'Too many requests. Please wait a moment and try again.');
                } else {
                    Alert.alert('Error', 'Failed to search locations. Please try again.');
                }
            }
        } finally {
            if (isMounted.current) {
                setIsSearching(false);
            }
        }
    };

    const handleUseCurrentLocation = async () => {
        if (!isMounted.current) return;
        
        setIsLoading(true);
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                if (isMounted.current) {
                    Alert.alert('Permission Denied', 'Please enable location services to use this feature.');
                }
                return;
            }

            const location = await Location.getCurrentPositionAsync({});
            const { latitude, longitude } = location.coords;
            
            // Get address from coordinates using reverse geocoding
            const [address] = await Location.reverseGeocodeAsync({
                latitude,
                longitude
            });

            if (!isMounted.current) return;

            if (address) {
                const locationData = {
                    name: 'Current Location',
                    address: `${address.street || ''} ${address.name || ''}, ${address.city || ''}, ${address.region || ''} ${address.postalCode || ''}`.trim(),
                    coordinates: { latitude, longitude }
                };
                
                await saveLocation(locationData);
                onLocationSelected(locationData);
                handleClose();
            } else {
                Alert.alert('Error', 'Could not determine your address. Please try again.');
            }
        } catch (error) {
            if (isMounted.current) {
                Alert.alert('Error', 'Failed to get your location. Please try again.');
            }
        } finally {
            if (isMounted.current) {
                setIsLoading(false);
            }
        }
    };

    const saveLocation = async (location) => {
        try {
            await AsyncStorage.setItem('userLocation', JSON.stringify(location));
            if (isMounted.current) {
                setCurrentLocation(location);
            }
        } catch (error) {
            if (isMounted.current) {
                Alert.alert('Error', 'Failed to save location. Please try again.');
            }
        }
    };

    const handleSelectLocation = (place) => {
        const locationData = {
            name: place.display_name.split(',')[0],
            address: place.display_name,
            coordinates: { 
                latitude: parseFloat(place.lat), 
                longitude: parseFloat(place.lon)
            }
        };
        
        saveLocation(locationData);
        onLocationSelected(locationData);
        handleClose();
    };

    const handleClose = () => {
        // Reset state before closing to improve performance
        setSearchQuery('');
        setSearchResults([]);
        setIsSearching(false);
        onClose();
    };

    const renderSearchResult = ({ item }) => (
        <TouchableOpacity 
            className="py-3 px-4 border-b border-gray-100"
            onPress={() => handleSelectLocation(item)}
        >
            <Text className="text-base font-medium">{item.display_name.split(',')[0]}</Text>
            <Text className="text-sm text-gray-500">{item.display_name}</Text>
        </TouchableOpacity>
    );

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={handleClose}
        >
            <View className="flex-1 bg-black/50">
                <View className="flex-1 bg-white mt-20 rounded-t-3xl">
                    <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
                        <TouchableOpacity onPress={handleClose}>
                            <ChevronLeftIcon size={30} color="black" />
                        </TouchableOpacity>
                        <Text className="text-xl font-bold">Select Location</Text>
                        <View style={{ width: 30 }} />
                    </View>

                    <View className="flex-1 p-4">
                        {/* Search Bar */}
                        <View className="flex-row items-center border border-gray-300 rounded-xl px-3 mb-4">
                            <MagnifyingGlassIcon size={20} color="gray" />
                            <TextInput
                                className="flex-1 py-3 px-2 text-base"
                                placeholder="Search for a location"
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                            {searchQuery.length > 0 && (
                                <TouchableOpacity onPress={() => setSearchQuery('')}>
                                    <XMarkIcon size={20} color="gray" />
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* Current Location Button */}
                        <TouchableOpacity 
                            onPress={handleUseCurrentLocation}
                            disabled={isLoading}
                            className="flex-row items-center gap-4 py-6 px-8 border-2 border-primary rounded-xl bg-white mb-4"
                        >
                            <Icon name="location" size={30} color={"#704f38"} />
                            <Text className="text-xl font-bold text-primary">
                                {isLoading ? "Getting Location..." : "Use My Current Location"}
                            </Text>
                        </TouchableOpacity>

                        {/* Search Results */}
                        {isSearching ? (
                            <View className="flex-1 justify-center items-center">
                                <ActivityIndicator size="large" color="#704f38" />
                                <Text className="mt-2 text-gray-500">Searching locations...</Text>
                            </View>
                        ) : searchResults.length > 0 ? (
                            <FlatList
                                data={searchResults}
                                renderItem={renderSearchResult}
                                keyExtractor={(item) => item.place_id}
                                className="flex-1"
                                initialNumToRender={10}
                                maxToRenderPerBatch={10}
                                windowSize={5}
                            />
                        ) : searchQuery.length > 2 ? (
                            <View className="flex-1 justify-center items-center">
                                <Text className="text-gray-500">No locations found</Text>
                            </View>
                        ) : null}

                        {currentLocation && !searchQuery && (
                            <View className="mt-4 p-4 bg-gray-50 rounded-xl">
                                <Text className="text-lg font-medium text-gray-800">Current Location:</Text>
                                <Text className="text-base text-gray-600 mt-2">{currentLocation.address}</Text>
                            </View>
                        )}
                    </View>
                </View>
            </View>
        </Modal>
    );
} 