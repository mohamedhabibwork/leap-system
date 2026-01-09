import { Module } from '@nestjs/common';
import { AdsService } from './ads.service';
import { AdsController } from './ads.controller';
import { AdCampaignsService } from './ad-campaigns.service';
import { AdCampaignsController } from './ad-campaigns.controller';
import { AdsTrackingService } from './ads-tracking.service';
import { AdsTrackingController } from './ads-tracking.controller';
import { AdsTargetingService } from './ads-targeting.service';

@Module({
  controllers: [AdsController, AdCampaignsController, AdsTrackingController],
  providers: [AdsService, AdCampaignsService, AdsTrackingService, AdsTargetingService],
  exports: [AdsService, AdCampaignsService, AdsTrackingService, AdsTargetingService],
})
export class AdsModule {}
