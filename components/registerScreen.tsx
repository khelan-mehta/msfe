import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Container } from './Container';
import { LinearGradient } from 'expo-linear-gradient';
import { setItem } from 'utils/storage';
import { CustomAlert } from './CustomAlert';

interface RegisterScreenProps {
  navigation: any;
  onLoginSuccess?: (userId: string) => void;
}

export default function RegisterScreen({ navigation, onLoginSuccess }: RegisterScreenProps) {
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [showKycModal, setShowKycModal] = useState(false);

  // KYC Fields
  const [aadharNumber, setAadharNumber] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [aadharFront, setAadharFront] = useState('');
  const [aadharBack, setAadharBack] = useState('');
  const [isKycVerified, setIsKycVerified] = useState(false);

  // Alert state
  const [alert, setAlert] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info' as 'success' | 'error' | 'info',
  });

  const showAlert = (
    title: string,
    message: string,
    type: 'success' | 'error' | 'info' = 'info'
  ) => {
    setAlert({ visible: true, title, message, type });
  };

  const closeAlert = () => {
    setAlert({ ...alert, visible: false });
  };

  const generateUserId = () => {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const generateAccessToken = () => {
    return `token_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`;
  };

  const handleContinue = async () => {
    if (!phone.trim() || phone.length !== 10) {
      showAlert('Error', 'Please enter a valid 10-digit phone number', 'error');
      return;
    }
    if (!name.trim()) {
      showAlert('Error', 'Please enter your name', 'error');
      return;
    }
    if (!address.trim()) {
      showAlert('Error', 'Please enter your address', 'error');
      return;
    }

    try {
      const userId = generateUserId();
      const accessToken = generateAccessToken();

      const userData = {
        userId,
        phone,
        name,
        address,
        isKycVerified,
        kycDetails: isKycVerified
          ? {
              aadharNumber,
              dateOfBirth,
              fatherName,
              aadharFront,
              aadharBack,
            }
          : null,
        createdAt: new Date().toISOString(),
      };

      await setItem('user_data', JSON.stringify(userData));
      await setItem('access_token', accessToken);
      await setItem('userId', userId);

      console.log('checking id:', userId);

      showAlert('Success', 'Registration completed successfully!', 'success');

      if (onLoginSuccess) onLoginSuccess(userId);
      setTimeout(() => navigation.navigate('Profile', { userId }), 1500);
    } catch (error) {
      showAlert('Error', 'Failed to save user data', 'error');
      console.error('Registration error:', error);
    }
  };

  const handleKycSubmit = () => {
    if (!aadharNumber.trim() || aadharNumber.length !== 12) {
      showAlert('Error', 'Please enter a valid 12-digit Aadhar number', 'error');
      return;
    }
    if (!dateOfBirth.trim()) {
      showAlert('Error', 'Please enter your date of birth', 'error');
      return;
    }
    if (!fatherName.trim()) {
      showAlert('Error', "Please enter your father's name", 'error');
      return;
    }
    if (!aadharFront.trim() || !aadharBack.trim()) {
      showAlert('Error', 'Please provide both Aadhar card images', 'error');
      return;
    }

    setIsKycVerified(true);
    setShowKycModal(false);
    showAlert('Success', 'KYC verification completed!', 'success');
  };

  const simulateImagePicker = (side: 'front' | 'back') => {
    const mockImageUri = `aadhar_${side}_${Date.now()}.jpg`;
    if (side === 'front') {
      setAadharFront(mockImageUri);
    } else {
      setAadharBack(mockImageUri);
    }
    showAlert('Success', `Aadhar ${side} uploaded successfully`, 'success');
  };

  return (
    <Container>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back to Login</Text>
          </TouchableOpacity>

          <Image
            source={require('../assets/logo_text.png')}
            alt="logo"
            style={{ height: 120, width: 120, alignSelf: 'center' }}
            resizeMode="contain"
          />
          <Text style={styles.heading}>Enter your phone number</Text>
          <Text style={styles.subheading}>
            We'll send you a text with verification code. Standard tariff may apply.
          </Text>

          <TextInput
            value={phone}
            onChangeText={setPhone}
            placeholder="Phone number"
            placeholderTextColor="#999"
            keyboardType="numeric"
            maxLength={10}
            style={styles.input}
          />

          <Text style={styles.heading}>Enter your Name</Text>
          <Text style={styles.subheading}>
            This name will be used during verification if you opt in as service provider in the
            future
          </Text>

          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Name"
            placeholderTextColor="#999"
            style={styles.input}
          />

          <Text style={styles.heading}>Address</Text>
          <Text style={styles.subheading}>
            This will be used as your default address, you can change it later as well from settings
          </Text>

          <TextInput
            value={address}
            onChangeText={setAddress}
            placeholder="Default Address"
            placeholderTextColor="#999"
            multiline
            numberOfLines={3}
            style={[styles.input, styles.textArea]}
          />

          <TouchableOpacity
            style={[styles.kycButton, isKycVerified && styles.kycButtonVerified]}
            onPress={() => setShowKycModal(true)}>
            <Text style={[styles.kycButtonText, isKycVerified && styles.kycButtonTextVerified]}>
              {isKycVerified ? '✓ KYC Verified' : 'Complete KYC Verification (Optional)'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
            <LinearGradient
              colors={['#0072FF', '#002D72']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.continueButton}>
              <Text style={styles.continueButtonText}>CONTINUE</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* KYC Verification Modal */}
      <Modal
        visible={showKycModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowKycModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>KYC Verification - Level 1</Text>
              <TouchableOpacity onPress={() => setShowKycModal(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalScroll}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}>
              <Text style={styles.modalLabel}>Aadhar Card Number</Text>
              <TextInput
                value={aadharNumber}
                onChangeText={setAadharNumber}
                placeholder="Enter 12-digit Aadhar number"
                placeholderTextColor="#999"
                keyboardType="numeric"
                maxLength={12}
                style={styles.modalInput}
              />

              <Text style={styles.modalLabel}>Date of Birth</Text>
              <TextInput
                value={dateOfBirth}
                onChangeText={setDateOfBirth}
                placeholder="DD/MM/YYYY"
                placeholderTextColor="#999"
                style={styles.modalInput}
              />

              <Text style={styles.modalLabel}>Father's Name</Text>
              <TextInput
                value={fatherName}
                onChangeText={setFatherName}
                placeholder="Enter father's name"
                placeholderTextColor="#999"
                style={styles.modalInput}
              />

              <Text style={styles.modalLabel}>Upload Aadhar Card</Text>

              <TouchableOpacity
                style={styles.uploadButton}
                onPress={() => simulateImagePicker('front')}>
                <Text style={styles.uploadButtonText}>
                  {aadharFront ? '✓ Front Side Uploaded' : '📄 Upload Front Side'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.uploadButton}
                onPress={() => simulateImagePicker('back')}>
                <Text style={styles.uploadButtonText}>
                  {aadharBack ? '✓ Back Side Uploaded' : '📄 Upload Back Side'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.submitKycButton} onPress={handleKycSubmit}>
                <Text style={styles.submitKycButtonText}>Submit KYC</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Custom Alert */}
      <CustomAlert
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        onClose={closeAlert}
      />
    </Container>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  content: {
    width: '100%',
  },
  backButton: {
    marginBottom: 10,
    paddingVertical: 8,
  },
  backButtonText: {
    color: '#0066CC',
    fontSize: 15,
    fontWeight: '600',
  },
  heading: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginTop: 24,
    marginBottom: 8,
  },
  subheading: {
    fontSize: 13,
    color: '#666',
    marginBottom: 16,
    lineHeight: 18,
  },
  input: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#000',
    marginBottom: 8,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  kycButton: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#0066CC',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  kycButtonVerified: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
  },
  kycButtonText: {
    color: '#0066CC',
    fontSize: 15,
    fontWeight: '600',
  },
  kycButtonTextVerified: {
    color: '#4CAF50',
  },
  continueButton: {
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    width: '100%',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  closeButton: {
    fontSize: 24,
    color: '#666',
    paddingHorizontal: 8,
  },
  modalScroll: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  modalLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
    marginTop: 12,
  },
  modalInput: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#000',
  },
  uploadButton: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#0066CC',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  uploadButtonText: {
    color: '#0066CC',
    fontSize: 14,
    fontWeight: '600',
  },
  submitKycButton: {
    backgroundColor: '#0066CC',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 10,
  },
  submitKycButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
