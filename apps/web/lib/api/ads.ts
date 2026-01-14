import { apiClient } from './client';

export interface AdCreateData {
  adType: string;
  targetType: string;
  targetId?: string;
  externalUrl?: string;
  titleEn: string;
  titleAr?: string;
  descriptionEn?: string;
  descriptionAr?: string;
  mediaUrl: string;
  callToAction?: string;
  targetUserRoles?: string[];
  targetSubscriptionPlans?: number[];
  placementType: string;
  startDate: string;
  endDate?: string;
  isPaid?: boolean;
}

export const adsAPI = {
  create: (data: AdCreateData) => {
    return apiClient.post('/ads', data);
  },
};
