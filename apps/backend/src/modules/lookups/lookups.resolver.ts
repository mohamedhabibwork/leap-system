import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { LookupsService } from './lookups.service';
import { LookupTypesService } from './lookup-types.service';
import { Lookup, LookupsPaginated, LookupStatistics } from './types/lookup.type';
import { LookupType } from './types/lookup-type.type';
import { CreateLookupInput, UpdateLookupInput, CreateLookupTypeInput, UpdateLookupTypeInput } from './types/lookup.input';
import { Roles } from '../../common/decorators/roles.decorator';

@Resolver(() => Lookup)

export class LookupsResolver {
  constructor(
    private readonly lookupsService: LookupsService,
    private readonly lookupTypesService: LookupTypesService,
  ) {}

  // Lookup Queries
  @Query(() => [Lookup], { name: 'lookups' })
  async findAllLookups() {
    return this.lookupsService.findAll();
  }

  @Query(() => [Lookup], { name: 'lookupsByType' })
  async findLookupsByType(
    @Args('typeCode') typeCode: string,
    @Args('search', { nullable: true }) search?: string,
  ) {
    return this.lookupsService.findByType(typeCode, { search });
  }

  @Query(() => Lookup, { name: 'lookup' })
  async findOneLookup(@Args('id', { type: () => Int }) id: number) {
    return this.lookupsService.findOne(id);
  }

  @Query(() => LookupsPaginated, { name: 'lookupsAdmin' })
  @Roles('admin')
  async findAllLookupsAdmin(
    @Args('page', { type: () => Int, nullable: true }) page?: number,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
    @Args('search', { nullable: true }) search?: string,
    @Args('typeId', { type: () => Int, nullable: true }) typeId?: number,
  ) {
    return this.lookupsService.findAllAdmin({ page, limit, search, typeId });
  }

  @Query(() => LookupStatistics, { name: 'lookupsStatistics' })
  @Roles('admin')
  async getLookupStatistics() {
    return this.lookupsService.getStatistics();
  }

  // Lookup Mutations
  @Mutation(() => Lookup)
  @Roles('admin')
  async createLookup(@Args('input') input: CreateLookupInput) {
    return this.lookupsService.create(input);
  }

  @Mutation(() => Lookup)
  @Roles('admin')
  async updateLookup(
    @Args('id', { type: () => Int }) id: number,
    @Args('input') input: UpdateLookupInput,
  ) {
    return this.lookupsService.update(id, input);
  }

  @Mutation(() => String)
  @Roles('admin')
  async removeLookup(@Args('id', { type: () => Int }) id: number) {
    const result = await this.lookupsService.remove(id);
    return result.message;
  }

  // Lookup Type Queries
  @Query(() => [LookupType], { name: 'lookupTypes' })
  async findAllLookupTypes() {
    return this.lookupTypesService.findAll();
  }

  @Query(() => LookupType, { name: 'lookupType' })
  async findOneLookupType(@Args('id', { type: () => Int }) id: number) {
    return this.lookupTypesService.findOne(id);
  }

  @Query(() => LookupType, { name: 'lookupTypeByCode' })
  async findLookupTypeByCode(@Args('code') code: string) {
    return this.lookupTypesService.findByCode(code);
  }

  // Lookup Type Mutations
  @Mutation(() => LookupType)
  @Roles('admin')
  async createLookupType(@Args('input') input: CreateLookupTypeInput) {
    return this.lookupTypesService.create(input);
  }

  @Mutation(() => LookupType)
  @Roles('admin')
  async updateLookupType(
    @Args('id', { type: () => Int }) id: number,
    @Args('input') input: UpdateLookupTypeInput,
  ) {
    return this.lookupTypesService.update(id, input);
  }

  @Mutation(() => String)
  @Roles('admin')
  async removeLookupType(@Args('id', { type: () => Int }) id: number) {
    const result = await this.lookupTypesService.remove(id);
    return result.message;
  }
}
