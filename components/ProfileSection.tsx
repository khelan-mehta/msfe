// screens/ProfileScreen.tsx - Main profile page with settings and worker profile link

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
  StatusBar,
  Platform,
  ActivityIndicator,
  Linking,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Bell,
  Moon,
  RefreshCw,
  LogOut,
  User,
  Phone,
  ChevronRight,
  Wrench,
  Briefcase,
  Shield,
  Settings,
  HelpCircle,
  FileText,
  Lock,
  Trash2,
} from 'lucide-react-native';
// Try to import Expo Router - will be undefined if not using Expo Router
let useRouter: any;
try {
  useRouter = require('expo-router').useRouter;
} catch (e) {
  useRouter = null;
}

import { ProfileScreenProps } from '../types';
import { useProfile } from '../hooks';
import { getWorkerSetupStatus, getJobSetupStatus } from '../utils';
import { colors, sharedStyles } from '../components';
import { Header } from './Header';
import { EditProfileModal, PostJobModal } from './modals';
import { Animated } from 'react-native';
import { API_BASE_URL } from '../constants';

// Build absolute URL for uploaded assets (backend returns paths like "/uploads/...")
const getAssetUrl = (path?: string | null) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  // API_BASE_URL is e.g. http://host:8000/api/v1 -> strip /api/v1
  try {
    return API_BASE_URL.replace(/\/api\/v1\/?$/, '') + path;
  } catch (e) {
    return path;
  }
};

interface Props {
  navigation?: any; // Optional - for React Navigation
  onLogout: () => void;
  onWorkerSetupPress?: () => void; // Optional callback for custom navigation
  onJobSetupPress?: () => void; // Optional callback for job setup navigation
}

export const ProfileScreen: React.FC<Props> = ({ navigation, onLogout, onWorkerSetupPress, onJobSetupPress }) => {
  // Use Expo Router if available
  const router = useRouter ? useRouter() : null;
  const { loading, refreshing, userProfile, workerProfile, jobSeekerProfile, flowState, jobFlowState, handleRefresh } =
    useProfile(onLogout);

  // Settings states
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  // Edit profile modal state + modal animation
  const [showEditModal, setShowEditModal] = useState(false);
  const modalAnim = React.useRef(new Animated.Value(0)).current;

  // Post job modal state + animation
  const [showPostJobModal, setShowPostJobModal] = useState(false);
  const postModalAnim = React.useRef(new Animated.Value(0)).current;

  // open official website
  const openWebsite = () => {
    Linking.openURL('https://mentoservices.com/');
  };

  // Animate edit modal in/out
  React.useEffect(() => {
    if (showEditModal) {
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
  }, [showEditModal, modalAnim]);

  React.useEffect(() => {
    if (showPostJobModal) {
      Animated.spring(postModalAnim, {
        toValue: 1,
        tension: 65,
        friction: 10,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(postModalAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [showPostJobModal, postModalAnim]);

  // Handle navigation to worker setup
  const handleWorkerSetupPress = () => {
    if (onWorkerSetupPress) {
      // Use custom callback if provided
      onWorkerSetupPress();
    } else if (router) {
      // Use Expo Router
      router.push('/worker-setup');
    } else if (navigation) {
      // Use React Navigation
      navigation.navigate('WorkerSetup');
    } else {
      console.warn(
        'No navigation method available. Please provide navigation prop, use Expo Router, or pass onWorkerSetupPress callback.'
      );
    }
  };

  // Handle navigation to KYC screen
  const handleKycPress = () => {
    if (router) {
      router.push('/kyc');
    } else if (navigation) {
      navigation.navigate('KycScreen');
    } else {
      console.warn('No navigation method available for KYC screen.');
    }
  };

  // Handle navigation to job setup
  const handleJobSetupPress = () => {
    if (onJobSetupPress) {
      // Use custom callback if provided
      onJobSetupPress();
    } else if (router) {
      // Use Expo Router
      router.push('/job-setup');
    } else if (navigation) {
      // Use React Navigation
      navigation.navigate('JobSetup');
    } else {
      console.warn(
        'No navigation method available. Please provide navigation prop, use Expo Router, or pass onJobSetupPress callback.'
      );
    }
  };

  // Get worker setup status for display
  const workerStatus = getWorkerSetupStatus(userProfile);

  // Get job setup status for display
  const jobStatus = getJobSetupStatus(userProfile);

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
      <Header name="Profile" rightIcon={Settings} />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* User Info Card */}
        {userProfile && (
          <View style={styles.userCard}>
            <View style={styles.userCardHeader}>
              <View style={styles.userAvatar}>
                {userProfile?.profile_photo ? (
                  <Image source={{ uri: getAssetUrl(userProfile.profile_photo) }} style={styles.userAvatarImage} />
                ) : (
                  <User size={36} color={colors.primary} />
                )}
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{userProfile.name || 'User'}</Text>
                <View style={styles.userPhoneRow}>
                  <Phone size={14} color={colors.textSecondary} />
                  <Text style={styles.userPhone}>{userProfile.mobile}</Text>
                </View>
                {userProfile.email && <Text style={styles.userEmail}>{userProfile.email}</Text>}
              </View>
              <TouchableOpacity style={styles.editButton} onPress={() => setShowEditModal(true)}>
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Worker Profile Section - Main CTA */}
        <TouchableOpacity
          style={styles.workerProfileCard}
          onPress={handleWorkerSetupPress}
          activeOpacity={0.8}>
          <LinearGradient
            colors={
              workerStatus.isComplete
                ? [colors.success, '#059669']
                : [colors.primary, colors.primaryDark]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.workerProfileGradient}>
            <View style={styles.workerProfileContent}>
              <View style={styles.workerProfileIcon}>
                <Wrench size={28} color="#FFFFFF" />
              </View>
              <View style={styles.workerProfileText}>
                <Text style={styles.workerProfileTitle}>Worker Profile</Text>
                <Text style={styles.workerProfileSubtitle}>{workerStatus.description}</Text>
              </View>
              <View style={styles.workerProfileBadge}>
                <Text style={styles.workerProfileBadgeText}>{workerStatus.label}</Text>
                <ChevronRight size={18} color="#FFFFFF" />
              </View>
            </View>

            {/* Progress indicator for incomplete setup */}
          </LinearGradient>
        </TouchableOpacity>

        {/* Job Profile Section - Main CTA */}
        <TouchableOpacity
          style={styles.workerProfileCard}
          onPress={handleJobSetupPress}
          activeOpacity={0.8}>
          <LinearGradient
            colors={
              jobStatus.isComplete
                ? [colors.success, '#059669']
                : [colors.purple, colors.purpleDark]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.workerProfileGradient}>
            <View style={styles.workerProfileContent}>
              <View style={styles.workerProfileIcon}>
                <Briefcase size={28} color="#FFFFFF" />
              </View>
              <View style={styles.workerProfileText}>
                <Text style={styles.workerProfileTitle}>Job Profile</Text>
                <Text style={styles.workerProfileSubtitle}>{jobStatus.description}</Text>
              </View>
              <View style={styles.workerProfileBadge}>
                <Text style={styles.workerProfileBadgeText}>{jobStatus.label}</Text>
                <ChevronRight size={18} color="#FFFFFF" />
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.sectionCard}>
<TouchableOpacity style={styles.menuItem} onPress={() => setShowEditModal(true)}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, { backgroundColor: '#EEF2FF' }]}>
                  <User size={20} color={colors.primary} />
                </View>
                <Text style={styles.menuItemText}>Personal Information</Text>
              </View>
              <ChevronRight size={20} color={colors.textLight} />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.menuItem, styles.menuItemBorder]} onPress={handleKycPress}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, { backgroundColor: '#FEF3C7' }]}>
                  <Shield size={20} color={colors.warning} />
                </View>
                <Text style={styles.menuItemText}>KYC Verification</Text>
              </View>
              <View style={styles.kycStatusRow}>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusBadgeText}>
                    {userProfile?.kyc_status?.toUpperCase() || 'PENDING'}
                  </Text>
                </View>
                <ChevronRight size={20} color={colors.textLight} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.menuItem, styles.menuItemBorder]} onPress={() => setShowPostJobModal(true)}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, { backgroundColor: '#D1FAE5' }]}> 
                  <Briefcase size={20} color={colors.success} />
                </View>
                <Text style={styles.menuItemText}>Post a Job</Text>
              </View>
              <ChevronRight size={20} color={colors.textLight} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Edit Profile Modal */}
        <EditProfileModal
          visible={showEditModal}
          userProfile={userProfile}
          modalAnim={modalAnim}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => handleRefresh()}
        />

        {/* Post Job Modal */}
        <PostJobModal
          visible={showPostJobModal}
          modalAnim={postModalAnim}
          onClose={() => setShowPostJobModal(false)}
          onSuccess={(jobId) => {
            if (jobId) {
              console.log('Job posted:', jobId);
            }
            handleRefresh();
          }}
        />

{/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>

          <View style={styles.sectionCard}>
            {/* Help Center */}
            <TouchableOpacity style={styles.menuItem} onPress={openWebsite}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, { backgroundColor: '#DBEAFE' }]}> 
                  <HelpCircle size={20} color="#3B82F6" />
                </View>
                <Text style={styles.menuItemText}>Help Center</Text>
              </View>
              <ChevronRight size={20} color={colors.textLight} />
            </TouchableOpacity>

            {/* Terms & Conditions */}
            <TouchableOpacity
              style={[styles.menuItem, styles.menuItemBorder]}
              onPress={openWebsite}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, { backgroundColor: '#F3E8FF' }]}>
                  <FileText size={20} color="#9333EA" />
                </View>
                <Text style={styles.menuItemText}>Terms & Conditions</Text>
              </View>
              <ChevronRight size={20} color={colors.textLight} />
            </TouchableOpacity>

            {/* Delete Account */}
            <TouchableOpacity
              style={[styles.menuItem, styles.menuItemBorder]}
              onPress={openWebsite}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, { backgroundColor: '#FEE2E2' }]}>
                  <Trash2 size={20} color="#DC2626" />
                </View>
                <Text style={styles.menuItemText}>Delete Account</Text>
              </View>
              <ChevronRight size={20} color={colors.textLight} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity onPress={onLogout} style={styles.logoutButton} activeOpacity={0.8}>
          <LogOut color={colors.error} size={22} />
          <Text style={styles.logoutButtonText}>Sign Out</Text>
        </TouchableOpacity>

        {/* App Version */}
        <Text style={styles.appVersion}>Version 1.0.0</Text>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

// Helper to calculate progress percentage
const getProgressPercentage = (flowState: string): string => {
  switch (flowState) {
    case 'kyc_required':
    case 'kyc_rejected':
      return '10%';
    case 'kyc_under_review':
      return '33%';
    case 'subscription_required':
      return '50%';
    case 'worker_profile_required':
      return '75%';
    case 'worker_pending':
      return '90%';
    case 'worker_verified':
      return '100%';
    default:
      return '0%';
  }
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

  // User Card
  userCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  userCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatarImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    resizeMode: 'cover',
  },
  userAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  userPhoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  userEmail: {
    fontSize: 13,
    color: colors.textLight,
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },

  // Worker Profile Card
  workerProfileCard: {
    borderRadius: 20,
    marginBottom: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  workerProfileGradient: {
    padding: 20,
  },
  workerProfileContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  workerProfileIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  workerProfileText: {
    flex: 1,
  },
  workerProfileTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  workerProfileSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
  },
  workerProfileBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 4,
  },
  workerProfileBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    marginTop: 16,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },

  // Section
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
    marginLeft: 4,
  },
  sectionCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    overflow: 'hidden',
  },

  // Menu Item
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  menuItemBorder: {
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  statusBadge: {
    backgroundColor: colors.warningLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.warningDark,
  },
  kycStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  // Logout
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderWidth: 1.5,
    borderColor: colors.error,
    gap: 10,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  logoutButtonText: {
    fontSize: 16,
    color: colors.error,
    fontWeight: '700',
  },

  // App Version
  appVersion: {
    textAlign: 'center',
    fontSize: 13,
    color: colors.textLight,
    marginTop: 24,
  },
});

export default ProfileScreen;
