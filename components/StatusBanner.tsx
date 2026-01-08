// components/StatusBanner.tsx - Status banner for worker setup flow

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Shield,
  Clock,
  XCircle,
  CreditCard,
  Wrench,
  CheckCircle,
  ChevronRight,
} from 'lucide-react-native';
import { FlowState, UserProfile } from '../types';

interface StatusBannerProps {
  flowState: FlowState;
  userProfile: UserProfile | null;
  onKycPress: () => void;
  onSubscriptionPress: () => void;
  onWorkerProfilePress: () => void;
}

interface BannerConfig {
  colors: [string, string];
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  actionText?: string;
  onAction?: () => void;
}

export const StatusBanner: React.FC<StatusBannerProps> = ({
  flowState,
  userProfile,
  onKycPress,
  onSubscriptionPress,
  onWorkerProfilePress,
}) => {
  const getBannerConfig = (): BannerConfig | null => {
    switch (flowState) {
      case 'kyc_required':
        return {
          colors: ['#EF4444', '#DC2626'],
          icon: <Shield size={28} color="#FFFFFF" />,
          title: 'KYC Required',
          subtitle: 'Complete verification to start earning',
          actionText: 'Start KYC',
          onAction: onKycPress,
        };

      case 'kyc_under_review':
        return {
          colors: ['#F59E0B', '#D97706'],
          icon: <Clock size={28} color="#FFFFFF" />,
          title: 'KYC Under Review',
          subtitle: 'Your documents are being verified',
          actionText: userProfile?.subscription_id ? undefined : 'Get Subscription',
          onAction: userProfile?.subscription_id ? undefined : onSubscriptionPress,
        };

      case 'kyc_rejected':
        return {
          colors: ['#EF4444', '#DC2626'],
          icon: <XCircle size={28} color="#FFFFFF" />,
          title: 'KYC Rejected',
          subtitle: 'Please resubmit your documents',
          actionText: 'Resubmit KYC',
          onAction: onKycPress,
        };

      case 'subscription_required':
        return {
          colors: ['#8B5CF6', '#7C3AED'],
          icon: <CreditCard size={28} color="#FFFFFF" />,
          title: 'Choose a Plan',
          subtitle: 'Subscribe to create your worker profile',
          actionText: 'View Plans',
          onAction: onSubscriptionPress,
        };

      case 'worker_profile_required':
        return {
          colors: ['#10B981', '#059669'],
          icon: <Wrench size={28} color="#FFFFFF" />,
          title: 'Create Worker Profile',
          subtitle: 'Set up your profile to start getting jobs',
          actionText: 'Create Profile',
          onAction: onWorkerProfilePress,
        };

      case 'worker_pending':
        return {
          colors: ['#F59E0B', '#D97706'],
          icon: <Clock size={28} color="#FFFFFF" />,
          title: 'Profile Under Review',
          subtitle: 'Your worker profile is being verified',
        };

      case 'worker_verified':
        return {
          colors: ['#10B981', '#059669'],
          icon: <CheckCircle size={28} color="#FFFFFF" />,
          title: 'Profile Verified',
          subtitle: 'You can now receive job requests',
        };

      default:
        return null;
    }
  };

  const bannerConfig = getBannerConfig();

  if (!bannerConfig) return null;

  return (
    <TouchableOpacity
      style={styles.statusBanner}
      onPress={bannerConfig.onAction}
      disabled={!bannerConfig.onAction}
      activeOpacity={bannerConfig.onAction ? 0.8 : 1}
    >
      <LinearGradient
        colors={bannerConfig.colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.statusBannerGradient}
      >
        <View style={styles.statusBannerContent}>
          <View style={styles.statusBannerIconContainer}>
            {bannerConfig.icon}
          </View>
          <View style={styles.statusBannerText}>
            <Text style={styles.statusBannerTitle}>{bannerConfig.title}</Text>
            <Text style={styles.statusBannerSubtitle}>{bannerConfig.subtitle}</Text>
          </View>
          {bannerConfig.actionText && (
            <View style={styles.statusBannerAction}>
              <Text style={styles.statusBannerActionText}>{bannerConfig.actionText}</Text>
              <ChevronRight size={16} color="#FFFFFF" />
            </View>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  statusBanner: {
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  statusBannerGradient: {
    padding: 20,
  },
  statusBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBannerIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  statusBannerText: {
    flex: 1,
  },
  statusBannerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statusBannerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  statusBannerAction: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  statusBannerActionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default StatusBanner;