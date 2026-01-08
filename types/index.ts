// types/index.ts - Shared TypeScript interfaces

export interface UserProfile {
  id: string;
  mobile: string;
  email: string | null;
  name: string | null;
  profile_photo: string | null;
  city: string | null;
  pincode: string | null;
  kyc_status: 'pending' | 'submitted' | 'approved' | 'rejected' | null;
  subscription_id: string | null;
  subscription_plan: 'silver' | 'gold' | null;
  subscription_expires_at: { $date: { $numberLong: string } } | null;
  worker_profile_id: string | null;
  worker_is_verified: boolean | null;
  // Job Seeker fields
  job_seeker_subscription_id: string | null;
  job_seeker_subscription_plan: 'basic' | 'premium' | null;
  job_seeker_subscription_expires_at: { $date: { $numberLong: string } } | null;
  job_seeker_profile_id: string | null;
  job_seeker_is_verified: boolean | null;
}

export interface WorkerProfile {
  worker_id: string;
  categories: string[];
  subcategories: string[];
  experience_years: number;
  description: string;
  hourly_rate: number;
  license_number?: string;
  service_areas: string[];
  is_verified: boolean;
  verification_status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  duration: string;
  features: string[];
  popular?: boolean;
  color: string;
}

export interface KycFormData {
  fullName: string;
  dateOfBirth: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  documentType: string;
  documentNumber: string;
  documentFrontImage: string;
  documentBackImage: string;
  selfieImage: string;
}

export interface WorkerFormData {
  categories: string[];
  subcategories: string[]; // Service names selected
  experienceYears: string;
  description: string;
  licenseNumber: string;
  serviceAreas: string;
}

export interface Service {
  _id?: string;
  serviceId: string;
  name: string;
  serviceCategory: string;
  price: string;
  rating: string;
  description: string;
  icon: string;
  color: string;
}

export interface CategoryWithServices {
  category: string;
  services: Service[];
  expanded: boolean;
}

export interface WorkerProfile {
  _id?: string;
  user_id: string;
  categories: string[];
  subcategories: string[];
  experience_years: number;
  description: string;
  hourly_rate: number;
  license_number?: string;
  service_areas: string[];
  subscription_plan: 'None' | 'Silver' | 'Gold';
  subscription_expires_at?: string;
  is_verified: boolean;
  is_available: boolean;
  rating: number;
  total_reviews: number;
  total_jobs_completed: number;
  created_at: string;
  updated_at: string;
}

// Flow States for Worker Setup
export type FlowState =
  | 'loading'
  | 'kyc_required'
  | 'kyc_under_review'
  | 'kyc_rejected'
  | 'subscription_required'
  | 'worker_profile_required'
  | 'worker_pending'
  | 'worker_verified'
  | 'complete';

export type PaymentStatus = 'idle' | 'processing' | 'verifying' | 'success' | 'failed';

// Flow States for Job Seeker Setup
export type JobFlowState =
  | 'loading'
  | 'kyc_required'
  | 'kyc_under_review'
  | 'kyc_rejected'
  | 'job_subscription_required'
  | 'job_profile_required'
  | 'job_profile_pending'
  | 'job_profile_verified'
  | 'complete';

// Job Seeker Profile Types
export interface Education {
  degree: string;
  institution: string;
  field_of_study?: string;
  start_year?: number;
  end_year?: number;
  is_current: boolean;
}

export interface WorkExperience {
  title: string;
  company: string;
  location?: string;
  start_date?: string;
  end_date?: string;
  is_current: boolean;
  description?: string;
}

export interface JobSeekerProfile {
  _id?: string;
  user_id: string;
  full_name: string;
  headline?: string;
  bio?: string;
  skills: string[];
  experience_years?: number;
  education: Education[];
  work_experience: WorkExperience[];
  preferred_categories: string[];
  preferred_job_types: string[];
  preferred_locations: string[];
  expected_salary_min?: number;
  expected_salary_max?: number;
  willing_to_relocate: boolean;
  resume_url?: string;
  portfolio_url?: string;
  linkedin_url?: string;
  subscription_plan: 'none' | 'basic' | 'premium';
  subscription_expires_at?: string;
  is_verified: boolean;
  is_available: boolean;
  profile_views: number;
  applications_count: number;
  created_at: string;
  updated_at: string;
}

export interface JobSeekerFormData {
  fullName: string;
  headline: string;
  bio: string;
  skills: string[];
  experienceYears: string;
  education: Education[];
  workExperience: WorkExperience[];
  preferredCategories: string[];
  preferredJobTypes: string[];
  preferredLocations: string;
  expectedSalaryMin: string;
  expectedSalaryMax: string;
  willingToRelocate: boolean;
  resumeUrl: string;
  portfolioUrl: string;
  linkedinUrl: string;
}

export interface JobSeekerSubscriptionPlan {
  id: string;
  name: string;
  price: number;
  duration: string;
  features: string[];
  popular?: boolean;
  color: string;
}

// Navigation Props
export interface ProfileScreenProps {
  navigation: any;
  onLogout: () => void;
}

export interface WorkerSetupScreenProps {
  navigation: any;
  onComplete?: () => void;
}

export interface KycScreenProps {
  navigation: any;
  onBack?: () => void;
}

export interface JobSetupScreenProps {
  navigation: any;
  onComplete?: () => void;
}