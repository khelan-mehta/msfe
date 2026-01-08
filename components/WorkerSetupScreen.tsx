// screens/WorkerSetupScreen.tsx - Full worker setup flow (KYC → Subscription → Worker Profile)

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, ChevronLeft, RefreshCw, Settings } from 'lucide-react-native';

// Try to import Expo Router - will be undefined if not using Expo Router
let useRouter: any;
try {
  useRouter = require('expo-router').useRouter;
} catch (e) {
  useRouter = null;
}

import { WorkerSetupScreenProps, FlowState } from '../types';
import { useProfile } from '../hooks';
import {
  StatusBanner,
  UserInfoCard,
  WorkerProfileCard,
  SubscriptionModal,
  WorkerProfileModal,
  colors,
  sharedStyles,
} from '../components';
import { Header } from './Header';

interface Props {
  navigation?: any; // Optional - for React Navigation
  onComplete?: () => void;
  onBack?: () => void; // Optional callback for custom back navigation
}

export const WorkerSetupScreen: React.FC<Props> = ({ navigation, onComplete, onBack }) => {
  // Use Expo Router if available
  const router = useRouter ? useRouter() : null;

  const {
    loading,
    refreshing,
    userProfile,
    workerProfile,
    flowState,
    loadUserData,
    handleRefresh,
  } = useProfile();

  // Modal visibility states
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showWorkerProfileModal, setShowWorkerProfileModal] = useState(false);
  const [isEditingWorkerProfile, setIsEditingWorkerProfile] = useState(false);

  const modalAnim = useRef(new Animated.Value(0)).current;

  // Navigate to KYC screen
  const navigateToKyc = () => {
    if (router) {
      router.push('/kyc');
    } else if (navigation) {
      navigation.navigate('KycScreen');
    }
  };

  // Handle back navigation
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (router) {
      router.back();
    } else if (navigation && navigation.goBack) {
      navigation.goBack();
    } else {
      console.warn('No back navigation method available.');
    }
  };

  // Animate modals
  useEffect(() => {
    if (showSubscriptionModal || showWorkerProfileModal) {
      Animated.spring(modalAnim, {
        toValue: 1,
        tension: 65,
        friction: 10,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(modalAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [showSubscriptionModal, showWorkerProfileModal]);

  // Auto-show appropriate modals based on flow state
  useEffect(() => {
    if (loading) return;

    // Reset all modals first
    setShowSubscriptionModal(false);
    setShowWorkerProfileModal(false);

    // Show appropriate modal after a brief delay (KYC is now on a separate screen)
    const timer = setTimeout(() => {
      switch (flowState) {
        case 'subscription_required':
          setShowSubscriptionModal(true);
          break;
        case 'worker_profile_required':
          setIsEditingWorkerProfile(false);
          setShowWorkerProfileModal(true);
          break;
        default:
          break;
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [flowState, loading]);

  // Handle Subscription success
  const handleSubscriptionSuccess = async () => {
    setShowSubscriptionModal(false);
    await loadUserData();
    setTimeout(() => {
      setIsEditingWorkerProfile(false);
      setShowWorkerProfileModal(true);
    }, 500);
  };

  // Handle Worker Profile success
  const handleWorkerProfileSuccess = async () => {
    setShowWorkerProfileModal(false);
    setIsEditingWorkerProfile(false);
    await loadUserData();

    if (onComplete) {
      onComplete();
    }
  };

  // Handle edit worker profile
  const handleEditWorkerProfile = () => {
    setIsEditingWorkerProfile(true);
    setShowWorkerProfileModal(true);
  };

  // Loading screen
  if (loading && !refreshing) {
    return (
      <View style={sharedStyles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={sharedStyles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}

      <Header name="Worker Setup" leftIcon={ChevronLeft} onLeftPress={() => navigation.goBack()} />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Status Banner */}
        <StatusBanner
          flowState={flowState}
          userProfile={userProfile}
          onKycPress={navigateToKyc}
          onSubscriptionPress={() => setShowSubscriptionModal(true)}
          onWorkerProfilePress={() => {
            setIsEditingWorkerProfile(false);
            setShowWorkerProfileModal(true);
          }}
        />

        {/* User Info Card */}
        {userProfile && <UserInfoCard userProfile={userProfile} />}

        {/* Worker Profile Card */}
        {workerProfile && (
          <WorkerProfileCard workerProfile={workerProfile} onEdit={handleEditWorkerProfile} />
        )}

        {/* Progress Steps */}
        <View style={styles.progressSection}>
          <Text style={styles.progressTitle}>Setup Progress</Text>
          <View style={styles.progressCard}>
            {renderProgressStep(1, 'KYC Verification', getKycStepStatus(flowState), navigateToKyc)}
            {renderProgressStep(
              2,
              'Choose Subscription',
              getSubscriptionStepStatus(flowState, userProfile),
              () => setShowSubscriptionModal(true)
            )}
            {renderProgressStep(3, 'Create Worker Profile', getWorkerStepStatus(flowState), () => {
              setIsEditingWorkerProfile(false);
              setShowWorkerProfileModal(true);
            })}
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Subscription Modal */}
      <SubscriptionModal
        visible={showSubscriptionModal}
        flowState={flowState}
        userProfile={userProfile}
        fullName={userProfile?.name || ''}
        modalAnim={modalAnim}
        onClose={() => setShowSubscriptionModal(false)}
        onSuccess={handleSubscriptionSuccess}
      />

      {/* Worker Profile Modal */}
      <WorkerProfileModal
        visible={showWorkerProfileModal}
        flowState={flowState}
        isEditing={isEditingWorkerProfile}
        existingProfile={workerProfile}
        modalAnim={modalAnim}
        onClose={() => {
          setShowWorkerProfileModal(false);
          setIsEditingWorkerProfile(false);
        }}
        onSuccess={handleWorkerProfileSuccess}
      />
    </View>
  );
};

// Helper functions for progress steps
const getKycStepStatus = (flowState: FlowState): 'pending' | 'active' | 'completed' => {
  if (['kyc_required', 'kyc_rejected'].includes(flowState)) return 'active';
  if (flowState === 'kyc_under_review') return 'pending';
  return 'completed';
};

const getSubscriptionStepStatus = (
  flowState: FlowState,
  userProfile: any
): 'pending' | 'active' | 'completed' => {
  if (['kyc_required', 'kyc_rejected'].includes(flowState)) return 'pending';
  if (flowState === 'subscription_required') return 'active';
  if (flowState === 'kyc_under_review' && !userProfile?.subscription_id) return 'active';
  return 'completed';
};

const getWorkerStepStatus = (flowState: FlowState): 'pending' | 'active' | 'completed' => {
  if (
    ['kyc_required', 'kyc_rejected', 'kyc_under_review', 'subscription_required'].includes(
      flowState
    )
  )
    return 'pending';
  if (flowState === 'worker_profile_required') return 'active';
  return 'completed';
};

// Progress step renderer
const renderProgressStep = (
  step: number,
  title: string,
  status: 'pending' | 'active' | 'completed',
  onPress: () => void
) => {
  const getStatusColor = () => {
    switch (status) {
      case 'completed':
        return colors.success;
      case 'active':
        return colors.primary;
      default:
        return colors.textLight;
    }
  };

  return (
    <TouchableOpacity
      key={step}
      style={styles.progressStep}
      onPress={onPress}
      disabled={status === 'pending'}>
      <View
        style={[
          styles.progressStepNumber,
          { backgroundColor: getStatusColor() + '20', borderColor: getStatusColor() },
        ]}>
        <Text style={[styles.progressStepNumberText, { color: getStatusColor() }]}>
          {status === 'completed' ? '✓' : step}
        </Text>
      </View>
      <View style={styles.progressStepContent}>
        <Text
          style={[
            styles.progressStepTitle,
            { color: status === 'pending' ? colors.textLight : colors.text },
          ]}>
          {title}
        </Text>
        <Text style={styles.progressStepStatus}>
          {status === 'completed' ? 'Completed' : status === 'active' ? 'In Progress' : 'Pending'}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    paddingHorizontal: 2,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: '#fff',
  },

  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },

  backText: {
    fontSize: 14,
    color: '#6B7280', // subtle gray
  },

  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
  },
  back: {
    flexDirection: 'row',
    alignItems: 'center', // vertical alignment
    gap: 8,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 24,
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  progressSection: {
    marginTop: 8,
  },
  progressTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  progressCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  progressStep: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  progressStepNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  progressStepNumberText: {
    fontSize: 16,
    fontWeight: '700',
  },
  progressStepContent: {
    flex: 1,
  },
  progressStepTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  progressStepStatus: {
    fontSize: 13,
    color: colors.textSecondary,
  },
});

export default WorkerSetupScreen;
