import {
  Controller,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { NewsletterService } from './newsletter.service';
import { SubscribeNewsletterDto } from './dto/subscribe-newsletter.dto';

@ApiTags('newsletter')
@Controller('newsletter')
export class NewsletterController {
  constructor(private readonly newsletterService: NewsletterService) {}

  @Post('subscribe')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Subscribe to newsletter' })
  @ApiResponse({ status: 201, description: 'Successfully subscribed' })
  @ApiResponse({ status: 409, description: 'Email already subscribed' })
  async subscribe(@Body() subscribeDto: SubscribeNewsletterDto) {
    return this.newsletterService.subscribe(subscribeDto);
  }

  @Post('confirm/:email')
  @ApiOperation({ summary: 'Confirm newsletter subscription' })
  async confirm(@Param('email') email: string) {
    return this.newsletterService.confirm(email);
  }

  @Post('unsubscribe/:email')
  @ApiOperation({ summary: 'Unsubscribe from newsletter' })
  async unsubscribe(@Param('email') email: string) {
    const success = await this.newsletterService.unsubscribe(email);
    return { success };
  }
}
