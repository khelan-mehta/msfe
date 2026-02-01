import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Briefcase, MapPin } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft } from 'lucide-react-native';
import { styles, colors } from 'components/styles/JobApplyStyles';
import { useRoute, RouteProp } from '@react-navigation/native';
import { API_BASE_URL } from '../constants';
import { buildUrl } from '../utils/api-config';
import { authorizedFetch } from '../utils/authorizedFetch';
import { useProfile } from '../hooks';
import { useToast } from '../context/ToastContext';

type ParamList = {
  JobApply: { jobId: string };
};

export default function JobDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<ParamList, 'JobApply'>>();
  const jobId = route.params?.jobId;
  const [loading, setLoading] = useState<boolean>(true);
  const [job, setJob] = useState<any | null>(null);
  const [applying, setApplying] = useState<boolean>(false);
  const [applied, setApplied] = useState<boolean>(false);
  const { userProfile, jobSeekerProfile, handleUnauthorized } = useProfile();
  const toast = useToast();

  const canApply = Boolean(jobSeekerProfile || userProfile?.job_seeker_profile_id);

  // Local device tracking for applied jobs (so UI can reflect applied state without depending on server)
  const APPLIED_JOBS_KEY = 'applied_jobs';

  const markJobAppliedLocally = async (id: string) => {
    try {
      const stored = await import('../utils/storage').then((m) => m.getItem(APPLIED_JOBS_KEY));
      const parsed = stored ? (JSON.parse(stored) as string[]) : [];
      if (!parsed.includes(id)) {
        parsed.push(id);
        await import('../utils/storage').then((m) =>
          m.setItem(APPLIED_JOBS_KEY, JSON.stringify(parsed))
        );
      }
    } catch (err) {
      console.error('Error storing applied job locally:', err);
    }
  };

  const checkLocalApplied = async (id?: string) => {
    try {
      const stored = await import('../utils/storage').then((m) => m.getItem(APPLIED_JOBS_KEY));
      const parsed = stored ? (JSON.parse(stored) as string[]) : [];
      if (id) setApplied(parsed.includes(id));
      else setApplied(false);
    } catch (err) {
      console.error('Error reading applied jobs from storage:', err);
    }
  };

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        if (!jobId) return;

        const res = await authorizedFetch(buildUrl(`/jobs/${jobId}`), {}, handleUnauthorized);

        if (!res.ok) {
          const errJson = await res.json().catch(() => null);
          throw new Error(errJson?.message || 'Failed to fetch job');
        }

        const json = await res.json();
        const data = json?.data || null;
        setJob(data);

        // Determine if user already applied (server-side list)
        const currentUserId =
          (userProfile as any)?.id ||
          (userProfile as any)?._id ||
          (userProfile as any)?.user_id ||
          null;
        if (currentUserId && data?.applications && Array.isArray(data.applications)) {
          setApplied(data.applications.includes(currentUserId));
        }

        // Also check local applied list to reflect on-device applications even if server is out-of-sync
        await checkLocalApplied(jobId);
      } catch (err: any) {
        console.error('Error fetching job details:', err);
        toast.showWarning('Error', err.message || 'Failed to fetch job');
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [jobId, userProfile]);

  const handleApply = async () => {
    if (!jobId || applying) return;
    if (!canApply) {
      toast.showWarning(
        'Profile Required',
        'Please complete your Job seeker profile before applying. Redirecting...'
      );
      // Navigate to Profile tab -> JobSetup screen
      const parent = navigation.getParent?.();
      if (parent) {
        parent.navigate('Profile', { screen: 'JobSetup' });
      } else {
        (navigation as any).navigate('Profile', { screen: 'JobSetup' });
      }
      return;
    }

    try {
      setApplying(true);
      const res = await authorizedFetch(
        `${API_BASE_URL}/job/${jobId}/apply`,
        { method: 'POST' },
        handleUnauthorized
      );
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.message || 'Failed to apply');
      }

      const json = await res.json();
      if (!json.success) throw new Error(json.message || 'Failed to apply');

      setApplied(true);
      await markJobAppliedLocally(jobId);
    } catch (err: any) {
      console.error('Error applying to job:', err);
      toast.showWarning('Error', err.message || 'Failed to apply');
    } finally {
      setApplying(false);
    }
  };

  // Helper to format salary
  const formatSalary = (amount: number | null | undefined) => {
    if (amount == null) return '-';
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  if (loading)
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );

  if (!job)
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: '#6B7280' }}>Job not found.</Text>
      </View>
    );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Heading */}
      <Text style={styles.heading}>{'Job Details'}</Text>
      <TouchableOpacity
  onPress={() => navigation.goBack()}
  style={{
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  }}
>
  <ArrowLeft size={20} color={colors.primary} />
  <Text style={{ marginLeft: 6, color: colors.primary, fontWeight: '600' }}>
    Back
  </Text>
</TouchableOpacity>

      {/* Job Summary Card */}
      <View style={styles.summaryCard}>
        <View style={styles.iconBox}>
          <Briefcase size={24} color={colors.primary} />
        </View>

        <View style={styles.summaryContent}>
          <Text style={styles.jobTitle}>{job.title}</Text>
          <Text style={styles.company}>{job.company_name || ''}</Text>

          <View style={styles.metaRow}>
            <Text style={styles.metaText}>
              {job.job_role || job.category || job.job_type || ''}
            </Text>
            {(job.salary_min || job.salary_max) && (
              <>
                <Text style={styles.dot}>•</Text>
                <Text style={styles.metaText}>
                  {formatSalary(job.salary_min)} - {formatSalary(job.salary_max)}
                </Text>
              </>
            )}
          </View>

          {job.location && (
            <View style={styles.locationRow}>
              <MapPin size={14} color={colors.textLight} />
              <Text style={styles.location}>
                {job.location}
                {job.city ? `, ${job.city}` : ''}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Details Section */}
      <View style={styles.detailCard}>
        {/* Job Role */}
        {job.job_role && (
          <>
            <Text style={styles.sectionTitle}>Job Role</Text>
            <Text style={styles.sectionText}>{job.job_role}</Text>
          </>
        )}

        {/* Description */}
        {job.description && (
          <>
            <Text style={styles.sectionTitle}>Job Description</Text>
            <Text style={styles.sectionText}>{job.description}</Text>
          </>
        )}

        {/* Salary Range */}
        {(job.salary_min || job.salary_max) && (
          <>
            <Text style={styles.sectionTitle}>Salary Range</Text>
            <Text style={styles.sectionText}>
              {formatSalary(job.salary_min)} - {formatSalary(job.salary_max)}
            </Text>
          </>
        )}

        {/* Eligibility */}
        {job.eligibility && Array.isArray(job.eligibility) && job.eligibility.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Eligibility</Text>
            <Text style={styles.sectionText}>{job.eligibility.join(', ')}</Text>
          </>
        )}

        {/* Requirements */}
        {job.requirements && Array.isArray(job.requirements) && job.requirements.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Requirements</Text>
            <Text style={styles.sectionText}>{job.requirements.join(', ')}</Text>
          </>
        )}

        {/* Required Skills (fallback for older API format) */}
        {job.required_skills &&
          Array.isArray(job.required_skills) &&
          job.required_skills.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Required Skills</Text>
              <Text style={styles.sectionText}>{job.required_skills.join(', ')}</Text>
            </>
          )}

        {/* Company Brief */}
        {job.company_brief && (
          <>
            <Text style={styles.sectionTitle}>Company Brief</Text>
            <Text style={styles.sectionText}>{job.company_brief}</Text>
          </>
        )}

        
      </View>

      {/* Apply Button */}
      <TouchableOpacity
        style={[styles.applyButton, applied && { backgroundColor: '#CBD5E1' }, !applied && !applying && { backgroundColor: '#38BDF8' }]}
        disabled={applying || applied}
        onPress={handleApply}>
        <Text style={styles.applyText}>
          {applied ? 'Applied' : applying ? 'Applying...' : 'Apply Now'}
        </Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}
