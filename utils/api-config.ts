// api/config.ts - API Configuration
import { API_BASE_URL } from '../constants';

export const API_CONFIG = {
  BASE_URL: "http://localhost:8000/api/v1",
  TIMEOUT: 30000,
};

export const API_ENDPOINTS = {
  // Auth
  SEND_OTP: '/auth/send-otp',
  VERIFY_OTP: '/auth/verify-otp',
  REFRESH_TOKEN: '/auth/refresh-token',
  
  // User
  GET_PROFILE: '/user/profile',
  UPDATE_PROFILE: '/user/profile',
  UPLOAD_PHOTO: '/user/upload-photo',
  UPDATE_FCM: '/user/fcm-token',
  DELETE_ACCOUNT: '/user/account',
  
  // KYC
  SUBMIT_KYC: '/kyc/submit',
  KYC_STATUS: '/kyc/status',
  
  // Worker
  CREATE_WORKER: '/worker/profile',
  GET_WORKER: '/worker/profile',
  UPDATE_WORKER: '/worker/profile',
  SEARCH_WORKERS: '/worker/search',
  
  // Subscription
  CREATE_SUBSCRIPTION: '/subscription/create',
  
  // Upload
  UPLOAD_IMAGE: '/upload/image',
  UPLOAD_DOCUMENT: '/upload/document',
  
  // Jobs
  CREATE_JOB: '/job/create',
  GET_JOBS: '/jobs',
  GET_MY_JOBS: '/job/my/posted',
  
  // Categories
  GET_CATEGORIES: '/category/all',
  
  // Reviews
  CREATE_REVIEW: '/review/create',
  GET_REVIEWS: '/review/worker',
};

// Helper function to build full URL
export const buildUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Helper function to get auth headers
export const getAuthHeaders = async (): Promise<Record<string, string>> => {
  const AsyncStorage = require('@react-native-async-storage/async-storage').default;
  const token = await AsyncStorage.getItem('access_token');
  
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};