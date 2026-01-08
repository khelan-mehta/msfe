// screens/JobSetupScreen.tsx - Full job seeker setup flow (KYC → Subscription → Job Profile)

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, Briefcase, Shield, CreditCard, CheckCircle, Clock, XCircle, ChevronRight } from 'lucide-react-native';

// Try to import Expo Router - will be undefined if not using Expo Router
let useRouter: any;
try {
  useRouter = require('expo-router').useRouter;
} catch (e) {
  useRouter = null;
}

import { JobFlowState, UserProfile, JobSeekerProfile } from '../types';
import { useProfile } from '../hooks';
import { getJobSetupStatus } from '../utils';
import { JobSubscriptionModal, JobProfileModal } from './modals';
import { colors, sharedStyles } from './styles/shared';
import { Header } from './Header';

interface Props {
  navigation?: any;
  onComplete?: () => void;
  onBack?: () => void;
}

export const JobSetupScreen: React.FC<Props> = ({ navigation, onComplete, onBack }) => {
  const router = useRouter ? useRouter() : null;

  const {
    loading,
    refreshing,
    userProfile,
    jobSeekerProfile,
    jobFlowState,
    loadUserData,
    handleRefresh,
  } = useProfile();

  // Modal visibility states
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showJobProfileModal, setShowJobProfileModal] = useState(false);
  const [isEditingJobProfile, setIsEditingJobProfile] = useState(false);

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
    }
  };

  // Animate modals
  useEffect(() => {
    if (showSubscriptionModal || showJobProfileModal) {
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
  }, [showSubscriptionModal, showJobProfileModal]);

  // Auto-show appropriate modals based on flow state
  useEffect(() => {
    if (loading) return;

    setShowSubscriptionModal(false);
    setShowJobProfileModal(false);

    const timer = setTimeout(() => {
      switch (jobFlowState) {
        case 'job_subscription_required':
          setShowSubscriptionModal(true);
          break;
        case 'job_profile_required':
          setIsEditingJobProfile(false);
          setShowJobProfileModal(true);
          break;
        default:
          break;
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [jobFlowState, loading]);

  // Handle Subscription success
  const handleSubscriptionSuccess = async () => {
    setShowSubscriptionModal(false);
    await loadUserData();
    setTimeout(() => {
      setIsEditingJobProfile(false);
      setShowJobProfileModal(true);
    }, 500);
  };

  // Handle Job Profile success
  const handleJobProfileSuccess = async () => {
    setShowJobProfileModal(false);
    setIsEditingJobProfile(false);
    await loadUserData();

    if (onComplete) {
      onComplete();
    }
  };

  // Handle edit job profile
  const handleEditJobProfile = () => {
    setIsEditingJobProfile(true);
    setShowJobProfileModal(true);
  };

  // Loading screen
  if (loading && !refreshing) {
    return (
      <View style={sharedStyles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.purple} />
        <Text style={sharedStyles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Get status for display
  const jobStatus = getJobSetupStatus(userProfile);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <Header name="Job Profile Setup" leftIcon={ChevronLeft} onLeftPress={() => navigation?.goBack()} />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Status Banner */}
        <JobStatusBanner
          flowState={jobFlowState}
          userProfile={userProfile}
          onKycPress={navigateToKyc}
          onSubscriptionPress={() => setShowSubscriptionModal(true)}
          onJobProfilePress={() => {
            setIsEditingJobProfile(false);
            setShowJobProfileModal(true);
          }}
        />

        {/* User Info Card */}
        {userProfile && <UserInfoCard userProfile={userProfile} />}

        {/* Job Seeker Profile Card */}
        {jobSeekerProfile && (
          <JobSeekerProfileCard profile={jobSeekerProfile} onEdit={handleEditJobProfile} />
        )}

        {/* Progress Steps */}
        <View style={styles.progressSection}>
          <Text style={styles.progressTitle}>Setup Progress</Text>
          <View style={styles.progressCard}>
            {renderProgressStep(1, 'KYC Verification', getKycStepStatus(jobFlowState), navigateToKyc)}
            {renderProgressStep(
              2,
              'Choose Subscription',
              getSubscriptionStepStatus(jobFlowState, userProfile),
              () => setShowSubscriptionModal(true)
            )}
            {renderProgressStep(3, 'Create Job Profile', getJobStepStatus(jobFlowState), () => {
              setIsEditingJobProfile(false);
              setShowJobProfileModal(true);
            })}
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Job Subscription Modal */}
      <JobSubscriptionModal
        visible={showSubscriptionModal}
        flowState={jobFlowState}
        userProfile={userProfile}
        fullName={userProfile?.name || ''}
        modalAnim={modalAnim}
        onClose={() => setShowSubscriptionModal(false)}
        onSuccess={handleSubscriptionSuccess}
      />

      {/* Job Profile Modal */}
      <JobProfileModal
        visible={showJobProfileModal}
        flowState={jobFlowState}
        isEditing={isEditingJobProfile}
        existingProfile={jobSeekerProfile}
        modalAnim={modalAnim}
        onClose={() => {
          setShowJobProfileModal(false);
          setIsEditingJobProfile(false);
        }}
        onSuccess={handleJobProfileSuccess}
      />
    </View>
  );
};

// Status Banner Component
interface JobStatusBannerProps {
  flowState: JobFlowState;
  userProfile: UserProfile | null;
  onKycPress: () => void;
  onSubscriptionPress: () => void;
  onJobProfilePress: () => void;
}

const JobStatusBanner: React.FC<JobStatusBannerProps> = ({
  flowState,
  userProfile,
  onKycPress,
  onSubscriptionPress,
  onJobProfilePress,
}) => {
  const getBannerConfig = () => {
    switch (flowState) {
      case 'kyc_required':
        return {
          colors: ['#EF4444', '#DC2626'] as [string, string],
          icon: <Shield size={28} color="#FFFFFF" />,
          title: 'KYC Required',
          subtitle: 'Complete verification to start applying for jobs',
          actionText: 'Start KYC',
          onAction: onKycPress,
        };
      case 'kyc_under_review':
        return {
          colors: ['#F59E0B', '#D97706'] as [string, string],
          icon: <Clock size={28} color="#FFFFFF" />,
          title: 'KYC Under Review',
          subtitle: 'Your documents are being verified',
          actionText: userProfile?.job_seeker_subscription_id ? undefined : 'Get Subscription',
          onAction: userProfile?.job_seeker_subscription_id ? undefined : onSubscriptionPress,
        };
      case 'kyc_rejected':
        return {
          colors: ['#EF4444', '#DC2626'] as [string, string],
          icon: <XCircle size={28} color="#FFFFFF" />,
          title: 'KYC Rejected',
          subtitle: 'Please resubmit your documents',
          actionText: 'Resubmit KYC',
          onAction: onKycPress,
        };
      case 'job_subscription_required':
        return {
          colors: ['#8B5CF6', '#7C3AED'] as [string, string],
          icon: <CreditCard size={28} color="#FFFFFF" />,
          title: 'Choose a Plan',
          subtitle: 'Subscribe to create your job profile',
          actionText: 'View Plans',
          onAction: onSubscriptionPress,
        };
      case 'job_profile_required':
        return {
          colors: ['#10B981', '#059669'] as [string, string],
          icon: <Briefcase size={28} color="#FFFFFF" />,
          title: 'Create Job Profile',
          subtitle: 'Set up your profile to start applying for jobs',
          actionText: 'Create Profile',
          onAction: onJobProfilePress,
        };
      case 'job_profile_pending':
        return {
          colors: ['#F59E0B', '#D97706'] as [string, string],
          icon: <Clock size={28} color="#FFFFFF" />,
          title: 'Profile Under Review',
          subtitle: 'Your job profile is being verified',
          actionText: undefined,
          onAction: undefined,
        };
      case 'job_profile_verified':
        return {
          colors: ['#10B981', '#059669'] as [string, string],
          icon: <CheckCircle size={28} color="#FFFFFF" />,
          title: 'Profile Verified',
          subtitle: 'You can now apply for jobs',
          actionText: undefined,
          onAction: undefined,
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
          <View style={styles.statusBannerIconContainer}>{bannerConfig.icon}</View>
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

// User Info Card Component
const UserInfoCard: React.FC<{ userProfile: UserProfile }> = ({ userProfile }) => (
  <View style={styles.userCard}>
    <View style={styles.userCardRow}>
      <Text style={styles.userCardLabel}>Name</Text>
      <Text style={styles.userCardValue}>{userProfile.name || 'Not set'}</Text>
    </View>
    <View style={styles.userCardRow}>
      <Text style={styles.userCardLabel}>Mobile</Text>
      <Text style={styles.userCardValue}>{userProfile.mobile}</Text>
    </View>
    {userProfile.email && (
      <View style={styles.userCardRow}>
        <Text style={styles.userCardLabel}>Email</Text>
        <Text style={styles.userCardValue}>{userProfile.email}</Text>
      </View>
    )}
    <View style={styles.userCardRow}>
      <Text style={styles.userCardLabel}>KYC Status</Text>
      <Text style={[styles.userCardValue, { textTransform: 'capitalize' }]}>
        {userProfile.kyc_status || 'Pending'}
      </Text>
    </View>
  </View>
);

// Job Seeker Profile Card Component
const JobSeekerProfileCard: React.FC<{ profile: JobSeekerProfile; onEdit: () => void }> = ({
  profile,
  onEdit,
}) => (
  <View style={styles.profileCard}>
    <View style={styles.profileCardHeader}>
      <View style={styles.profileIconContainer}>
        <Briefcase size={24} color={colors.purple} />
      </View>
      <View style={styles.profileCardHeaderText}>
        <Text style={styles.profileCardTitle}>{profile.full_name}</Text>
        {profile.headline && <Text style={styles.profileCardSubtitle}>{profile.headline}</Text>}
      </View>
      <TouchableOpacity style={styles.editButton} onPress={onEdit}>
        <Text style={styles.editButtonText}>Edit</Text>
      </TouchableOpacity>
    </View>
    <View style={styles.profileCardDetails}>
      {profile.skills.length > 0 && (
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Skills:</Text>
          <Text style={styles.detailValue}>{profile.skills.slice(0, 3).join(', ')}{profile.skills.length > 3 ? '...' : ''}</Text>
        </View>
      )}
      {profile.preferred_locations?.length > 0 && (
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Locations:</Text>
          <Text style={styles.detailValue}>{profile.preferred_locations.join(', ')}</Text>
        </View>
      )}
      <View style={styles.statusRow}>
        <View style={[styles.statusBadge, { backgroundColor: profile.is_verified ? colors.successLight : colors.warningLight }]}>
          <Text style={[styles.statusBadgeText, { color: profile.is_verified ? colors.success : colors.warning }]}>
            {profile.is_verified ? 'Verified' : 'Pending Verification'}
          </Text>
        </View>
      </View>
    </View>
  </View>
);

// Helper functions for progress steps
const getKycStepStatus = (flowState: JobFlowState): 'pending' | 'active' | 'completed' => {
  if (['kyc_required', 'kyc_rejected'].includes(flowState)) return 'active';
  if (flowState === 'kyc_under_review') return 'pending';
  return 'completed';
};

const getSubscriptionStepStatus = (
  flowState: JobFlowState,
  userProfile: UserProfile | null
): 'pending' | 'active' | 'completed' => {
  if (['kyc_required', 'kyc_rejected'].includes(flowState)) return 'pending';
  if (flowState === 'job_subscription_required') return 'active';
  if (flowState === 'kyc_under_review' && !userProfile?.job_seeker_subscription_id) return 'active';
  return 'completed';
};

const getJobStepStatus = (flowState: JobFlowState): 'pending' | 'active' | 'completed' => {
  if (['kyc_required', 'kyc_rejected', 'kyc_under_review', 'job_subscription_required'].includes(flowState)) return 'pending';
  if (flowState === 'job_profile_required') return 'active';
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
        return colors.purple;
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
          {status === 'completed' ? 'Completed' : status === 'active' ? 'In Progress' : 'Pending'}
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 24,
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  // Status Banner
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
  // User Card
  userCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  userCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  userCardLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  userCardValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  // Profile Card
  profileCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  profileCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  profileCardHeaderText: {
    flex: 1,
  },
  profileCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  profileCardSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F3E8FF',
    borderRadius: 8,
  },
  editButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.purple,
  },
  profileCardDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
  },
  detailLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    width: 80,
  },
  detailValue: {
    fontSize: 13,
    color: colors.text,
    flex: 1,
  },
  statusRow: {
    marginTop: 8,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  // Progress Section
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

export default JobSetupScreen;
