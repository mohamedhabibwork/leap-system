import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionDto, UpdateSubscriptionDto } from './dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('subscriptions')
@Controller('subscriptions')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Create a new subscription (Admin only)' })
  @ApiResponse({ status: 201, description: 'Subscription created successfully' })
  create(@Body() createSubscriptionDto: CreateSubscriptionDto) {
    return this.subscriptionsService.create(createSubscriptionDto);
  }

  @Get()
  @Roles('admin')
  @ApiOperation({ summary: 'Get all subscriptions (Admin only)' })
  @ApiResponse({ status: 200, description: 'Subscriptions retrieved successfully' })
  findAll() {
    return this.subscriptionsService.findAll();
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current user subscriptions' })
  @ApiResponse({ status: 200, description: 'User subscriptions retrieved successfully' })
  getMySubscriptions(@CurrentUser() user: any) {
    return this.subscriptionsService.findByUser(user.userId);
  }

  @Get('me/active')
  @ApiOperation({ summary: 'Get current user active subscription' })
  @ApiResponse({ status: 200, description: 'Active subscription retrieved successfully' })
  getMyActiveSubscription(@CurrentUser() user: any) {
    return this.subscriptionsService.findActiveByUser(user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get subscription by ID' })
  @ApiResponse({ status: 200, description: 'Subscription retrieved successfully' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.subscriptionsService.findOne(id);
  }

  @Patch(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Update subscription (Admin only)' })
  @ApiResponse({ status: 200, description: 'Subscription updated successfully' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSubscriptionDto: UpdateSubscriptionDto,
  ) {
    return this.subscriptionsService.update(id, updateSubscriptionDto);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel subscription' })
  @ApiResponse({ status: 200, description: 'Subscription cancelled successfully' })
  cancel(@Param('id', ParseIntPipe) id: number) {
    return this.subscriptionsService.cancel(id);
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Delete subscription (Admin only)' })
  @ApiResponse({ status: 200, description: 'Subscription deleted successfully' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.subscriptionsService.remove(id);
  }
}
