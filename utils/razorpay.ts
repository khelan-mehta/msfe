// utils/razorpay.ts - Razorpay Payment Integration

/**
 * RAZORPAY INTEGRATION GUIDE FOR REACT NATIVE
 * 
 * 1. Install the package:
 *    npm install react-native-razorpay
 *    
 * 2. For iOS:
 *    cd ios && pod install
 *    
 * 3. Add this to your AndroidManifest.xml (Android):
 *    <uses-permission android:name="android.permission.INTERNET" />
 */

import RazorpayCheckout from 'react-native-razorpay';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { RAZORPAY_KEY, API_BASE_URL } from '../constants';

export interface RazorpayOptions {
  orderId: string;
  amount: number; // in paise (multiply by 100)
  name: string;
  description: string;
  planId: string;
}

export interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

const RAZORPAY_KEY_ID = RAZORPAY_KEY; // From your .env (fallback used if not provided)

export class RazorpayService {
  /**
   * Initialize payment with Razorpay
   */
  static async initiatePayment(options: RazorpayOptions): Promise<RazorpayResponse | null> {
    try {
      const userData = await AsyncStorage.getItem('user_data');
      const user = userData ? JSON.parse(userData) : null;

      const razorpayOptions = {
        description: options.description,
        image: 'https://your-logo-url.com/logo.png', // Add your logo URL
        currency: 'INR',
        key: RAZORPAY_KEY_ID,
        amount: options.amount * 100, // Convert to paise
        name: options.name,
        order_id: options.orderId,
        prefill: {
          email: user?.email || '',
          contact: user?.mobile || '',
          name: user?.name || 'User',
        },
        theme: {
          color: '#2563EB', // Your theme color
        },
      };

      // Open Razorpay checkout
      const data = await RazorpayCheckout.open(razorpayOptions);

      return {
        razorpay_payment_id: data.razorpay_payment_id,
        razorpay_order_id: data.razorpay_order_id,
        razorpay_signature: data.razorpay_signature,
      };
    } catch (error: any) {
      console.error('Razorpay Error:', error);
      
      if (error.code === 0) {
        toast.showWarning('Payment Cancelled', 'You cancelled the payment');
      } else if (error.code === 1) {
        toast.showWarning('Network Error', 'Please check your internet connection');
      } else {
        toast.showWarning('Payment Failed', error.message || 'Something went wrong');
      }
      
      return null;
    }
  }

  /**
   * Verify payment on backend
   */
  static async verifyPayment(
    paymentData: RazorpayResponse,
    subscriptionId: string
  ): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem('access_token');

      const response = await fetch(`${API_BASE_URL}/subscription/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...paymentData,
          subscription_id: subscriptionId,
        }),
      });

      const result = await response.json();

      if (result.success) {
        return true;
      } else {
        throw new Error(result.message || 'Verification failed');
      }
    } catch (error: any) {
      console.error('Payment Verification Error:', error);
      toast.showWarning('Verification Failed', error.message);
      return false;
    }
  }

  /**
   * Complete payment flow (create order + initiate payment + verify)
   */
  static async processPayment(planId: string, planName: string, amount: number): Promise<boolean> {
    try {
      // Step 1: Create subscription order on backend
      const token = await AsyncStorage.getItem('access_token');

      const createResponse = await fetch(
        `${API_BASE_URL}/subscription/create/${planId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const createResult = await createResponse.json();

      if (!createResult.success) {
        throw new Error(createResult.message || 'Failed to create order');
      }

      const { subscription_id, order } = createResult.data;

      // Step 2: Initiate Razorpay payment
      const paymentData = await this.initiatePayment({
        orderId: order.id,
        amount: amount,
        name: `${planName} Plan`,
        description: `Subscription to ${planName} plan for 1 year`,
        planId: planId,
      });

      if (!paymentData) {
        return false; // Payment was cancelled or failed
      }

      // Step 3: Verify payment on backend
      const verified = await this.verifyPayment(paymentData, subscription_id);

      if (verified) {
        toast.showWarning(
          'Success! 🎉',
          `Your ${planName} subscription has been activated successfully!`
        );
        return true;
      } else {
        return false;
      }
    } catch (error: any) {
      console.error('Payment Process Error:', error);
      toast.showWarning('Payment Error', error.message || 'Something went wrong');
      return false;
    }
  }
}

/**
 * USAGE EXAMPLE:
 * 
 * import { RazorpayService } from './utils/razorpay';
 * 
 * const handlePayment = async () => {
 *   const success = await RazorpayService.processPayment(
 *     'silver',      // planId
 *     'Silver',      // planName
 *     499            // amount in INR
 *   );
 *   
 *   if (success) {
 *     // Navigate to success screen or refresh data
 *   }
 * };
 */