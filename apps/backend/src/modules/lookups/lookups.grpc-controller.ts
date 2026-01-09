import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { LookupsService } from './lookups.service';
import { LookupTypesService } from './lookup-types.service';

@Controller()
export class LookupsGrpcController {
  constructor(
    private readonly lookupsService: LookupsService,
    private readonly lookupTypesService: LookupTypesService,
  ) {}

  @GrpcMethod('LookupsService', 'FindAll')
  async findAll() {
    const lookups = await this.lookupsService.findAll();
    return { lookups };
  }

  @GrpcMethod('LookupsService', 'FindByType')
  async findByType(data: { typeCode: string; search?: string }) {
    const lookups = await this.lookupsService.findByType(data.typeCode, { search: data.search });
    return { lookups };
  }

  @GrpcMethod('LookupsService', 'FindOne')
  async findOne(data: { id: number }) {
    return this.lookupsService.findOne(data.id);
  }

  @GrpcMethod('LookupsService', 'Create')
  async create(data: any) {
    return this.lookupsService.create(data);
  }

  @GrpcMethod('LookupsService', 'Update')
  async update(data: any) {
    const { id, ...updateData } = data;
    return this.lookupsService.update(id, updateData);
  }

  @GrpcMethod('LookupsService', 'Delete')
  async delete(data: { id: number }) {
    return this.lookupsService.remove(data.id);
  }

  @GrpcMethod('LookupsService', 'FindAllTypes')
  async findAllTypes() {
    const types = await this.lookupTypesService.findAll();
    return { types };
  }

  @GrpcMethod('LookupsService', 'FindOneType')
  async findOneType(data: { id: number }) {
    return this.lookupTypesService.findOne(data.id);
  }

  @GrpcMethod('LookupsService', 'CreateType')
  async createType(data: any) {
    return this.lookupTypesService.create(data);
  }

  @GrpcMethod('LookupsService', 'UpdateType')
  async updateType(data: any) {
    const { id, ...updateData } = data;
    return this.lookupTypesService.update(id, updateData);
  }

  @GrpcMethod('LookupsService', 'DeleteType')
  async deleteType(data: { id: number }) {
    return this.lookupTypesService.remove(data.id);
  }
}
