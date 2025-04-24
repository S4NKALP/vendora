import { View, Text, TextInput, ScrollView, TouchableOpacity, ActivityIndicator, Image, Alert } from 'react-native'
import React, { useState, useEffect } from 'react'
import TabBar from '../themes/TabBar'
import { ChevronLeftIcon, MagnifyingGlassIcon, XMarkIcon } from 'react-native-heroicons/outline'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useNavigation } from '@react-navigation/native';
import { 
  fetchProducts, 
  getCurrentUser, 
  getUserRecentSearches, 
  saveUserRecentSearch,
  removeUserRecentSearch,
  clearAllUserRecentSearches 
} from '../api';
import { Ionicons } from '@expo/vector-icons';


const SearchScreen = () => {
    const [searchText, setSearchText] = useState('');
    const [recentSearches, setRecentSearches] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [products, setProducts] = useState([]);
    const [user, setUser] = useState(null);
    const navigation = useNavigation();

    useEffect(() => {
        loadCurrentUser();
        loadRecentSearches();
    }, []);

    const loadCurrentUser = async () => {
        try {
            const currentUser = await getCurrentUser();
            setUser(currentUser);
        } catch (error) {
            console.error('Error loading current user:', error);
        }
    };

    const loadRecentSearches = async () => {
        try {
            const searches = await getUserRecentSearches();
            setRecentSearches(Array.isArray(searches) ? searches : []);
        } catch (error) {
            console.error('Error loading recent searches:', error);
            setRecentSearches([]);
        }
    };

    const handleClearRecentSearch = async (term) => {
        try {
            if (!term) return;
            const updatedSearches = await removeUserRecentSearch(term);
            setRecentSearches(Array.isArray(updatedSearches) ? updatedSearches : []);
        } catch (error) {
            console.error('Error clearing recent search:', error);
        }
    };

    const handleClearAllRecentSearches = async () => {
        try {
            await clearAllUserRecentSearches();
            setRecentSearches([]);
        } catch (error) {
            console.error('Error clearing all recent searches:', error);
        }
    };

    const handleSearch = async (searchTerm = searchText) => {
        if (!searchTerm || !searchTerm.trim()) return;
        
        setLoading(true);
        setErrorMsg('');
        
        try {
            const result = await fetchProducts(searchTerm);
            setProducts(result);
            
            // Save to recent searches
            await saveUserRecentSearch(searchTerm);
            
            // Refresh recent searches
            loadRecentSearches();
            
            navigation.navigate('SearchResult', { 
                products: result,
                searchTerm: searchTerm 
            });
        } catch (error) {
            setErrorMsg('Error searching products. Please try again.');
            console.error('Search error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRecentSearchPress = (term) => {
        if (!term) return;
        setSearchText(term);
        handleSearch(term);
    };

    return (
        <View className={`bg-white flex-col`} style={{ height: hp('98%') }}>
            <TabBar
                prefix={""}
                title={"Search"}
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
            <View className={`mx-4 mt-6`}>
                <View className="h-12 w-30 rounded-3xl flex-row justify-between items-center gap-3 mb-6 ">
                    <View className="flex-row items-center flex-1 border border-gray-400 px-3 h-14 rounded-full">
                        <MagnifyingGlassIcon color={"#704f38"} width={"25"} height={"25"} />
                        <TextInput 
                            placeholder="Search products" 
                            className="font-medium flex-1 h-full" 
                            value={searchText}
                            onChangeText={setSearchText}
                            onSubmitEditing={() => handleSearch()}
                            returnKeyType="search"
                            autoFocus
                        />
                    </View>
                </View>
                
                {errorMsg && (
                    <View className="bg-red-100 p-2 rounded-lg mb-4">
                        <Text className="text-red-500">{errorMsg}</Text>
                    </View>
                )}

                <View className={`flex-row justify-between items-center`}>
                    <Text className={`text-xl font-bold`}>Recent</Text>
                    <TouchableOpacity onPress={handleClearAllRecentSearches}>
                        <Text className={`text-primary text-xl font-bold`}>Clear All</Text>
                    </TouchableOpacity>
                </View>
                <View className="bg-black w-full h-[0.5px] my-5" />
            </View>
            
            {loading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#704f38" />
                </View>
            ) : (
                <ScrollView showsVerticalScrollIndicator={false}>
                    <View className={`mx-4`}>
                        {recentSearches.length === 0 ? (
                            <Text className="text-gray-500 text-center py-4">No recent searches</Text>
                        ) : (
                            recentSearches.map((item, index) => (
                                <View key={index} className={`flex pb-3 pt-2 justify-center`}>
                                    <View className={`flex-row justify-between items-center`}>
                                        <TouchableOpacity 
                                            onPress={() => handleRecentSearchPress(item)}
                                            className="flex-1"
                                        >
                                            <Text className={`text-xl text-gray-500 font-medium`}>{item}</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => handleClearRecentSearch(item)}>
                                            <XMarkIcon size={24} color={"#704f38"} />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))
                        )}
                    </View>
                </ScrollView>
            )}
        </View>
    );
};

export default SearchScreen;