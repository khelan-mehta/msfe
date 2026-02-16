import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { X, Camera, CheckCircle, ChevronRight } from 'lucide-react-native';
import { API_BASE_URL } from '../../constants';
import { colors, sharedStyles } from '../styles/shared';
import { useToast } from '../../context/ToastContext';
import { uploadDocument, uploadProfilePhoto } from '../../utils/fileUpload';
import { uploadImageAsBase64 } from '../../utils/base64Upload';
import { authorizedFetch } from '../../utils/authorizedFetch';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface EditProfileModalProps {
  visible: boolean;
  userProfile: any;
  modalAnim: Animated.Value;
  onClose: () => void;
  onSuccess: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  visible,
  userProfile,
  modalAnim,
  onClose,
  onSuccess,
}) => {
  const toast = useToast();

  // Status: idle | uploading (image) | saving (profile) | success | error
  const [status, setStatus] = useState<'idle' | 'uploading' | 'saving' | 'success' | 'error'>('idle');

  const [name, setName] = useState(userProfile?.name || '');
  const [email, setEmail] = useState(userProfile?.email || '');
  const [city, setCity] = useState(userProfile?.city || '');
  const [pincode, setPincode] = useState(userProfile?.pincode || '');
  const [profilePhoto, setProfilePhoto] = useState<string | null>(userProfile?.profile_photo || null);

  useEffect(() => {
    setName(userProfile?.name || '');
    setEmail(userProfile?.email || '');
    setCity(userProfile?.city || '');
    setPincode(userProfile?.pincode || '');
    setProfilePhoto(userProfile?.profile_photo || null);
  }, [userProfile, visible]);

  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        toast.showWarning('Permission Required', 'Please allow access to your photo library');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadProfileImage(result.assets[0].uri);
      }
    } catch (error: any) {
      console.error('Error picking image:', error);
      toast.showWarning('Error', 'Failed to pick image');
    }
  };

  const uploadProfileImage = async (uri: string) => {
    try {
      setStatus('uploading');

      // 1) Try direct profile photo endpoint (more tolerant on server)
      let res = await uploadProfilePhoto(uri).catch((e) => {
        console.warn('uploadProfilePhoto failed:', e);
        return null;
      });

      // 2) If that fails, try base64 upload
      if (!res || !res.success) {
        res = await uploadImageAsBase64(uri, 'selfie').catch((e) => {
          console.warn('uploadImageAsBase64 failed:', e);
          return null;
        });
      }

      // 3) Last resort: multipart document upload
      if (!res || !res.success) {
        res = await uploadDocument(uri, 'selfie').catch((e) => {
          console.warn('uploadDocument failed:', e);
          return null;
        });
      }

      if (!res || !res.success) throw new Error(res?.error || 'Upload failed');

      setProfilePhoto(res.url || null);
      toast.showSuccess('Success', 'Profile image uploaded');
      setStatus('idle');
    } catch (error: any) {
      console.error('Error uploading profile image:', error);
      toast.showWarning('Error', error.message || 'Failed to upload image');
      setStatus('error');
      setTimeout(() => setStatus('idle'), 1500);
    }
  };

  const handleSave = async () => {
    try {
      setStatus('saving');

      const payload: any = {
        updated_at: new Date().toISOString(),
      };

      if (name !== (userProfile?.name || '')) payload.name = name;
      if (email !== (userProfile?.email || '')) payload.email = email;
      if (city !== (userProfile?.city || '')) payload.city = city;
      if (pincode !== (userProfile?.pincode || '')) payload.pincode = pincode;
      if (profilePhoto !== (userProfile?.profile_photo || null)) payload.profile_photo = profilePhoto;

      const response = await authorizedFetch(`${API_BASE_URL}/user/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const json = await response.json().catch(() => null);
        throw new Error(json?.message || 'Failed to update profile');
      }

      const result = await response.json();

      if (!result.success) throw new Error(result.message || 'Failed to update profile');

      // Success: show overlay then close
      setStatus('success');
      toast.showSuccess('Profile updated', 'Personal information updated successfully');

      setTimeout(() => {
        onSuccess();
        onClose();
        setStatus('idle');
      }, 900);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.showWarning('Error', error.message || 'Failed to update profile');
      setStatus('error');
      setTimeout(() => setStatus('idle'), 1500);
    }
  };

  return (
    <Modal visible={visible} animationType="none" transparent onRequestClose={onClose}>
      <View style={sharedStyles.modalOverlay}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />

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
              <Text style={sharedStyles.modalTitle}>Edit Profile</Text>
              <Text style={sharedStyles.modalSubtitle}>Update your personal information</Text>
            </View>

            <TouchableOpacity
              style={sharedStyles.modalCloseButton}
              onPress={onClose}
            >
              <X size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Loading / Upload / Saving overlays */}
          {status !== 'idle' && (
            <View style={styles.overlay} pointerEvents="none">
              {status === 'uploading' && (
                <View style={styles.overlayContent}>
                  <ActivityIndicator size="large" color={colors.purple} />
                  <Text style={styles.overlayText}>Uploading image...</Text>
                </View>
              )}

              {status === 'saving' && (
                <View style={styles.overlayContent}>
                  <ActivityIndicator size="large" color={colors.purple} />
                  <Text style={styles.overlayText}>Saving changes...</Text>
                </View>
              )}

              {status === 'success' && (
                <View style={styles.overlayContent}>
                  <View style={styles.successIconContainer}>
                    <CheckCircle size={64} color={colors.success} fill={colors.success} />
                  </View>
                  <Text style={styles.overlayText}>Saved</Text>
                </View>
              )}

              {status === 'error' && (
                <View style={styles.overlayContent}>
                  <Text style={styles.overlayText}>An error occurred</Text>
                </View>
              )}
            </View>
          )}

          <ScrollView style={sharedStyles.modalScroll} contentContainerStyle={{ paddingBottom: 40 }}>
            <View style={{ alignItems: 'center', marginBottom: 12 }}>
              <TouchableOpacity style={styles.avatarContainer} onPress={pickImage} disabled={status !== 'idle'}>
                {profilePhoto ? (
                  <Image source={{ uri: profilePhoto }} style={styles.avatar} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Camera size={26} color={colors.purple} />
                  </View>
                )}
              </TouchableOpacity>
              <Text style={styles.avatarHint}>Tap to change profile photo</Text>
            </View>

            <View style={sharedStyles.inputGroup}>
              <Text style={sharedStyles.inputLabel}>Full Name</Text>
              <TextInput value={name} onChangeText={setName} placeholder="Full name" style={sharedStyles.textInput} editable={status === 'idle'} />
            </View>

            <View style={sharedStyles.inputGroup}>
              <Text style={sharedStyles.inputLabel}>Email</Text>
              <TextInput value={email} onChangeText={setEmail} placeholder="Email" style={sharedStyles.textInput} keyboardType="email-address" editable={status === 'idle'} />
            </View>

            <View style={sharedStyles.inputGroup}>
              <Text style={sharedStyles.inputLabel}>City</Text>
              <TextInput value={city} onChangeText={setCity} placeholder="City" style={sharedStyles.textInput} editable={status === 'idle'} />
            </View>

            <View style={sharedStyles.inputGroup}>
              <Text style={sharedStyles.inputLabel}>Pincode</Text>
              <TextInput value={pincode} onChangeText={setPincode} placeholder="Pincode" style={sharedStyles.textInput} keyboardType={Platform.OS === 'web' ? 'numeric' : 'number-pad'} editable={status === 'idle'} />
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={status !== 'idle'}>
              <Text style={styles.saveButtonText}>{status === 'saving' ? 'Saving...' : 'Save'}</Text>
              {(status === 'saving' || status === 'uploading') && <ActivityIndicator size="small" color="#fff" style={{ marginLeft: 10 }} />}
            </TouchableOpacity>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  avatarContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    overflow: 'hidden',
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  avatarHint: {
    marginTop: 8,
    color: colors.textLight,
    fontSize: 12,
  },
  saveButton: {
    marginTop: 16,
    backgroundColor: colors.purple,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
    paddingHorizontal: 20,
  },
  overlayContent: {
    alignItems: 'center',
  },
  overlayText: {
    marginTop: 12,
    color: colors.text,
    fontSize: 16,
  },
  successIconContainer: {
    marginBottom: 8,
  },
});
