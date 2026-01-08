// components/PackageModal.tsx
import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, StyleSheet } from 'react-native';
import { X, Package } from 'lucide-react-native';

interface PackageType {
  id: string;
  name: string;
  services: string;
  price: string;
  discount: string;
  backgroundColor: string;
}

interface PackageModalProps {
  visible: boolean;
  package: PackageType | null;
  onClose: () => void;
  onBookPress: () => void;
}

export const PackageModal: React.FC<PackageModalProps> = ({
  visible,
  package: selectedPackage,
  onClose,
  onBookPress,
}) => {
  if (!selectedPackage) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Package Details</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#000" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={false}>
            <View style={styles.packageDetailContainer}>
              <View
                style={[
                  styles.packageDetailHeader,
                  { backgroundColor: selectedPackage.backgroundColor },
                ]}>
                <Text style={styles.packageDetailTitle}>{selectedPackage.name}</Text>
              </View>
              <View style={styles.packageDetailBody}>
                <View style={styles.packageDetailRow}>
                  <Package size={24} color="#0EA5E9" />
                  <Text style={styles.packageDetailLabel}>Included Services</Text>
                </View>
                <Text style={styles.packageDetailServices}>{selectedPackage.services}</Text>

                <View style={styles.packageDetailDivider} />

                <View style={styles.packageDetailPricing}>
                  <View>
                    <Text style={styles.packageDetailPriceLabel}>Total Price</Text>
                    <Text style={styles.packageDetailPrice}>{selectedPackage.price}</Text>
                  </View>
                  <View style={styles.packageDetailDiscountBadge}>
                    <Text style={styles.packageDetailDiscount}>{selectedPackage.discount}</Text>
                  </View>
                </View>

                <TouchableOpacity style={styles.bookNowButton} onPress={onBookPress}>
                  <Text style={styles.bookNowButtonText}>Book This Package</Text>
                </TouchableOpacity>
              </View>
            </View>
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
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  closeButton: {
    padding: 4,
  },
  modalScrollView: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 20,
  },
  packageDetailContainer: {
    marginBottom: 20,
  },
  packageDetailHeader: {
    padding: 24,
    borderRadius: 16,
    marginBottom: 16,
  },
  packageDetailTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  packageDetailBody: {
    backgroundColor: '#F9FAFB',
    padding: 20,
    borderRadius: 16,
  },
  packageDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  packageDetailLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  packageDetailServices: {
    fontSize: 15,
    color: '#6B7280',
    lineHeight: 22,
    marginBottom: 20,
  },
  packageDetailDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 20,
  },
  packageDetailPricing: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  packageDetailPriceLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  packageDetailPrice: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  packageDetailDiscountBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  packageDetailDiscount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
  },
  bookNowButton: {
    backgroundColor: '#0EA5E9',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  bookNowButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
