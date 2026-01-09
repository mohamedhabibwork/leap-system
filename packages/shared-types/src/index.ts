// Shared types for the LEAP LMS platform

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// User roles
export enum UserRole {
  ADMIN = 'admin',
  INSTRUCTOR = 'instructor',
  USER = 'user',
  RECRUITER = 'recruiter',
}

// Common entity interface
export interface BaseEntity {
  id: number;
  uuid: string;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date;
  isDeleted: boolean;
}

export * from './api.types';
export * from './user.types';
export * from './course.types';
