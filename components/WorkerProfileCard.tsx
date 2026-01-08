// components/WorkerProfileCard.tsx - Worker profile display card

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import {
  Wrench,
  Clock,
  DollarSign,
  MapPin,
  Shield,
  FileText,
  Edit3,
  CheckCircle,
  XCircle,
} from 'lucide-react-native';
import { WorkerProfile } from '../types';
import { colors } from './styles/shared';

interface WorkerProfileCardProps {
  workerProfile: WorkerProfile;
  onEdit: () => void;
}

export const WorkerProfileCard: React.FC<WorkerProfileCardProps> = ({
  workerProfile,
  onEdit,
}) => {
  const renderVerificationBadge = () => {
    if (workerProfile.is_verified || workerProfile.verification_status === 'approved') {
      return (
        <View style={styles.verifiedBadge}>
          <CheckCircle size={16} color="#10B981" fill="#10B981" />
          <Text style={styles.verifiedBadgeText}>Verified</Text>
        </View>
      );
    } else if (workerProfile.verification_status === 'pending') {
      return (
        <View style={styles.pendingBadge}>
          <Clock size={16} color="#F59E0B" />
          <Text style={styles.pendingBadgeText}>Pending</Text>
        </View>
      );
    } else {
      return (
        <View style={styles.rejectedBadge}>
          <XCircle size={16} color="#EF4444" />
          <Text style={styles.rejectedBadgeText}>Rejected</Text>
        </View>
      );
    }
  };

  return (
    <View style={styles.workerCard}>
      <View style={styles.workerCardHeader}>
        <View style={styles.workerCardHeaderLeft}>
          <View style={styles.workerIconBg}>
            <Wrench color={colors.primary} size={24} />
          </View>
          <View style={styles.workerCardTitleSection}>
            <Text style={styles.workerCardTitle}>Worker Profile</Text>
            <Text style={styles.workerCardCategories}>
              {workerProfile.categories.join(', ')}
            </Text>
          </View>
        </View>

        <View style={styles.workerCardHeaderRight}>{renderVerificationBadge()}</View>
      </View>

      <View style={styles.workerDetailsGrid}>
        <View style={styles.workerDetailRow}>
          <View style={styles.workerDetailItem}>
            <Clock color={colors.textSecondary} size={18} />
            <View>
              <Text style={styles.workerDetailLabel}>Experience</Text>
              <Text style={styles.workerDetailValue}>
                {workerProfile.experience_years} years
              </Text>
            </View>
          </View>

          <View style={styles.workerDetailItem}>
            <DollarSign color={colors.textSecondary} size={18} />
            <View>
              <Text style={styles.workerDetailLabel}>Hourly Rate</Text>
              <Text style={styles.workerDetailValue}>
                ₹{workerProfile.hourly_rate}/hr
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.workerDetailFull}>
          <MapPin color={colors.textSecondary} size={18} />
          <View style={{ flex: 1 }}>
            <Text style={styles.workerDetailLabel}>Service Areas</Text>
            <Text style={styles.workerDetailValue}>
              {workerProfile.service_areas.join(', ')}
            </Text>
          </View>
        </View>

        {workerProfile.license_number && (
          <View style={styles.workerDetailFull}>
            <Shield color={colors.textSecondary} size={18} />
            <View style={{ flex: 1 }}>
              <Text style={styles.workerDetailLabel}>License</Text>
              <Text style={styles.workerDetailValue}>
                {workerProfile.license_number}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.workerDetailFull}>
          <FileText color={colors.textSecondary} size={18} />
          <View style={{ flex: 1 }}>
            <Text style={styles.workerDetailLabel}>Description</Text>
            <Text style={styles.workerDetailValue}>{workerProfile.description}</Text>
          </View>
        </View>
      </View>

      {/* Edit Button */}
      <TouchableOpacity style={styles.editProfileButton} onPress={onEdit}>
        <Edit3 size={18} color={colors.primary} />
        <Text style={styles.editProfileButtonText}>Edit Profile</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  workerCard: {
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
  workerCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  workerCardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  workerIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  workerCardTitleSection: {
    flex: 1,
  },
  workerCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  workerCardCategories: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  workerCardHeaderRight: {},
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  verifiedBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#065F46',
  },
  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  pendingBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#92400E',
  },
  rejectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  rejectedBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#991B1B',
  },
  workerDetailsGrid: {
    gap: 16,
  },
  workerDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  workerDetailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    flex: 1,
  },
  workerDetailFull: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  workerDetailLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  workerDetailValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 20,
    gap: 8,
  },
  editProfileButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primary,
  },
});

export default WorkerProfileCard;