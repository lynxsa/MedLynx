// Payment Types for South African Market
export interface PaymentMethod {
  id: string;
  name: string;
  type: 'card' | 'eft' | 'mobile' | 'wallet' | 'instant_payment';
  description: string;
  icon: string;
  fees: number;
  processingTime: string;
  isAvailable: boolean;
  providerLogo?: string;
  minAmount?: number;
  maxAmount?: number;
}

export interface PaymentRequest {
  amount: number;
  reference: string;
  description: string;
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  paymentMethodId: string;
  returnUrl?: string;
  notifyUrl?: string;
}

export interface PaymentResponse {
  success: boolean;
  transactionId?: string;
  paymentUrl?: string;
  message: string;
  reference?: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
}

export interface BankingDetails {
  accountHolder: string;
  accountNumber: string;
  bankName: string;
  branchCode: string;
  accountType: 'savings' | 'current' | 'transmission';
}

// PayFast Integration Service
class PaymentService {
  private static instance: PaymentService;
  private payFastMerchantId: string = 'YOUR_PAYFAST_MERCHANT_ID'; // Replace with actual merchant ID
  private payFastMerchantKey: string = 'YOUR_PAYFAST_MERCHANT_KEY'; // Replace with actual merchant key
  private baseUrl: string = 'https://sandbox.payfast.co.za/eng/process'; // Use live URL for production

  static getInstance(): PaymentService {
    if (!PaymentService.instance) {
      PaymentService.instance = new PaymentService();
    }
    return PaymentService.instance;
  }

  // Get Available Payment Methods for South Africa
  getPaymentMethods(): PaymentMethod[] {
    return [
      // Card Payments
      {
        id: 'visa',
        name: 'Visa',
        type: 'card',
        description: 'Credit & Debit Cards',
        icon: 'card-outline',
        fees: 0,
        processingTime: 'Instant',
        isAvailable: true,
        providerLogo: 'visa-logo'
      },
      {
        id: 'mastercard',
        name: 'Mastercard',
        type: 'card',
        description: 'Credit & Debit Cards',
        icon: 'card-outline',
        fees: 0,
        processingTime: 'Instant',
        isAvailable: true,
        providerLogo: 'mastercard-logo'
      },
      
      // South African Banks
      {
        id: 'fnb',
        name: 'FNB Online Banking',
        type: 'eft',
        description: 'Pay securely with FNB',
        icon: 'business-outline',
        fees: 0,
        processingTime: 'Instant',
        isAvailable: true,
        providerLogo: 'fnb-logo'
      },
      {
        id: 'absa',
        name: 'ABSA Online Banking',
        type: 'eft',
        description: 'Pay securely with ABSA',
        icon: 'business-outline',
        fees: 0,
        processingTime: 'Instant',
        isAvailable: true,
        providerLogo: 'absa-logo'
      },
      {
        id: 'standard_bank',
        name: 'Standard Bank',
        type: 'eft',
        description: 'Pay securely with Standard Bank',
        icon: 'business-outline',
        fees: 0,
        processingTime: 'Instant',
        isAvailable: true,
        providerLogo: 'standard-bank-logo'
      },
      {
        id: 'nedbank',
        name: 'Nedbank',
        type: 'eft',
        description: 'Pay securely with Nedbank',
        icon: 'business-outline',
        fees: 0,
        processingTime: 'Instant',
        isAvailable: true,
        providerLogo: 'nedbank-logo'
      },
      {
        id: 'capitec',
        name: 'Capitec Bank',
        type: 'eft',
        description: 'Pay securely with Capitec',
        icon: 'business-outline',
        fees: 0,
        processingTime: 'Instant',
        isAvailable: true,
        providerLogo: 'capitec-logo'
      },

      // Mobile Payments
      {
        id: 'ozow',
        name: 'Ozow',
        type: 'instant_payment',
        description: 'Instant bank payments',
        icon: 'flash-outline',
        fees: 0,
        processingTime: 'Instant',
        isAvailable: true,
        providerLogo: 'ozow-logo',
        minAmount: 5,
        maxAmount: 50000
      },

      // Digital Wallets
      {
        id: 'snapscan',
        name: 'SnapScan',
        type: 'mobile',
        description: 'Mobile payment app',
        icon: 'phone-portrait-outline',
        fees: 0,
        processingTime: 'Instant',
        isAvailable: true,
        providerLogo: 'snapscan-logo'
      },
      {
        id: 'zapper',
        name: 'Zapper',
        type: 'mobile',
        description: 'QR code payments',
        icon: 'qr-code-outline',
        fees: 0,
        processingTime: 'Instant',
        isAvailable: true,
        providerLogo: 'zapper-logo'
      },

      // EFT/Bank Transfer
      {
        id: 'eft',
        name: 'EFT/Bank Transfer',
        type: 'eft',
        description: 'Manual bank transfer',
        icon: 'swap-horizontal-outline',
        fees: 0,
        processingTime: '1-2 business days',
        isAvailable: true
      }
    ];
  }

  // PayFast Payment Processing
  async processPayment(paymentRequest: PaymentRequest): Promise<PaymentResponse> {
    try {
      console.log('🔄 Processing payment:', paymentRequest);

      // Generate unique payment reference
      const paymentReference = `MEDLYNX-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // PayFast payment data
      const paymentData = {
        merchant_id: this.payFastMerchantId,
        merchant_key: this.payFastMerchantKey,
        return_url: paymentRequest.returnUrl || 'https://medlynx.app/payment-success',
        cancel_url: 'https://medlynx.app/payment-cancelled',
        notify_url: paymentRequest.notifyUrl || 'https://medlynx.app/payment-notify',
        
        // Payment details
        name_first: paymentRequest.customerName.split(' ')[0],
        name_last: paymentRequest.customerName.split(' ').slice(1).join(' ') || '',
        email_address: paymentRequest.customerEmail,
        cell_number: paymentRequest.customerPhone,
        
        // Transaction details
        m_payment_id: paymentReference,
        amount: paymentRequest.amount.toFixed(2),
        item_name: paymentRequest.description,
        item_description: `MedLynx Order - ${paymentRequest.reference}`,
        
        // Additional parameters
        payment_method: this.mapPaymentMethod(paymentRequest.paymentMethodId),
        subscription_type: 1 // One-time payment
      };

      // Handle different payment methods
      switch (paymentRequest.paymentMethodId) {
        case 'ozow':
          return await this.processOzowPayment(paymentRequest, paymentReference);
        
        case 'snapscan':
        case 'zapper':
          return await this.processMobilePayment(paymentRequest, paymentReference);
        
        case 'eft':
          return await this.processEFTPayment(paymentRequest, paymentReference);
        
        default:
          return await this.processPayFastPayment(paymentData, paymentReference);
      }

    } catch (error) {
      console.error('Payment processing error:', error);
      return {
        success: false,
        message: 'Payment processing failed. Please try again.',
        status: 'failed'
      };
    }
  }

  // Ozow Integration
  private async processOzowPayment(
    paymentRequest: PaymentRequest, 
    reference: string
  ): Promise<PaymentResponse> {
    // Ozow API integration (requires separate Ozow merchant account)
    const ozowData = {
      SiteCode: 'YOUR_OZOW_SITE_CODE',
      CountryCode: 'ZA',
      CurrencyCode: 'ZAR',
      Amount: paymentRequest.amount,
      TransactionReference: reference,
      Customer: paymentRequest.customerName,
      BankReference: paymentRequest.description,
      NotifyUrl: 'https://medlynx.app/ozow-notify',
      ReturnUrl: 'https://medlynx.app/payment-success',
      CancelUrl: 'https://medlynx.app/payment-cancelled'
    };

    // For demo purposes, simulate Ozow payment
    return {
      success: true,
      transactionId: `OZ${Date.now()}`,
      paymentUrl: `https://pay.ozow.com/?${this.buildOzowQueryString(ozowData)}`,
      message: 'Redirecting to Ozow for payment...',
      reference,
      status: 'pending'
    };
  }

  // Mobile Payment Processing
  private async processMobilePayment(
    paymentRequest: PaymentRequest, 
    reference: string
  ): Promise<PaymentResponse> {
    // Generate QR code data for SnapScan/Zapper
    const qrData = {
      amount: paymentRequest.amount,
      reference: reference,
      description: paymentRequest.description
    };

    console.log('Mobile payment QR data:', qrData);

    return {
      success: true,
      transactionId: `MP${Date.now()}`,
      message: `Please scan the QR code with ${paymentRequest.paymentMethodId === 'snapscan' ? 'SnapScan' : 'Zapper'}`,
      reference,
      status: 'pending'
    };
  }

  // EFT Payment Processing
  private async processEFTPayment(
    paymentRequest: PaymentRequest, 
    reference: string
  ): Promise<PaymentResponse> {
    const bankingDetails: BankingDetails = {
      accountHolder: 'MedLynx (Pty) Ltd',
      accountNumber: '1234567890',
      bankName: 'First National Bank',
      branchCode: '250655',
      accountType: 'current'
    };

    console.log('EFT banking details:', bankingDetails);

    return {
      success: true,
      transactionId: `EFT${Date.now()}`,
      message: 'Please use the provided banking details to complete your payment',
      reference,
      status: 'pending'
    };
  }

  // PayFast Payment Processing
  private async processPayFastPayment(
    paymentData: any, 
    reference: string
  ): Promise<PaymentResponse> {
    try {
      // Generate PayFast signature
      const signature = this.generatePayFastSignature(paymentData);
      paymentData.signature = signature;

      // Build PayFast payment URL
      const paymentUrl = `${this.baseUrl}?${this.buildQueryString(paymentData)}`;

      return {
        success: true,
        transactionId: `PF${Date.now()}`,
        paymentUrl,
        message: 'Redirecting to PayFast for secure payment...',
        reference,
        status: 'pending'
      };

    } catch (error) {
      console.error('PayFast payment error:', error);
      return {
        success: false,
        message: 'Failed to initialize PayFast payment',
        status: 'failed'
      };
    }
  }

  // Payment Status Checking
  async checkPaymentStatus(transactionId: string): Promise<{
    status: 'pending' | 'completed' | 'failed' | 'cancelled';
    message: string;
  }> {
    try {
      // In a real app, this would check with the payment provider's API
      // For demo purposes, we'll simulate different outcomes
      const outcomes = ['completed', 'pending', 'failed'];
      const randomStatus = outcomes[Math.floor(Math.random() * outcomes.length)] as any;

      return {
        status: randomStatus,
        message: this.getStatusMessage(randomStatus)
      };
    } catch (error) {
      console.error('Error checking payment status:', error);
      return {
        status: 'failed',
        message: 'Unable to check payment status'
      };
    }
  }

  // Refund Processing
  async processRefund(transactionId: string, amount: number, reason: string): Promise<{
    success: boolean;
    refundId?: string;
    message: string;
  }> {
    try {
      // Process refund through PayFast API
      const refundData = {
        merchant_id: this.payFastMerchantId,
        merchant_key: this.payFastMerchantKey,
        transaction_id: transactionId,
        amount: amount.toFixed(2),
        reason
      };

      console.log('Processing refund:', refundData);

      // For demo purposes
      return {
        success: true,
        refundId: `REF${Date.now()}`,
        message: 'Refund processed successfully. It may take 3-5 business days to reflect in your account.'
      };
    } catch (error) {
      console.error('Refund processing error:', error);
      return {
        success: false,
        message: 'Failed to process refund. Please contact support.'
      };
    }
  }

  // Utility Methods
  private mapPaymentMethod(methodId: string): string {
    const mapping: { [key: string]: string } = {
      visa: 'cc',
      mastercard: 'cc',
      fnb: 'eft',
      absa: 'eft',
      standard_bank: 'eft',
      nedbank: 'eft',
      capitec: 'eft'
    };
    return mapping[methodId] || 'cc';
  }

  private generatePayFastSignature(data: any): string {
    // PayFast signature generation logic
    const queryString = Object.keys(data)
      .sort()
      .map(key => `${key}=${encodeURIComponent(data[key])}`)
      .join('&');
    
    console.log('PayFast signature data:', queryString);
    // In production, use proper MD5 hashing with passphrase
    return 'demo_signature'; // Replace with actual signature generation
  }

  private buildQueryString(data: any): string {
    return Object.keys(data)
      .map(key => `${key}=${encodeURIComponent(data[key])}`)
      .join('&');
  }

  private buildOzowQueryString(data: any): string {
    return Object.keys(data)
      .map(key => `${key}=${encodeURIComponent(data[key])}`)
      .join('&');
  }

  private getStatusMessage(status: string): string {
    switch (status) {
      case 'completed':
        return 'Payment completed successfully';
      case 'pending':
        return 'Payment is being processed';
      case 'failed':
        return 'Payment failed';
      case 'cancelled':
        return 'Payment was cancelled';
      default:
        return 'Unknown payment status';
    }
  }

  // Get Banking Details for EFT
  getBankingDetails(): BankingDetails {
    return {
      accountHolder: 'MedLynx (Pty) Ltd',
      accountNumber: '1234567890',
      bankName: 'First National Bank',
      branchCode: '250655',
      accountType: 'current'
    };
  }

  // Validate Payment Amount
  validatePaymentAmount(amount: number, methodId: string): { valid: boolean; message: string } {
    const method = this.getPaymentMethods().find(m => m.id === methodId);
    
    if (!method) {
      return { valid: false, message: 'Invalid payment method' };
    }

    if (method.minAmount && amount < method.minAmount) {
      return { valid: false, message: `Minimum amount for ${method.name} is R${method.minAmount}` };
    }

    if (method.maxAmount && amount > method.maxAmount) {
      return { valid: false, message: `Maximum amount for ${method.name} is R${method.maxAmount}` };
    }

    return { valid: true, message: 'Amount is valid' };
  }
}

export default PaymentService;
