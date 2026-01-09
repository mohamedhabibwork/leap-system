"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdsModule = void 0;
const common_1 = require("@nestjs/common");
const ads_service_1 = require("./ads.service");
const ads_controller_1 = require("./ads.controller");
const ad_campaigns_service_1 = require("./ad-campaigns.service");
const ad_campaigns_controller_1 = require("./ad-campaigns.controller");
const ads_tracking_service_1 = require("./ads-tracking.service");
const ads_tracking_controller_1 = require("./ads-tracking.controller");
const ads_targeting_service_1 = require("./ads-targeting.service");
let AdsModule = class AdsModule {
};
exports.AdsModule = AdsModule;
exports.AdsModule = AdsModule = __decorate([
    (0, common_1.Module)({
        controllers: [ads_controller_1.AdsController, ad_campaigns_controller_1.AdCampaignsController, ads_tracking_controller_1.AdsTrackingController],
        providers: [ads_service_1.AdsService, ad_campaigns_service_1.AdCampaignsService, ads_tracking_service_1.AdsTrackingService, ads_targeting_service_1.AdsTargetingService],
        exports: [ads_service_1.AdsService, ad_campaigns_service_1.AdCampaignsService, ads_tracking_service_1.AdsTrackingService, ads_targeting_service_1.AdsTargetingService],
    })
], AdsModule);
//# sourceMappingURL=ads.module.js.map