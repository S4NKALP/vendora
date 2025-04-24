import { View, Text, Animated, ActivityIndicator, Linking } from 'react-native'
import React, { useState, useRef, useEffect } from 'react'
import { TouchableOpacity } from 'react-native'
import { ChevronDownIcon, ChevronUpIcon, GlobeAltIcon } from 'react-native-heroicons/outline'
import Icon from 'react-native-vector-icons/FontAwesome6'
import { getContacts } from '../api'

export default function ContactUsCenter() {
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expandedItems, setExpandedItems] = useState({})
  const animations = useRef({})

  useEffect(() => {
    fetchContacts()
  }, [])

  const fetchContacts = async () => {
    try {
      setLoading(true)
      const data = await getContacts()
      setContacts(data)
      
      // Initialize expanded state and animations
      const initialExpandedState = {}
      data.forEach(contact => {
        initialExpandedState[contact.id] = contact.contact_type === 'whatsapp'
        animations.current[contact.id] = new Animated.Value(contact.contact_type === 'whatsapp' ? 1 : 0)
      })
      setExpandedItems(initialExpandedState)
    } catch (err) {
      setError('Failed to load contacts')
      console.error('Error fetching contacts:', err)
    } finally {
      setLoading(false)
    }
  }

  const toggleItem = (itemId) => {
    const isExpanded = !expandedItems[itemId]
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: isExpanded
    }))

    Animated.timing(animations.current[itemId], {
      toValue: isExpanded ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start()
  }

  const handleContactPress = async (contact) => {
    try {
      let url = '';
      switch (contact.contact_type) {
        case 'whatsapp':
          // Remove any non-numeric characters from the phone number
          const phoneNumber = contact.value.replace(/\D/g, '');
          url = `https://wa.me/${phoneNumber}`;
          break;
        case 'website':
          url = contact.value.startsWith('http') ? contact.value : `https://${contact.value}`;
          break;
        case 'facebook':
          url = `https://facebook.com/${contact.value.replace('@', '')}`;
          break;
        case 'instagram':
          url = `https://instagram.com/${contact.value.replace('@', '')}`;
          break;
        case 'twitter':
          url = `https://twitter.com/${contact.value.replace('@', '')}`;
          break;
        case 'customer_service':
          // For phone numbers, use tel: protocol
          const telNumber = contact.value.replace(/\D/g, '');
          url = `tel:${telNumber}`;
          break;
        default:
          return;
      }

      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        console.error(`Don't know how to open URL: ${url}`);
      }
    } catch (error) {
      console.error('Error opening URL:', error);
    }
  }

  const getIcon = (contactType) => {
    switch (contactType) {
      case 'customer_service':
        return <Icon name='headset' color="#704f38" size={25} />
      case 'whatsapp':
        return <Icon name='whatsapp' color="#704f38" size={25} />
      case 'website':
        return <GlobeAltIcon color="#704f38" size={26} />
      case 'facebook':
        return <Icon name='facebook' color="#704f38" size={26} />
      case 'instagram':
        return <Icon name='instagram' color="#704f38" size={26} />
      case 'twitter':
        return <Icon name='twitter' color="#704f38" size={26} />
      default:
        return null
    }
  }

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#704f38" />
      </View>
    )
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-red-500">{error}</Text>
      </View>
    )
  }

  return (
    <View className="mt-4 mx-4">
      {contacts.map((contact) => (
        <View key={contact.id} className="mb-3">
          <View className="border rounded-xl border-gray-300 bg-white overflow-hidden">
            <TouchableOpacity
              onPress={() => toggleItem(contact.id)}
              className="flex-row items-center justify-between p-4">
              <View className="flex-row items-center gap-4">
                {getIcon(contact.contact_type)}
                <Text className="text-lg font-semibold">{contact.title}</Text>
              </View>
              {expandedItems[contact.id] ? (
                <ChevronUpIcon color="#704f38" size={24} />
              ) : (
                <ChevronDownIcon color="#704f38" size={24} />
              )}
            </TouchableOpacity>
            <Animated.View
              style={{
                maxHeight: animations.current[contact.id].interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 1000],
                }),
                opacity: animations.current[contact.id],
                overflow: 'hidden',
              }}
            >
              <View className="px-4 pb-4">
                <View className="h-px bg-gray-200 mb-4" />
                <TouchableOpacity onPress={() => handleContactPress(contact)}>
                  <Text className="text-gray-500 text-base ml-9">
                    {contact.value}
                  </Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </View>
        </View>
      ))}
    </View>
  )
}