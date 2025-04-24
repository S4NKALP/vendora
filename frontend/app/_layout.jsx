import { Stack } from 'expo-router';
import { CartProvider } from './context/CartContext';
import { NotificationProvider } from './context/NotificationContext';

// Import your global CSS file
import "../global.css";

export default function Layout() {
  return (
    <NotificationProvider>
      <CartProvider>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        />
      </CartProvider>
    </NotificationProvider>
  );
}