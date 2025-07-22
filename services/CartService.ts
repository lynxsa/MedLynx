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
  maxQuantity?: number;
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

class CartService {
  private static instance: CartService;
  private cartItems: CartItem[] = [];
  private listeners: ((items: CartItem[]) => void)[] = [];
  private readonly CART_STORAGE_KEY = 'medlynx_cart';
  private readonly TAX_RATE = 0.15; // 15% VAT
  
  // Delivery options
  private deliveryOptions: DeliveryOption[] = [
    {
      id: 'standard',
      name: 'Standard Delivery',
      description: '3-5 business days',
      estimatedTime: '3-5 days',
      price: 60,
      icon: 'car',
    },
    {
      id: 'express',
      name: 'Express Delivery',
      description: 'Next business day',
      estimatedTime: '1 day',
      price: 120,
      icon: 'flash',
    },
    {
      id: 'same-day',
      name: 'Same Day Delivery',
      description: 'Within 4 hours',
      estimatedTime: '4 hours',
      price: 200,
      icon: 'time',
    },
    {
      id: 'pickup',
      name: 'Store Pickup',
      description: 'Collect at pharmacy',
      estimatedTime: '2 hours',
      price: 0,
      icon: 'storefront',
    },
  ];

  private selectedDeliveryOption: DeliveryOption = this.deliveryOptions[0];

  public static getInstance(): CartService {
    if (!CartService.instance) {
      CartService.instance = new CartService();
    }
    return CartService.instance;
  }

  constructor() {
    this.loadCartFromStorage();
  }

  // Storage operations
  private async saveCartToStorage(): Promise<void> {
    try {
      await AsyncStorage.setItem(this.CART_STORAGE_KEY, JSON.stringify(this.cartItems));
    } catch (error) {
      console.error('Error saving cart to storage:', error);
    }
  }

  private async loadCartFromStorage(): Promise<void> {
    try {
      const storedCart = await AsyncStorage.getItem(this.CART_STORAGE_KEY);
      if (storedCart) {
        this.cartItems = JSON.parse(storedCart);
        this.notifyListeners();
      }
    } catch (error) {
      console.error('Error loading cart from storage:', error);
    }
  }

  // Listener management
  public addListener(listener: (items: CartItem[]) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener([...this.cartItems]));
  }

  // Cart operations
  public async addItem(product: any, quantity: number = 1): Promise<boolean> {
    try {
      const existingItemIndex = this.cartItems.findIndex(item => item.id === product.id);
      
      if (existingItemIndex !== -1) {
        // Update existing item
        const existingItem = this.cartItems[existingItemIndex];
        const newQuantity = existingItem.quantity + quantity;
        const maxAllowed = product.stockCount || existingItem.maxQuantity || 99;
        
        if (newQuantity > maxAllowed) {
          return false; // Quantity exceeds available stock
        }
        
        this.cartItems[existingItemIndex] = {
          ...existingItem,
          quantity: newQuantity
        };
      } else {
        // Add new item
        const cartItem: CartItem = {
          id: product.id,
          name: product.name,
          price: product.price,
          originalPrice: product.originalPrice,
          quantity,
          image: product.image,
          pharmacy: product.pharmacy,
          pharmacyColor: product.pharmacyColor,
          inStock: product.inStock,
          stockCount: product.stockCount,
          maxQuantity: product.stockCount || 99,
          genericName: product.genericName,
          dosage: product.dosage,
          packSize: product.quantity,
          prescription: product.prescription,
          realImageUrl: product.realImageUrl,
        };
        
        this.cartItems.push(cartItem);
      }
      
      await this.saveCartToStorage();
      this.notifyListeners();
      return true;
    } catch (error) {
      console.error('Error adding item to cart:', error);
      return false;
    }
  }

  public async updateItemQuantity(productId: string, quantity: number): Promise<boolean> {
    try {
      const itemIndex = this.cartItems.findIndex(item => item.id === productId);
      
      if (itemIndex === -1) {
        return false;
      }

      const item = this.cartItems[itemIndex];
      const maxAllowed = item.maxQuantity || 99;

      if (quantity <= 0) {
        // Remove item if quantity is 0 or negative
        this.cartItems.splice(itemIndex, 1);
      } else if (quantity <= maxAllowed) {
        // Update quantity
        this.cartItems[itemIndex] = {
          ...item,
          quantity
        };
      } else {
        return false; // Quantity exceeds maximum allowed
      }

      await this.saveCartToStorage();
      this.notifyListeners();
      return true;
    } catch (error) {
      console.error('Error updating item quantity:', error);
      return false;
    }
  }

  public async removeItem(productId: string): Promise<void> {
    try {
      this.cartItems = this.cartItems.filter(item => item.id !== productId);
      await this.saveCartToStorage();
      this.notifyListeners();
    } catch (error) {
      console.error('Error removing item from cart:', error);
    }
  }

  public async clearCart(): Promise<void> {
    try {
      this.cartItems = [];
      await this.saveCartToStorage();
      this.notifyListeners();
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  }

  // Cart data access
  public getItems(): CartItem[] {
    return [...this.cartItems];
  }

  public getItemCount(): number {
    return this.cartItems.reduce((total, item) => total + item.quantity, 0);
  }

  public getItem(productId: string): CartItem | undefined {
    return this.cartItems.find(item => item.id === productId);
  }

  public hasItem(productId: string): boolean {
    return this.cartItems.some(item => item.id === productId);
  }

  public getItemQuantity(productId: string): number {
    const item = this.getItem(productId);
    return item ? item.quantity : 0;
  }

  // Cart calculations
  public getCartSummary(): CartSummary {
    const subtotal = this.cartItems.reduce(
      (total, item) => total + (item.price * item.quantity),
      0
    );

    const savings = this.cartItems.reduce(
      (total, item) => {
        if (item.originalPrice && item.originalPrice > item.price) {
          return total + ((item.originalPrice - item.price) * item.quantity);
        }
        return total;
      },
      0
    );

    const tax = subtotal * this.TAX_RATE;
    const deliveryFee = this.selectedDeliveryOption.price;
    const total = subtotal + tax + deliveryFee;

    return {
      totalItems: this.getItemCount(),
      subtotal: Math.round(subtotal * 100) / 100,
      savings: Math.round(savings * 100) / 100,
      tax: Math.round(tax * 100) / 100,
      deliveryFee,
      total: Math.round(total * 100) / 100,
    };
  }

  // Delivery options
  public getDeliveryOptions(): DeliveryOption[] {
    return [...this.deliveryOptions];
  }

  public getSelectedDeliveryOption(): DeliveryOption {
    return this.selectedDeliveryOption;
  }

  public setDeliveryOption(optionId: string): boolean {
    const option = this.deliveryOptions.find(opt => opt.id === optionId);
    if (option) {
      this.selectedDeliveryOption = option;
      this.notifyListeners(); // Notify to update totals
      return true;
    }
    return false;
  }

  // Validation
  public validateCart(): { valid: boolean; issues: string[] } {
    const issues: string[] = [];

    for (const item of this.cartItems) {
      if (!item.inStock) {
        issues.push(`${item.name} is currently out of stock`);
      }

      if (item.stockCount && item.quantity > item.stockCount) {
        issues.push(`${item.name} quantity exceeds available stock (${item.stockCount})`);
      }

      if (item.prescription) {
        issues.push(`${item.name} requires a valid prescription`);
      }
    }

    return {
      valid: issues.length === 0,
      issues
    };
  }

  // Grouping by pharmacy
  public getItemsByPharmacy(): { [pharmacy: string]: CartItem[] } {
    return this.cartItems.reduce((groups, item) => {
      if (!groups[item.pharmacy]) {
        groups[item.pharmacy] = [];
      }
      groups[item.pharmacy].push(item);
      return groups;
    }, {} as { [pharmacy: string]: CartItem[] });
  }

  // Pharmacy-specific totals
  public getPharmacyTotals(): { [pharmacy: string]: number } {
    const itemsByPharmacy = this.getItemsByPharmacy();
    const totals: { [pharmacy: string]: number } = {};

    Object.keys(itemsByPharmacy).forEach(pharmacy => {
      totals[pharmacy] = itemsByPharmacy[pharmacy].reduce(
        (total, item) => total + (item.price * item.quantity),
        0
      );
    });

    return totals;
  }

  // Quick actions
  public async incrementItem(productId: string): Promise<boolean> {
    const item = this.getItem(productId);
    if (item) {
      return await this.updateItemQuantity(productId, item.quantity + 1);
    }
    return false;
  }

  public async decrementItem(productId: string): Promise<boolean> {
    const item = this.getItem(productId);
    if (item) {
      return await this.updateItemQuantity(productId, item.quantity - 1);
    }
    return false;
  }
}

export default CartService;
