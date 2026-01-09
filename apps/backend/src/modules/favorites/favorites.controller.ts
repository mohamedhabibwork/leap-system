import { Controller, Get, Post, Body, Delete, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('favorites')
@Controller('favorites')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post()
  create(@CurrentUser() user: any, @Body() dto: CreateFavoriteDto) {
    return this.favoritesService.create(user.userId, dto);
  }

  @Get('my-favorites')
  findMy(@CurrentUser() user: any) {
    return this.favoritesService.findByUser(user.userId);
  }

  @Delete(':id')
  remove(@CurrentUser() user: any, @Param('id', ParseIntPipe) id: number) {
    return this.favoritesService.remove(user.userId, id);
  }
}
