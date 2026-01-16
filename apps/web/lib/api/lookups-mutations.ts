import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import { lookupKeys } from '../hooks/use-lookups';
import type { Lookup, LookupType } from '@leap-lms/shared-types';

/**
 * Mutation DTOs matching backend
 */
export interface CreateLookupDto {
  lookupTypeId: number;
  parentId?: number;
  code: string;
  nameEn: string;
  nameAr?: string;
  descriptionEn?: string;
  descriptionAr?: string;
  timezone?: string;
  metadata?: string;
  sortOrder?: number;
  displayOrder?: number;
  isActive?: boolean;
}

export interface UpdateLookupDto extends Partial<CreateLookupDto> {}

export interface CreateLookupTypeDto {
  name: string;
  code: string;
  description?: string;
  parentId?: number;
  metadata?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdateLookupTypeDto extends Partial<CreateLookupTypeDto> {}

export interface ReorderItem {
  id: number;
  order: number;
}

export interface ReorderLookupsDto {
  items: ReorderItem[];
}

export enum BulkOperation {
  DELETE = 'delete',
  ACTIVATE = 'activate',
  DEACTIVATE = 'deactivate',
}

export interface BulkLookupOperationDto {
  operation: BulkOperation;
  ids: number[];
}

/**
 * Lookup Mutations
 */

export function useCreateLookup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateLookupDto) =>
      apiClient.post<Lookup>('/lookups', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: lookupKeys.values.all });
    },
  });
}

export function useUpdateLookup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateLookupDto }) =>
      apiClient.put<Lookup>(`/lookups/${id}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: lookupKeys.values.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: lookupKeys.values.lists() });
    },
  });
}

export function useDeleteLookup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      apiClient.delete(`/lookups/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: lookupKeys.values.all });
    },
  });
}

export function useReorderLookups() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ReorderLookupsDto) =>
      apiClient.post('/lookups/reorder', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: lookupKeys.values.all });
    },
  });
}

export function useBulkLookupOperation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BulkLookupOperationDto) =>
      apiClient.post('/lookups/bulk', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: lookupKeys.values.all });
    },
  });
}

/**
 * Lookup Type Mutations
 */

export function useCreateLookupType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateLookupTypeDto) =>
      apiClient.post<LookupType>('/lookup-types', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: lookupKeys.types.all });
    },
  });
}

export function useUpdateLookupType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateLookupTypeDto }) =>
      apiClient.put<LookupType>(`/lookup-types/${id}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: lookupKeys.types.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: lookupKeys.types.lists() });
    },
  });
}

export function useDeleteLookupType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      apiClient.delete(`/lookup-types/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: lookupKeys.types.all });
    },
  });
}
