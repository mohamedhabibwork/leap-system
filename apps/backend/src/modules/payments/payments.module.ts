import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PaymentsService } from './payments.service';
import { PayPalService } from './paypal.service';
import { PdfService } from './pdf.service';
import { PaymentsController } from './payments.controller';
import { DatabaseModule } from '../../database/database.module';
import { BackgroundJobsModule } from '../background-jobs/background-jobs.module';
import { PlansModule } from '../plans/plans.module';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { LookupsModule } from '../lookups/lookups.module';

@Module({
  imports: [
    DatabaseModule,
    BackgroundJobsModule,
    HttpModule,
    PlansModule,
    SubscriptionsModule,
    LookupsModule,
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService, PayPalService, PdfService],
  exports: [PaymentsService, PayPalService, PdfService],
})
export class PaymentsModule {}
