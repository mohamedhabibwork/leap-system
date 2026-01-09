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
  Query,
} from '@nestjs/common';
import { MediaService } from './media.service';
import { CreateMediaDto, UpdateMediaDto } from './dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('media')
@Controller('media')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post()
  @ApiOperation({ summary: 'Upload media file' })
  @ApiResponse({ status: 201, description: 'Media uploaded successfully' })
  create(@Body() createMediaDto: CreateMediaDto) {
    return this.mediaService.create(createMediaDto);
  }

  @Get()
  @Roles('admin', 'instructor')
  @ApiOperation({ summary: 'Get all media files' })
  @ApiResponse({ status: 200, description: 'Media retrieved successfully' })
  findAll() {
    return this.mediaService.findAll();
  }

  @Get('by-uploadable')
  @ApiOperation({ summary: 'Get media by uploadable entity' })
  @ApiQuery({ name: 'type', required: true })
  @ApiQuery({ name: 'id', required: true, type: Number })
  @ApiResponse({ status: 200, description: 'Media retrieved successfully' })
  findByUploadable(
    @Query('type') type: string,
    @Query('id', ParseIntPipe) id: number,
  ) {
    return this.mediaService.findByUploadable(type, id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get media by ID' })
  @ApiResponse({ status: 200, description: 'Media retrieved successfully' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.mediaService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update media' })
  @ApiResponse({ status: 200, description: 'Media updated successfully' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMediaDto: UpdateMediaDto,
  ) {
    return this.mediaService.update(id, updateMediaDto);
  }

  @Post(':id/download')
  @ApiOperation({ summary: 'Track media download' })
  @ApiResponse({ status: 200, description: 'Download tracked successfully' })
  async trackDownload(@Param('id', ParseIntPipe) id: number) {
    await this.mediaService.incrementDownloadCount(id);
    return { message: 'Download tracked successfully' };
  }

  @Delete(':id')
  @Roles('admin', 'instructor')
  @ApiOperation({ summary: 'Delete media' })
  @ApiResponse({ status: 200, description: 'Media deleted successfully' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.mediaService.remove(id);
  }

  @Post('cleanup-temporary')
  @Roles('admin')
  @ApiOperation({ summary: 'Cleanup temporary files (Admin only)' })
  @ApiResponse({ status: 200, description: 'Temporary files cleaned up' })
  async cleanupTemporary() {
    const count = await this.mediaService.cleanupTemporaryFiles();
    return { message: `Cleaned up ${count} temporary files` };
  }
}
