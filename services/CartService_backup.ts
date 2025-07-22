import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  image: string;
  pharmacy: string;
  pharmacyColor: string;
  inStock: boolean;
  stockCount?: number;
  maxQuantity: number;
  genericName?: string;
  dosage?: string;
  packSize?: string;
  prescription?: boolean;
  realImageUrl?: string;
}

export interface CartSummary {
  totalItems: number;
  subtotal: number;
  savings: number;
  tax: number;
  deliveryFee: number;
  total: number;
}

export interface DeliveryOption {
  id: string;
  name: string;
  description: string;
  estimatedTime: string;
  price: number;
  icon: string;
}
  image: any;
  rating: number;
  category: string;
  discount?: number;
  reason: 'frequently_bought_together' | 'customers_also_bought' | 'recommended_for_you' | 'related_products';
}

export interface CartSummary {
  subtotal: number;
  discount: number;
  couponDiscount: number;
  deliveryFee: number;
  total: number;
  itemCount: number;
  savings: number;
}

export interface PaymentMethod {
  id: string;
  name: string;
  type: 'card' | 'eft' | 'mobile' | 'wallet' | 'instant_payment';
  description: string;
  icon: string;
  fees?: number;
  processingTime: string;
  isAvailable: boolean;
  providerLogo?: any;
}

// Cart Service Class
class CartService {
  private static instance: CartService;
  private cartKey = '@medlynx_cart';
  private couponsKey = '@medlynx_applied_coupons';

  static getInstance(): CartService {
    if (!CartService.instance) {
      CartService.instance = new CartService();
    }
    return CartService.instance;
  }

  // Cart Management
  async getCart(): Promise<CartItem[]> {
    try {
      const cart = await AsyncStorage.getItem(this.cartKey);
      return cart ? JSON.parse(cart) : [];
    } catch (error) {
      console.error('Error getting cart:', error);
      return [];
    }
  }

  async addToCart(item: Omit<CartItem, 'quantity'>): Promise<void> {
    try {
      const cart = await this.getCart();
      const existingIndex = cart.findIndex(cartItem => 
        cartItem.medicationId === item.medicationId && 
        cartItem.pharmacyId === item.pharmacyId
      );

      if (existingIndex !== -1) {
        // Update quantity if item exists
        cart[existingIndex].quantity = Math.min(
          cart[existingIndex].quantity + 1, 
          cart[existingIndex].maxQuantity
        );
      } else {
        // Add new item
        cart.push({ ...item, quantity: 1 });
      }

      await AsyncStorage.setItem(this.cartKey, JSON.stringify(cart));
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  }

  async updateQuantity(medicationId: string, pharmacyId: string, quantity: number): Promise<void> {
    try {
      const cart = await this.getCart();
      const itemIndex = cart.findIndex(item => 
        item.medicationId === medicationId && 
        item.pharmacyId === pharmacyId
      );

      if (itemIndex !== -1) {
        if (quantity <= 0) {
          cart.splice(itemIndex, 1);
        } else {
          cart[itemIndex].quantity = Math.min(quantity, cart[itemIndex].maxQuantity);
        }
        await AsyncStorage.setItem(this.cartKey, JSON.stringify(cart));
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      throw error;
    }
  }

  async removeFromCart(medicationId: string, pharmacyId: string): Promise<void> {
    try {
      const cart = await this.getCart();
      const updatedCart = cart.filter(item => 
        !(item.medicationId === medicationId && item.pharmacyId === pharmacyId)
      );
      await AsyncStorage.setItem(this.cartKey, JSON.stringify(updatedCart));
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  }

  async clearCart(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.cartKey);
      await AsyncStorage.removeItem(this.couponsKey);
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  }

  // Coupon Management
  async applyCoupon(coupon: Coupon, cartItems: CartItem[]): Promise<{ success: boolean; message: string; discount: number }> {
    try {
      // Validate coupon
      const validation = this.validateCoupon(coupon, cartItems);
      if (!validation.valid) {
        return { success: false, message: validation.message, discount: 0 };
      }

      // Calculate discount
      const discount = this.calculateCouponDiscount(coupon, cartItems);
      
      // Save applied coupons
      const appliedCoupons = await this.getAppliedCoupons();
      appliedCoupons.push(coupon);
      await AsyncStorage.setItem(this.couponsKey, JSON.stringify(appliedCoupons));

      return { 
        success: true, 
        message: `Coupon applied! You saved R${discount.toFixed(2)}`, 
        discount 
      };
    } catch (error) {
      console.error('Error applying coupon:', error);
      return { success: false, message: 'Failed to apply coupon', discount: 0 };
    }
  }

  async removeCoupon(couponId: string): Promise<void> {
    try {
      const appliedCoupons = await this.getAppliedCoupons();
      const updatedCoupons = appliedCoupons.filter(coupon => coupon.id !== couponId);
      await AsyncStorage.setItem(this.couponsKey, JSON.stringify(updatedCoupons));
    } catch (error) {
      console.error('Error removing coupon:', error);
      throw error;
    }
  }

  async getAppliedCoupons(): Promise<Coupon[]> {
    try {
      const coupons = await AsyncStorage.getItem(this.couponsKey);
      return coupons ? JSON.parse(coupons) : [];
    } catch (error) {
      console.error('Error getting applied coupons:', error);
      return [];
    }
  }

  // Cart Calculations
  async calculateCartSummary(deliveryOption?: DeliveryOption): Promise<CartSummary> {
    try {
      const cartItems = await this.getCart();
      const appliedCoupons = await this.getAppliedCoupons();

      const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const originalTotal = cartItems.reduce((sum, item) => 
        sum + ((item.originalPrice || item.price) * item.quantity), 0
      );
      
      const discount = originalTotal - subtotal;
      const couponDiscount = appliedCoupons.reduce((sum, coupon) => 
        sum + this.calculateCouponDiscount(coupon, cartItems), 0
      );

      const deliveryFee = deliveryOption?.price || 0;
      const total = Math.max(0, subtotal - couponDiscount + deliveryFee);
      const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
      const savings = discount + couponDiscount;

      return {
        subtotal,
        discount,
        couponDiscount,
        deliveryFee,
        total,
        itemCount,
        savings
      };
    } catch (error) {
      console.error('Error calculating cart summary:', error);
      return {
        subtotal: 0,
        discount: 0,
        couponDiscount: 0,
        deliveryFee: 0,
        total: 0,
        itemCount: 0,
        savings: 0
      };
    }
  }

  // Suggested Products
  getSuggestedProducts(cartItems: CartItem[]): SuggestedProduct[] {
    // Mock suggested products - in real app, this would use ML/AI recommendations
    const suggestions: SuggestedProduct[] = [
      {
        id: 'sg1',
        name: 'Vitamin C 1000mg',
        price: 89.99,
        originalPrice: 109.99,
        image: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=300&h=300&fit=crop',
        rating: 4.6,
        category: 'vitamins',
        discount: 18,
        reason: 'frequently_bought_together'
      },
      {
        id: 'sg2',
        name: 'Zinc Tablets',
        price: 45.50,
        image: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=300&h=300&fit=crop',
        rating: 4.3,
        category: 'supplements',
        reason: 'customers_also_bought'
      },
      {
        id: 'sg3',
        name: 'Hand Sanitizer 500ml',
        price: 35.99,
        originalPrice: 42.99,
        image: 'https://images.unsplash.com/photo-1584745224532-bccf2e3c6b60?w=300&h=300&fit=crop',
        rating: 4.8,
        category: 'hygiene',
        discount: 16,
        reason: 'recommended_for_you'
      }
    ];

    return suggestions;
  }

  // Delivery Options
  getDeliveryOptions(): DeliveryOption[] {
    return [
      {
        id: 'standard',
        name: 'Standard Delivery',
        description: '3-5 business days',
        price: 65,
        estimatedTime: '3-5 days',
        icon: 'car-outline',
        isAvailable: true
      },
      {
        id: 'express',
        name: 'Express Delivery',
        description: 'Next business day',
        price: 125,
        estimatedTime: '1 day',
        icon: 'flash-outline',
        isAvailable: true
      },
      {
        id: 'same_day',
        name: 'Same Day Delivery',
        description: 'Within 4-6 hours (Johannesburg & Cape Town)',
        price: 199,
        estimatedTime: '4-6 hours',
        icon: 'time-outline',
        isAvailable: true
      },
      {
        id: 'click_collect',
        name: 'Click & Collect',
        description: 'Collect from nearest store',
        price: 0,
        estimatedTime: '2-4 hours',
        icon: 'storefront-outline',
        isAvailable: true
      }
    ];
  }

  // Private helper methods
  private validateCoupon(coupon: Coupon, cartItems: CartItem[]): { valid: boolean; message: string } {
    if (!coupon.isActive) {
      return { valid: false, message: 'This coupon is no longer active' };
    }

    if (new Date() > coupon.validUntil) {
      return { valid: false, message: 'This coupon has expired' };
    }

    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    if (subtotal < coupon.minOrderAmount) {
      return { 
        valid: false, 
        message: `Minimum order amount of R${coupon.minOrderAmount} required` 
      };
    }

    return { valid: true, message: 'Coupon is valid' };
  }

  private calculateCouponDiscount(coupon: Coupon, cartItems: CartItem[]): number {
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    switch (coupon.type) {
      case 'percentage':
        const percentageDiscount = (subtotal * coupon.value) / 100;
        return coupon.maxDiscount 
          ? Math.min(percentageDiscount, coupon.maxDiscount)
          : percentageDiscount;
      
      case 'fixed':
        return Math.min(coupon.value, subtotal);
      
      case 'free_delivery':
        return 65; // Standard delivery fee
      
      case 'buy_one_get_one':
        // Simplified BOGO calculation
        return cartItems.reduce((discount, item) => {
          const pairs = Math.floor(item.quantity / 2);
          return discount + (pairs * item.price);
        }, 0);
      
      default:
        return 0;
    }
  }
}

export default CartService;
