// constants/index.ts - Static configuration and data

import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { SubscriptionPlan, JobSeekerSubscriptionPlan } from '../types';

// Read env variables from Expo `extra` or from process.env (works with babel plugins or CI/EAS)
const expoExtra = (Constants.expoConfig && Constants.expoConfig.extra) || (Constants.manifest && Constants.manifest.extra) || {};

// API Configuration
export const getApiBaseUrl = (): string => {
  // Allow explicit env override first
  const envUrl = process.env.API_BASE_URL || expoExtra.API_BASE_URL;
  if (envUrl) return envUrl as string;

  // Default URL based on platform
  return 'https://api.mentoservices.com/api/v1';
};

export const API_BASE_URL = getApiBaseUrl();

// Razorpay Configuration - prefer env value, fallback to existing key
export const RAZORPAY_KEY = process.env.RAZORPAY_KEY || expoExtra.RAZORPAY_KEY || 'rzp_test_S0Er546MROcDPm';

// Subscription Plans
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
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

// Worker Categories
export const WORKER_CATEGORIES = [
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

// Document Types
export const DOCUMENT_TYPES = [
  { label: 'Aadhaar', value: 'aadhaar' },
  { label: 'PAN', value: 'pan' },
  { label: 'Driving License', value: 'drivinglicense' },
  { label: 'Voter ID', value: 'voterid' },
];

// Job Seeker Subscription Plans
export const JOB_SEEKER_SUBSCRIPTION_PLANS: JobSeekerSubscriptionPlan[] = [
  {
    id: 'basic',
    name: 'Basic',
    price: 299,
    duration: '1 Year',
    features: [
      'Profile visibility to employers',
      'Apply to unlimited jobs',
      'Basic job alerts',
      'Email support',
    ],
    color: '#6B7280',
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 599,
    duration: '1 Year',
    features: [
      'All Basic features',
      'Featured profile badge',
      'Priority job alerts',
      'Resume boost in searches',
      'Priority support',
      'Advanced analytics',
    ],
    popular: true,
    color: '#8B5CF6',
  },
];

// Job Types
export const JOB_TYPES = [
  { label: 'Full Time', value: 'fulltime' },
  { label: 'Part Time', value: 'parttime' },
  { label: 'Contract', value: 'contract' },
  { label: 'Freelance', value: 'freelance' },
  { label: 'Internship', value: 'internship' },
];

// AsyncStorage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
  WORKER_PROFILE_ID: 'worker_profile_id',
  SUBSCRIPTION_ID: 'subscription_id',
  JOB_SEEKER_PROFILE_ID: 'job_seeker_profile_id',
  JOB_SEEKER_SUBSCRIPTION_ID: 'job_seeker_subscription_id',
  APPLIED_JOBS: 'applied_jobs',
  SEARCH_HINT_SHOWN: 'search_hint_shown',
};