// utils/index.ts - Helper functions

import { UserProfile, FlowState, JobFlowState } from '../types';

/**
 * Adjusts a hex color by a given amount
 */
export const adjustColor = (color: string, amount: number): string => {
  const clamp = (num: number) => Math.min(255, Math.max(0, num));
  let hex = color.replace('#', '');
  if (hex.length === 3) {
    hex = hex.split('').map((c) => c + c).join('');
  }
  const num = parseInt(hex, 16);
  const r = clamp((num >> 16) + amount);
  const g = clamp(((num >> 8) & 0x00ff) + amount);
  const b = clamp((num & 0x0000ff) + amount);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
};

/**
 * Formats subscription expiry date
 */
export const formatSubscriptionExpiry = (
  expiresAt: { $date: { $numberLong: string } } | null
): string => {
  if (!expiresAt) return '';
  const timestamp = parseInt(expiresAt.$date.$numberLong);
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

/**
 * Determines the flow state based on user profile
 */
export const determineFlowState = (profile: UserProfile): FlowState => {
  /*
    Flow Logic:
    1. Has worker_profile_id?
       - YES → Check is_verified
         - true → worker_verified
         - false → worker_pending
       - NO → Has subscription_id?
         - YES → worker_profile_required
         - NO → Check kyc_status
           - approved → subscription_required
           - submitted → kyc_under_review (show subscription option)
           - rejected → kyc_rejected
           - null/pending → kyc_required
  */

  // Step 1: Check if has worker profile
  if (profile.worker_profile_id) {
    if (profile.worker_is_verified === true) {
      return 'worker_verified';
    } else {
      return 'worker_pending';
    }
  }

  // Step 2: No worker profile - check subscription
  if (profile.subscription_id) {
    return 'worker_profile_required';
  }

  // Step 3: No subscription - check KYC status
  switch (profile.kyc_status) {
    case 'approved':
      return 'subscription_required';
    case 'submitted':
      return 'kyc_under_review';
    case 'rejected':
      return 'kyc_rejected';
    case 'pending':
    case null:
    default:
      return 'kyc_required';
  }
};

/**
 * Get status summary for profile display
 */
export const getWorkerSetupStatus = (
  profile: UserProfile | null
): {
  label: string;
  color: string;
  description: string;
  isComplete: boolean;
} => {
  if (!profile) {
    return {
      label: 'Loading...',
      color: '#6B7280',
      description: 'Please wait',
      isComplete: false,
    };
  }

  const flowState = determineFlowState(profile);

  switch (flowState) {
    case 'kyc_required':
      return {
        label: 'KYC Required',
        color: '#EF4444',
        description: 'Complete verification to become a worker',
        isComplete: false,
      };
    case 'kyc_under_review':
      return {
        label: 'KYC Under Review',
        color: '#F59E0B',
        description: 'Documents are being verified',
        isComplete: false,
      };
    case 'kyc_rejected':
      return {
        label: 'KYC Rejected',
        color: '#EF4444',
        description: 'Please resubmit documents',
        isComplete: false,
      };
    case 'subscription_required':
      return {
        label: 'Choose Plan',
        color: '#8B5CF6',
        description: 'Subscribe to create worker profile',
        isComplete: false,
      };
    case 'worker_profile_required':
      return {
        label: 'Create Profile',
        color: '#10B981',
        description: 'Set up your worker profile',
        isComplete: false,
      };
    case 'worker_pending':
      return {
        label: 'Under Review',
        color: '#F59E0B',
        description: 'Profile is being verified',
        isComplete: false,
      };
    case 'worker_verified':
      return {
        label: 'Verified',
        color: '#10B981',
        description: 'Ready to receive jobs',
        isComplete: true,
      };
    default:
      return {
        label: 'Setup Required',
        color: '#6B7280',
        description: 'Complete your worker setup',
        isComplete: false,
      };
  }
};

/**
 * Determines the job seeker flow state based on user profile
 */
export const determineJobFlowState = (profile: UserProfile): JobFlowState => {
  /*
    Flow Logic:
    1. Has job_seeker_profile_id?
       - YES → Check is_verified
         - true → job_profile_verified
         - false → job_profile_pending
       - NO → Has job_seeker_subscription_id?
         - YES → job_profile_required
         - NO → Check kyc_status
           - approved → job_subscription_required
           - submitted → kyc_under_review
           - rejected → kyc_rejected
           - null/pending → kyc_required
  */

  // Step 1: Check if has job seeker profile (accept worker profile as fallback)
  if (profile.job_seeker_profile_id || profile.worker_profile_id) {
    // Accept truthy values (true, 1, 'true') for backward compatibility with different backends
    if (profile.job_seeker_is_verified || profile.worker_is_verified) {
      return 'job_profile_verified';
    } else {
      return 'job_profile_pending';
    }
  }

  // Step 2: No job seeker profile - check subscription (accept generic subscription id as fallback)
  if (profile.job_seeker_subscription_id || profile.subscription_id) {
    return 'job_profile_required';
  }

  // Step 3: No subscription - check KYC status
  switch (profile.kyc_status) {
    case 'approved':
      return 'job_subscription_required';
    case 'submitted':
      return 'kyc_under_review';
    case 'rejected':
      return 'kyc_rejected';
    case 'pending':
    case null:
    default:
      return 'kyc_required';
  }
};

/**
 * Get status summary for job seeker profile display
 */
export const getJobSetupStatus = (
  profile: UserProfile | null
): {
  label: string;
  color: string;
  description: string;
  isComplete: boolean;
} => {
  if (!profile) {
    return {
      label: 'Loading...',
      color: '#6B7280',
      description: 'Please wait',
      isComplete: false,
    };
  }

  const flowState = determineJobFlowState(profile);

  switch (flowState) {
    case 'kyc_required':
      return {
        label: 'KYC Required',
        color: '#EF4444',
        description: 'Complete verification to find jobs',
        isComplete: false,
      };
    case 'kyc_under_review':
      return {
        label: 'KYC Under Review',
        color: '#F59E0B',
        description: 'Documents are being verified',
        isComplete: false,
      };
    case 'kyc_rejected':
      return {
        label: 'KYC Rejected',
        color: '#EF4444',
        description: 'Please resubmit documents',
        isComplete: false,
      };
    case 'job_subscription_required':
      return {
        label: 'Choose Plan',
        color: '#8B5CF6',
        description: 'Subscribe to create job profile',
        isComplete: false,
      };
    case 'job_profile_required':
      return {
        label: 'Create Profile',
        color: '#10B981',
        description: 'Set up your job seeker profile',
        isComplete: false,
      };
    case 'job_profile_pending':
      return {
        label: 'Under Review',
        color: '#F59E0B',
        description: 'Profile is being verified',
        isComplete: false,
      };
    case 'job_profile_verified':
      return {
        label: 'Verified',
        color: '#10B981',
        description: 'Ready to apply for jobs',
        isComplete: true,
      };
    default:
      return {
        label: 'Setup Required',
        color: '#6B7280',
        description: 'Complete your job seeker setup',
        isComplete: false,
      };
  }
};