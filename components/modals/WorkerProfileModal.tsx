// components/modals/WorkerProfileModal.tsx - Enhanced worker profile form with dynamic services

import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Wrench, ChevronDown, ChevronUp } from 'lucide-react-native';
import { WorkerFormData, WorkerProfile, FlowState } from '../../types';
import { API_BASE_URL, STORAGE_KEYS } from '../../constants';
import { colors, sharedStyles } from '../styles/shared';
import { authorizedFetch } from '../../utils/authorizedFetch';
import { useToast } from '../../context/ToastContext';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Service {
  serviceId: string;
  name: string;
  serviceCategory: string;
  description: string;
  icon: string;
  color: string;
}

interface CategoryWithServices {
  category: string;
  services: Service[];
  expanded: boolean;
}

interface WorkerProfileModalProps {
  visible: boolean;
  flowState: FlowState;
  isEditing: boolean;
  existingProfile: WorkerProfile | null;
  modalAnim: Animated.Value;
  onClose: () => void;
  onSuccess: () => void;
}

export const WorkerProfileModal: React.FC<WorkerProfileModalProps> = ({
  visible,
  flowState,
  isEditing,
  existingProfile,
  modalAnim,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [loadingServices, setLoadingServices] = useState(false);
  const [categoriesWithServices, setCategoriesWithServices] = useState<CategoryWithServices[]>([]);

  const toast = useToast();
  
  const [formData, setFormData] = useState<WorkerFormData>({
    categories: [],
    subcategories: [],
    experienceYears: '',
    description: '',
    licenseNumber: '',
    serviceAreas: '',
  });

  // Fetch services and categories from backend
  useEffect(() => {
    if (visible) {
      fetchServicesAndCategories();
    }
  }, [visible]);

  const fetchServicesAndCategories = async () => {
    try {
      setLoadingServices(true);
      
      // Fetch all services
      const servicesResponse = await authorizedFetch(`${API_BASE_URL}/services`);
      const servicesData = await servicesResponse.json();

      if (servicesData.success && servicesData.data) {
        const services: Service[] = servicesData.data.services || [];
        
        // Group services by category
        const grouped: { [key: string]: Service[] } = {};
        services.forEach((service) => {
          if (!grouped[service.serviceCategory]) {
            grouped[service.serviceCategory] = [];
          }
          grouped[service.serviceCategory].push(service);
        });

        // Convert to array with expanded state
        const categoriesArray: CategoryWithServices[] = Object.entries(grouped).map(
          ([category, services]) => ({
            category,
            services,
            expanded: false,
          })
        );

        setCategoriesWithServices(categoriesArray);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
      // toast.showWarning('Error', 'Failed to load services. Please try again.');
    } finally {
      setLoadingServices(false);
    }
  };

  // Pre-fill form when editing
  useEffect(() => {
    if (isEditing && existingProfile) {
      setFormData({
        categories: existingProfile.categories || [],
        subcategories: existingProfile.subcategories || [],
        experienceYears: existingProfile.experience_years?.toString() || '',
        description: existingProfile.description || '',
        licenseNumber: existingProfile.license_number || '',
        serviceAreas: existingProfile.service_areas?.join(', ') || '',
      });
    } else if (!isEditing) {
      setFormData({
        categories: [],
        subcategories: [],
        experienceYears: '',
        description: '',
        licenseNumber: '',
        serviceAreas: '',
      });
    }
  }, [isEditing, existingProfile, visible]);

  const updateFormData = (key: keyof WorkerFormData, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const toggleCategory = (category: string) => {
    if (formData.categories.includes(category)) {
      // Remove category and all its services
      const categoryServices = categoriesWithServices.find((c) => c.category === category);
      const serviceNames = categoryServices?.services.map((s) => s.name) || [];
      
      updateFormData(
        'categories',
        formData.categories.filter((c) => c !== category)
      );
      updateFormData(
        'subcategories',
        formData.subcategories.filter((s) => !serviceNames.includes(s))
      );
    } else {
      updateFormData('categories', [...formData.categories, category]);
    }
  };

  const toggleService = (serviceName: string, category: string) => {
    // Ensure category is selected first
    if (!formData.categories.includes(category)) {
      updateFormData('categories', [...formData.categories, category]);
    }

    if (formData.subcategories.includes(serviceName)) {
      updateFormData(
        'subcategories',
        formData.subcategories.filter((s) => s !== serviceName)
      );
    } else {
      updateFormData('subcategories', [...formData.subcategories, serviceName]);
    }
  };

  const toggleCategoryExpanded = (category: string) => {
    setCategoriesWithServices((prev) =>
      prev.map((cat) =>
        cat.category === category ? { ...cat, expanded: !cat.expanded } : cat
      )
    );
  };

  const handleSubmit = async () => {
    if (
      formData.categories.length === 0 ||
      formData.subcategories.length === 0 ||
      !formData.experienceYears.trim() ||
      !formData.description.trim() ||
      !formData.serviceAreas.trim()
    ) {
      toast.showWarning('Error', 'Please fill all required fields and select at least one service');
      return;
    }

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

      const serviceAreasArray = formData.serviceAreas.split(',').map((s) => s.trim());

      const payload = {
        categories: formData.categories,
        subcategories: formData.subcategories,
        experience_years: parseInt(formData.experienceYears),
        description: formData.description,
        license_number: formData.licenseNumber || undefined,
        service_areas: serviceAreasArray,
        latitude: 21.1702,
        longitude: 72.8311,
      };

      const method = isEditing ? 'PUT' : 'POST';
      const url = `${API_BASE_URL}/worker/profile`;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        toast.showWarning(
          'Success! 🎉',
          isEditing
            ? 'Your worker profile has been updated!'
            : 'Your worker profile has been created!'
        );
        onSuccess();
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      console.error('Error saving worker profile:', error);
      toast.showWarning('Error', error.message || 'Failed to save worker profile');
    } finally {
      setLoading(false);
    }
  };

  const selectedCategoryServices = categoriesWithServices.filter((cat) =>
    formData.categories.includes(cat.category)
  );

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent
      onRequestClose={onClose}>
      <View style={sharedStyles.modalOverlay}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
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
          ]}>
          <View style={sharedStyles.modalHandle} />

          <View style={sharedStyles.modalHeader}>
            <View>
              <Text style={sharedStyles.modalTitle}>
                {isEditing ? 'Edit Profile' : 'Worker Profile'}
              </Text>
              <Text style={sharedStyles.modalSubtitle}>
                {formData.categories.length > 0
                  ? `${formData.categories.length} categories, ${formData.subcategories.length} services selected`
                  : 'Share your expertise'}
              </Text>
            </View>
            <TouchableOpacity
              style={sharedStyles.modalCloseButton}
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <X size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={sharedStyles.modalScroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled">
            <Text style={styles.stepTitle}>
              {isEditing ? 'Edit Your Worker Profile' : 'Create Your Worker Profile'}
            </Text>

            {/* Loading State */}
            {loadingServices ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Loading services...</Text>
              </View>
            ) : (
              <>
                {/* Categories & Services Selection */}
                <View style={sharedStyles.inputGroup}>
                  <Text style={sharedStyles.inputLabel}>
                    Select Categories & Services <Text style={sharedStyles.required}>*</Text>
                  </Text>
                  <Text style={styles.helperText}>
                    Choose categories and specific services you provide
                  </Text>

                  {categoriesWithServices.map((categoryData) => {
                    const isCategorySelected = formData.categories.includes(categoryData.category);
                    const categoryServicesCount = categoryData.services.filter((s) =>
                      formData.subcategories.includes(s.name)
                    ).length;

                    return (
                      <View key={categoryData.category} style={styles.categoryBlock}>
                        {/* Category Header */}
                        <TouchableOpacity
                          style={[
                            styles.categoryHeader,
                            isCategorySelected && styles.categoryHeaderSelected,
                          ]}
                          onPress={() => toggleCategory(categoryData.category)}>
                          <View style={styles.categoryHeaderLeft}>
                            <View
                              style={[
                                styles.categoryCheckbox,
                                isCategorySelected && styles.categoryCheckboxSelected,
                              ]}>
                              {isCategorySelected && (
                                <Text style={styles.categoryCheckboxText}>✓</Text>
                              )}
                            </View>
                            <View>
                              <Text
                                style={[
                                  styles.categoryHeaderText,
                                  isCategorySelected && styles.categoryHeaderTextSelected,
                                ]}>
                                {categoryData.category}
                              </Text>
                              <Text style={styles.categoryServicesCount}>
                                {categoryData.services.length} services
                                {categoryServicesCount > 0 &&
                                  ` • ${categoryServicesCount} selected`}
                              </Text>
                            </View>
                          </View>
                          <TouchableOpacity
                            onPress={() => toggleCategoryExpanded(categoryData.category)}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                            {categoryData.expanded ? (
                              <ChevronUp size={20} color={colors.textSecondary} />
                            ) : (
                              <ChevronDown size={20} color={colors.textSecondary} />
                            )}
                          </TouchableOpacity>
                        </TouchableOpacity>

                        {/* Services List */}
                        {categoryData.expanded && (
                          <View style={styles.servicesContainer}>
                            {categoryData.services.map((service) => {
                              const isSelected = formData.subcategories.includes(service.name);
                              return (
                                <TouchableOpacity
                                  key={service.serviceId}
                                  style={[
                                    styles.serviceChip,
                                    isSelected && styles.serviceChipSelected,
                                  ]}
                                  onPress={() =>
                                    toggleService(service.name, categoryData.category)
                                  }>
                                  <View
                                    style={[
                                      styles.serviceCheckbox,
                                      isSelected && styles.serviceCheckboxSelected,
                                    ]}>
                                    {isSelected && (
                                      <Text style={styles.serviceCheckboxText}>✓</Text>
                                    )}
                                  </View>
                                  <View style={styles.serviceInfo}>
                                    <Text
                                      style={[
                                        styles.serviceChipText,
                                        isSelected && styles.serviceChipTextSelected,
                                      ]}>
                                      {service.name}
                                    </Text>
                                    <Text
                                      style={styles.serviceDescription}
                                      numberOfLines={1}>
                                      {service.description}
                                    </Text>
                                  </View>
                                </TouchableOpacity>
                              );
                            })}
                          </View>
                        )}
                      </View>
                    );
                  })}
                </View>

                {/* Selected Summary */}
                {formData.subcategories.length > 0 && (
                  <View style={styles.summaryCard}>
                    <Text style={styles.summaryTitle}>Selected Services</Text>
                    <View style={styles.summaryChips}>
                      {formData.subcategories.map((service) => (
                        <View key={service} style={styles.summaryChip}>
                          <Text style={styles.summaryChipText}>{service}</Text>
                          <TouchableOpacity
                            onPress={() => {
                              const category = selectedCategoryServices.find((cat) =>
                                cat.services.some((s) => s.name === service)
                              )?.category;
                              if (category) {
                                toggleService(service, category);
                              }
                            }}
                            hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}>
                            <X size={14} color={colors.primary} />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {/* Experience Years */}
                <View style={sharedStyles.inputGroup}>
                  <Text style={sharedStyles.inputLabel}>
                    Years of Experience <Text style={sharedStyles.required}>*</Text>
                  </Text>
                  <TextInput
                    value={formData.experienceYears}
                    onChangeText={(val) => updateFormData('experienceYears', val)}
                    placeholder="e.g., 5"
                    placeholderTextColor="#9CA3AF"
                    style={sharedStyles.textInput}
                    keyboardType="numeric"
                  />
                </View>

                {/* Description */}
                <View style={sharedStyles.inputGroup}>
                  <Text style={sharedStyles.inputLabel}>
                    Description <Text style={sharedStyles.required}>*</Text>
                  </Text>
                  <TextInput
                    value={formData.description}
                    onChangeText={(val) => updateFormData('description', val)}
                    placeholder="Describe your skills and experience"
                    placeholderTextColor="#9CA3AF"
                    style={[sharedStyles.textInput, sharedStyles.textArea]}
                    multiline
                    numberOfLines={4}
                  />
                </View>

                {/* Hourly Rate */}
                {/* <View style={sharedStyles.inputGroup}>
                  <Text style={sharedStyles.inputLabel}>
                    Hourly Rate (₹) <Text style={sharedStyles.required}>*</Text>
                  </Text>
                  <TextInput
                    value={formData.hourlyRate}
                    onChangeText={(val) => updateFormData('hourlyRate', val)}
                    placeholder="e.g., 200"
                    placeholderTextColor="#9CA3AF"
                    style={sharedStyles.textInput}
                    keyboardType="numeric"
                  />
                </View> */}

                {/* License Number */}
                <View style={sharedStyles.inputGroup}>
                  <Text style={sharedStyles.inputLabel}>License Number (Optional)</Text>
                  <TextInput
                    value={formData.licenseNumber}
                    onChangeText={(val) => updateFormData('licenseNumber', val)}
                    placeholder="Enter license number if applicable"
                    placeholderTextColor="#9CA3AF"
                    style={sharedStyles.textInput}
                  />
                </View>

                {/* Service Areas */}
                <View style={sharedStyles.inputGroup}>
                  <Text style={sharedStyles.inputLabel}>
                    Service Areas <Text style={sharedStyles.required}>*</Text>
                  </Text>
                  <TextInput
                    value={formData.serviceAreas}
                    onChangeText={(val) => updateFormData('serviceAreas', val)}
                    placeholder="e.g., Surat, Navsari, Vapi (comma-separated)"
                    placeholderTextColor="#9CA3AF"
                    style={sharedStyles.textInput}
                  />
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                  style={sharedStyles.primaryButton}
                  onPress={handleSubmit}
                  disabled={loading}>
                  <LinearGradient
                    colors={[colors.primary, colors.primaryDark]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={sharedStyles.primaryButtonGradient}>
                    {loading ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <>
                        <Wrench size={20} color="#FFFFFF" />
                        <Text style={sharedStyles.primaryButtonText}>
                          {isEditing ? 'Update Profile' : 'Create Profile'}
                        </Text>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </>
            )}

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
  helperText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.textSecondary,
  },

  /* Category Block */
  categoryBlock: {
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F9FAFB',
  },
  categoryHeaderSelected: {
    backgroundColor: '#EFF6FF',
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  categoryHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryCheckboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryCheckboxText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  categoryHeaderText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  categoryHeaderTextSelected: {
    color: colors.primary,
    fontWeight: '700',
  },
  categoryServicesCount: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },

  /* Services Container */
  servicesContainer: {
    padding: 12,
    backgroundColor: '#FFFFFF',
    gap: 8,
  },
  serviceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: colors.border,
  },
  serviceChipSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: colors.primary,
  },
  serviceCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.border,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceCheckboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  serviceCheckboxText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  serviceInfo: {
    flex: 1,
  },
  serviceChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  serviceChipTextSelected: {
    color: colors.primary,
    fontWeight: '700',
  },
  serviceDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },

  /* Summary Card */
  summaryCard: {
    backgroundColor: '#F0F9FF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 12,
  },
  summaryChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  summaryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 6,
    paddingLeft: 12,
    paddingRight: 8,
    borderRadius: 16,
    gap: 6,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  summaryChipText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
  },
});

export default WorkerProfileModal;