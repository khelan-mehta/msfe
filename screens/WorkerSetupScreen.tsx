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
import { ArrowLeft, RefreshCw } from 'lucide-react-native';

import { WorkerSetupScreenProps, FlowState } from '../types';
import { useProfile } from '../hooks';
import {
  StatusBanner,
  UserInfoCard,
  WorkerProfileCard,
  KycModal,
  SubscriptionModal,
  WorkerProfileModal,
  colors,
  sharedStyles,
} from '../components';

export const WorkerSetupScreen: React.FC<WorkerSetupScreenProps> = ({
  navigation,
  onComplete,
}) => {
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
  const [showKycModal, setShowKycModal] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showWorkerProfileModal, setShowWorkerProfileModal] = useState(false);
  const [isEditingWorkerProfile, setIsEditingWorkerProfile] = useState(false);

  // Form data for passing to subscription modal
  const [kycFullName, setKycFullName] = useState('');

  const modalAnim = useRef(new Animated.Value(0)).current;

  // Animate modals
  useEffect(() => {
    if (showKycModal || showSubscriptionModal || showWorkerProfileModal) {
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
  }, [showKycModal, showSubscriptionModal, showWorkerProfileModal]);

  // Auto-show appropriate modals based on flow state
  useEffect(() => {
    if (loading) return;

    // Reset all modals first
    setShowKycModal(false);
    setShowSubscriptionModal(false);
    setShowWorkerProfileModal(false);

    // Show appropriate modal after a brief delay
    const timer = setTimeout(() => {
      switch (flowState) {
        case 'kyc_required':
        case 'kyc_rejected':
          setShowKycModal(true);
          break;
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

  // Handle KYC success
  const handleKycSuccess = async () => {
    setShowKycModal(false);
    await loadUserData();
    setTimeout(() => {
      setShowSubscriptionModal(true);
    }, 500);
  };

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
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={sharedStyles.header}>
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={sharedStyles.headerContent}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <ArrowLeft size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <View>
              <Text style={sharedStyles.headerTitle}>Worker Setup</Text>
              <Text style={sharedStyles.headerSubtitle}>
                Complete your worker profile
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={sharedStyles.headerButton}
            onPress={handleRefresh}
            disabled={refreshing}
          >
            {refreshing ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <RefreshCw size={24} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Status Banner */}
        <StatusBanner
          flowState={flowState}
          userProfile={userProfile}
          onKycPress={() => setShowKycModal(true)}
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
          <WorkerProfileCard
            workerProfile={workerProfile}
            onEdit={handleEditWorkerProfile}
          />
        )}

        {/* Progress Steps */}
        <View style={styles.progressSection}>
          <Text style={styles.progressTitle}>Setup Progress</Text>
          <View style={styles.progressCard}>
            {renderProgressStep(
              1,
              'KYC Verification',
              getKycStepStatus(flowState),
              () => setShowKycModal(true)
            )}
            {renderProgressStep(
              2,
              'Choose Subscription',
              getSubscriptionStepStatus(flowState, userProfile),
              () => setShowSubscriptionModal(true)
            )}
            {renderProgressStep(
              3,
              'Create Worker Profile',
              getWorkerStepStatus(flowState),
              () => {
                setIsEditingWorkerProfile(false);
                setShowWorkerProfileModal(true);
              }
            )}
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* KYC Modal */}
      <KycModal
        visible={showKycModal}
        flowState={flowState}
        modalAnim={modalAnim}
        onClose={() => setShowKycModal(false)}
        onSuccess={handleKycSuccess}
      />

      {/* Subscription Modal */}
      <SubscriptionModal
        visible={showSubscriptionModal}
        flowState={flowState}
        userProfile={userProfile}
        fullName={kycFullName || userProfile?.name || ''}
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
      disabled={status === 'pending'}
    >
      <View
        style={[
          styles.progressStepNumber,
          { backgroundColor: getStatusColor() + '20', borderColor: getStatusColor() },
        ]}
      >
        <Text style={[styles.progressStepNumberText, { color: getStatusColor() }]}>
          {status === 'completed' ? '✓' : step}
        </Text>
      </View>
      <View style={styles.progressStepContent}>
        <Text
          style={[
            styles.progressStepTitle,
            { color: status === 'pending' ? colors.textLight : colors.text },
          ]}
        >
          {title}
        </Text>
        <Text style={styles.progressStepStatus}>
          {status === 'completed'
            ? 'Completed'
            : status === 'active'
            ? 'In Progress'
            : 'Pending'}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
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