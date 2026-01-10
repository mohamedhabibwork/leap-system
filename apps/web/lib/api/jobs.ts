import { apiClient } from './client';

export interface Job {
  id: number;
  title: string;
  description?: string;
  companyId: number;
  company: {
    id: number;
    name: string;
    logo?: string;
    website?: string;
  };
  location: string;
  locationType: 'remote' | 'hybrid' | 'on-site';
  jobType: 'full-time' | 'part-time' | 'contract' | 'freelance' | 'internship';
  experienceLevel: 'entry' | 'mid' | 'senior' | 'lead' | 'executive';
  salary?: {
    min: number;
    max: number;
    currency: string;
    period: 'hourly' | 'monthly' | 'yearly';
  };
  categoryId?: number;
  category?: string;
  requirements?: string[];
  responsibilities?: string[];
  benefits?: string[];
  skills?: string[];
  status: 'draft' | 'published' | 'closed' | 'filled';
  isFeatured: boolean;
  applicationCount: number;
  viewCount: number;
  postedAt: string;
  expiresAt?: string;
  postedBy: number;
  hasApplied?: boolean;
  isSaved?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface JobApplication {
  id: number;
  jobId: number;
  userId: number;
  fullName: string;
  email: string;
  phone: string;
  resumeUrl: string;
  coverLetter: string;
  status: 'pending' | 'reviewed' | 'shortlisted' | 'interview' | 'accepted' | 'rejected';
  appliedAt: string;
  reviewedAt?: string;
  notes?: string;
  user?: {
    id: number;
    firstName: string;
    lastName: string;
    avatar?: string;
    email: string;
  };
}

export interface CreateJobDto {
  titleEn: string;
  titleAr?: string;
  slug: string;
  descriptionEn?: string;
  descriptionAr?: string;
  jobTypeId: number;
  experienceLevelId: number;
  statusId: number;
  location?: string;
  salaryRange?: string;
  companyId?: number;
}

export interface UpdateJobDto {
  title?: string;
  description?: string;
  location?: string;
  locationType?: 'remote' | 'hybrid' | 'on-site';
  jobType?: 'full-time' | 'part-time' | 'contract' | 'freelance' | 'internship';
  experienceLevel?: 'entry' | 'mid' | 'senior' | 'lead' | 'executive';
  salary?: {
    min: number;
    max: number;
    currency: string;
    period: 'hourly' | 'monthly' | 'yearly';
  };
  categoryId?: number;
  requirements?: string[];
  responsibilities?: string[];
  benefits?: string[];
  skills?: string[];
  status?: 'draft' | 'published' | 'closed' | 'filled';
  expiresAt?: string;
}

export interface ApplyJobDto {
  fullName: string;
  email: string;
  phone: string;
  resumeUrl: string;
  coverLetter: string;
}

export interface UpdateApplicationStatusDto {
  status: 'pending' | 'reviewed' | 'shortlisted' | 'interview' | 'accepted' | 'rejected';
  notes?: string;
}

/**
 * Jobs API Service
 * Handles all job-related API calls with authentication
 */
export const jobsAPI = {
  /**
   * Get all jobs with pagination and filtering
   */
  getAll: (params?: any) => 
    apiClient.get<Job[]>('/jobs', { params }),
  
  /**
   * Get a single job by ID
   */
  getById: (id: number) => 
    apiClient.get<Job>(`/jobs/${id}`),
  
  /**
   * Create a new job posting
   */
  create: (data: CreateJobDto) => 
    apiClient.post<Job>('/jobs', data),
  
  /**
   * Update an existing job
   */
  update: (id: number, data: UpdateJobDto) => 
    apiClient.patch<Job>(`/jobs/${id}`, data),
  
  /**
   * Delete a job
   */
  delete: (id: number) => 
    apiClient.delete(`/jobs/${id}`),
  
  /**
   * Apply for a job
   */
  apply: (id: number, data: ApplyJobDto) => 
    apiClient.post<JobApplication>(`/jobs/${id}/apply`, data),
  
  /**
   * Get job applications
   */
  getApplications: (id: number, params?: any) => 
    apiClient.get<JobApplication[]>(`/jobs/${id}/applications`, { params }),
  
  /**
   * Update application status
   */
  updateApplicationStatus: (jobId: number, applicationId: number, data: UpdateApplicationStatusDto) => 
    apiClient.patch<JobApplication>(`/jobs/${jobId}/applications/${applicationId}`, data),
  
  /**
   * Get my job postings
   */
  getMyJobs: (params?: any) => 
    apiClient.get<Job[]>('/jobs/my-jobs', { params }),
  
  /**
   * Get my applications
   */
  getMyApplications: (params?: any) => 
    apiClient.get<JobApplication[]>('/jobs/my-applications', { params }),
  
  /**
   * Save a job
   */
  save: (id: number) => 
    apiClient.post(`/jobs/${id}/save`),
  
  /**
   * Unsave a job
   */
  unsave: (id: number) => 
    apiClient.delete(`/jobs/${id}/save`),
  
  /**
   * Get saved jobs
   */
  getSavedJobs: (params?: any) => 
    apiClient.get<Job[]>('/jobs/saved', { params }),
  
  /**
   * Feature a job
   */
  feature: (id: number) => 
    apiClient.post(`/jobs/${id}/feature`),
  
  /**
   * Unfeature a job
   */
  unfeature: (id: number) => 
    apiClient.delete(`/jobs/${id}/feature`),
  
  /**
   * Get job statistics
   */
  getStatistics: () => 
    apiClient.get('/jobs/statistics'),
  
  /**
   * Export jobs to CSV
   */
  exportToCsv: (params?: any) => 
    apiClient.get('/jobs/export/csv', { params, responseType: 'blob' }),
};

export default jobsAPI;
