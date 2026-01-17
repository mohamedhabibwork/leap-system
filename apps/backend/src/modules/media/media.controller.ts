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
  UseInterceptors,
  UploadedFile,
  Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MediaService } from './media.service';
import { MinioService } from './minio.service';
import { R2Service } from './r2.service';
import { CreateMediaDto, UpdateMediaDto } from './dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ResourceOwnerGuard } from '../../common/guards/resource-owner.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ResourceType, SkipOwnership } from '../../common/decorators/resource-type.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser,getUserId } from '../../common/types/request.types';
import { Role } from '../../common/enums/roles.enum';
import { ConfigService } from '@nestjs/config';

@ApiTags('media')
@Controller('media')
@UseGuards(JwtAuthGuard, RolesGuard, ResourceOwnerGuard)
@ApiBearerAuth()
export class MediaController {
  private readonly logger = new Logger(MediaController.name);
  private storageProvider: 'minio' | 'r2';

  constructor(
    private readonly mediaService: MediaService,
    private readonly minioService: MinioService,
    private readonly r2Service: R2Service,
    private readonly configService: ConfigService,
  ) {
    // Choose storage provider based on configuration
    this.storageProvider = this.configService.get<string>('STORAGE_PROVIDER') === 'r2' ? 'r2' : 'minio';
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload file to storage (MinIO or R2)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        folder: {
          type: 'string',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'File uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid file or missing file' })
  @ApiResponse({ status: 413, description: 'File too large' })
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('folder') folder: string = 'general',
    @CurrentUser() user: AuthenticatedUser,
  ) {
    if (!file) {
      throw new Error('No file provided');
    }

    // Add user info to track who uploaded the file
    const uploadResult = this.storageProvider === 'r2'
      ? await this.r2Service.uploadFile(file, folder)
      : await this.minioService.uploadFile(file, folder);

    // Log upload for security audit
    this.logger.log(
      `File uploaded by user ${user.id}: ${file.originalname} (${file.size} bytes) to ${folder}`
    );

    return {
      ...uploadResult,
      uploadedBy: user.id,
      uploadedAt: new Date(),
    };
  }

  @Post('upload/avatar')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload avatar image' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Avatar uploaded successfully' })
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    if (!file) {
      throw new Error('No file provided');
    }

    // Validate file is an image
    if (!file.mimetype.startsWith('image/')) {
      throw new Error('File must be an image');
    }

    // Upload to avatars folder
    const result = this.storageProvider === 'r2'
      ? await this.r2Service.uploadFile(file, 'avatars')
      : await this.minioService.uploadFile(file, 'avatars');

    this.logger.log(`Avatar uploaded by user ${user.id}`);

    return {
      ...result,
      type: 'avatar',
      uploadedBy: user.id,
    };
  }

  @Post()
  @ApiOperation({ summary: 'Create media record' })
  @ApiResponse({ status: 201, description: 'Media record created successfully' })
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

  @Delete(':key')
  @ApiOperation({ summary: 'Delete file from storage' })
  @ApiResponse({ status: 200, description: 'File deleted successfully' })
  async deleteFile(@Param('key') key: string) {
    if (this.storageProvider === 'r2') {
      await this.r2Service.deleteFile(key);
    } else {
      await this.minioService.deleteFile(key);
    }
    return { message: 'File deleted successfully' };
  }

  @Delete(':id')
  @Roles('admin', 'instructor')
  @ApiOperation({ summary: 'Delete media record' })
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
