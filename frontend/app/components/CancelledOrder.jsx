import { View, Text, Image, TouchableOpacity } from 'react-native'
import React from 'react'
import { useNavigation } from '@react-navigation/native'

export default function CancelledOrder({ orders = [], navigation: propNavigation }) {
  // Use provided navigation prop if available, otherwise get from hook
  const navigation = propNavigation || useNavigation();

  // Safe number formatting helper
  const formatCurrency = (value) => {
    if (value === undefined || value === null) return '0.00';
    if (typeof value === 'number') return value.toFixed(2);
    if (typeof value === 'string') {
      const num = parseFloat(value);
      return isNaN(num) ? '0.00' : num.toFixed(2);
    }
    return '0.00';
  };

  if (!orders || orders.length === 0) {
    return (
      <View className="flex-1 justify-center items-center py-10">
        <Text className="text-gray-500">No cancelled orders found</Text>
      </View>
    );
  }

  return (
    <View className={`mx-4`}>
      {orders.map((order, index) => {
        // Each order can have multiple items
        return (
          <View key={index} className="mb-6 border rounded-lg border-gray-200 overflow-hidden">
            <View className="bg-gray-100 p-3 border-b border-gray-200">
              <Text className="font-bold">Order #{order.id}</Text>
              <Text className="text-gray-500">
                {new Date(order.created_at || order.date).toLocaleDateString()} | 
                Status: <Text className="text-red-500 font-medium capitalize">{order.status}</Text>
              </Text>
            </View>

            {order.items && order.items.map((item, itemIndex) => (
              <View key={itemIndex} className={`flex-row items-center gap-6 py-3 px-3 ${itemIndex < order.items.length - 1 ? 'border-b border-gray-200' : ''}`}>
                <Image 
                  source={{ uri: item.product_image || item.product?.image || 'https://via.placeholder.com/100' }} 
                  className="size-[90px] rounded-lg"
                  defaultSource={require('../../assets/images/favicon.png')}
                />
                <View className={`flex-1 flex-col gap-2`}>
                  <Text className={`font-medium text-lg`}>{item.product_name || item.product?.title || 'Product'}</Text>
                  <Text className={`text-sm`}>Qty: {item.quantity}</Text>
                  <View className={`flex-row justify-between items-start`}>
                    <Text className={`text-lg font-bold`}>${formatCurrency(item.price || item.subtotal)}</Text>
                  </View>
                </View>
              </View>
            ))}

            <View className="bg-gray-50 p-3 border-t border-gray-200 flex-row justify-between items-center">
              <Text className="font-bold">Total: ${formatCurrency(order.total_price || order.total_amount)}</Text>
              <TouchableOpacity 
                onPress={() => navigation.navigate('Home')}
                className={`bg-primary rounded-full px-4 py-2`}
              >
                <Text className={`text-white font-medium`}>Re-Order</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      })}
    </View>
  );
}