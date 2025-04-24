import { View, Text, ScrollView, ActivityIndicator, Animated } from 'react-native'
import React, { useState, useEffect, useRef } from 'react'
import { TouchableOpacity } from 'react-native';
import { ChevronDownIcon, ChevronUpIcon } from 'react-native-heroicons/outline';
import { getFAQs, getFAQCategories } from '../api';

export default function FaqCenter() {
  const [categories, setCategories] = useState(['All', 'Services', 'General', 'Account']);
  const [activeCategory, setActiveCategory] = useState('All');
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedFaqs, setExpandedFaqs] = useState({});
  const animations = useRef({});

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchFAQs();
  }, [activeCategory]);

  const fetchCategories = async () => {
    try {
      const data = await getFAQCategories();
      setCategories(data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchFAQs = async () => {
    try {
      setLoading(true);
      const data = await getFAQs(activeCategory);
      setFaqs(data);
      const initialExpandedState = {};
      data.forEach(faq => {
        initialExpandedState[faq.id] = false;
        animations.current[faq.id] = new Animated.Value(0);
      });
      setExpandedFaqs(initialExpandedState);
    } catch (err) {
      setError('Failed to load FAQs');
      console.error('Error fetching FAQs:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleFaq = (faqId) => {
    const isExpanded = !expandedFaqs[faqId];
    setExpandedFaqs(prev => ({
      ...prev,
      [faqId]: isExpanded
    }));

    Animated.timing(animations.current[faqId], {
      toValue: isExpanded ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  return (
    <View className="mx-4 mt-5">
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
        {categories.map((category, index) => {
          const isActive = category === activeCategory;
          return (
            <TouchableOpacity
              key={index}
              onPress={() => setActiveCategory(category)}
              className={`
                border border-gray-200 bg-gray-200 px-5 mr-4 rounded-full py-3 
                ${isActive ? "bg-primary" : ""}
              `}>
              <Text className={`${isActive ? "text-white" : ""} capitalize font-bold`}>
                {category}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {loading ? (
        <ActivityIndicator size="large" color="#704f38" />
      ) : error ? (
        <Text className="text-red-500 text-center">{error}</Text>
      ) : faqs.length > 0 ? (
        faqs.map((faq) => (
          <View key={faq.id} className="mb-4">
            <View className="border rounded-2xl border-gray-300 bg-white overflow-hidden">
              <TouchableOpacity
                onPress={() => toggleFaq(faq.id)}
                className="flex-row justify-between items-center p-4">
                <Text className="font-semibold text-lg flex-1 mr-2">{faq.question}</Text>
                {expandedFaqs[faq.id] ? (
                  <ChevronUpIcon color="#704f38" size={24} />
                ) : (
                  <ChevronDownIcon color="#704f38" size={24} />
                )}
              </TouchableOpacity>
              <Animated.View
                style={{
                  maxHeight: animations.current[faq.id].interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 1000],
                  }),
                  opacity: animations.current[faq.id],
                  overflow: 'hidden',
                }}
              >
                <View className="px-4 pb-4">
                  <View className="h-px bg-gray-200 mb-4" />
                  <Text className="text-gray-700 leading-6 text-base">
                    {faq.answer}
                  </Text>
                </View>
              </Animated.View>
            </View>
          </View>
        ))
      ) : (
        <View className="items-center justify-center py-8">
          <Text className="text-gray-500 text-center text-lg">
            No FAQs available for this category
          </Text>
        </View>
      )}
    </View>
  );
}