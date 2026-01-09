import { Module } from '@nestjs/common';
import { LookupsService } from './lookups.service';
import { LookupsController } from './lookups.controller';
import { LookupTypesService } from './lookup-types.service';
import { LookupTypesController } from './lookup-types.controller';
import { LookupsResolver } from './lookups.resolver';
import { LookupsGrpcController } from './lookups.grpc-controller';

@Module({
  controllers: [LookupsController, LookupTypesController, LookupsGrpcController],
  providers: [LookupsService, LookupTypesService, LookupsResolver],
  exports: [LookupsService, LookupTypesService],
})
export class LookupsModule {}
