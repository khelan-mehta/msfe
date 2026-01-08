// components/BookingModal.tsx
import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  StyleSheet,
} from 'react-native';
import { X, Calendar, MapPin } from 'lucide-react-native';

interface Service {
  name: string;
  description?: string;
  price?: string;
  duration?: string;
}

interface Package {
  name: string;
  services: string;
  price: string;
  discount: string;
}

interface BookingModalProps {
  visible: boolean;
  service: Service | null;
  package: Package | null;
  bookingDate: string;
  bookingAddress: string;
  onClose: () => void;
  onDateChange: (date: string) => void;
  onAddressChange: (address: string) => void;
  onConfirm: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  visible,
  service,
  package: selectedPackage,
  bookingDate,
  bookingAddress,
  onClose,
  onDateChange,
  onAddressChange,
  onConfirm,
}) => {
  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Book Service</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#000" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={false}>
            <View style={styles.bookingContainer}>
              {/* Service/Package Summary */}
              <View style={styles.bookingSummary}>
                <Text style={styles.bookingSummaryTitle}>
                  {service?.name || selectedPackage?.name}
                </Text>
                {service && (
                  <>
                    <Text style={styles.bookingSummaryDescription}>{service.description}</Text>
                    <View style={styles.bookingSummaryMeta}>
                      <Text style={styles.bookingSummaryPrice}>{service.price}</Text>
                      <Text style={styles.bookingSummaryDuration}>• {service.duration}</Text>
                    </View>
                  </>
                )}
                {selectedPackage && (
                  <>
                    <Text style={styles.bookingSummaryDescription}>{selectedPackage.services}</Text>
                    <View style={styles.bookingSummaryMeta}>
                      <Text style={styles.bookingSummaryPrice}>{selectedPackage.price}</Text>
                      <Text style={styles.bookingSummaryDiscount}>{selectedPackage.discount}</Text>
                    </View>
                  </>
                )}
              </View>

              {/* Booking Form */}
              <View style={styles.bookingForm}>
                <Text style={styles.bookingFormLabel}>Select Date & Time</Text>
                <View style={styles.bookingInputContainer}>
                  <Calendar size={20} color="#9CA3AF" />
                  <TextInput
                    placeholder="e.g., Nov 5, 2025 at 10:00 AM"
                    placeholderTextColor="#9CA3AF"
                    style={styles.bookingInput}
                    value={bookingDate}
                    onChangeText={onDateChange}
                  />
                </View>

                <Text style={styles.bookingFormLabel}>Service Address</Text>
                <View style={styles.bookingInputContainer}>
                  <MapPin size={20} color="#9CA3AF" />
                  <TextInput
                    placeholder="Enter your address"
                    placeholderTextColor="#9CA3AF"
                    style={styles.bookingInput}
                    value={bookingAddress}
                    onChangeText={onAddressChange}
                    multiline
                  />
                </View>

                <TouchableOpacity style={styles.confirmBookingButton} onPress={onConfirm}>
                  <Text style={styles.confirmBookingButtonText}>Confirm Booking</Text>
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
  bookingContainer: {
    marginBottom: 20,
  },
  bookingSummary: {
    backgroundColor: '#F9FAFB',
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
  },
  bookingSummaryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  bookingSummaryDescription: {
    fontSize: 15,
    color: '#6B7280',
    lineHeight: 22,
    marginBottom: 12,
  },
  bookingSummaryMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bookingSummaryPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  bookingSummaryDuration: {
    fontSize: 15,
    color: '#6B7280',
  },
  bookingSummaryDiscount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
  },
  bookingForm: {
    gap: 20,
  },
  bookingFormLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  bookingInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 12,
  },
  bookingInput: {
    flex: 1,
    fontSize: 15,
    color: '#1F2937',
  },
  confirmBookingButton: {
    backgroundColor: '#0EA5E9',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  confirmBookingButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
