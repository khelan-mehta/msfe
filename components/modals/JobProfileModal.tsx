// components/modals/JobProfileModal.tsx - Job seeker profile form modal

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
  Switch,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Briefcase, Plus, Trash2 } from 'lucide-react-native';
import { JobSeekerFormData, JobSeekerProfile, JobFlowState, Education, WorkExperience } from '../../types';
import { API_BASE_URL, STORAGE_KEYS, JOB_TYPES, WORKER_CATEGORIES } from '../../constants';
import { colors, sharedStyles } from '../styles/shared';
import { authorizedFetch } from '../../utils/authorizedFetch';
import { useToast } from '../../context/ToastContext';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface JobProfileModalProps {
  visible: boolean;
  flowState: JobFlowState;
  isEditing: boolean;
  existingProfile: JobSeekerProfile | null;
  modalAnim: Animated.Value;
  onClose: () => void;
  onSuccess: () => void;
}

export const JobProfileModal: React.FC<JobProfileModalProps> = ({
  visible,
  flowState,
  isEditing,
  existingProfile,
  modalAnim,
  onClose,
  onSuccess,
}) => {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Basic Info, 2: Skills & Experience, 3: Preferences

  const [formData, setFormData] = useState<JobSeekerFormData>({
    fullName: '',
    headline: '',
    bio: '',
    skills: [],
    experienceYears: '',
    education: [],
    workExperience: [],
    preferredCategories: [],
    preferredJobTypes: [],
    preferredLocations: '',
    expectedSalaryMin: '',
    expectedSalaryMax: '',
    willingToRelocate: false,
    resumeUrl: '',
    portfolioUrl: '',
    linkedinUrl: '',
  });

  const [newSkill, setNewSkill] = useState('');

  // Pre-fill form when editing
  useEffect(() => {
    if (isEditing && existingProfile) {
      setFormData({
        fullName: existingProfile.full_name || '',
        headline: existingProfile.headline || '',
        bio: existingProfile.bio || '',
        skills: existingProfile.skills || [],
        experienceYears: existingProfile.experience_years?.toString() || '',
        education: existingProfile.education || [],
        workExperience: existingProfile.work_experience || [],
        preferredCategories: existingProfile.preferred_categories || [],
        preferredJobTypes: existingProfile.preferred_job_types || [],
        preferredLocations: existingProfile.preferred_locations?.join(', ') || '',
        expectedSalaryMin: existingProfile.expected_salary_min?.toString() || '',
        expectedSalaryMax: existingProfile.expected_salary_max?.toString() || '',
        willingToRelocate: existingProfile.willing_to_relocate || false,
        resumeUrl: existingProfile.resume_url || '',
        portfolioUrl: existingProfile.portfolio_url || '',
        linkedinUrl: existingProfile.linkedin_url || '',
      });
    } else if (!isEditing) {
      setFormData({
        fullName: '',
        headline: '',
        bio: '',
        skills: [],
        experienceYears: '',
        education: [],
        workExperience: [],
        preferredCategories: [],
        preferredJobTypes: [],
        preferredLocations: '',
        expectedSalaryMin: '',
        expectedSalaryMax: '',
        willingToRelocate: false,
        resumeUrl: '',
        portfolioUrl: '',
        linkedinUrl: '',
      });
      setStep(1);
    }
  }, [isEditing, existingProfile, visible]);

  const updateFormData = (key: keyof JobSeekerFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      updateFormData('skills', [...formData.skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    updateFormData('skills', formData.skills.filter((s) => s !== skill));
  };

  const toggleJobType = (jobType: string) => {
    if (formData.preferredJobTypes.includes(jobType)) {
      updateFormData('preferredJobTypes', formData.preferredJobTypes.filter((t) => t !== jobType));
    } else {
      updateFormData('preferredJobTypes', [...formData.preferredJobTypes, jobType]);
    }
  };

  const toggleCategory = (category: string) => {
    if (formData.preferredCategories.includes(category)) {
      updateFormData('preferredCategories', formData.preferredCategories.filter((c) => c !== category));
    } else {
      updateFormData('preferredCategories', [...formData.preferredCategories, category]);
    }
  };

  const validateStep = (stepNum: number): boolean => {
    switch (stepNum) {
      case 1:
        if (!formData.fullName.trim()) {
          toast.showWarning('Error', 'Please enter your full name');
          return false;
        }
        return true;
      case 2:
        if (formData.skills.length === 0) {
          toast.showWarning('Error', 'Please add at least one skill');
          return false;
        }
        return true;
      case 3:
        if (formData.preferredJobTypes.length === 0) {
          toast.showWarning('Error', 'Please select at least one job type');
          return false;
        }
        if (!formData.preferredLocations.trim()) {
          toast.showWarning('Error', 'Please enter preferred locations');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;

    try {
      setLoading(true);

      const locationsArray = formData.preferredLocations.split(',').map((s) => s.trim()).filter(Boolean);

      const payload = {
        full_name: formData.fullName,
        headline: formData.headline || undefined,
        bio: formData.bio || undefined,
        skills: formData.skills,
        experience_years: formData.experienceYears ? parseInt(formData.experienceYears) : undefined,
        education: formData.education,
        work_experience: formData.workExperience,
        preferred_categories: formData.preferredCategories,
        preferred_job_types: formData.preferredJobTypes,
        preferred_locations: locationsArray,
        expected_salary_min: formData.expectedSalaryMin ? parseFloat(formData.expectedSalaryMin) : undefined,
        expected_salary_max: formData.expectedSalaryMax ? parseFloat(formData.expectedSalaryMax) : undefined,
        willing_to_relocate: formData.willingToRelocate,
        resume_url: formData.resumeUrl || undefined,
        portfolio_url: formData.portfolioUrl || undefined,
        linkedin_url: formData.linkedinUrl || undefined,
      };

      const method = isEditing ? 'PUT' : 'POST';
      const url = `${API_BASE_URL}/job-seeker/profile`;

      const response = await authorizedFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        toast.showSuccess(
          'Success!',
          isEditing
            ? 'Your job profile has been updated!'
            : 'Your job profile has been created!'
        );
        onSuccess();
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      console.error('Error saving job profile:', error);
      toast.showWarning('Error', error.message || 'Failed to save job profile');
    } finally {
      setLoading(false);
    }
  };

  const canClose = isEditing || flowState !== 'job_profile_required';

  const renderStep1 = () => (
    <>
      <Text style={styles.stepTitle}>Basic Information</Text>

      <View style={sharedStyles.inputGroup}>
        <Text style={sharedStyles.inputLabel}>
          Full Name <Text style={sharedStyles.required}>*</Text>
        </Text>
        <TextInput
          value={formData.fullName}
          onChangeText={(val) => updateFormData('fullName', val)}
          placeholder="Enter your full name"
          placeholderTextColor="#9CA3AF"
          style={sharedStyles.textInput}
        />
      </View>

      <View style={sharedStyles.inputGroup}>
        <Text style={sharedStyles.inputLabel}>Professional Headline</Text>
        <TextInput
          value={formData.headline}
          onChangeText={(val) => updateFormData('headline', val)}
          placeholder="e.g., Senior Software Engineer"
          placeholderTextColor="#9CA3AF"
          style={sharedStyles.textInput}
        />
      </View>

      <View style={sharedStyles.inputGroup}>
        <Text style={sharedStyles.inputLabel}>Bio</Text>
        <TextInput
          value={formData.bio}
          onChangeText={(val) => updateFormData('bio', val)}
          placeholder="Tell employers about yourself"
          placeholderTextColor="#9CA3AF"
          style={[sharedStyles.textInput, sharedStyles.textArea]}
          multiline
          numberOfLines={4}
        />
      </View>

      <View style={sharedStyles.inputGroup}>
        <Text style={sharedStyles.inputLabel}>Years of Experience</Text>
        <TextInput
          value={formData.experienceYears}
          onChangeText={(val) => updateFormData('experienceYears', val)}
          placeholder="e.g., 5"
          placeholderTextColor="#9CA3AF"
          style={sharedStyles.textInput}
          keyboardType="numeric"
        />
      </View>

      <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
        <LinearGradient
          colors={[colors.purple, colors.purpleDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.nextButtonGradient}
        >
          <Text style={styles.nextButtonText}>Continue</Text>
        </LinearGradient>
      </TouchableOpacity>
    </>
  );

  const renderStep2 = () => (
    <>
      <Text style={styles.stepTitle}>Skills & Experience</Text>

      <View style={sharedStyles.inputGroup}>
        <Text style={sharedStyles.inputLabel}>
          Skills <Text style={sharedStyles.required}>*</Text>
        </Text>
        <View style={styles.skillInputRow}>
          <TextInput
            value={newSkill}
            onChangeText={setNewSkill}
            placeholder="Add a skill"
            placeholderTextColor="#9CA3AF"
            style={[sharedStyles.textInput, { flex: 1 }]}
            onSubmitEditing={addSkill}
          />
          <TouchableOpacity style={styles.addSkillButton} onPress={addSkill}>
            <Plus size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        {formData.skills.length > 0 && (
          <View style={styles.skillsContainer}>
            {formData.skills.map((skill) => (
              <View key={skill} style={styles.skillChip}>
                <Text style={styles.skillChipText}>{skill}</Text>
                <TouchableOpacity onPress={() => removeSkill(skill)}>
                  <X size={14} color={colors.purple} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </View>

      <View style={sharedStyles.inputGroup}>
        <Text style={sharedStyles.inputLabel}>LinkedIn URL (Optional)</Text>
        <TextInput
          value={formData.linkedinUrl}
          onChangeText={(val) => updateFormData('linkedinUrl', val)}
          placeholder="https://linkedin.com/in/yourprofile"
          placeholderTextColor="#9CA3AF"
          style={sharedStyles.textInput}
          autoCapitalize="none"
        />
      </View>

      <View style={sharedStyles.inputGroup}>
        <Text style={sharedStyles.inputLabel}>Portfolio URL (Optional)</Text>
        <TextInput
          value={formData.portfolioUrl}
          onChangeText={(val) => updateFormData('portfolioUrl', val)}
          placeholder="https://yourportfolio.com"
          placeholderTextColor="#9CA3AF"
          style={sharedStyles.textInput}
          autoCapitalize="none"
        />
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={sharedStyles.secondaryButton} onPress={handleBack}>
          <Text style={sharedStyles.secondaryButtonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.nextButton, { flex: 1, marginLeft: 12, marginTop: 0 }]} onPress={handleNext}>
          <LinearGradient
            colors={[colors.purple, colors.purpleDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.nextButtonGradient}
          >
            <Text style={styles.nextButtonText}>Continue</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </>
  );

  const renderStep3 = () => (
    <>
      <Text style={styles.stepTitle}>Job Preferences</Text>

      <View style={sharedStyles.inputGroup}>
        <Text style={sharedStyles.inputLabel}>
          Preferred Job Types <Text style={sharedStyles.required}>*</Text>
        </Text>
        <View style={sharedStyles.chipContainer}>
          {JOB_TYPES.map((type) => (
            <TouchableOpacity
              key={type.value}
              style={[
                sharedStyles.chip,
                formData.preferredJobTypes.includes(type.value) && sharedStyles.chipSelected,
              ]}
              onPress={() => toggleJobType(type.value)}
            >
              <Text
                style={[
                  sharedStyles.chipText,
                  formData.preferredJobTypes.includes(type.value) && sharedStyles.chipTextSelected,
                ]}
              >
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={sharedStyles.inputGroup}>
        <Text style={sharedStyles.inputLabel}>Preferred Categories</Text>
        <View style={sharedStyles.chipContainer}>
          {WORKER_CATEGORIES.slice(0, 6).map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                sharedStyles.chip,
                formData.preferredCategories.includes(category) && sharedStyles.chipSelected,
              ]}
              onPress={() => toggleCategory(category)}
            >
              <Text
                style={[
                  sharedStyles.chipText,
                  formData.preferredCategories.includes(category) && sharedStyles.chipTextSelected,
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={sharedStyles.inputGroup}>
        <Text style={sharedStyles.inputLabel}>
          Preferred Locations <Text style={sharedStyles.required}>*</Text>
        </Text>
        <TextInput
          value={formData.preferredLocations}
          onChangeText={(val) => updateFormData('preferredLocations', val)}
          placeholder="e.g., Mumbai, Delhi, Bangalore (comma-separated)"
          placeholderTextColor="#9CA3AF"
          style={sharedStyles.textInput}
        />
      </View>

      <View style={sharedStyles.inputRow}>
        <View style={[sharedStyles.inputGroup, { flex: 1, marginRight: 8 }]}>
          <Text style={sharedStyles.inputLabel}>Min Salary (₹)</Text>
          <TextInput
            value={formData.expectedSalaryMin}
            onChangeText={(val) => updateFormData('expectedSalaryMin', val)}
            placeholder="e.g., 20000"
            placeholderTextColor="#9CA3AF"
            style={sharedStyles.textInput}
            keyboardType="numeric"
          />
        </View>
        <View style={[sharedStyles.inputGroup, { flex: 1, marginLeft: 8 }]}>
          <Text style={sharedStyles.inputLabel}>Max Salary (₹)</Text>
          <TextInput
            value={formData.expectedSalaryMax}
            onChangeText={(val) => updateFormData('expectedSalaryMax', val)}
            placeholder="e.g., 50000"
            placeholderTextColor="#9CA3AF"
            style={sharedStyles.textInput}
            keyboardType="numeric"
          />
        </View>
      </View>

      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Willing to Relocate</Text>
        <Switch
          value={formData.willingToRelocate}
          onValueChange={(val) => updateFormData('willingToRelocate', val)}
          trackColor={{ false: '#E5E7EB', true: colors.purple + '60' }}
          thumbColor={formData.willingToRelocate ? colors.purple : '#FFFFFF'}
        />
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={sharedStyles.secondaryButton} onPress={handleBack}>
          <Text style={sharedStyles.secondaryButtonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[sharedStyles.primaryButton, { flex: 1, marginLeft: 12, marginTop: 0 }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <LinearGradient
            colors={[colors.purple, colors.purpleDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={sharedStyles.primaryButtonGradient}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Briefcase size={20} color="#FFFFFF" />
                <Text style={sharedStyles.primaryButtonText}>
                  {isEditing ? 'Update Profile' : 'Create Profile'}
                </Text>
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
              <Text style={sharedStyles.modalTitle}>
                {isEditing ? 'Edit Job Profile' : 'Create Job Profile'}
              </Text>
              <Text style={sharedStyles.modalSubtitle}>
                Step {step} of 3 - {step === 1 ? 'Basic Info' : step === 2 ? 'Skills' : 'Preferences'}
              </Text>
            </View>
            <TouchableOpacity
              style={sharedStyles.modalCloseButton}
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Step Indicator */}
          <View style={styles.stepIndicator}>
            <View style={[styles.stepDot, step >= 1 && styles.stepDotActive]} />
            <View style={[styles.stepLine, step >= 2 && styles.stepLineActive]} />
            <View style={[styles.stepDot, step >= 2 && styles.stepDotActive]} />
            <View style={[styles.stepLine, step >= 3 && styles.stepLineActive]} />
            <View style={[styles.stepDot, step >= 3 && styles.stepDotActive]} />
          </View>

          <ScrollView
            style={sharedStyles.modalScroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
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
    marginTop: 12,
    marginBottom: 16,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    marginBottom: 8,
  },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.borderLight,
  },
  stepDotActive: {
    backgroundColor: colors.purple,
  },
  stepLine: {
    width: 40,
    height: 3,
    backgroundColor: colors.borderLight,
    marginHorizontal: 8,
  },
  stepLineActive: {
    backgroundColor: colors.purple,
  },
  skillInputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  addSkillButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.purple,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  skillChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3E8FF',
    paddingVertical: 6,
    paddingLeft: 12,
    paddingRight: 8,
    borderRadius: 16,
    gap: 6,
    borderWidth: 1,
    borderColor: colors.purple,
  },
  skillChipText: {
    fontSize: 13,
    color: colors.purple,
    fontWeight: '600',
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
  buttonRow: {
    flexDirection: 'row',
    marginTop: 24,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
  },
  switchLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
});

export default JobProfileModal;
