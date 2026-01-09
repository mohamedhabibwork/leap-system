import { Module } from '@nestjs/common';
import { LookupsService } from './lookups.service';
import { LookupsController } from './lookups.controller';
import { LookupTypesService } from './lookup-types.service';
import { LookupTypesController } from './lookup-types.controller';

@Module({
  controllers: [LookupsController, LookupTypesController],
  providers: [LookupsService, LookupTypesService],
  exports: [LookupsService, LookupTypesService],
})
export class LookupsModule {}
