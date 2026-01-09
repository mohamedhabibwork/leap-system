import { Controller, Get, Post, Body, UseGuards, Query, ParseIntPipe } from '@nestjs/common';
import { SharesService } from './shares.service';
import { CreateShareDto } from './dto/create-share.dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('shares')
@Controller('shares')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SharesController {
  constructor(private readonly sharesService: SharesService) {}

  @Post()
  create(@CurrentUser() user: any, @Body() dto: CreateShareDto) {
    return this.sharesService.create(user.userId, dto);
  }

  @Get('my-shares')
  findMy(@CurrentUser() user: any) {
    return this.sharesService.findByUser(user.userId);
  }

  @Get('by-shareable')
  findByShareable(@Query('type') type: string, @Query('id', ParseIntPipe) id: number) {
    return this.sharesService.findByShareable(type, id);
  }
}
