// Ad Module Types

export interface Ad {
  id: number;
  uuid: string;
  campaignId?: number;
  adType: 'banner' | 'sponsored' | 'popup' | 'video';
  targetType?: 'course' | 'event' | 'job' | 'post' | 'external';
  targetId?: number;
  externalUrl?: string;
  titleEn: string;
  titleAr?: string;
  descriptionEn?: string;
  descriptionAr?: string;
  mediaUrl?: string;
  callToAction?: string;
  placementType: string;
  status: string;
  priority: number;
  startDate: Date;
  endDate?: Date;
  isPaid: boolean;
  impressionCount: number;
  clickCount: number;
  ctr: number;
  createdBy: number;
  createdAt: Date;
  updatedAt?: Date;
}

export interface AdTargetingRules {
  id?: number;
  adId: number;
  targetUserRoles?: string[];
  targetSubscriptionPlans?: number[];
  targetAgeRange?: { min: number; max: number };
  targetLocations?: string[];
  targetInterests?: string[];
  targetBehavior?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface AdCampaign {
  id: number;
  uuid: string;
  name: string;
  description?: string;
  budget?: number;
  spentAmount: number;
  status: string;
  startDate: Date;
  endDate?: Date;
  createdBy: number;
  ads?: Ad[];
  createdAt: Date;
  updatedAt?: Date;
}

export interface AdPlacement {
  id: number;
  uuid: string;
  code: string;
  nameEn: string;
  nameAr?: string;
  description?: string;
  width?: number;
  height?: number;
  maxAds: number;
  isActive: boolean;
}

export interface AdImpression {
  id: number;
  uuid: string;
  adId: number;
  userId?: number;
  sessionId: string;
  placementId?: number;
  ipAddress?: string;
  userAgent?: string;
  viewedAt: Date;
  metadata?: Record<string, unknown>;
}

export interface AdClick {
  id: number;
  uuid: string;
  adId: number;
  impressionId?: number;
  userId?: number;
  sessionId: string;
  clickedAt: Date;
  referrer?: string;
  destinationUrl?: string;
  converted: boolean;
  metadata?: Record<string, unknown>;
}

export interface AdPayment {
  id: number;
  uuid: string;
  campaignId: number;
  userId: number;
  amount: number;
  currency: string;
  paymentMethod?: string;
  transactionId?: string;
  paymentStatus: string;
  paidAt?: Date;
  metadata?: Record<string, unknown>;
}

export interface AdAnalytics {
  adId: number;
  impressions: number;
  clicks: number;
  ctr: number;
  uniqueUsers: number;
  topPlacements: Array<{ placement: string; count: number }>;
  dailyStats: Array<{ date: string; impressions: number; clicks: number }>;
}

export interface CreateAdDto {
  campaignId?: number;
  adTypeId: number;
  targetType?: 'course' | 'event' | 'job' | 'post' | 'external';
  targetId?: number;
  externalUrl?: string;
  titleEn: string;
  titleAr?: string;
  descriptionEn?: string;
  descriptionAr?: string;
  mediaUrl?: string;
  callToAction?: string;
  placementTypeId: number;
  priority?: number;
  startDate: string;
  endDate?: string;
  isPaid?: boolean;
  targetingRules?: Omit<AdTargetingRules, 'id' | 'adId'>;
}

export interface UpdateAdDto extends Partial<CreateAdDto> {}

export interface AdQueryParams {
  statusId?: number;
  adTypeId?: number;
  placementCode?: string;
  userId?: number;
  campaignId?: number;
  page?: number;
  limit?: number;
}

export interface GetActiveAdsParams {
  placement?: string;
  limit?: number;
}

export interface TrackImpressionDto {
  adId: number;
  placementCode?: string;
  userId?: number;
  sessionId: string;
  metadata?: Record<string, unknown>;
}

export interface TrackClickDto {
  adId: number;
  impressionId?: number;
  userId?: number;
  sessionId: string;
  referrer?: string;
  destinationUrl?: string;
  metadata?: Record<string, unknown>;
}
