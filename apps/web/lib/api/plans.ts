import apiClient from './client';

export interface Plan {
  id: number;
  uuid: string;
  nameEn: string;
  nameAr?: string;
  descriptionEn?: string;
  descriptionAr?: string;
  priceMonthly?: number;
  priceQuarterly?: number;
  priceAnnual?: number;
  maxCourses?: number;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
}

/**
 * Plans API functions using REST API
 */
export const plansAPI = {
  /**
   * Get all plans
   */
  findAll: () => apiClient.get<Plan[]>('/plans'),

  /**
   * Get all active plans
   */
  findActive: () => apiClient.get<Plan[]>('/plans/active'),

  /**
   * Get plan by ID
   */
  findOne: (id: number) => apiClient.get<Plan>(`/plans/${id}`),

  /**
   * Get plan by slug
   */
  findBySlug: (slug: string) => apiClient.get<Plan>(`/plans/slug/${slug}`),
};
