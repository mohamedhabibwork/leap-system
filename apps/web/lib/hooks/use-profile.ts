import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { mediaAPI } from '../api/media';
import apiClient from '../api/client';
import { toast } from 'sonner';

export interface UserProfile {
  id: number;
  uuid: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  bio?: string;
  avatarUrl?: string;
  roleId: number;
  preferredLanguage: string;
  timezone?: string;
  isOnline: boolean;
  isActive: boolean;
  lastSeenAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  bio?: string;
  timezone?: string;
  preferredLanguage?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export function useProfile(userId?: number) {
  return useQuery({
    queryKey: ['profile', userId || 'me'],
    queryFn: async () => {
      if (userId) {
        return await apiClient.get<UserProfile>(`/users/${userId}`);
      }
      return await apiClient.get<UserProfile>('/users/me');
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateProfileData) => {
      return await apiClient.patch('/users/profile', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Profile updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    },
  });
}

export function useUploadAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      // Use unified mediaAPI for upload
      return await mediaAPI.upload(file, 'avatars');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Avatar uploaded successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message || 'Failed to upload avatar');
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: async (data: ChangePasswordData) => {
      return await apiClient.patch('/users/me/password', data);
    },
    onSuccess: () => {
      toast.success('Password changed successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to change password');
    },
  });
}

export function usePublicProfile(userId: number) {
  return useQuery({
    queryKey: ['public-profile', userId],
    queryFn: async () => {
      return await apiClient.get<UserProfile>(`/users/${userId}/profile`);
    },
    enabled: !!userId,
  });
}
