import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { MinusIcon, PlusIcon } from 'react-native-heroicons/outline'

/**
 * A reusable component for quantity selection with plus and minus buttons
 * 
 * @param {Object} props Component props
 * @param {number} props.quantity Current quantity value
 * @param {Function} props.onIncrease Function to call when increasing quantity
 * @param {Function} props.onDecrease Function to call when decreasing quantity
 * @param {string} props.label Label text to display (optional)
 * @param {Object} props.containerStyle Additional styles for the container
 * @returns {React.Component} Quantity selector component
 */
export default function ProductQuantityInput({ 
  quantity = 1, 
  onIncrease, 
  onDecrease, 
  label = "Quantity",
  containerStyle = {}
}) {
  return (
    <View style={containerStyle}>
      {label && <Text className="text-[17px] font-medium mb-2">{label}</Text>}
      <View className="flex-row items-center">
        <TouchableOpacity 
          onPress={onDecrease}
          className={`bg-primary/40 rounded-lg p-1 ${quantity <= 1 ? 'opacity-50' : ''}`}
          disabled={quantity <= 1}
        >
          <MinusIcon color={quantity <= 1 ? "gray" : "black"} size={25} />
        </TouchableOpacity>
        
        <Text className="mx-4 text-xl">{quantity}</Text>
        
        <TouchableOpacity 
          onPress={onIncrease}
          className="bg-primary rounded-lg p-1"
        >
          <PlusIcon color="white" size={25} />
        </TouchableOpacity>
      </View>
    </View>
  )
} 