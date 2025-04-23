import { Stack } from 'expo-router';
import { CartProvider } from './context/CartContext';

// Import your global CSS file
import "../global.css";

export default function Layout() {
  return (
    <CartProvider>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
    </CartProvider>
  );
}