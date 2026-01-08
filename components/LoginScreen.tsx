import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../utils/config';

interface LoginScreenProps {
  navigation: any;
  onLoginSuccess?: (userId: string) => void;
}

const { width } = Dimensions.get('window');

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation, onLoginSuccess = () => {} }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // OTP input refs
  const otpInputs = useRef<Array<TextInput | null>>([null, null, null, null]);

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [step]);

  const validatePhoneNumber = (phone: string) => /^[6-9]\d{9}$/.test(phone);

  const handlePhoneSubmit = async () => {
    setError('');
    if (!validatePhoneNumber(phoneNumber)) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mobile: phoneNumber,
          email: `${phoneNumber}@temp.com`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send OTP');
      }

      fadeAnim.setValue(0);
      slideAnim.setValue(50);

      setStep('otp');

      setTimeout(() => {
        otpInputs.current[0]?.focus();
      }, 300);
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (value: string, index: number) => {
    const numericValue = value.replace(/[^0-9]/g, '');

    if (numericValue.length > 1) {
      const digits = numericValue.slice(0, 4).split('');
      const newOtp = [...otp];
      digits.forEach((digit, i) => {
        if (index + i < 4) {
          newOtp[index + i] = digit;
        }
      });
      setOtp(newOtp);

      const nextIndex = Math.min(index + digits.length, 3);
      otpInputs.current[nextIndex]?.focus();
    } else {
      const newOtp = [...otp];
      newOtp[index] = numericValue;
      setOtp(newOtp);

      if (numericValue && index < 3) {
        otpInputs.current[index + 1]?.focus();
      }
    }
  };

  const handleOtpKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputs.current[index - 1]?.focus();
    }
  };

  const handleOtpSubmit = async () => {
    setError('');
    const otpString = otp.join('');

    if (otpString.length !== 4) {
      setError('Please enter the complete 4-digit OTP');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mobile: phoneNumber,
          otp: otpString,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Invalid OTP');
      }

      const { user, accessToken, refreshToken } = data.data;

      await AsyncStorage.setItem('access_token', accessToken);
      await AsyncStorage.setItem('refresh_token', refreshToken);
      await AsyncStorage.setItem('user_data', JSON.stringify(user));
      await AsyncStorage.setItem('userId', user.id);

      onLoginSuccess(user.id);
    } catch (err: any) {
      setError(err.message || 'Invalid OTP. Please try again.');
      setOtp(['', '', '', '']);
      otpInputs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/resend-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mobile: phoneNumber,
          email: `${ phoneNumber }@temp.com`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to resend OTP');
      }

      setOtp(['', '', '', '']);
      otpInputs.current[0]?.focus();
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    fadeAnim.setValue(0);
    slideAnim.setValue(50);
    setStep('phone');
    setOtp(['', '', '', '']);
    setError('');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}>
          {step === 'phone' ? (
            <>
              <View style={styles.logoContainer}>
                <View style={styles.logoCircle}>
                  <Image
                    source={require('../assets/logo_text.png')}
                    resizeMode="contain"
                    style={styles.logo}
                  />
                </View>
              </View>

              <View style={styles.headerContainer}>
                <Text style={styles.title}>Welcome Back</Text>
                <Text style={styles.subtitle}>Enter your mobile number to continue</Text>
              </View>

              <View style={styles.inputContainer}>
                <View style={styles.phoneInputWrapper}>
                  <View style={styles.countryCode}>
                    <Text style={styles.countryCodeText}>🇮🇳 +91</Text>
                  </View>
                  <TextInput
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    placeholder="Mobile Number"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                    maxLength={10}
                    editable={!loading}
                    style={styles.phoneInput}
                    autoFocus={true}
                  />
                </View>
              </View>

              {error ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>⚠️ {error}</Text>
                </View>
              ) : null}

              <Pressable
                onPress={handlePhoneSubmit}
                disabled={loading || phoneNumber.length !== 10}
                style={({ pressed }) => [
                  styles.primaryButton,
                  (loading || phoneNumber.length !== 10) && styles.buttonDisabled,
                  pressed && styles.buttonPressed,
                ]}>
                {loading ? (
                  <ActivityIndicator color="#121212" size="small" />
                ) : (
                  <Text style={styles.primaryButtonText}>Send OTP</Text>
                )}
              </Pressable>

              <View style={styles.footer}>
                <Text style={styles.footerText}>
                  By continuing, you agree to our <Text style={styles.link}>Terms of Service</Text>{' '}
                  and <Text style={styles.link}>Privacy Policy</Text>
                </Text>
              </View>
            </>
          ) : (
            <>
              <Pressable onPress={handleBack} style={styles.backButton}>
                <Text style={styles.backIcon}>←</Text>
                <Text style={styles.backText}>Back</Text>
              </Pressable>

              <View style={styles.otpIconContainer}>
                <View style={styles.otpIcon}>
                  <Text style={styles.otpIconText}>📱</Text>
                </View>
              </View>

              <View style={styles.headerContainer}>
                <Text style={styles.title}>Verify Your Number</Text>
                <Text style={styles.subtitle}>
                  Enter the 4-digit code sent to{'\n'}
                  <Text style={styles.phoneHighlight}>+91 {phoneNumber}</Text>
                </Text>
              </View>

              <View style={styles.otpContainer}>
                {[0, 1, 2, 3].map((index) => (
                  <View key={index} style={styles.otpInputWrapper}>
                    <TextInput
                      ref={(ref) => {
                        otpInputs.current[index] = ref;
                      }}
                      value={otp[index]}
                      onChangeText={(value) => handleOtpChange(value, index)}
                      onKeyPress={(e) => handleOtpKeyPress(e, index)}
                      keyboardType="numeric"
                      maxLength={1}
                      selectTextOnFocus
                      editable={!loading}
                      style={[
                        styles.otpInput,
                        otp[index] && styles.otpInputFilled,
                        error && styles.otpInputError,
                      ]}
                    />
                  </View>
                ))}
              </View>

              {error ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>⚠️ {error}</Text>
                </View>
              ) : null}

              <Pressable onPress={handleResendOtp} disabled={loading} style={styles.resendButton}>
                <Text style={styles.resendText}>
                  Didn't receive the code? <Text style={styles.resendLink}>Resend OTP</Text>
                </Text>
              </Pressable>

              <Pressable
                onPress={handleOtpSubmit}
                disabled={loading || otp.join('').length !== 4}
                style={({ pressed }) => [
                  styles.primaryButton,
                  (loading || otp.join('').length !== 4) && styles.buttonDisabled,
                  pressed && styles.buttonPressed,
                ]}>
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.primaryButtonText}>Verify & Continue</Text>
                )}
              </Pressable>
            </>
          )}
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F0F9FF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  logo: {
    width: 60,
    height: 60,
  },
  headerContainer: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  phoneHighlight: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  inputContainer: {
    marginBottom: 24,
  },
  phoneInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    overflow: 'hidden',
  },
  countryCode: {
    paddingHorizontal: 16,
    paddingVertical: 18,
    borderRightWidth: 2,
    borderRightColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  countryCodeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  phoneInput: {
    flex: 1,
    fontSize: 18,
    color: '#111827',
    paddingHorizontal: 16,
    paddingVertical: 18,
    fontWeight: '500',
  },
  otpIconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  otpIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpIconText: {
    fontSize: 40,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
    paddingHorizontal: 10,
  },
  otpInputWrapper: {
    marginHorizontal: 6,
  },
  otpInput: {
    width: 60,
    height: 60,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  otpInputFilled: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  otpInputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  primaryButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    marginHorizontal: 4,
    color: "#000000"
  },
  buttonDisabled: {
    backgroundColor: '#BFDBFE',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonPressed: {
    backgroundColor: '#2563EB',
  },
  primaryButtonText: {
    color: '#3B82F6',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 8,
  },
  backIcon: {
    fontSize: 24,
    color: '#3B82F6',
    marginRight: 8,
  },
  backText: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '600',
  },
  resendButton: {
    marginBottom: 24,
    paddingVertical: 8,
  },
  resendText: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
  },
  resendLink: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  errorContainer: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  errorText: {
    fontSize: 14,
    color: '#DC2626',
    textAlign: 'center',
    fontWeight: '500',
  },
  footer: {
    marginTop: 24,
    paddingTop: 24,
  },
  footerText: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
  link: {
    color: '#3B82F6',
    fontWeight: '600',
  },
});

export default LoginScreen;