// SettingsScreen.tsx - Complete Integrated Flow
// KYC Verification → Subscription Payment → Worker Profile Creation

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Modal,
  TextInput,
  Alert,
  Animated,
  Dimensions,
  StatusBar,
  Platform,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import {
  ArrowLeft,
  Bell,
  Moon,
  Shield,
  CheckCircle,
  AlertCircle,
  XCircle,
  X,
  Upload,
  Camera,
  Award,
  Zap,
  Star,
  ChevronRight,
  Settings,
  Clock,
  Sparkles,
  Wrench,
  MapPin,
  DollarSign,
} from 'lucide-react-native';
import { theme } from '../theme';
import * as ImagePicker from 'expo-image-picker';
import RazorpayCheckout from 'react-native-razorpay';
import { useToast } from 'context/ToastContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

interface SettingsScreenProps {
  onBack?: () => void;
}

interface KycData {
  kyc_exists: boolean;
  status: 'pending' | 'submitted' | 'approved' | 'rejected';
  rejection_reason?: string;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  duration: string;
  features: string[];
  popular?: boolean;
  color: string;
}

const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'silver',
    name: 'Silver',
    price: 499,
    duration: '1 Year',
    features: [
      'Profile visibility boost',
      'Priority in search results',
      'Basic analytics',
      'Email support',
    ],
    color: '#9CA3AF',
  },
  {
    id: 'gold',
    name: 'Gold',
    price: 799,
    duration: '1 Year',
    features: [
      'All Silver features',
      'Featured profile badge',
      'Advanced analytics',
      'Priority support',
      'Unlimited job applications',
    ],
    popular: true,
    color: '#F59E0B',
  },
];

const WORKER_CATEGORIES = [
  'Plumber',
  'Electrician',
  'Carpenter',
  'Painter',
  'AC Technician',
  'Cleaner',
  'Cook',
  'Driver',
  'Gardener',
  'Security Guard',
];

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onBack }) => {
  const [loading, setLoading] = useState(false);
  const [currentFlow, setCurrentFlow] = useState<'kyc' | 'subscription' | 'profile' | 'settings'>(
    'settings'
  );

  // KYC States
  const [kycData, setKycData] = useState<KycData | null>(null);
  const [showKycModal, setShowKycModal] = useState(false);
  const [kycStep, setKycStep] = useState(1);
  const [fullName, setFullName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [documentType, setDocumentType] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');
  const [documentFrontImage, setDocumentFrontImage] = useState('');
  const [documentBackImage, setDocumentBackImage] = useState('');
  const [selfieImage, setSelfieImage] = useState('');

  // Subscription States
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [subscriptionId, setSubscriptionId] = useState('');

  // Worker Profile States
  const [showWorkerProfileModal, setShowWorkerProfileModal] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [experienceYears, setExperienceYears] = useState('');
  const [workerDescription, setWorkerDescription] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [serviceAreas, setServiceAreas] = useState('');

  // Settings States
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const scrollY = useRef(new Animated.Value(0)).current;
  const modalAnim = useRef(new Animated.Value(0)).current;

  const toast = useToast();

  useEffect(() => {
    checkInitialFlow();
  }, []);

  useEffect(() => {
    if (showKycModal || showSubscriptionModal || showWorkerProfileModal) {
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
  }, [showKycModal, showSubscriptionModal, showWorkerProfileModal]);

  const checkInitialFlow = async () => {
    try {
      setLoading(true);

      const token = await AsyncStorage.getItem('access_token');

      if (!token) {
        await logout();
        return;
      }

      const res = await fetch(`${API_BASE_URL}/kyc/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401 || res.status === 403) {
        await logout();
        return;
      }

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const kycResult = await res.json();
      if (!kycResult?.success) return;

      setKycData(kycResult.data);

      if (!kycResult.data.kyc_exists || kycResult.data.status === 'pending') {
        setShowKycModal(true);
        setCurrentFlow('kyc');
      } else if (kycResult.data.status === 'submitted') {
        const hasSubscription = await checkSubscription();
        if (!hasSubscription) {
          setShowSubscriptionModal(true);
          setCurrentFlow('subscription');
        }
      } else if (kycResult.data.status === 'approved') {
        await checkWorkerProfile();
      }
    } catch (e) {
      console.error('Initial flow error:', e);
      await logout(); // network failure should also logout
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await AsyncStorage.multiRemove([
      'access_token',
      'refresh_token',
      'subscription_id',
      'worker_profile_id',
    ]);

    toast.showWarning('Session expired', 'Please login again');

    onBack?.(); // only works if parent screen redirects to Login
  };

  const checkSubscription = async (): Promise<boolean> => {
    try {
      const subId = await AsyncStorage.getItem('subscription_id');
      return !!subId;
    } catch {
      return false;
    }
  };

  const checkWorkerProfile = async () => {
    try {
      const workerId = await AsyncStorage.getItem('worker_profile_id');
      if (!workerId) {
        const hasSubscription = await checkSubscription();
        if (hasSubscription) {
          // Has subscription but no profile
          setShowWorkerProfileModal(true);
          setCurrentFlow('profile');
        }
      }
    } catch (error) {
      console.error('Error checking worker profile:', error);
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
      const token = await AsyncStorage.getItem('access_token');
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
        if (type === 'front') setDocumentFrontImage(imageUrl);
        else if (type === 'back') setDocumentBackImage(imageUrl);
        else setSelfieImage(imageUrl);
        toast.showWarning('Success', 'Image uploaded successfully');
      } else {
        throw new Error(result.message || 'Upload failed');
      }
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast.showWarning('Error', error.message || 'Failed to upload image');
    }
  };

  const handleKycSubmit = async () => {
    if (
      !fullName.trim() ||
      !dateOfBirth.trim() ||
      !address.trim() ||
      !city.trim() ||
      !state.trim() ||
      !pincode.trim() ||
      !documentType.trim() ||
      !documentNumber.trim() ||
      !documentFrontImage ||
      !selfieImage
    ) {
      toast.showWarning('Error', 'Please fill all required fields and upload images');
      return;
    }

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('access_token');

      const payload: any = {
        full_name: fullName,
        date_of_birth: dateOfBirth,
        address,
        city,
        state,
        pincode,
        document_type: documentType,
        document_number: documentNumber,
        document_front_image: documentFrontImage,
        selfie_image: selfieImage,
      };

      if (documentBackImage) {
        payload.document_back_image = documentBackImage;
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
        toast.showWarning('Success! 🎉', 'Your KYC has been submitted. Now choose a subscription plan.');
        setShowKycModal(false);
        setKycData({ ...kycData!, status: 'submitted' });

        // Move to subscription flow
        setTimeout(() => {
          setShowSubscriptionModal(true);
          setCurrentFlow('subscription');
        }, 500);
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

  const handlePlanSelection = async (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    await initiatePayment(plan);
  };

  const initiatePayment = async (plan: SubscriptionPlan) => {
    try {
      setProcessingPayment(true);
      const token = await AsyncStorage.getItem('access_token');

      // Create subscription order
      const response = await fetch(`${API_BASE_URL}/subscription/create/${plan.id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = await response.json();

      if (result.success) {
        const { subscription_id, order } = result.data;
        setSubscriptionId(subscription_id.toString());

        // Open Razorpay
        const options = {
          key: 'rzp_test_YOUR_KEY_HERE', // Replace with your Razorpay key
          amount: plan.price * 100,
          currency: 'INR',
          name: `${plan.name} Plan`,
          description: `Subscription for ${plan.duration}`,
          order_id: order.id,
          prefill: {
            name: fullName || 'User',
          },
        };

        RazorpayCheckout.open(options)
          .then((data: any) => {
            handlePaymentSuccess(data, subscription_id.toString());
          })
          .catch((error: any) => {
            console.error('Razorpay error:', error);
            toast.showWarning('Payment Cancelled', 'You cancelled the payment');
            setProcessingPayment(false);
          });
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      console.error('Error initiating payment:', error);
      toast.showWarning('Error', error.message || 'Failed to initiate payment');
      setProcessingPayment(false);
    }
  };

  const handlePaymentSuccess = async (paymentData: any, subId: string) => {
    try {
      // Save subscription ID
      await AsyncStorage.setItem('subscription_id', subId);

      toast.showWarning('Success! 🎉', 'Payment successful! Now create your worker profile.');
      setShowSubscriptionModal(false);
      setProcessingPayment(false);

      // Move to worker profile flow
      setTimeout(() => {
        setShowWorkerProfileModal(true);
        setCurrentFlow('profile');
      }, 500);
    } catch (error) {
      console.error('Error saving subscription:', error);
      setProcessingPayment(false);
    }
  };

  const handleWorkerProfileSubmit = async () => {
    if (
      selectedCategories.length === 0 ||
      !experienceYears.trim() ||
      !workerDescription.trim() ||
      !hourlyRate.trim() ||
      !serviceAreas.trim()
    ) {
      toast.showWarning('Error', 'Please fill all required fields');
      return;
    }

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('access_token');

      const serviceAreasArray = serviceAreas.split(',').map((s) => s.trim());

      const payload = {
        categories: selectedCategories,
        subcategories: selectedCategories,
        experience_years: parseInt(experienceYears),
        description: workerDescription,
        hourly_rate: parseFloat(hourlyRate),
        license_number: licenseNumber || undefined,
        service_areas: serviceAreasArray,
        latitude: 21.1702,
        longitude: 72.8311,
      };

      const response = await fetch(`${API_BASE_URL}/worker/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        // Save worker profile ID
        await AsyncStorage.setItem('worker_profile_id', result.data.worker_id);

        toast.showWarning('Success! 🎉', 'Your worker profile has been created successfully!');
        setShowWorkerProfileModal(false);
        setCurrentFlow('settings');
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      console.error('Error creating worker profile:', error);
      toast.showWarning('Error', error.message || 'Failed to create worker profile');
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  // Render KYC Step
  const renderKycStep = () => {
    if (kycStep === 1) {
      return (
        <>
          <Text style={styles.stepTitle}>Personal Information</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Full Name <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              value={fullName}
              onChangeText={setFullName}
              placeholder="As per Aadhaar/PAN"
              placeholderTextColor="#9CA3AF"
              style={styles.textInput}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Date of Birth <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              value={dateOfBirth}
              onChangeText={setDateOfBirth}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#9CA3AF"
              style={styles.textInput}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Address <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              value={address}
              onChangeText={setAddress}
              placeholder="Street address"
              placeholderTextColor="#9CA3AF"
              style={styles.textInput}
              multiline
            />
          </View>

          <View style={styles.inputRow}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.inputLabel}>
                City <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                value={city}
                onChangeText={setCity}
                placeholder="City"
                placeholderTextColor="#9CA3AF"
                style={styles.textInput}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.inputLabel}>
                State <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                value={state}
                onChangeText={setState}
                placeholder="State"
                placeholderTextColor="#9CA3AF"
                style={styles.textInput}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Pincode <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              value={pincode}
              onChangeText={setPincode}
              placeholder="6-digit pincode"
              placeholderTextColor="#9CA3AF"
              style={styles.textInput}
              keyboardType="numeric"
              maxLength={6}
            />
          </View>

          <TouchableOpacity style={styles.nextButton} onPress={() => setKycStep(2)}>
            <LinearGradient
              colors={[theme.colors.primary, '#1a365d']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.nextButtonGradient}>
              <Text style={styles.nextButtonText}>Continue</Text>
              <ChevronRight size={20} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
        </>
      );
    } else {
      return (
        <>
          <Text style={styles.stepTitle}>Document Verification</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Document Type <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.documentTypeContainer}>
              {[
                { label: 'Aadhaar', value: 'aadhaar' },
                { label: 'PAN', value: 'pan' },
                { label: 'Driving License', value: 'drivinglicense' },
                { label: 'Voter ID', value: 'voterid' },
              ].map((type) => (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.documentTypeChip,
                    documentType === type.value && styles.documentTypeChipSelected,
                  ]}
                  onPress={() => setDocumentType(type.value)}>
                  <Text
                    style={[
                      styles.documentTypeText,
                      documentType === type.value && styles.documentTypeTextSelected,
                    ]}>
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Document Number <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              value={documentNumber}
              onChangeText={setDocumentNumber}
              placeholder="Enter document number"
              placeholderTextColor="#9CA3AF"
              style={styles.textInput}
            />
          </View>

          <View style={styles.uploadSection}>
            <Text style={styles.uploadSectionTitle}>Upload Documents</Text>

            <TouchableOpacity style={styles.uploadButton} onPress={() => pickImage('front')}>
              <View style={styles.uploadButtonContent}>
                <Upload size={24} color={theme.colors.primary} />
                <Text style={styles.uploadButtonText}>
                  {documentFrontImage ? '✓ Front Image Uploaded' : 'Upload Front Image'}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.uploadButton} onPress={() => pickImage('back')}>
              <View style={styles.uploadButtonContent}>
                <Upload size={24} color={theme.colors.primary} />
                <Text style={styles.uploadButtonText}>
                  {documentBackImage ? '✓ Back Image Uploaded' : 'Upload Back Image (Optional)'}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.uploadButton} onPress={() => pickImage('selfie')}>
              <View style={styles.uploadButtonContent}>
                <Camera size={24} color={theme.colors.primary} />
                <Text style={styles.uploadButtonText}>
                  {selfieImage ? '✓ Selfie Uploaded' : 'Upload Selfie'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.backButtonStyle} onPress={() => setKycStep(1)}>
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.submitButton, { flex: 1, marginLeft: 12 }]}
              onPress={handleKycSubmit}
              disabled={loading}>
              <LinearGradient
                colors={[theme.colors.primary, '#1a365d']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.submitButtonGradient}>
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Sparkles size={20} color="#FFFFFF" />
                    <Text style={styles.submitButtonText}>Submit KYC</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </>
      );
    }
  };

  // Render Subscription Plans
  const renderSubscriptionPlans = () => {
    return SUBSCRIPTION_PLANS.map((plan) => (
      <TouchableOpacity
        key={plan.id}
        style={[styles.planCard, plan.popular && styles.planCardPopular]}
        onPress={() => handlePlanSelection(plan)}
        disabled={processingPayment}>
        {plan.popular && (
          <View style={styles.popularBadge}>
            <Star size={12} color="#FFFFFF" fill="#FFFFFF" />
            <Text style={styles.popularBadgeText}>Most Popular</Text>
          </View>
        )}

        <View style={styles.planHeader}>
          <View style={[styles.planIcon, { backgroundColor: plan.color + '20' }]}>
            {plan.id === 'silver' ? (
              <Award size={28} color={plan.color} />
            ) : (
              <Zap size={28} color={plan.color} />
            )}
          </View>
          <View style={styles.planHeaderText}>
            <Text style={styles.planName}>{plan.name}</Text>
            <Text style={styles.planDuration}>{plan.duration}</Text>
          </View>
        </View>

        <View style={styles.planPricing}>
          <Text style={styles.planCurrency}>₹</Text>
          <Text style={styles.planPrice}>{plan.price}</Text>
          <Text style={styles.planPeriod}>/year</Text>
        </View>

        <View style={styles.planFeatures}>
          {plan.features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <CheckCircle size={16} color="#10B981" />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>

        <View style={styles.selectButton}>
          <LinearGradient
            colors={[plan.color, adjustColor(plan.color, -20)]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.selectButtonGradient}>
            <Text style={styles.selectButtonText}>
              {processingPayment && selectedPlan?.id === plan.id ? 'Processing...' : 'Select Plan'}
            </Text>
            <ChevronRight size={18} color="#FFFFFF" />
          </LinearGradient>
        </View>
      </TouchableOpacity>
    ));
  };

  // Render Worker Profile Form
  const renderWorkerProfileForm = () => {
    return (
      <>
        <Text style={styles.stepTitle}>Create Your Worker Profile</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>
            Select Categories <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.categoryGrid}>
            {WORKER_CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryChip,
                  selectedCategories.includes(category) && styles.categoryChipSelected,
                ]}
                onPress={() => toggleCategory(category)}>
                <Text
                  style={[
                    styles.categoryChipText,
                    selectedCategories.includes(category) && styles.categoryChipTextSelected,
                  ]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>
            Years of Experience <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            value={experienceYears}
            onChangeText={setExperienceYears}
            placeholder="e.g., 5"
            placeholderTextColor="#9CA3AF"
            style={styles.textInput}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>
            Description <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            value={workerDescription}
            onChangeText={setWorkerDescription}
            placeholder="Describe your skills and experience"
            placeholderTextColor="#9CA3AF"
            style={[styles.textInput, styles.textArea]}
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>
            Hourly Rate (₹) <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            value={hourlyRate}
            onChangeText={setHourlyRate}
            placeholder="e.g., 200"
            placeholderTextColor="#9CA3AF"
            style={styles.textInput}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>License Number (Optional)</Text>
          <TextInput
            value={licenseNumber}
            onChangeText={setLicenseNumber}
            placeholder="Enter license number if applicable"
            placeholderTextColor="#9CA3AF"
            style={styles.textInput}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>
            Service Areas <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            value={serviceAreas}
            onChangeText={setServiceAreas}
            placeholder="e.g., Surat, Navsari, Vapi (comma-separated)"
            placeholderTextColor="#9CA3AF"
            style={styles.textInput}
          />
        </View>

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleWorkerProfileSubmit}
          disabled={loading}>
          <LinearGradient
            colors={[theme.colors.primary, '#1a365d']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.submitButtonGradient}>
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Wrench size={20} color="#FFFFFF" />
                <Text style={styles.submitButtonText}>Create Profile</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </>
    );
  };

  // Helper function
  const adjustColor = (color: string, amount: number): string => {
    const clamp = (num: number) => Math.min(255, Math.max(0, num));
    let hex = color.replace('#', '');
    if (hex.length === 3) {
      hex = hex
        .split('')
        .map((c) => c + c)
        .join('');
    }
    const num = parseInt(hex, 16);
    const r = clamp((num >> 16) + amount);
    const g = clamp(((num >> 8) & 0x00ff) + amount);
    const b = clamp((num & 0x0000ff) + amount);
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
  };

  if (loading && !kycData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <LinearGradient
          colors={[theme.colors.primary, '#1a365d']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Settings</Text>
          <Text style={styles.headerSubtitle}>Manage your account</Text>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* KYC Status Card */}
        {kycData && (
          <TouchableOpacity
            style={styles.kycCard}
            onPress={() => {
              if (kycData.status !== 'approved') {
                setShowKycModal(true);
              }
            }}>
            <LinearGradient
              colors={
                kycData.status === 'approved' ? ['#10B981', '#059669'] : ['#F59E0B', '#D97706']
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.kycCardGradient}>
              <View style={styles.kycCardContent}>
                <Shield size={32} color="#FFFFFF" />
                <View style={styles.kycCardText}>
                  <Text style={styles.kycCardTitle}>KYC Verification</Text>
                  <Text style={styles.kycCardSubtitle}>
                    {kycData.status === 'approved'
                      ? 'Account verified'
                      : kycData.status === 'submitted'
                        ? 'Under review'
                        : 'Complete verification'}
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.sectionCard}>
            <View style={styles.settingItem}>
              <Bell size={20} color={theme.colors.primary} />
              <Text style={styles.settingLabel}>Notifications</Text>
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: '#E5E7EB', true: theme.colors.primary + '60' }}
                thumbColor={notifications ? theme.colors.primary : '#FFFFFF'}
              />
            </View>

            <View style={[styles.settingItem, styles.settingItemBorder]}>
              <Moon size={20} color={theme.colors.primary} />
              <Text style={styles.settingLabel}>Dark Mode</Text>
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                trackColor={{ false: '#E5E7EB', true: theme.colors.primary + '60' }}
                thumbColor={darkMode ? theme.colors.primary : '#FFFFFF'}
                disabled
              />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* KYC Modal */}
      <Modal
        visible={showKycModal}
        animationType="none"
        transparent
        onRequestClose={() => {
          if (kycData?.status === 'approved') {
            setShowKycModal(false);
          }
        }}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => {
              if (kycData?.status === 'approved') {
                setShowKycModal(false);
              }
            }}
          />
          <Animated.View
            style={[
              styles.modalContainer,
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
            ]}>
            <View style={styles.modalHandle} />

            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>KYC Verification</Text>
                <Text style={styles.modalSubtitle}>
                  Step {kycStep} of 2 - {kycStep === 1 ? 'Personal Info' : 'Documents'}
                </Text>
              </View>
              {kycData?.status === 'approved' && (
                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => setShowKycModal(false)}>
                  <X size={20} color="#6B7280" />
                </TouchableOpacity>
              )}
            </View>

            <ScrollView
              style={styles.modalScroll}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled">
              {renderKycStep()}
              <View style={{ height: 40 }} />
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>

      {/* Subscription Modal */}
      <Modal
        visible={showSubscriptionModal}
        animationType="none"
        transparent
        onRequestClose={() => setShowSubscriptionModal(false)}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setShowSubscriptionModal(false)}
          />
          <Animated.View
            style={[
              styles.modalContainer,
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
            ]}>
            <View style={styles.modalHandle} />

            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Choose Your Plan</Text>
                <Text style={styles.modalSubtitle}>Unlock premium features</Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowSubscriptionModal(false)}>
                <X size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalScroll}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 40 }}>
              {renderSubscriptionPlans()}
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>

      {/* Worker Profile Modal */}
      <Modal
        visible={showWorkerProfileModal}
        animationType="none"
        transparent
        onRequestClose={() => setShowWorkerProfileModal(false)}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => {}} />
          <Animated.View
            style={[
              styles.modalContainer,
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
            ]}>
            <View style={styles.modalHandle} />

            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Worker Profile</Text>
                <Text style={styles.modalSubtitle}>Share your expertise</Text>
              </View>
            </View>

            <ScrollView
              style={styles.modalScroll}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled">
              {renderWorkerProfileForm()}
              <View style={{ height: 40 }} />
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    overflow: 'hidden',
  },
  backButton: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  scrollView: { flex: 1 },
  scrollContent: {
    paddingTop: 24,
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  kycCard: {
    borderRadius: 20,
    marginBottom: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  kycCardGradient: {
    padding: 20,
  },
  kycCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  kycCardText: {
    flex: 1,
  },
  kycCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  kycCardSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 14,
  },
  settingItemBorder: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  settingLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    maxHeight: SCREEN_HEIGHT * 0.9,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalScroll: {
    paddingHorizontal: 24,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginTop: 20,
    marginBottom: 16,
  },
  inputGroup: {
    marginTop: 16,
  },
  inputRow: {
    flexDirection: 'row',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  required: {
    color: '#EF4444',
  },
  textInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
    color: '#111827',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  documentTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  documentTypeChip: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
  },
  documentTypeChipSelected: {
    backgroundColor: theme.colors.primary,
  },
  documentTypeText: {
    fontSize: 13,
    color: '#111827',
    fontWeight: '500',
  },
  documentTypeTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  uploadSection: {
    marginTop: 20,
  },
  uploadSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  uploadButton: {
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#E5E7EB',
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
  submitButton: {
    marginTop: 24,
    borderRadius: 16,
    overflow: 'hidden',
  },
  submitButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  backButtonStyle: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  planCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  planCardPopular: {
    borderColor: '#F59E0B',
  },
  popularBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F59E0B',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  popularBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  planIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  planHeaderText: {
    flex: 1,
  },
  planName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  planDuration: {
    fontSize: 14,
    color: '#6B7280',
  },
  planPricing: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 20,
  },
  planCurrency: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  planPrice: {
    fontSize: 36,
    fontWeight: '800',
    color: '#111827',
    marginHorizontal: 4,
  },
  planPeriod: {
    fontSize: 16,
    color: '#6B7280',
  },
  planFeatures: {
    marginBottom: 20,
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  featureText: {
    fontSize: 14,
    color: '#4B5563',
    flex: 1,
  },
  selectButton: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  selectButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  selectButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
  },
  categoryChipSelected: {
    backgroundColor: theme.colors.primary,
  },
  categoryChipText: {
    fontSize: 13,
    color: '#111827',
    fontWeight: '500',
  },
  categoryChipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
