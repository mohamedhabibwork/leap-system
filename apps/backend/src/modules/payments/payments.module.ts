import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PayPalService } from './paypal.service';
import { PdfService } from './pdf.service';
import { PaymentsController } from './payments.controller';
import { DatabaseModule } from '../../database/database.module';
import { BackgroundJobsModule } from '../background-jobs/background-jobs.module';

@Module({
  imports: [DatabaseModule, BackgroundJobsModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, PayPalService, PdfService],
  exports: [PaymentsService, PayPalService, PdfService],
})
export class PaymentsModule {}
