// components/modals/SubscriptionModal.tsx - Subscription plans modal

import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import RazorpayCheckout from 'react-native-razorpay';
import {
  X,
  Award,
  Zap,
  Star,
  CheckCircle,
  ChevronRight,
} from 'lucide-react-native';
import { SubscriptionPlan, PaymentStatus, FlowState, UserProfile } from '../../types';
import { API_BASE_URL, SUBSCRIPTION_PLANS, RAZORPAY_KEY, STORAGE_KEYS } from '../../constants';
import { adjustColor } from '../../utils';
import { colors, sharedStyles } from '../styles/shared';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface SubscriptionModalProps {
  visible: boolean;
  flowState: FlowState;
  userProfile: UserProfile | null;
  fullName: string;
  modalAnim: Animated.Value;
  onClose: () => void;
  onSuccess: () => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  visible,
  flowState,
  userProfile,
  fullName,
  modalAnim,
  onClose,
  onSuccess,
}) => {
  const [processingPayment, setProcessingPayment] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('idle');

  const canClose = !processingPayment && flowState !== 'subscription_required';

  const handlePlanSelection = async (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    await initiatePayment(plan);
  };

  const initiatePayment = async (plan: SubscriptionPlan) => {
    try {
      setProcessingPayment(true);
      setPaymentStatus('processing');
      const token = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

      const response = await fetch(`${API_BASE_URL}/subscription/create/${plan.id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = await response.json();

      if (result.success) {
        const { subscription_id, order } = result.data;

        const options = {
          key: RAZORPAY_KEY,
          amount: order.amount,
          currency: order.currency,
          name: `${plan.name} Plan`,
          description: `Subscription for ${plan.duration}`,
          order_id: order.id,
          prefill: {
            name: fullName || userProfile?.name || 'User',
            email: userProfile?.email || '',
            contact: userProfile?.mobile || '',
          },
          theme: {
            color: colors.primary,
          },
          handler: async function (paymentResponse: any) {
            setPaymentStatus('verifying');
            await handlePaymentSuccess(paymentResponse, subscription_id);
          },
          modal: {
            ondismiss: function () {
              setPaymentStatus('failed');
              setProcessingPayment(false);
              toast.showWarning('Payment Cancelled', 'You cancelled the payment.', [
                { text: 'OK', onPress: () => setPaymentStatus('idle') },
              ]);
            },
            escape: true,
            backdropclose: false,
          },
        };

        if (Platform.OS === 'web') {
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.async = true;
          script.onload = () => {
            const rzp = new (window as any).Razorpay(options);
            rzp.on('payment.failed', function (paymentResponse: any) {
              setPaymentStatus('failed');
              setProcessingPayment(false);
              toast.showWarning(
                'Payment Failed',
                paymentResponse.error.description || 'Payment failed.',
                [
                  {
                    text: 'Retry',
                    onPress: () => {
                      setPaymentStatus('idle');
                      initiatePayment(plan);
                    },
                  },
                  { text: 'Cancel', style: 'cancel', onPress: () => setPaymentStatus('idle') },
                ]
              );
            });
            rzp.open();
          };
          script.onerror = () => {
            setPaymentStatus('failed');
            setProcessingPayment(false);
            toast.showWarning('Error', 'Failed to load payment gateway.');
          };
          document.body.appendChild(script);
        } else {
          RazorpayCheckout.open(options)
            .then(async (data: any) => {
              setPaymentStatus('verifying');
              await handlePaymentSuccess(data, subscription_id);
            })
            .catch((error: any) => {
              setPaymentStatus('failed');
              setProcessingPayment(false);
              const isCancelled =
                error.description === 'Payment cancelled by user' || error.code === 2;
              if (isCancelled) {
                toast.showWarning('Payment Cancelled', 'You cancelled the payment.', [
                  { text: 'OK', onPress: () => setPaymentStatus('idle') },
                ]);
              } else {
                toast.showWarning('Payment Failed', error.description || 'Payment failed.', [
                  {
                    text: 'Retry',
                    onPress: () => {
                      setPaymentStatus('idle');
                      initiatePayment(plan);
                    },
                  },
                  { text: 'Cancel', style: 'cancel', onPress: () => setPaymentStatus('idle') },
                ]);
              }
            });
        }
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      console.error('Error initiating payment:', error);
      setPaymentStatus('failed');
      setProcessingPayment(false);
      toast.showWarning('Error', error.message || 'Failed to initiate payment', [
        {
          text: 'Retry',
          onPress: () => {
            setPaymentStatus('idle');
            initiatePayment(plan);
          },
        },
        { text: 'Cancel', style: 'cancel', onPress: () => setPaymentStatus('idle') },
      ]);
    }
  };

  const handlePaymentSuccess = async (paymentData: any, subscriptionId: string) => {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

      const response = await fetch(`${API_BASE_URL}/subscription/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          subscription_id: subscriptionId,
          razorpay_order_id: paymentData.razorpay_order_id,
          razorpay_payment_id: paymentData.razorpay_payment_id,
          razorpay_signature: paymentData.razorpay_signature,
        }),
      });

      const result = await response.json();

      if (result.success) {
        await AsyncStorage.setItem(STORAGE_KEYS.SUBSCRIPTION_ID, subscriptionId);
        setPaymentStatus('success');

        toast.showWarning('🎉 Success!', 'Payment successful! Now create your worker profile.', [
          {
            text: 'Continue',
            onPress: () => {
              setProcessingPayment(false);
              setPaymentStatus('idle');
              onSuccess();
            },
          },
        ]);
      } else {
        throw new Error(result.message || 'Payment verification failed');
      }
    } catch (error: any) {
      console.error('Error verifying payment:', error);
      setPaymentStatus('failed');
      setProcessingPayment(false);
      toast.showWarning(
        'Verification Failed',
        'Payment was successful but verification failed. Please contact support.',
        [{ text: 'OK', onPress: () => setPaymentStatus('idle') }]
      );
    }
  };

  const getSubtitleText = () => {
    switch (paymentStatus) {
      case 'processing':
        return 'Processing payment...';
      case 'verifying':
        return 'Verifying payment...';
      case 'success':
        return 'Payment successful!';
      default:
        return 'Unlock premium features';
    }
  };

  const renderPlanCard = (plan: SubscriptionPlan) => (
    <TouchableOpacity
      key={plan.id}
      style={[styles.planCard, plan.popular && styles.planCardPopular]}
      onPress={() => handlePlanSelection(plan)}
      disabled={processingPayment}
    >
      {plan.popular && (
        <View style={styles.popularBadge}>
          <Star size={12} color="#FFFFFF" fill="#FFFFFF" />
          <Text style={styles.popularBadgeText}>Most Popular</Text>
        </View>
      )}

      <View style={styles.planHeader}>
        <View style={[styles.planIcon, { backgroundColor: plan.color + '20' }]}>
          {plan.id === 'silver' ? (
            <Award size={28} color={plan.color} />
          ) : (
            <Zap size={28} color={plan.color} />
          )}
        </View>
        <View style={styles.planHeaderText}>
          <Text style={styles.planName}>{plan.name}</Text>
          <Text style={styles.planDuration}>{plan.duration}</Text>
        </View>
      </View>

      <View style={styles.planPricing}>
        <Text style={styles.planCurrency}>₹</Text>
        <Text style={styles.planPrice}>{plan.price}</Text>
        <Text style={styles.planPeriod}>/year</Text>
      </View>

      <View style={styles.planFeatures}>
        {plan.features.map((feature, index) => (
          <View key={index} style={styles.featureItem}>
            <CheckCircle size={16} color={colors.success} />
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </View>

      <View style={styles.selectButton}>
        <LinearGradient
          colors={[plan.color, adjustColor(plan.color, -20)]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.selectButtonGradient}
        >
          <Text style={styles.selectButtonText}>
            {processingPayment && selectedPlan?.id === plan.id ? 'Processing...' : 'Select Plan'}
          </Text>
          <ChevronRight size={18} color="#FFFFFF" />
        </LinearGradient>
      </View>
    </TouchableOpacity>
  );

  const renderPaymentStatus = () => {
    if (paymentStatus === 'processing' || paymentStatus === 'verifying') {
      return (
        <View style={styles.paymentStatusContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.paymentStatusText}>
            {paymentStatus === 'processing' ? 'Setting up payment...' : 'Verifying your payment...'}
          </Text>
          <Text style={styles.paymentStatusSubtext}>Please wait, do not close this screen</Text>
        </View>
      );
    }

    if (paymentStatus === 'success') {
      return (
        <View style={styles.paymentStatusContainer}>
          <View style={styles.successIconContainer}>
            <CheckCircle size={64} color={colors.success} fill={colors.success} />
          </View>
          <Text style={styles.paymentSuccessText}>Payment Successful! 🎉</Text>
          <Text style={styles.paymentSuccessSubtext}>Your subscription is now active</Text>
        </View>
      );
    }

    return null;
  };

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent
      onRequestClose={() => onClose()}
    >
      <View style={sharedStyles.modalOverlay}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={() => onClose()}
        />
        <Animated.View
          style={[
            sharedStyles.modalContainer,
            {
              transform: [
                {
                  translateY: modalAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [SCREEN_HEIGHT, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={sharedStyles.modalHandle} />

          <View style={sharedStyles.modalHeader}>
            <View>
              <Text style={sharedStyles.modalTitle}>Choose Your Plan</Text>
              <Text style={sharedStyles.modalSubtitle}>{getSubtitleText()}</Text>
            </View>
            {canClose && (
              <TouchableOpacity
                style={sharedStyles.modalCloseButton}
                onPress={() => {
                  onClose();
                  setPaymentStatus('idle');
                }}
              >
                <X size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>

          {renderPaymentStatus()}

          <ScrollView
            style={sharedStyles.modalScroll}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
            scrollEnabled={paymentStatus === 'idle' || paymentStatus === 'failed'}
          >
            {(paymentStatus === 'idle' || paymentStatus === 'failed') &&
              SUBSCRIPTION_PLANS.map(renderPlanCard)}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  planCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  planCardPopular: {
    borderColor: colors.warning,
  },
  popularBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warning,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  popularBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  planIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  planHeaderText: {
    flex: 1,
  },
  planName: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  planDuration: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  planPricing: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 20,
  },
  planCurrency: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
  },
  planPrice: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.text,
    marginHorizontal: 4,
  },
  planPeriod: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  planFeatures: {
    marginBottom: 20,
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  featureText: {
    fontSize: 14,
    color: '#4B5563',
    flex: 1,
  },
  selectButton: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  selectButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  selectButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  paymentStatusContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  paymentStatusText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginTop: 16,
    textAlign: 'center',
  },
  paymentStatusSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  successIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.successLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  paymentSuccessText: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    marginTop: 16,
    textAlign: 'center',
  },
  paymentSuccessSubtext: {
    fontSize: 16,
    color: colors.success,
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '600',
  },
});

export default SubscriptionModal;