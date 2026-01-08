import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {
  Briefcase,
  MapPin,
} from 'lucide-react-native';

import {styles, colors} from "components/styles/JobApplyStyles";
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
      const stored = await import('../utils/storage').then(m => m.getItem(APPLIED_JOBS_KEY));
      const parsed = stored ? JSON.parse(stored) as string[] : [];
      if (!parsed.includes(id)) {
        parsed.push(id);
        await import('../utils/storage').then(m => m.setItem(APPLIED_JOBS_KEY, JSON.stringify(parsed)));
      }
    } catch (err) {
      console.error('Error storing applied job locally:', err);
    }
  };

  const checkLocalApplied = async (id?: string) => {
    try {
      const stored = await import('../utils/storage').then(m => m.getItem(APPLIED_JOBS_KEY));
      const parsed = stored ? JSON.parse(stored) as string[] : [];
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
        const currentUserId = (userProfile as any)?.id || (userProfile as any)?._id || (userProfile as any)?.user_id || null;
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
      toast.showWarning('Action required', 'Please complete your Job seeker profile before applying');
      return;
    }

    try {
      setApplying(true);
      const res = await authorizedFetch(`${API_BASE_URL}/job/${jobId}/apply`, { method: 'POST' }, handleUnauthorized);
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

  if (loading) return (
    <View style={[styles.container, {justifyContent: 'center', alignItems: 'center'}]}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );

  if (!job) return (
    <View style={[styles.container, {justifyContent: 'center', alignItems: 'center'}]}>
      <Text style={{ color: '#6B7280' }}>Job not found.</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Heading */}
      <Text style={styles.heading}>{job.title || 'Job Details'}</Text>

      {/* Job Summary Card */}
      <View style={styles.summaryCard}>
        <View style={styles.iconBox}>
          <Briefcase size={24} color={colors.primary} />
        </View>

        <View style={styles.summaryContent}>
          <Text style={styles.jobTitle}>{job.title}</Text>
          <Text style={styles.company}>{job.company_name || job.posted_by || ''}</Text>

          <View style={styles.metaRow}>
            <Text style={styles.metaText}>{job.category || job.job_type || ''}</Text>
            <Text style={styles.dot}>•</Text>
            <Text style={styles.metaText}>{job.salary_min ? `₹${job.salary_min}` : 'Salary not specified'}</Text>
          </View>

          {job.location && (
            <View style={styles.locationRow}>
              <MapPin size={14} color={colors.textLight} />
              <Text style={styles.location}>{job.location}{job.city ? `, ${job.city}` : ''}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Details Section */}
      <View style={styles.detailCard}>
        <Text style={styles.sectionTitle}>Job Description</Text>
        <Text style={styles.sectionText}>{job.description || 'No description provided.'}</Text>

        {job.required_skills && (
          <>
            <Text style={styles.sectionTitle}>Eligibility</Text>
            <Text style={styles.sectionText}>{(job.required_skills || []).join(', ')}</Text>
          </>
        )}

        {job.company_brief && (
          <>
            <Text style={styles.sectionTitle}>Company Brief</Text>
            <Text style={styles.sectionText}>{job.company_brief}</Text>
          </>
        )}

        {job.hr_name && (
          <>
            <Text style={styles.sectionTitle}>HR Details</Text>
            <Text style={styles.sectionText}>
              HR Name: {job.hr_name}{'\n'}
              Email: {job.hr_email || '-'}{'\n'}
              Contact: {job.hr_contact || '-'}
            </Text>
          </>
        )}
      </View>

      {/* Apply Button */}
      <TouchableOpacity
        style={[styles.applyButton, (!canApply || applied) && { backgroundColor: '#CBD5E1' }]}
        disabled={!canApply || applying || applied}
        onPress={handleApply}
      >
        <Text style={styles.applyText}>{applied ? 'Applied' : (applying ? 'Applying...' : 'Apply Now')}</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

