import { Controller, Get, Post, Body, Delete, Param, UseGuards, ParseIntPipe, Query } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { BulkCheckFavoriteDto } from './dto/bulk-check-favorite.dto';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser, getUserId } from '../../common/types/request.types';

@ApiTags('favorites')
@Controller('favorites')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post('toggle')
  @ApiOperation({ summary: 'Toggle favorite status (add if not exists, remove if exists)' })
  @ApiResponse({ status: 200, description: 'Favorite toggled successfully' })
  async toggle(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateFavoriteDto) {
    return this.favoritesService.toggle(getUserId(user), dto);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new favorite' })
  @ApiResponse({ status: 201, description: 'Favorite created successfully' })
  @ApiResponse({ status: 400, description: 'Already favorited' })
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateFavoriteDto) {
    return this.favoritesService.create(getUserId(user), dto);
  }

  @Get('my-favorites')
  @ApiOperation({ summary: 'Get all favorites for current user' })
  @ApiResponse({ status: 200, description: 'Favorites retrieved successfully' })
  findMy(@CurrentUser() user: AuthenticatedUser) {
    return this.favoritesService.findByUser(getUserId(user));
  }

  @Get('check')
  @ApiOperation({ summary: 'Check if an entity is favorited' })
  @ApiResponse({ status: 200, description: 'Favorite status checked' })
  async checkFavorite(
    @CurrentUser() user: AuthenticatedUser,
    @Query('type') favoritableType: string,
    @Query('id', ParseIntPipe) favoritableId: number,
  ) {
    const isFavorited = await this.favoritesService.checkFavorite(
      getUserId(user),
      favoritableType,
      favoritableId,
    );
    return { favorited: isFavorited };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove favorite by ID' })
  @ApiResponse({ status: 200, description: 'Favorite removed successfully' })
  @ApiResponse({ status: 404, description: 'Favorite not found' })
  remove(@CurrentUser() user: AuthenticatedUser, @Param('id', ParseIntPipe) id: number) {
    return this.favoritesService.remove(getUserId(user), id);
  }

  @Delete()
  @ApiOperation({ summary: 'Remove favorite by entity type and ID' })
  @ApiResponse({ status: 200, description: 'Favorite removed successfully' })
  @ApiResponse({ status: 404, description: 'Favorite not found' })
  removeByEntity(
    @CurrentUser() user: AuthenticatedUser,
    @Query('type') favoritableType: string,
    @Query('id', ParseIntPipe) favoritableId: number,
  ) {
    return this.favoritesService.removeByEntity(
      getUserId(user),
      favoritableType,
      favoritableId,
    );
  }

  @Get('my-favorites-with-entities')
  @ApiOperation({ summary: 'Get all favorites for current user with full entity data' })
  @ApiResponse({ status: 200, description: 'Favorites with entities retrieved successfully' })
  findMyWithEntities(
    @CurrentUser() user: AuthenticatedUser,
    @Query('type') type?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.favoritesService.findByUserWithEntities(
      getUserId(user),
      { type, page: page ? Number(page) : undefined, limit: limit ? Number(limit) : undefined },
    );
  }

  @Get('by-type/:type')
  @ApiOperation({ summary: 'Get favorites by type for current user' })
  @ApiResponse({ status: 200, description: 'Favorites by type retrieved successfully' })
  findByType(
    @CurrentUser() user: AuthenticatedUser,
    @Param('type') type: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.favoritesService.findByType(
      getUserId(user),
      type,
      { page: page ? Number(page) : undefined, limit: limit ? Number(limit) : undefined },
    );
  }

  @Post('bulk-check')
  @ApiOperation({ summary: 'Bulk check favorite status for multiple items' })
  @ApiResponse({ status: 200, description: 'Favorite status checked for all items' })
  bulkCheck(@CurrentUser() user: AuthenticatedUser, @Body() dto: BulkCheckFavoriteDto) {
    return this.favoritesService.bulkCheckFavorite(
      getUserId(user),
      dto.items,
    );
  }
}
