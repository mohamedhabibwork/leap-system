import { Controller, Get, Post, Body, UseGuards, Query, ParseIntPipe } from '@nestjs/common';
import { SharesService } from './shares.service';
import { CreateShareDto } from './dto/create-share.dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('shares')
@Controller('shares')

@ApiBearerAuth()
export class SharesController {
  constructor(private readonly sharesService: SharesService) {}

  @Post()
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateShareDto) {
    return this.sharesService.create(getUserId(user), dto);
  }

  @Get('my-shares')
  findMy(@CurrentUser() user: AuthenticatedUser) {
    return this.sharesService.findByUser(getUserId(user));
  }

  @Get('by-shareable')
  findByShareable(@Query('type') type: string, @Query('id', ParseIntPipe) id: number) {
    return this.sharesService.findByShareable(type, id);
  }
}
