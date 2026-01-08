// components/modals/KycModal.tsx - KYC verification modal

import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import {
  X,
  Upload,
  Camera,
  ChevronRight,
  Sparkles,
} from 'lucide-react-native';
import { KycFormData, FlowState } from '../../types';
import { API_BASE_URL, DOCUMENT_TYPES, STORAGE_KEYS } from '../../constants';
import { colors, sharedStyles } from '../styles/shared';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface KycModalProps {
  visible: boolean;
  flowState: FlowState;
  modalAnim: Animated.Value;
  onClose: () => void;
  onSuccess: () => void;
}

export const KycModal: React.FC<KycModalProps> = ({
  visible,
  flowState,
  modalAnim,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [kycStep, setKycStep] = useState(1);

  // Form state
  const [formData, setFormData] = useState<KycFormData>({
    fullName: '',
    dateOfBirth: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    documentType: '',
    documentNumber: '',
    documentFrontImage: '',
    documentBackImage: '',
    selfieImage: '',
  });

  const updateFormData = (key: keyof KycFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const pickImage = async (type: 'front' | 'back' | 'selfie') => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        toast.showWarning('Permission Required', 'Please allow access to your photo library');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadImage(result.assets[0].uri, type);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      toast.showWarning('Error', 'Failed to pick image');
    }
  };

  const uploadImage = async (uri: string, type: 'front' | 'back' | 'selfie') => {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      const uriParts = uri.split('.');
      const fileExtension = uriParts[uriParts.length - 1].toLowerCase();

      let extension = 'jpg';
      let mimeType = 'image/jpeg';

      if (['jpg', 'jpeg'].includes(fileExtension)) {
        extension = 'jpg';
        mimeType = 'image/jpeg';
      } else if (fileExtension === 'png') {
        extension = 'png';
        mimeType = 'image/png';
      }

      const filename = `${type}_${Date.now()}.${extension}`;
      const response = await fetch(uri);
      const blob = await response.blob();

      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            const base64 = reader.result.split(',')[1];
            resolve(base64);
          } else {
            reject(new Error('Failed to convert to base64'));
          }
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      const uploadResponse = await fetch(`${API_BASE_URL}/upload/document-base64`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ filename, mime_type: mimeType, data: base64Data }),
      });

      const result = await uploadResponse.json();

      if (result.success) {
        const imageUrl = result.data.url;
        if (type === 'front') updateFormData('documentFrontImage', imageUrl);
        else if (type === 'back') updateFormData('documentBackImage', imageUrl);
        else updateFormData('selfieImage', imageUrl);
        toast.showWarning('Success', 'Image uploaded successfully');
      } else {
        throw new Error(result.message || 'Upload failed');
      }
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast.showWarning('Error', error.message || 'Failed to upload image');
    }
  };

  const handleSubmit = async () => {
    if (
      !formData.fullName.trim() ||
      !formData.dateOfBirth.trim() ||
      !formData.address.trim() ||
      !formData.city.trim() ||
      !formData.state.trim() ||
      !formData.pincode.trim() ||
      !formData.documentType.trim() ||
      !formData.documentNumber.trim() ||
      !formData.documentFrontImage ||
      !formData.selfieImage
    ) {
      toast.showWarning('Error', 'Please fill all required fields and upload images');
      return;
    }

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

      const payload: any = {
        full_name: formData.fullName,
        date_of_birth: formData.dateOfBirth,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        document_type: formData.documentType,
        document_number: formData.documentNumber,
        document_front_image: formData.documentFrontImage,
        selfie_image: formData.selfieImage,
      };

      if (formData.documentBackImage) {
        payload.document_back_image = formData.documentBackImage;
      }

      const response = await fetch(`${API_BASE_URL}/kyc/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        toast.showWarning('Success! 🎉', 'Your KYC has been submitted.');
        onSuccess();
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      console.error('Error submitting KYC:', error);
      toast.showWarning('Error', error.message || 'Failed to submit KYC');
    } finally {
      setLoading(false);
    }
  };

  const canClose = flowState !== 'kyc_required';

  const renderStep1 = () => (
    <>
      <Text style={styles.stepTitle}>Personal Information</Text>

      <View style={sharedStyles.inputGroup}>
        <Text style={sharedStyles.inputLabel}>
          Full Name <Text style={sharedStyles.required}>*</Text>
        </Text>
        <TextInput
          value={formData.fullName}
          onChangeText={(val) => updateFormData('fullName', val)}
          placeholder="As per Aadhaar/PAN"
          placeholderTextColor="#9CA3AF"
          style={sharedStyles.textInput}
        />
      </View>

      <View style={sharedStyles.inputGroup}>
        <Text style={sharedStyles.inputLabel}>
          Date of Birth <Text style={sharedStyles.required}>*</Text>
        </Text>
        <TextInput
          value={formData.dateOfBirth}
          onChangeText={(val) => updateFormData('dateOfBirth', val)}
          placeholder="YYYY-MM-DD"
          placeholderTextColor="#9CA3AF"
          style={sharedStyles.textInput}
        />
      </View>

      <View style={sharedStyles.inputGroup}>
        <Text style={sharedStyles.inputLabel}>
          Address <Text style={sharedStyles.required}>*</Text>
        </Text>
        <TextInput
          value={formData.address}
          onChangeText={(val) => updateFormData('address', val)}
          placeholder="Street address"
          placeholderTextColor="#9CA3AF"
          style={sharedStyles.textInput}
          multiline
        />
      </View>

      <View style={sharedStyles.inputRow}>
        <View style={[sharedStyles.inputGroup, { flex: 1, marginRight: 8 }]}>
          <Text style={sharedStyles.inputLabel}>
            City <Text style={sharedStyles.required}>*</Text>
          </Text>
          <TextInput
            value={formData.city}
            onChangeText={(val) => updateFormData('city', val)}
            placeholder="City"
            placeholderTextColor="#9CA3AF"
            style={sharedStyles.textInput}
          />
        </View>
        <View style={[sharedStyles.inputGroup, { flex: 1, marginLeft: 8 }]}>
          <Text style={sharedStyles.inputLabel}>
            State <Text style={sharedStyles.required}>*</Text>
          </Text>
          <TextInput
            value={formData.state}
            onChangeText={(val) => updateFormData('state', val)}
            placeholder="State"
            placeholderTextColor="#9CA3AF"
            style={sharedStyles.textInput}
          />
        </View>
      </View>

      <View style={sharedStyles.inputGroup}>
        <Text style={sharedStyles.inputLabel}>
          Pincode <Text style={sharedStyles.required}>*</Text>
        </Text>
        <TextInput
          value={formData.pincode}
          onChangeText={(val) => updateFormData('pincode', val)}
          placeholder="6-digit pincode"
          placeholderTextColor="#9CA3AF"
          style={sharedStyles.textInput}
          keyboardType="numeric"
          maxLength={6}
        />
      </View>

      <TouchableOpacity style={styles.nextButton} onPress={() => setKycStep(2)}>
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.nextButtonGradient}
        >
          <Text style={styles.nextButtonText}>Continue</Text>
          <ChevronRight size={20} color="#FFFFFF" />
        </LinearGradient>
      </TouchableOpacity>
    </>
  );

  const renderStep2 = () => (
    <>
      <Text style={styles.stepTitle}>Document Verification</Text>

      <View style={sharedStyles.inputGroup}>
        <Text style={sharedStyles.inputLabel}>
          Document Type <Text style={sharedStyles.required}>*</Text>
        </Text>
        <View style={sharedStyles.chipContainer}>
          {DOCUMENT_TYPES.map((type) => (
            <TouchableOpacity
              key={type.value}
              style={[
                sharedStyles.chip,
                formData.documentType === type.value && sharedStyles.chipSelected,
              ]}
              onPress={() => updateFormData('documentType', type.value)}
            >
              <Text
                style={[
                  sharedStyles.chipText,
                  formData.documentType === type.value && sharedStyles.chipTextSelected,
                ]}
              >
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={sharedStyles.inputGroup}>
        <Text style={sharedStyles.inputLabel}>
          Document Number <Text style={sharedStyles.required}>*</Text>
        </Text>
        <TextInput
          value={formData.documentNumber}
          onChangeText={(val) => updateFormData('documentNumber', val)}
          placeholder="Enter document number"
          placeholderTextColor="#9CA3AF"
          style={sharedStyles.textInput}
        />
      </View>

      <View style={styles.uploadSection}>
        <Text style={styles.uploadSectionTitle}>Upload Documents</Text>

        <TouchableOpacity style={styles.uploadButton} onPress={() => pickImage('front')}>
          <View style={styles.uploadButtonContent}>
            <Upload size={24} color={colors.primary} />
            <Text style={styles.uploadButtonText}>
              {formData.documentFrontImage ? '✓ Front Image Uploaded' : 'Upload Front Image'}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.uploadButton} onPress={() => pickImage('back')}>
          <View style={styles.uploadButtonContent}>
            <Upload size={24} color={colors.primary} />
            <Text style={styles.uploadButtonText}>
              {formData.documentBackImage
                ? '✓ Back Image Uploaded'
                : 'Upload Back Image (Optional)'}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.uploadButton} onPress={() => pickImage('selfie')}>
          <View style={styles.uploadButtonContent}>
            <Camera size={24} color={colors.primary} />
            <Text style={styles.uploadButtonText}>
              {formData.selfieImage ? '✓ Selfie Uploaded' : 'Upload Selfie'}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={sharedStyles.secondaryButton} onPress={() => setKycStep(1)}>
          <Text style={sharedStyles.secondaryButtonText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[sharedStyles.primaryButton, { flex: 1, marginLeft: 12 }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <LinearGradient
            colors={[colors.primary, colors.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={sharedStyles.primaryButtonGradient}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Sparkles size={20} color="#FFFFFF" />
                <Text style={sharedStyles.primaryButtonText}>Submit KYC</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </>
  );

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent
      onRequestClose={() => canClose && onClose()}
    >
      <View style={sharedStyles.modalOverlay}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={() => canClose && onClose()}
        />
        <Animated.View
          style={[
            sharedStyles.modalContainer,
            {
              transform: [
                {
                  translateY: modalAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [SCREEN_HEIGHT, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={sharedStyles.modalHandle} />

          <View style={sharedStyles.modalHeader}>
            <View>
              <Text style={sharedStyles.modalTitle}>KYC Verification</Text>
              <Text style={sharedStyles.modalSubtitle}>
                Step {kycStep} of 2 - {kycStep === 1 ? 'Personal Info' : 'Documents'}
              </Text>
            </View>
            {canClose && (
              <TouchableOpacity style={sharedStyles.modalCloseButton} onPress={onClose}>
                <X size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>

          <ScrollView
            style={sharedStyles.modalScroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {kycStep === 1 ? renderStep1() : renderStep2()}
            <View style={{ height: 40 }} />
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  stepTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginTop: 20,
    marginBottom: 16,
  },
  nextButton: {
    marginTop: 24,
    borderRadius: 16,
    overflow: 'hidden',
  },
  nextButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  uploadSection: {
    marginTop: 20,
  },
  uploadSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  uploadButton: {
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    padding: 16,
    marginBottom: 12,
  },
  uploadButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  uploadButtonText: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 24,
  },
});

export default KycModal;