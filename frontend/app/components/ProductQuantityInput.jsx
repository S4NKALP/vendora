import { View, Text, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
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
const ProductQuantityInput = ({ initialQuantity = 1, onQuantityChange }) => {
    const [quantity, setQuantity] = useState(initialQuantity);

    const handleDecrease = () => {
        if (quantity > 1) {
            const newQuantity = quantity - 1;
            setQuantity(newQuantity);
            onQuantityChange(newQuantity);
        }
    };

    const handleIncrease = () => {
        const newQuantity = quantity + 1;
        setQuantity(newQuantity);
        onQuantityChange(newQuantity);
    };

    return (
        <View className="flex-row items-center justify-between border border-gray-300 rounded-full px-4 py-2" style={{ width: wp('30%') }}>
            <TouchableOpacity onPress={handleDecrease} disabled={quantity <= 1}>
                <MinusIcon size={wp('5%')} color={quantity <= 1 ? '#ccc' : '#000'} />
            </TouchableOpacity>
            <Text style={{ fontSize: wp('4%') }} className="font-semibold">{quantity}</Text>
            <TouchableOpacity onPress={handleIncrease}>
                <PlusIcon size={wp('5%')} color="#000" />
            </TouchableOpacity>
        </View>
    );
}

export default ProductQuantityInput; 