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
  coverPhoto?: string;
  dateOfBirth?: string;
  gender?: string;
  location?: string;
  website?: string;
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
  // User table fields (sent to /users/me)
  firstName?: string;
  lastName?: string;
  phone?: string;
  timezone?: string;
  preferredLanguage?: string;
  // Profile table fields (sent to /users/profile)
  bio?: string;
  dateOfBirth?: string;
  gender?: string;
  location?: string;
  website?: string;
  coverPhoto?: string;
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
      // Separate user fields and profile fields
      const userFields = {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        timezone: data.timezone,
        preferredLanguage: data.preferredLanguage,
      };

      const profileFields = {
        bio: data.bio,
        date_of_birth: data.dateOfBirth,
        gender: data.gender,
        location: data.location,
        website: data.website,
        cover_photo: data.coverPhoto,
      };

      // Update both user and profile in parallel
      const [userResult, profileResult] = await Promise.all([
        // Only update user if there are user fields to update
        Object.values(userFields).some(v => v !== undefined)
          ? apiClient.patch('/users/me', userFields)
          : Promise.resolve(null),
        // Only update profile if there are profile fields to update
        Object.values(profileFields).some(v => v !== undefined)
          ? apiClient.patch('/users/profile', profileFields)
          : Promise.resolve(null),
      ]);

      return { user: userResult, profile: profileResult };
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
      const response = await mediaAPI.upload(file, 'avatars');
      // Update profile with avatar URL
      await apiClient.patch('/users/profile', { avatar: response.url });
      return response;
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

export function useUploadCoverPhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      // Use unified mediaAPI for upload
      const response = await mediaAPI.upload(file, 'covers');
      // Update profile with cover photo URL
      await apiClient.patch('/users/profile', { cover_photo: response.url });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Cover photo uploaded successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message || 'Failed to upload cover photo');
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
