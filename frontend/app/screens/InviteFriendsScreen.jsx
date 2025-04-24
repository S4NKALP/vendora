import { View, Text, Image, TouchableOpacity, ActivityIndicator, Platform } from 'react-native'
import React, { useState, useEffect } from 'react'
import TabBar from '../themes/TabBar'
import { ChevronLeftIcon } from 'react-native-heroicons/outline'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen'
import { ScrollView } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import * as Contacts from 'expo-contacts'
import { Linking } from 'react-native'
import { getInviteMessage } from '../api'

export default function InviteFriendsScreen() {
  const navigation = useNavigation()
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [inviteMessage, setInviteMessage] = useState('')
  const [inviteLink, setInviteLink] = useState('')

  useEffect(() => {
    requestContactsPermission()
    fetchInviteMessage()
  }, [])

  const fetchInviteMessage = async () => {
    try {
      const response = await getInviteMessage()
      setInviteMessage(response.message)
      setInviteLink(response.link)
    } catch (err) {
      console.error('Error fetching invite message:', err)
      setInviteMessage("Hey! I've been shopping on this Shopping App and it's been amazing! They have awesome deals, fast delivery, and quality products. Use my link to sign up and get a special discount on your first order!")
      setInviteLink("https://play.google.com/store/apps/details?id=com.vendora.app")
    }
  }

  const requestContactsPermission = async () => {
    try {
      const { status } = await Contacts.requestPermissionsAsync()
      if (status === 'granted') {
        fetchContacts()
      } else {
        setError('Permission to access contacts was denied')
        setLoading(false)
      }
    } catch (err) {
      setError('Failed to request contacts permission')
      setLoading(false)
    }
  }

  const fetchContacts = async () => {
    try {
      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Name],
      })

      // Filter out contacts without phone numbers and sort by name
      const filteredContacts = data
        .filter(contact => contact.phoneNumbers && contact.phoneNumbers.length > 0)
        .sort((a, b) => a.name.localeCompare(b.name))
      
      setContacts(filteredContacts)
      setLoading(false)
    } catch (err) {
      console.error('Error fetching contacts:', err)
      setError('Failed to fetch contacts')
      setLoading(false)
    }
  }

  const handleInvite = async (phoneNumber) => {
    try {
      const messageWithLink = `${inviteMessage}\n\n${inviteLink}`
      const url = `https://wa.me/${phoneNumber.replace(/\D/g, '')}?text=${encodeURIComponent(messageWithLink)}`
      
      const supported = await Linking.canOpenURL(url)
      if (supported) {
        await Linking.openURL(url)
      } else {
        console.error('WhatsApp is not installed')
      }
    } catch (error) {
      console.error('Error sending invite:', error)
    }
  }

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#704f38" />
      </View>
    )
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-red-500 text-lg">{error}</Text>
        <TouchableOpacity 
          onPress={requestContactsPermission}
          className="mt-4 bg-primary px-4 py-2 rounded-full"
        >
          <Text className="text-white">Try Again</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View className={`bg-white`} style={{ height: hp('97%') }}>
      <TabBar
        prefix={""}
        title={"Invite Friends"}
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
      <ScrollView showsVerticalScrollIndicator={false}>
        {contacts.map((contact, index) => (
          <View key={index} className="flex-row items-center justify-between gap-4 border-b-[1px] border-gray-300 px-4 py-3">
            <View className="size-[70px] rounded-full bg-gray-200 justify-center items-center">
              <Text className="text-2xl font-bold text-gray-600">
                {contact.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View className="flex-1 gap-2">
              <Text className="text-xl font-semibold">{contact.name}</Text>
              <Text className="font-medium text-gray-600">
                {contact.phoneNumbers[0].number}
              </Text>
            </View>
            <TouchableOpacity 
              className="bg-primary px-5 py-2 rounded-full"
              onPress={() => handleInvite(contact.phoneNumbers[0].number)}
            >
              <Text className="text-white text-xl font-medium">Invite</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  )
}