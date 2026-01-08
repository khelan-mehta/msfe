// components/UserInfoCard.tsx - User info display card

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { User, Phone, Zap, Award } from 'lucide-react-native';
import { UserProfile } from '../types';
import { formatSubscriptionExpiry } from '../utils';
import { colors } from './styles/shared';

interface UserInfoCardProps {
  userProfile: UserProfile;
}

export const UserInfoCard: React.FC<UserInfoCardProps> = ({ userProfile }) => {
  return (
    <View style={styles.userInfoCard}>
      <View style={styles.userInfoHeader}>
        <View style={styles.userAvatar}>
          <User size={32} color={colors.primary} />
        </View>
        <View style={styles.userInfoDetails}>
          <Text style={styles.userName}>{userProfile.name || 'Worker'}</Text>
          <View style={styles.userPhoneRow}>
            <Phone size={14} color={colors.textSecondary} />
            <Text style={styles.userPhone}>{userProfile.mobile}</Text>
          </View>
        </View>
      </View>

      {/* Subscription Info */}
      {userProfile.subscription_id && (
        <View style={styles.subscriptionInfoCard}>
          <View style={styles.subscriptionInfoRow}>
            <View
              style={[
                styles.planBadge,
                {
                  backgroundColor:
                    userProfile.subscription_plan === 'gold' ? '#FEF3C7' : '#F3F4F6',
                },
              ]}
            >
              {userProfile.subscription_plan === 'gold' ? (
                <Zap size={16} color="#F59E0B" />
              ) : (
                <Award size={16} color="#9CA3AF" />
              )}
              <Text
                style={[
                  styles.planBadgeText,
                  {
                    color:
                      userProfile.subscription_plan === 'gold' ? '#92400E' : '#4B5563',
                  },
                ]}
              >
                {userProfile.subscription_plan?.toUpperCase()} Plan
              </Text>
            </View>
            <Text style={styles.subscriptionExpiry}>
              Expires: {formatSubscriptionExpiry(userProfile.subscription_expires_at)}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  userInfoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  userInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  userInfoDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  userPhoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userPhone: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  subscriptionInfoCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 14,
  },
  subscriptionInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  planBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  subscriptionExpiry: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});

export default UserInfoCard;