import React from 'react';
import { View } from 'react-native';
import ModernCart from './ModernCart';

interface AdvancedCartProps {
  onCheckout?: (cartData: any) => void;
  onContinueShopping?: () => void;
}

const AdvancedCart: React.FC<AdvancedCartProps> = (props) => {
  return (
    <View style={{ flex: 1 }}>
      <ModernCart {...props} />
    </View>
  );
};

export default AdvancedCart;
