// Entity placeholder for TypeORM compatibility
// Actual schema is defined in packages/database/src/schema/ads.schema.ts using Drizzle ORM

export class Ad {
  id: number;
  uuid: string;
  campaignId?: number;
  adTypeId: number;
  targetType?: string;
  targetId?: number;
  externalUrl?: string;
  titleEn: string;
  titleAr?: string;
  descriptionEn?: string;
  descriptionAr?: string;
  mediaUrl?: string;
  callToAction?: string;
  placementTypeId: number;
  statusId: number;
  priority: number;
  startDate: Date;
  endDate?: Date;
  isPaid: boolean;
  paymentStatusId?: number;
  impressionCount: number;
  clickCount: number;
  ctr: number;
  createdBy: number;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export class AdCampaign {
  id: number;
  uuid: string;
  name: string;
  description?: string;
  budget?: number;
  spentAmount: number;
  statusId: number;
  startDate: Date;
  endDate?: Date;
  createdBy: number;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}
