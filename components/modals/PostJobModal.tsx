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
  Platform,
} from 'react-native';
import { X, Upload } from 'lucide-react-native';
import { colors, sharedStyles } from '../styles/shared';
import { API_BASE_URL } from '../../constants';
import { useToast } from '../../context/ToastContext';
import { authorizedFetch } from '../../utils/authorizedFetch';
import { uploadDocument } from '../../utils/fileUpload';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface PostJobModalProps {
  visible: boolean;
  modalAnim: Animated.Value;
  onClose: () => void;
  onSuccess?: (jobId?: string) => void;
}

export const PostJobModal: React.FC<PostJobModalProps> = ({ visible, modalAnim, onClose, onSuccess }) => {
  const toast = useToast();
  const [status, setStatus] = useState<'idle' | 'uploading' | 'saving' | 'success' | 'error'>('idle');

  const [title, setTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyBrief, setCompanyBrief] = useState('');
  const [eligibility, setEligibility] = useState(''); // comma-separated
  const [requirements, setRequirements] = useState(''); // comma-separated
  const [jobRole, setJobRole] = useState('');
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [location, setLocation] = useState('');
  const [hrName, setHrName] = useState('');
  const [hrEmail, setHrEmail] = useState('');
  const [hrContact, setHrContact] = useState('');
  const [companyDocumentUrl, setCompanyDocumentUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) {
      // reset form when closed
      setTitle('');
      setCompanyName('');
      setCompanyBrief('');
      setEligibility('');
      setRequirements('');
      setJobRole('');
      setSalaryMin('');
      setSalaryMax('');
      setLocation('');
      setHrName('');
      setHrEmail('');
      setHrContact('');
      setCompanyDocumentUrl(null);
      setStatus('idle');
    }
  }, [visible]);

  const pickDocument = async () => {
    try {
      setStatus('uploading');

      // Use file upload helper - this supports web and native
      // For jobs documents we use 'front' as a generic type
      const res = await uploadDocument(companyDocumentUrl || '', 'front').catch(() => null);

      // Note: uploadDocument expects a file URI. On mobile you'd pass a picked file uri.
      // Here it's a placeholder flow — callers should integrate a picker (ImagePicker/FilePicker) as required.

      if (res && res.success) {
        setCompanyDocumentUrl(res.url || null);
        toast.showSuccess('Success', 'Document uploaded');
      } else {
        throw new Error(res?.error || 'Upload failed');
      }
    } catch (error: any) {
      console.error('Error uploading document:', error);
      toast.showWarning('Error', error.message || 'Failed to upload document');
      setStatus('error');
      setTimeout(() => setStatus('idle'), 1500);
    } finally {
      if (status !== 'saving') setStatus('idle');
    }
  };

  const validate = () => {
    if (!title.trim()) {
      toast.showWarning('Validation', 'Title is required');
      return false;
    }
    if (!companyName.trim()) {
      toast.showWarning('Validation', 'Company name is required');
      return false;
    }
    if (!jobRole.trim()) {
      toast.showWarning('Validation', 'Job role is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      setStatus('saving');

      const payload: any = {
        title: title.trim(),
        company_name: companyName.trim(),
        company_brief: companyBrief.trim() || null,
        eligibility: eligibility ? eligibility.split(',').map(s => s.trim()).filter(Boolean) : null,
        requirements: requirements ? requirements.split(',').map(s => s.trim()).filter(Boolean) : null,
        job_role: jobRole.trim(),
        salary_min: salaryMin ? Number(salaryMin) : null,
        salary_max: salaryMax ? Number(salaryMax) : null,
        location: location.trim() || null,
        hr_name: hrName.trim() || null,
        hr_email: hrEmail.trim() || null,
        hr_contact: hrContact.trim() || null,
        company_document_url: companyDocumentUrl || null,
      };

      const response = await authorizedFetch(`${API_BASE_URL}/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const json = await response.json().catch(() => null);
        throw new Error(json?.message || 'Failed to create job');
      }

      const result = await response.json();

      if (!result.success) throw new Error(result.message || 'Failed to create job');

      const jobId = result.data?.job_id || null;

      setStatus('success');
      toast.showSuccess('Success', 'Job posted and pending admin approval');

      setTimeout(() => {
        onSuccess?.(jobId);
        onClose();
        setStatus('idle');
      }, 900);
    } catch (error: any) {
      console.error('Error creating job:', error);
      toast.showWarning('Error', error.message || 'Failed to create job');
      setStatus('error');
      setTimeout(() => setStatus('idle'), 1500);
    }
  };

  const canClose = status === 'idle' || status === 'success';

  return (
    <Modal visible={visible} animationType="none" transparent onRequestClose={() => canClose && onClose()}>
      <View style={sharedStyles.modalOverlay}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => canClose && onClose()} />

        <Animated.View
          style={[
            sharedStyles.modalContainer,
            {
              transform: [
                {
                  translateY: modalAnim.interpolate({ inputRange: [0, 1], outputRange: [SCREEN_HEIGHT, 0] }),
                },
              ],
            },
          ]}
        >
          <View style={sharedStyles.modalHandle} />

          <View style={sharedStyles.modalHeader}>
            <View>
              <Text style={sharedStyles.modalTitle}>Post a Job</Text>
              <Text style={sharedStyles.modalSubtitle}>Fill the job details and submit</Text>
            </View>
            {canClose && (
              <TouchableOpacity style={sharedStyles.modalCloseButton} onPress={() => onClose()}>
                <X size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>

          <ScrollView style={sharedStyles.modalScroll} contentContainerStyle={{ paddingBottom: 40 }}>
            <View style={sharedStyles.inputGroup}>
              <Text style={sharedStyles.inputLabel}>Title *</Text>
              <TextInput value={title} onChangeText={setTitle} placeholder="Senior Developer" style={sharedStyles.textInput} />
            </View>

            <View style={sharedStyles.inputGroup}>
              <Text style={sharedStyles.inputLabel}>Company Name *</Text>
              <TextInput value={companyName} onChangeText={setCompanyName} placeholder="Company Inc." style={sharedStyles.textInput} />
            </View>

            <View style={sharedStyles.inputGroup}>
              <Text style={sharedStyles.inputLabel}>Job Role *</Text>
              <TextInput value={jobRole} onChangeText={setJobRole} placeholder="Frontend Engineer" style={sharedStyles.textInput} />
            </View>

            <View style={sharedStyles.inputGroup}>
              <Text style={sharedStyles.inputLabel}>Company Brief</Text>
              <TextInput value={companyBrief} onChangeText={setCompanyBrief} placeholder="Short description" style={sharedStyles.textInput} multiline />
            </View>

            <View style={sharedStyles.inputGroup}>
              <Text style={sharedStyles.inputLabel}>Eligibility (comma-separated)</Text>
              <TextInput value={eligibility} onChangeText={setEligibility} placeholder="B.E, 3+ years" style={sharedStyles.textInput} />
            </View>

            <View style={sharedStyles.inputGroup}>
              <Text style={sharedStyles.inputLabel}>Requirements (comma-separated)</Text>
              <TextInput value={requirements} onChangeText={setRequirements} placeholder="React, Node" style={sharedStyles.textInput} />
            </View>

            <View style={sharedStyles.inputGroup}>
              <Text style={sharedStyles.inputLabel}>Salary Min</Text>
              <TextInput value={salaryMin} onChangeText={setSalaryMin} placeholder="20000" style={sharedStyles.textInput} keyboardType={Platform.OS === 'web' ? 'numeric' : 'number-pad'} />
            </View>

            <View style={sharedStyles.inputGroup}>
              <Text style={sharedStyles.inputLabel}>Salary Max</Text>
              <TextInput value={salaryMax} onChangeText={setSalaryMax} placeholder="50000" style={sharedStyles.textInput} keyboardType={Platform.OS === 'web' ? 'numeric' : 'number-pad'} />
            </View>

            <View style={sharedStyles.inputGroup}>
              <Text style={sharedStyles.inputLabel}>Location</Text>
              <TextInput value={location} onChangeText={setLocation} placeholder="Mumbai" style={sharedStyles.textInput} />
            </View>

            <View style={sharedStyles.inputGroup}>
              <Text style={sharedStyles.inputLabel}>HR Name</Text>
              <TextInput value={hrName} onChangeText={setHrName} placeholder="HR" style={sharedStyles.textInput} />
            </View>

            <View style={sharedStyles.inputGroup}>
              <Text style={sharedStyles.inputLabel}>HR Email</Text>
              <TextInput value={hrEmail} onChangeText={setHrEmail} placeholder="hr@example.com" style={sharedStyles.textInput} keyboardType="email-address" />
            </View>

            <View style={sharedStyles.inputGroup}>
              <Text style={sharedStyles.inputLabel}>HR Contact</Text>
              <TextInput value={hrContact} onChangeText={setHrContact} placeholder="9876543210" style={sharedStyles.textInput} />
            </View>

            <View style={{ marginTop: 8 }}>
              <TouchableOpacity style={styles.uploadButton} onPress={pickDocument} disabled={status !== 'idle'}>
                <Upload size={18} color="#fff" />
                <Text style={styles.uploadButtonText}>{companyDocumentUrl ? 'Document uploaded' : 'Upload Document (optional)'}</Text>
                {status === 'uploading' && <ActivityIndicator size="small" color="#fff" style={{ marginLeft: 10 }} />}
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleSubmit} disabled={status !== 'idle'}>
              <Text style={styles.saveButtonText}>{status === 'saving' ? 'Posting...' : 'Post Job'}</Text>
              {status === 'saving' && <ActivityIndicator size="small" color="#fff" style={{ marginLeft: 10 }} />}
            </TouchableOpacity>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  uploadButton: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadButtonText: {
    color: '#FFFFFF',
    marginLeft: 8,
    fontWeight: '600',
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
});
