"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdCampaign = exports.Ad = void 0;
class Ad {
    id;
    uuid;
    campaignId;
    adTypeId;
    targetType;
    targetId;
    externalUrl;
    titleEn;
    titleAr;
    descriptionEn;
    descriptionAr;
    mediaUrl;
    callToAction;
    placementTypeId;
    statusId;
    priority;
    startDate;
    endDate;
    isPaid;
    paymentStatusId;
    impressionCount;
    clickCount;
    ctr;
    createdBy;
    isDeleted;
    createdAt;
    updatedAt;
    deletedAt;
}
exports.Ad = Ad;
class AdCampaign {
    id;
    uuid;
    name;
    description;
    budget;
    spentAmount;
    statusId;
    startDate;
    endDate;
    createdBy;
    isDeleted;
    createdAt;
    updatedAt;
    deletedAt;
}
exports.AdCampaign = AdCampaign;
//# sourceMappingURL=ad.entity.js.map