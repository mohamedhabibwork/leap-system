import { apiClient } from './client';
import { LookupTypeCode } from '@leap-lms/shared-types';

export interface LookupType {
  id: number;
  uuid: string;
  name: string;
  code: string;
  description?: string;
  parentId?: number;
  metadata?: Record<string, any>;
  sortOrder?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface Lookup {
  id: number;
  uuid: string;
  lookupTypeId: number;
  parentId?: number;
  code: string;
  nameEn: string;
  nameAr?: string;
  descriptionEn?: string;
  descriptionAr?: string;
  timezone?: string;
  metadata?: Record<string, any>;
  sortOrder?: number;
  displayOrder?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface LookupsByTypeQuery {
  search?: string;
}

/**
 * Lookups API Service
 * Handles all lookup-related API calls
 * All endpoints are public (no authentication required)
 */
export const lookupsAPI = {
  /**
   * Get all lookup types
   */
  getLookupTypes: () => apiClient.get<LookupType[]>('/lookup-types'),

  /**
   * Get a single lookup type by ID
   */
  getLookupTypeById: (id: number) => apiClient.get<LookupType>(`/lookup-types/${id}`),

  /**
   * Get a single lookup type by code
   */
  getLookupTypeByCode: (code: string) => apiClient.get<LookupType>(`/lookup-types/code/${code}`),

  /**
   * Get lookups by type code
   */
  getLookupsByType: (typeCode: LookupTypeCode | string, query?: LookupsByTypeQuery) =>
    apiClient.get<Lookup[]>(`/lookups/type/${typeCode}`, { params: query }),

  /**
   * Get a single lookup by ID
   */
  getLookupById: (id: number) => apiClient.get<Lookup>(`/lookups/${id}`),
};

export default lookupsAPI;
