import { useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import ModernCart from '../../components/ModernCart';
import { useTheme } from '../../contexts/ThemeContext';

const CartScreen: React.FC = () => {
  const { theme } = useTheme();
  const router = useRouter();

  const handleCheckout = useCallback((cartData: any) => {
    // Navigate to checkout screen or process checkout
    console.log('Checkout data:', cartData);
    // For now, just show the cart data structure
    router.push('/checkout' as any);
  }, [router]);

  const handleContinueShopping = useCallback(() => {
    // Navigate back to main shopping areas
    router.push('/(tabs)/carehub');
  }, [router]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ModernCart
        onCheckout={handleCheckout}
        onContinueShopping={handleContinueShopping}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default CartScreen;
