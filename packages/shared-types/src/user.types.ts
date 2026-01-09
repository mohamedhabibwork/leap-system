// User-related types

export interface User {
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
  statusId: number;
  preferredLanguage: string;
  timezone?: string;
  isOnline: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

export interface CreateUserDto {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  roleId: number;
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  phone?: string;
  bio?: string;
  avatarUrl?: string;
  preferredLanguage?: string;
  timezone?: string;
}
