// components/KycScreen.tsx - KYC verification screen (form + status view)

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  ChevronLeft,
  Upload,
  Camera,
  ChevronRight,
  Sparkles,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Calendar,
} from 'lucide-react-native';

import { KycFormData, FlowState } from '../types';
import { API_BASE_URL, DOCUMENT_TYPES, STORAGE_KEYS } from '../constants';
import { colors, sharedStyles } from '../components';
import { Header } from './Header';
import { useProfile } from '../hooks';
import { useToast } from '../context/ToastContext';
import { authorizedFetch } from '../utils/authorizedFetch';

// Try to import Expo Router - will be undefined if not using Expo Router
let useRouter: any;
try {
  useRouter = require('expo-router').useRouter;
} catch (e) {
  useRouter = null;
}

interface Props {
  navigation?: any;
  onBack?: () => void;
}

export const KycScreen: React.FC<Props> = ({ navigation, onBack }) => {
  const router = useRouter ? useRouter() : null;
  const toast = useToast();
  const { loading, refreshing, userProfile, flowState, loadUserData, handleRefresh } = useProfile();

  const [submitting, setSubmitting] = useState(false);
  const [kycStep, setKycStep] = useState(1);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2000, 0, 1));

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

  // Handle date selection
  const handleDateChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (date) {
      setSelectedDate(date);
      // Build YYYY-MM-DD from local date components to avoid timezone shifts
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;
      updateFormData('dateOfBirth', formattedDate);
    }
  };

  // Format date for display
  const formatDisplayDate = (dateString: string): string => {
    if (!dateString) return '';
    const parts = dateString.split('-').map((p) => parseInt(p, 10));
    if (parts.length !== 3) return dateString;
    const [year, month, day] = parts;
    // Create a local Date using year, monthIndex, day to avoid timezone parsing issues
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
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

      const uploadResponse = await authorizedFetch(`${API_BASE_URL}/upload/document-base64`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filename, mime_type: mimeType, data: base64Data }),
      });

      const contentType = uploadResponse.headers.get('content-type') || '';
      let result: any;

      if (contentType.includes('application/json')) {
        result = await uploadResponse.json();
      } else {
        const text = await uploadResponse.text();
        if (__DEV__) console.error('Upload non-JSON response:', uploadResponse.status, text);
        throw new Error('Upload failed: Server returned unexpected response');
      }

      if (uploadResponse.ok && result && result.success) {
        const imageUrl = result.data.url;
        if (type === 'front') updateFormData('documentFrontImage', imageUrl);
        else if (type === 'back') updateFormData('documentBackImage', imageUrl);
        else updateFormData('selfieImage', imageUrl);
        toast.showSuccess('Success', 'Image uploaded successfully');
      } else {
        const msg = (result && result.message) || 'Upload failed';
        throw new Error(msg);
      }
    } catch (error: any) {
      if (__DEV__) console.error('Error uploading image:', error);
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
      setSubmitting(true);
      const token = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

      if (!token) {
        toast.showWarning('Authentication Required', 'Please log in and try again');
        setSubmitting(false);
        return;
      }

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

      const url = `${API_BASE_URL}/kyc/submit`;
      if (__DEV__) {
        console.log('Submitting KYC to:', url);
        console.log('KYC payload (truncated):', JSON.stringify(payload).slice(0, 1000));
      }

      const response = await authorizedFetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const contentType = response.headers.get('content-type') || '';

      // If server did not return JSON, capture the text for debugging
      let result: any;
      if (contentType.includes('application/json')) {
        result = await response.json();
      } else {
        const text = await response.text();
        if (__DEV__) console.error('KYC submit non-JSON response:', response.status, text);
        throw new Error(`Server returned non-JSON response (status ${response.status})`);
      }

      // Handle validation errors (422)
      if (!response.ok) {
        if (response.status === 422) {
          const errors = result.errors || result.validation || result.data || {};
          const messages: string[] = [];
          if (errors && typeof errors === 'object') {
            for (const v of Object.values(errors)) {
              if (Array.isArray(v)) messages.push(...v);
              else if (typeof v === 'string') messages.push(v);
            }
          }
          const msg = messages.length ? messages.join('; ') : (result.message || `Validation failed (status ${response.status})`);
          toast.showWarning('Validation Error', msg);
          return;
        }

        const msg = (result && (result.message || JSON.stringify(result))) || `Server error ${response.status}`;
        throw new Error(`Server error ${response.status}: ${String(msg).slice(0, 500)}`);
      }

      if (result && result.success) {
        toast.showSuccess('Success!', 'Your KYC has been submitted for review.');
        await loadUserData();
      } else {
        throw new Error((result && result.message) || 'Failed to submit KYC');
      }
    } catch (error: any) {
      console.error('Error submitting KYC:', error);
      toast.showWarning('Error', error.message || 'Failed to submit KYC');
    } finally {
      setSubmitting(false);
    }
  };

  // Determine if we should show the form or status
  const showForm = flowState === 'kyc_required' || flowState === 'kyc_rejected';
  const kycStatus = userProfile?.kyc_status;

  // Loading screen
  if (loading && !refreshing) {
    return (
      <View style={sharedStyles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={sharedStyles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const renderStatusView = () => {
    const getStatusConfig = () => {
      switch (kycStatus) {
        case 'submitted':
          return {
            icon: Clock,
            color: colors.warning,
            bgColor: '#FEF3C7',
            title: 'KYC Under Review',
            description: 'Your KYC application has been submitted and is currently being reviewed. This usually takes 1-2 business days.',
          };
        case 'approved':
          return {
            icon: CheckCircle,
            color: colors.success,
            bgColor: '#D1FAE5',
            title: 'KYC Approved',
            description: 'Your KYC verification has been approved. You can now access all features of the app.',
          };
        case 'rejected':
          return {
            icon: XCircle,
            color: colors.error,
            bgColor: '#FEE2E2',
            title: 'KYC Rejected',
            description: 'Unfortunately, your KYC application was rejected. Please resubmit with correct information.',
          };
        default:
          return {
            icon: AlertCircle,
            color: colors.textSecondary,
            bgColor: '#F3F4F6',
            title: 'KYC Pending',
            description: 'Please complete your KYC verification to unlock all features.',
          };
      }
    };

    const config = getStatusConfig();
    const StatusIcon = config.icon;

    return (
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.statusContainer}>
        <View style={[styles.statusIconContainer, { backgroundColor: config.bgColor }]}>
          <StatusIcon size={64} color={config.color} />
        </View>

        <Text style={styles.statusTitle}>{config.title}</Text>
        <Text style={styles.statusDescription}>{config.description}</Text>

        {kycStatus === 'submitted' && (
          <View style={styles.infoCard}>
            <Text style={styles.infoCardTitle}>What happens next?</Text>
            <View style={styles.infoItem}>
              <View style={styles.infoBullet} />
              <Text style={styles.infoText}>Our team will verify your documents</Text>
            </View>
            <View style={styles.infoItem}>
              <View style={styles.infoBullet} />
              <Text style={styles.infoText}>You'll receive a notification once reviewed</Text>
            </View>
            <View style={styles.infoItem}>
              <View style={styles.infoBullet} />
              <Text style={styles.infoText}>Typically completed within 1-2 business days</Text>
            </View>
          </View>
        )}

        {kycStatus === 'approved' && (
          <View style={[styles.infoCard, { backgroundColor: '#D1FAE5' }]}>
            <Text style={[styles.infoCardTitle, { color: colors.success }]}>You're all set!</Text>
            <Text style={styles.infoText}>
              Your identity has been verified. You can now proceed with your worker profile setup.
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.refreshButton}
          onPress={handleRefresh}
          disabled={refreshing}
        >
          {refreshing ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <>
              <RefreshCw size={20} color={colors.primary} />
              <Text style={styles.refreshButtonText}>Refresh Status</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
      </KeyboardAvoidingView>
    );
  };

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
        <TouchableOpacity
          style={styles.datePickerButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={[styles.datePickerText, !formData.dateOfBirth && styles.datePickerPlaceholder]}>
            {formData.dateOfBirth ? formatDisplayDate(formData.dateOfBirth) : 'Select date of birth'}
          </Text>
          <Calendar size={20} color={colors.textSecondary} />
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
            maximumDate={new Date()}
            minimumDate={new Date(1920, 0, 1)}
          />
        )}
        {Platform.OS === 'ios' && showDatePicker && (
          <TouchableOpacity
            style={styles.datePickerDoneButton}
            onPress={() => setShowDatePicker(false)}
          >
            <Text style={styles.datePickerDoneText}>Done</Text>
          </TouchableOpacity>
        )}
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
          disabled={submitting}
        >
          <LinearGradient
            colors={[colors.primary, colors.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={sharedStyles.primaryButtonGradient}
          >
            {submitting ? (
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

  const renderFormView = () => (
    <>
      {/* Step Indicator */}
      <View style={styles.stepIndicator}>
        <View style={[styles.stepDot, kycStep >= 1 && styles.stepDotActive]} />
        <View style={[styles.stepLine, kycStep >= 2 && styles.stepLineActive]} />
        <View style={[styles.stepDot, kycStep >= 2 && styles.stepDotActive]} />
      </View>
      <Text style={styles.stepIndicatorText}>
        Step {kycStep} of 2 - {kycStep === 1 ? 'Personal Info' : 'Documents'}
      </Text>

      {flowState === 'kyc_rejected' && (
        <View style={styles.rejectedBanner}>
          <XCircle size={20} color={colors.error} />
          <Text style={styles.rejectedBannerText}>
            Your previous KYC was rejected. Please resubmit with correct information.
          </Text>
        </View>
      )}

      {kycStep === 1 ? renderStep1() : renderStep2()}
    </>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <Header
        name="KYC Verification"
        leftIcon={ChevronLeft}
        onLeftPress={handleBack}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {showForm ? renderFormView() : renderStatusView()}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
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

  // Step Indicator
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.borderLight,
  },
  stepDotActive: {
    backgroundColor: colors.primary,
  },
  stepLine: {
    width: 60,
    height: 3,
    backgroundColor: colors.borderLight,
    marginHorizontal: 8,
  },
  stepLineActive: {
    backgroundColor: colors.primary,
  },
  stepIndicatorText: {
    textAlign: 'center',
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 20,
  },

  // Rejected Banner
  rejectedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    gap: 12,
  },
  rejectedBannerText: {
    flex: 1,
    fontSize: 14,
    color: colors.error,
    fontWeight: '500',
  },

  // Form styles
  stepTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 20,
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

  // Date Picker styles
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  datePickerText: {
    fontSize: 15,
    color: colors.text,
  },
  datePickerPlaceholder: {
    color: '#9CA3AF',
  },
  datePickerDoneButton: {
    alignSelf: 'flex-end',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  datePickerDoneText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },

  // Status View styles
  statusContainer: {
    alignItems: 'center',
    paddingTop: 40,
  },
  statusIconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  statusTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  statusDescription: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  infoCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    marginBottom: 24,
  },
  infoCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF2FF',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  refreshButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primary,
  },
});

export default KycScreen;
