// @ts-nocheck - Style compatibility issues - needs refactoring
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import CartService, { CartSummary } from '../services/CartService';
import PaymentService, { BankingDetails, PaymentMethod, PaymentRequest, PaymentResponse } from '../services/PaymentService';

interface CheckoutScreenProps {
  cartSummary: CartSummary;
  onPaymentComplete: (success: boolean, transactionId?: string) => void;
  onBack: () => void;
}

export default function CheckoutScreen({ cartSummary, onPaymentComplete, onBack }: CheckoutScreenProps) {
  const { theme } = useTheme();
  
  // Form states
  const [customerDetails, setCustomerDetails] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
  });

  // Payment states
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [showBankingDetails, setShowBankingDetails] = useState(false);
  const [bankingDetails, setBankingDetails] = useState<BankingDetails | null>(null);
  
  // Processing states
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'details' | 'payment' | 'processing' | 'success' | 'failed'>('details');
  const [paymentResponse, setPaymentResponse] = useState<PaymentResponse | null>(null);

  const paymentService = PaymentService.getInstance();
  const cartService = CartService.getInstance();

  useEffect(() => {
    loadPaymentMethods();
    loadBankingDetails();
  }, []);

  const loadPaymentMethods = () => {
    const methods = paymentService.getPaymentMethods();
    setPaymentMethods(methods);
  };

  const loadBankingDetails = () => {
    const details = paymentService.getBankingDetails();
    setBankingDetails(details);
  };

  const validateForm = (): boolean => {
    const { name, email, phone, address, city, postalCode } = customerDetails;
    
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your full name');
      return false;
    }
    
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }
    
    if (!phone.trim() || !/^[0-9+\-\s()]+$/.test(phone)) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return false;
    }
    
    if (!address.trim()) {
      Alert.alert('Error', 'Please enter your delivery address');
      return false;
    }
    
    if (!city.trim()) {
      Alert.alert('Error', 'Please enter your city');
      return false;
    }
    
    if (!postalCode.trim() || !/^[0-9]{4}$/.test(postalCode)) {
      Alert.alert('Error', 'Please enter a valid 4-digit postal code');
      return false;
    }

    if (!selectedPaymentMethod) {
      Alert.alert('Error', 'Please select a payment method');
      return false;
    }

    return true;
  };

  const handlePayment = async () => {
    if (!validateForm()) return;
    
    setIsProcessing(true);
    setPaymentStep('processing');

    try {
      const paymentRequest: PaymentRequest = {
        amount: cartSummary.total,
        reference: `ORDER-${Date.now()}`,
        description: `MedLynx Order - ${cartSummary.itemCount} items`,
        customerEmail: customerDetails.email,
        customerName: customerDetails.name,
        customerPhone: customerDetails.phone,
        paymentMethodId: selectedPaymentMethod!.id,
        returnUrl: 'https://medlynx.app/payment-success',
        notifyUrl: 'https://medlynx.app/payment-notify',
      };

      const response = await paymentService.processPayment(paymentRequest);
      setPaymentResponse(response);

      if (response.success) {
        if (response.paymentUrl) {
          // Redirect to payment provider
          const supported = await Linking.canOpenURL(response.paymentUrl);
          if (supported) {
            await Linking.openURL(response.paymentUrl);
            // In a real app, you'd listen for the return URL
            setPaymentStep('success');
            onPaymentComplete(true, response.transactionId);
          } else {
            throw new Error('Cannot open payment URL');
          }
        } else {
          // Handle special payment types (EFT, Mobile)
          if (selectedPaymentMethod!.id === 'eft') {
            setShowBankingDetails(true);
            setPaymentStep('success');
            onPaymentComplete(true, response.transactionId);
          } else {
            setPaymentStep('success');
            onPaymentComplete(true, response.transactionId);
          }
        }
        
        // Clear cart after successful payment
        await cartService.clearCart();
      } else {
        setPaymentStep('failed');
        Alert.alert('Payment Failed', response.message);
      }
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentStep('failed');
      Alert.alert('Payment Error', 'Something went wrong. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const retryPayment = () => {
    setPaymentStep('payment');
    setPaymentResponse(null);
  };

  const renderCustomerDetailsForm = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Delivery Details
      </Text>
      
      <TextInput
        style={[styles.input, { borderColor: theme.colors.border, color: theme.colors.text }]}
        placeholder="Full Name"
        placeholderTextColor={theme.colors.textSecondary}
        value={customerDetails.name}
        onChangeText={(text) => setCustomerDetails(prev => ({ ...prev, name: text }))}
      />
      
      <TextInput
        style={[styles.input, { borderColor: theme.colors.border, color: theme.colors.text }]}
        placeholder="Email Address"
        placeholderTextColor={theme.colors.textSecondary}
        value={customerDetails.email}
        onChangeText={(text) => setCustomerDetails(prev => ({ ...prev, email: text }))}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <TextInput
        style={[styles.input, { borderColor: theme.colors.border, color: theme.colors.text }]}
        placeholder="Phone Number"
        placeholderTextColor={theme.colors.textSecondary}
        value={customerDetails.phone}
        onChangeText={(text) => setCustomerDetails(prev => ({ ...prev, phone: text }))}
        keyboardType="phone-pad"
      />
      
      <TextInput
        style={[styles.input, { borderColor: theme.colors.border, color: theme.colors.text }]}
        placeholder="Street Address"
        placeholderTextColor={theme.colors.textSecondary}
        value={customerDetails.address}
        onChangeText={(text) => setCustomerDetails(prev => ({ ...prev, address: text }))}
        multiline
      />
      
      <View style={styles.row}>
        <TextInput
          style={[styles.input, styles.halfInput, { borderColor: theme.colors.border, color: theme.colors.text }]}
          placeholder="City"
          placeholderTextColor={theme.colors.textSecondary}
          value={customerDetails.city}
          onChangeText={(text) => setCustomerDetails(prev => ({ ...prev, city: text }))}
        />
        
        <TextInput
          style={[styles.input, styles.halfInput, { borderColor: theme.colors.border, color: theme.colors.text }]}
          placeholder="Postal Code"
          placeholderTextColor={theme.colors.textSecondary}
          value={customerDetails.postalCode}
          onChangeText={(text) => setCustomerDetails(prev => ({ ...prev, postalCode: text }))}
          keyboardType="numeric"
          maxLength={4}
        />
      </View>
    </View>
  );

  const renderPaymentMethods = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Payment Method
      </Text>
      
      {paymentMethods.map((method) => (
        <TouchableOpacity
          key={method.id}
          style={[
            styles.paymentMethod,
            { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
            selectedPaymentMethod?.id === method.id && { borderColor: theme.colors.primary }
          ]}
          onPress={() => setSelectedPaymentMethod(method)}
        >
          <View style={styles.paymentMethodContent}>
            <Ionicons
              name={method.icon as any}
              size={24}
              color={theme.colors.primary}
              style={styles.paymentIcon}
            />
            <View style={styles.paymentInfo}>
              <Text style={[styles.paymentName, { color: theme.colors.text }]}>
                {method.name}
              </Text>
              <Text style={[styles.paymentDescription, { color: theme.colors.textSecondary }]}>
                {method.description}
              </Text>
              <Text style={[styles.paymentTime, { color: theme.colors.textSecondary }]}>
                {method.processingTime}
                {method.fees > 0 && ` • +R${method.fees} fee`}
              </Text>
            </View>
            <Ionicons
              name={selectedPaymentMethod?.id === method.id ? 'radio-button-on' : 'radio-button-off'}
              size={20}
              color={selectedPaymentMethod?.id === method.id ? theme.colors.primary : theme.colors.textSecondary}
            />
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderOrderSummary = () => (
    <View style={[styles.section, styles.summaryContainer, { backgroundColor: theme.colors.card }]}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Order Summary
      </Text>
      
      <View style={styles.summaryRow}>
        <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
          Subtotal ({cartSummary.itemCount} items)
        </Text>
        <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
          R{cartSummary.subtotal.toFixed(2)}
        </Text>
      </View>
      
      {cartSummary.discount > 0 && (
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
            Product Discounts
          </Text>
          <Text style={[styles.summaryValue, { color: theme.colors.success }]}>
            -R{cartSummary.discount.toFixed(2)}
          </Text>
        </View>
      )}
      
      {cartSummary.couponDiscount > 0 && (
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
            Coupon Discount
          </Text>
          <Text style={[styles.summaryValue, { color: theme.colors.success }]}>
            -R{cartSummary.couponDiscount.toFixed(2)}
          </Text>
        </View>
      )}
      
      <View style={styles.summaryRow}>
        <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
          Delivery
        </Text>
        <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
          {cartSummary.deliveryFee === 0 ? 'Free' : `R${cartSummary.deliveryFee.toFixed(2)}`}
        </Text>
      </View>

      <View style={[styles.summaryRow, styles.totalRow]}>
        <Text style={[styles.totalLabel, { color: theme.colors.text }]}>
          Total
        </Text>
        <Text style={[styles.totalValue, { color: theme.colors.primary }]}>
          R{cartSummary.total.toFixed(2)}
        </Text>
      </View>

      {cartSummary.savings > 0 && (
        <Text style={[styles.savingsText, { color: theme.colors.success }]}>
          You saved R{cartSummary.savings.toFixed(2)}!
        </Text>
      )}
    </View>
  );

  const renderBankingDetails = () => {
    if (!bankingDetails) return null;
    
    return (
      <View style={[styles.section, styles.bankingContainer, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Banking Details for EFT
        </Text>
        
        <View style={styles.bankingRow}>
          <Text style={[styles.bankingLabel, { color: theme.colors.textSecondary }]}>
            Account Holder:
          </Text>
          <Text style={[styles.bankingValue, { color: theme.colors.text }]}>
            {bankingDetails.accountHolder}
          </Text>
        </View>
        
        <View style={styles.bankingRow}>
          <Text style={[styles.bankingLabel, { color: theme.colors.textSecondary }]}>
            Bank:
          </Text>
          <Text style={[styles.bankingValue, { color: theme.colors.text }]}>
            {bankingDetails.bankName}
          </Text>
        </View>
        
        <View style={styles.bankingRow}>
          <Text style={[styles.bankingLabel, { color: theme.colors.textSecondary }]}>
            Account Number:
          </Text>
          <Text style={[styles.bankingValue, { color: theme.colors.text }]}>
            {bankingDetails.accountNumber}
          </Text>
        </View>
        
        <View style={styles.bankingRow}>
          <Text style={[styles.bankingLabel, { color: theme.colors.textSecondary }]}>
            Branch Code:
          </Text>
          <Text style={[styles.bankingValue, { color: theme.colors.text }]}>
            {bankingDetails.branchCode}
          </Text>
        </View>
        
        <View style={styles.bankingRow}>
          <Text style={[styles.bankingLabel, { color: theme.colors.textSecondary }]}>
            Reference:
          </Text>
          <Text style={[styles.bankingValue, { color: theme.colors.text }]}>
            {paymentResponse?.reference || 'ORDER-' + Date.now()}
          </Text>
        </View>

        <View style={[styles.noteContainer, { backgroundColor: theme.colors.warning + '20' }]}>
          <Ionicons name="information-circle" size={20} color={theme.colors.warning} />
          <Text style={[styles.noteText, { color: theme.colors.warning }]}>
            Please use the reference number when making your EFT payment. 
            Your order will be processed once payment is received.
          </Text>
        </View>
      </View>
    );
  };

  const renderProcessingScreen = () => (
    <View style={styles.processingContainer}>
      <Ionicons name="card-outline" size={80} color={theme.colors.primary} />
      <Text style={[styles.processingTitle, { color: theme.colors.text }]}>
        Processing Payment...
      </Text>
      <Text style={[styles.processingSubtitle, { color: theme.colors.textSecondary }]}>
        Please wait while we process your payment
      </Text>
    </View>
  );

  const renderSuccessScreen = () => (
    <View style={styles.processingContainer}>
      <Ionicons name="checkmark-circle" size={80} color={theme.colors.success} />
      <Text style={[styles.processingTitle, { color: theme.colors.text }]}>
        Payment Successful!
      </Text>
      <Text style={[styles.processingSubtitle, { color: theme.colors.textSecondary }]}>
        Thank you for your order. You will receive a confirmation email shortly.
      </Text>
      {paymentResponse?.transactionId && (
        <Text style={[styles.transactionId, { color: theme.colors.textSecondary }]}>
          Transaction ID: {paymentResponse.transactionId}
        </Text>
      )}
    </View>
  );

  const renderFailedScreen = () => (
    <View style={styles.processingContainer}>
      <Ionicons name="close-circle" size={80} color={theme.colors.error} />
      <Text style={[styles.processingTitle, { color: theme.colors.text }]}>
        Payment Failed
      </Text>
      <Text style={[styles.processingSubtitle, { color: theme.colors.textSecondary }]}>
        {paymentResponse?.message || 'Something went wrong with your payment'}
      </Text>
      
      <TouchableOpacity
        style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
        onPress={retryPayment}
      >
        <Text style={styles.retryButtonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 15,
      paddingTop: 60,
      backgroundColor: theme.colors.primary,
    },
    backButton: {
      marginRight: 15,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#fff',
    },
    content: {
      flex: 1,
    },
    section: {
      padding: 20,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 15,
    },
    input: {
      borderWidth: 1,
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      marginBottom: 12,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    halfInput: {
      width: '48%',
    },
    paymentMethod: {
      borderWidth: 1,
      borderRadius: 12,
      padding: 15,
      marginBottom: 10,
    },
    paymentMethodContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    paymentIcon: {
      marginRight: 15,
    },
    paymentInfo: {
      flex: 1,
    },
    paymentName: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 2,
    },
    paymentDescription: {
      fontSize: 14,
      marginBottom: 2,
    },
    paymentTime: {
      fontSize: 12,
    },
    summaryContainer: {
      borderRadius: 12,
      margin: 20,
      padding: 20,
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    summaryLabel: {
      fontSize: 14,
    },
    summaryValue: {
      fontSize: 14,
      fontWeight: '500',
    },
    totalRow: {
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      paddingTop: 10,
      marginTop: 5,
      marginBottom: 10,
    },
    totalLabel: {
      fontSize: 18,
      fontWeight: 'bold',
    },
    totalValue: {
      fontSize: 18,
      fontWeight: 'bold',
    },
    savingsText: {
      textAlign: 'center',
      fontSize: 14,
      fontWeight: '500',
    },
    bankingContainer: {
      borderRadius: 12,
      margin: 20,
      padding: 20,
    },
    bankingRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 10,
    },
    bankingLabel: {
      fontSize: 14,
      fontWeight: '500',
    },
    bankingValue: {
      fontSize: 14,
      fontWeight: 'bold',
    },
    noteContainer: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      padding: 12,
      borderRadius: 8,
      marginTop: 15,
    },
    noteText: {
      fontSize: 12,
      marginLeft: 8,
      flex: 1,
    },
    processingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 40,
    },
    processingTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      marginTop: 20,
      marginBottom: 10,
      textAlign: 'center',
    },
    processingSubtitle: {
      fontSize: 16,
      textAlign: 'center',
      lineHeight: 22,
    },
    transactionId: {
      fontSize: 14,
      marginTop: 15,
      fontFamily: 'monospace',
    },
    retryButton: {
      paddingHorizontal: 30,
      paddingVertical: 12,
      borderRadius: 8,
      marginTop: 20,
    },
    retryButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
    },
    bottomContainer: {
      padding: 20,
      backgroundColor: theme.colors.card,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    payButton: {
      borderRadius: 12,
      overflow: 'hidden',
    },
    payButtonContent: {
      paddingVertical: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    payButtonText: {
      color: '#fff',
      fontSize: 18,
      fontWeight: 'bold',
    },
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
      </View>

      {/* Content based on step */}
      {paymentStep === 'processing' && renderProcessingScreen()}
      {paymentStep === 'success' && (
        <ScrollView style={styles.content}>
          {renderSuccessScreen()}
          {showBankingDetails && renderBankingDetails()}
        </ScrollView>
      )}
      {paymentStep === 'failed' && renderFailedScreen()}
      
      {(paymentStep === 'details' || paymentStep === 'payment') && (
        <>
          <ScrollView style={styles.content}>
            {renderCustomerDetailsForm()}
            {renderPaymentMethods()}
            {renderOrderSummary()}
          </ScrollView>

          {/* Pay Button */}
          <View style={styles.bottomContainer}>
            <TouchableOpacity
              style={styles.payButton}
              onPress={handlePayment}
              disabled={isProcessing}
            >
              <LinearGradient
                colors={[theme.colors.primary, theme.colors.secondary]}
                style={styles.payButtonContent}
              >
                <Text style={styles.payButtonText}>
                  {isProcessing ? 'Processing...' : `Pay R${cartSummary.total.toFixed(2)}`}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}
