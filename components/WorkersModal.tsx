// WorkersModal.tsx - Enhanced with distance and proper worker data
import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Linking,
  Alert,
} from 'react-native';
import { X, Star, Phone, MessageCircle, MapPin, Briefcase, Award } from 'lucide-react-native';
import { useToast } from 'context/ToastContext';

interface Worker {
  id: string;
  name: string;
  rating: number;
  reviewCount: number;
  phone: string;
  experience: string;
  profileImage: any;
  specialization: string[];
  hourlyRate: number;
  serviceAreas: string[];
  description: string;
  subscriptionPlan: string;
  distance?: number;
}

interface WorkersModalProps {
  visible: boolean;
  workers: any;
  serviceName: string;
  onClose: () => void;
  onWorkerSelect: (worker: Worker) => void;
}

export const WorkersModal: React.FC<WorkersModalProps> = ({
  visible,
  workers,
  serviceName,
  onClose,
  onWorkerSelect,
}) => {
  const toast = useToast();

  const handleWhatsApp = async (worker: Worker) => {
    const cleanPhone = worker.phone.replace(/\D/g, '');
    const message = `Hi ${worker.name}, I would like to book your services for ${serviceName}. Are you available?`;
    const encodedMessage = encodeURIComponent(message);

    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;

    try {
      await Linking.openURL(whatsappUrl);
    } catch (error) {
      toast.showWarning('Error', 'Unable to open WhatsApp');
    }
  };

  const handleCall = async (phone: string) => {
    const cleanPhone = phone.replace(/\s+/g, '');

    try {
      await Linking.openURL(`tel:${cleanPhone}`);
    } catch (error) {
      toast.showWarning('Error', 'Unable to initiate call');
    }
  };

  const getPlanBadgeStyle = (plan: string) => {
    switch (plan.toLowerCase()) {
      case 'gold':
        return styles.goldBadge;
      case 'silver':
        return styles.silverBadge;
      default:
        return styles.defaultBadge;
    }
  };

  const getPlanBadgeText = (plan: string) => {
    switch (plan.toLowerCase()) {
      case 'gold':
        return '👑 Gold';
      case 'silver':
        return '⭐ Silver';
      default:
        return 'Standard';
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>
                {workers.length} Worker{workers.length !== 1 ? 's' : ''} Available
              </Text>
              <Text style={styles.headerSubtitle}>{serviceName}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Workers List */}
          <ScrollView style={styles.workersList} showsVerticalScrollIndicator={false}>
            {workers.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>👷</Text>
                <Text style={styles.emptyText}>No workers found</Text>
                <Text style={styles.emptySubtext}>
                  Try searching in a different area or check back later
                </Text>
              </View>
            ) : (
              workers.map((worker: any) => (
                <View key={worker.id} style={styles.workerCard}>
                  {/* Subscription Badge */}
                  <View style={[styles.planBadge, getPlanBadgeStyle(worker.subscriptionPlan)]}>
                    <Text style={styles.planBadgeText}>
                      {getPlanBadgeText(worker.subscriptionPlan)}
                    </Text>
                  </View>

                  {/* Profile Section */}
                  <View style={styles.workerHeader}>
                    <Image source={worker.profileImage} style={styles.profileImage} />
                    <View style={styles.workerInfo}>
                      <Text style={styles.workerName}>{worker.name}</Text>

                      {/* Rating */}
                      <View style={styles.ratingContainer}>
                        <Star size={16} color="#FCD34D" fill="#FCD34D" />
                        <Text style={styles.ratingText}>
                          {worker.rating > 0
                            ? `${worker.rating.toFixed(1)} (${worker.reviewCount} reviews)`
                            : 'New Worker'}
                        </Text>
                      </View>

                      {/* Experience */}
                      <View style={styles.infoRow}>
                        <Briefcase size={14} color="#6B7280" />
                        <Text style={styles.infoText}>{worker.experience}</Text>
                      </View>

                      {/* Distance */}
                      {worker.distance !== undefined && (
                        <View style={styles.infoRow}>
                          <MapPin size={14} color="#10B981" />
                          <Text style={styles.distanceText}>
                            {worker.distance.toFixed(1)} km away
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>

                  {/* Description */}
                  {worker.description && (
                    <Text style={styles.description} numberOfLines={2}>
                      {worker.description}
                    </Text>
                  )}

                  {/* Specializations */}
                  <View style={styles.specializationContainer}>
                    {worker.specialization.slice(0, 3).map((spec: any, index: any) => (
                      <View key={index} style={styles.specializationTag}>
                        <Text style={styles.specializationText}>{spec}</Text>
                      </View>
                    ))}
                    {worker.specialization.length > 3 && (
                      <View style={styles.specializationTag}>
                        <Text style={styles.specializationText}>
                          +{worker.specialization.length - 3} more
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Service Areas */}
                  {worker.serviceAreas.length > 0 && (
                    <View style={styles.serviceAreasContainer}>
                      <Text style={styles.serviceAreasLabel}>Service Areas:</Text>
                      <Text style={styles.serviceAreasText}>
                        {worker.serviceAreas.slice(0, 2).join(', ')}
                        {worker.serviceAreas.length > 2 && ` +${worker.serviceAreas.length - 2}`}
                      </Text>
                    </View>
                  )}

                  {/* Hourly Rate */}
                  <View style={styles.rateContainer}>
                    <Award size={16} color="#0EA5E9" />
                    <Text style={styles.rateText}>₹{worker.hourlyRate}/hour</Text>
                  </View>

                  {/* Phone Display */}
                  <View style={styles.phoneDisplayContainer}>
                    <Phone size={18} color="#6B7280" />
                    <Text style={styles.phoneDisplayText}>{worker.phone}</Text>
                  </View>

                  {/* Action Buttons */}
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={styles.whatsappButton}
                      onPress={() => handleWhatsApp(worker)}>
                      <MessageCircle size={20} color="#FFFFFF" />
                      <Text style={styles.whatsappButtonText}>WhatsApp</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.callButton}
                      onPress={() => handleCall(worker.phone)}>
                      <Phone size={20} color="#FFFFFF" />
                      <Text style={styles.callButtonText}>Call Now</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  closeButton: {
    padding: 4,
  },
  workersList: {
    padding: 20,
  },

  /* Empty State */
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 20,
  },

  /* Worker Card */
  workerCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    position: 'relative',
  },
  planBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    zIndex: 1,
  },
  goldBadge: {
    backgroundColor: '#FEF3C7',
  },
  silverBadge: {
    backgroundColor: '#E5E7EB',
  },
  defaultBadge: {
    backgroundColor: '#DBEAFE',
  },
  planBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1F2937',
  },
  workerHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 12,
  },
  workerInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  workerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 6,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 6,
  },
  infoText: {
    fontSize: 13,
    color: '#6B7280',
  },
  distanceText: {
    fontSize: 13,
    color: '#10B981',
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  specializationContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  specializationTag: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  specializationText: {
    fontSize: 12,
    color: '#0EA5E9',
    fontWeight: '500',
  },
  serviceAreasContainer: {
    backgroundColor: '#F3F4F6',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  serviceAreasLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
    marginBottom: 4,
  },
  serviceAreasText: {
    fontSize: 13,
    color: '#1F2937',
  },
  rateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    gap: 8,
  },
  rateText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0EA5E9',
  },
  phoneDisplayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
  },
  phoneDisplayText: {
    fontSize: 15,
    color: '#1F2937',
    marginLeft: 8,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  whatsappButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#25D366',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  whatsappButtonText: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  callButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0EA5E9',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  callButtonText: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
