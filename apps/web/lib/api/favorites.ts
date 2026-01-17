import { apiClient } from './client';

export interface Favorite {
  id: number;
  uuid: string;
  userId: number;
  favoritableType: string;
  favoritableId: number;
  createdAt: string;
  deletedAt?: string;
}

export interface FavoriteWithEntity {
  favorite: Favorite;
  entity: any;
  type: string;
}

export interface FavoritesResponse {
  data: FavoriteWithEntity[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateFavoriteDto {
  favoritableType: string;
  favoritableId: number;
}

export interface BulkCheckItem {
  type: string;
  id: number;
}

export interface BulkCheckFavoriteDto {
  items: BulkCheckItem[];
}

/**
 * Favorites API Service
 * Handles all favorite-related API calls with authentication
 */
export const favoritesAPI = {
  /**
   * Toggle favorite status (add if not exists, remove if exists)
   */
  toggle: (data: CreateFavoriteDto) =>
    apiClient.post<{ favorited: boolean; favorite: Favorite | null }>('/favorites/toggle', data),

  /**
   * Create a new favorite
   */
  create: (data: CreateFavoriteDto) =>
    apiClient.post<Favorite>('/favorites', data),

  /**
   * Get all favorites for current user
   */
  getMyFavorites: () =>
    apiClient.get<Favorite[]>('/favorites/my-favorites'),

  /**
   * Get all favorites for current user with full entity data
   */
  getMyFavoritesWithEntities: (params?: { type?: string; page?: number; limit?: number }) =>
    apiClient.get<FavoritesResponse>('/favorites/my-favorites-with-entities', { params }),

  /**
   * Get favorites by type for current user
   */
  getFavoritesByType: (type: string, params?: { page?: number; limit?: number }) =>
    apiClient.get<{ data: any[]; pagination: any }>(`/favorites/by-type/${type}`, { params }),

  /**
   * Check if an entity is favorited
   */
  checkFavorite: (type: string, id: number) =>
    apiClient.get<{ favorited: boolean }>('/favorites/check', { params: { type, id } }),

  /**
   * Bulk check favorite status for multiple items
   */
  bulkCheck: (data: BulkCheckFavoriteDto) =>
    apiClient.post<Record<string, boolean>>('/favorites/bulk-check', data),

  /**
   * Remove favorite by ID
   */
  remove: (id: number) =>
    apiClient.delete(`/favorites/${id}`),

  /**
   * Remove favorite by entity type and ID
   */
  removeByEntity: (type: string, id: number) =>
    apiClient.delete('/favorites', { params: { type, id } }),
};

export default favoritesAPI;
