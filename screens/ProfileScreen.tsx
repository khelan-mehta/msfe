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
  Shield,
  Settings,
  HelpCircle,
  FileText,
  Lock,
} from 'lucide-react-native';

import { ProfileScreenProps } from '../types';
import { useProfile } from '../hooks';
import { getWorkerSetupStatus } from '../utils';
import { colors, sharedStyles } from '../components';

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation, onLogout }) => {
  const {
    loading,
    refreshing,
    userProfile,
    workerProfile,
    flowState,
    handleRefresh,
  } = useProfile(onLogout);

  // Settings states
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  // Get worker setup status for display
  const workerStatus = getWorkerSetupStatus(userProfile);

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
          <View>
            <Text style={sharedStyles.headerTitle}>Profile</Text>
            <Text style={sharedStyles.headerSubtitle}>
              {userProfile?.name || 'Manage your account'}
            </Text>
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
        {/* User Info Card */}
        {userProfile && (
          <View style={styles.userCard}>
            <View style={styles.userCardHeader}>
              <View style={styles.userAvatar}>
                <User size={36} color={colors.primary} />
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{userProfile.name || 'User'}</Text>
                <View style={styles.userPhoneRow}>
                  <Phone size={14} color={colors.textSecondary} />
                  <Text style={styles.userPhone}>{userProfile.mobile}</Text>
                </View>
                {userProfile.email && (
                  <Text style={styles.userEmail}>{userProfile.email}</Text>
                )}
              </View>
              <TouchableOpacity style={styles.editButton}>
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Worker Profile Section - Main CTA */}
        <TouchableOpacity
          style={styles.workerProfileCard}
          onPress={() => navigation.navigate('WorkerSetup')}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={
              workerStatus.isComplete
                ? [colors.success, '#059669']
                : [colors.primary, colors.primaryDark]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.workerProfileGradient}
          >
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
            {!workerStatus.isComplete && (
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: getProgressPercentage(flowState) as any,
                    },
                  ]}
                />
              </View>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.sectionCard}>
            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, { backgroundColor: '#EEF2FF' }]}>
                  <User size={20} color={colors.primary} />
                </View>
                <Text style={styles.menuItemText}>Personal Information</Text>
              </View>
              <ChevronRight size={20} color={colors.textLight} />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.menuItem, styles.menuItemBorder]}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, { backgroundColor: '#FEF3C7' }]}>
                  <Shield size={20} color={colors.warning} />
                </View>
                <Text style={styles.menuItemText}>KYC Status</Text>
              </View>
              <View style={styles.statusBadge}>
                <Text style={styles.statusBadgeText}>
                  {userProfile?.kyc_status?.toUpperCase() || 'PENDING'}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.menuItem, styles.menuItemBorder]}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, { backgroundColor: '#D1FAE5' }]}>
                  <Lock size={20} color={colors.success} />
                </View>
                <Text style={styles.menuItemText}>Privacy & Security</Text>
              </View>
              <ChevronRight size={20} color={colors.textLight} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.sectionCard}>
            <View style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, { backgroundColor: '#FEE2E2' }]}>
                  <Bell size={20} color={colors.error} />
                </View>
                <Text style={styles.menuItemText}>Notifications</Text>
              </View>
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: '#E5E7EB', true: colors.primary + '60' }}
                thumbColor={notifications ? colors.primary : '#FFFFFF'}
              />
            </View>

            <View style={[styles.menuItem, styles.menuItemBorder]}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, { backgroundColor: '#E0E7FF' }]}>
                  <Moon size={20} color="#6366F1" />
                </View>
                <Text style={styles.menuItemText}>Dark Mode</Text>
              </View>
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                trackColor={{ false: '#E5E7EB', true: colors.primary + '60' }}
                thumbColor={darkMode ? colors.primary : '#FFFFFF'}
                disabled
              />
            </View>
          </View>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.sectionCard}>
            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, { backgroundColor: '#DBEAFE' }]}>
                  <HelpCircle size={20} color="#3B82F6" />
                </View>
                <Text style={styles.menuItemText}>Help Center</Text>
              </View>
              <ChevronRight size={20} color={colors.textLight} />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.menuItem, styles.menuItemBorder]}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, { backgroundColor: '#F3E8FF' }]}>
                  <FileText size={20} color="#9333EA" />
                </View>
                <Text style={styles.menuItemText}>Terms & Conditions</Text>
              </View>
              <ChevronRight size={20} color={colors.textLight} />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.menuItem, styles.menuItemBorder]}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, { backgroundColor: '#FCE7F3' }]}>
                  <Settings size={20} color="#EC4899" />
                </View>
                <Text style={styles.menuItemText}>App Settings</Text>
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