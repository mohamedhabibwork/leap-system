import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ContactService } from './contact.service';
import { CreateContactDto } from './dto/create-contact.dto';

@ApiTags('contact')
@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Submit a contact form' })
  @ApiResponse({ status: 201, description: 'Contact form submitted successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async create(@Body() createContactDto: CreateContactDto) {
    return this.contactService.create(createContactDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all contact submissions (Admin only)' })
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('admin')
  async findAll() {
    return this.contactService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a contact submission by ID (Admin only)' })
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('admin')
  async findOne(@Param('id') id: string) {
    return this.contactService.findOne(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update contact submission status (Admin only)' })
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('admin')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.contactService.updateStatus(id, status);
  }
}
