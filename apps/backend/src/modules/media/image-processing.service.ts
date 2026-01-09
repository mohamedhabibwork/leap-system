import { Injectable, Logger } from '@nestjs/common';
import sharp from 'sharp';
import * as path from 'path';
import * as crypto from 'crypto';

interface ImageDimensions {
  width: number;
  height: number;
}

interface ResizeOptions {
  width?: number;
  height?: number;
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  quality?: number;
}

interface ThumbnailSizes {
  small: ImageDimensions;
  medium: ImageDimensions;
  large: ImageDimensions;
}

interface ProcessedImages {
  original: Buffer;
  thumbnail?: Buffer;
  webp?: Buffer;
  thumbnails?: {
    small: Buffer;
    medium: Buffer;
    large: Buffer;
  };
}

/**
 * Image processing service using Sharp
 * 
 * Features:
 * - Image optimization (resize, compress)
 * - Thumbnail generation
 * - Multiple format support (WebP conversion)
 * - Metadata extraction
 * - Watermarking support
 */
@Injectable()
export class ImageProcessingService {
  private readonly logger = new Logger(ImageProcessingService.name);

  private readonly defaultThumbnailSizes: ThumbnailSizes = {
    small: { width: 150, height: 150 },
    medium: { width: 300, height: 300 },
    large: { width: 600, height: 600 },
  };

  /**
   * Optimize image (compress and resize if needed)
   */
  async optimizeImage(
    buffer: Buffer,
    options: ResizeOptions = {}
  ): Promise<Buffer> {
    try {
      let image = sharp(buffer);

      // Get image metadata
      const metadata = await image.metadata();

      // Resize if dimensions provided
      if (options.width || options.height) {
        image = image.resize({
          width: options.width,
          height: options.height,
          fit: options.fit || 'inside',
          withoutEnlargement: true,
        });
      }

      // Optimize based on format
      const quality = options.quality || 80;

      if (metadata.format === 'jpeg' || metadata.format === 'jpg') {
        image = image.jpeg({ quality, progressive: true });
      } else if (metadata.format === 'png') {
        image = image.png({ quality, compressionLevel: 9 });
      } else if (metadata.format === 'webp') {
        image = image.webp({ quality });
      }

      return await image.toBuffer();
    } catch (error) {
      this.logger.error('Error optimizing image:', error);
      throw error;
    }
  }

  /**
   * Generate a single thumbnail
   */
  async generateThumbnail(
    buffer: Buffer,
    width: number,
    height: number,
    quality = 80
  ): Promise<Buffer> {
    try {
      return await sharp(buffer)
        .resize(width, height, {
          fit: 'cover',
          position: 'center',
        })
        .jpeg({ quality })
        .toBuffer();
    } catch (error) {
      this.logger.error('Error generating thumbnail:', error);
      throw error;
    }
  }

  /**
   * Generate multiple thumbnail sizes
   */
  async generateThumbnails(
    buffer: Buffer,
    sizes: ThumbnailSizes = this.defaultThumbnailSizes
  ): Promise<{ small: Buffer; medium: Buffer; large: Buffer }> {
    try {
      const [small, medium, large] = await Promise.all([
        this.generateThumbnail(buffer, sizes.small.width, sizes.small.height),
        this.generateThumbnail(buffer, sizes.medium.width, sizes.medium.height),
        this.generateThumbnail(buffer, sizes.large.width, sizes.large.height),
      ]);

      return { small, medium, large };
    } catch (error) {
      this.logger.error('Error generating thumbnails:', error);
      throw error;
    }
  }

  /**
   * Convert image to WebP format
   */
  async convertToWebP(buffer: Buffer, quality = 80): Promise<Buffer> {
    try {
      return await sharp(buffer)
        .webp({ quality })
        .toBuffer();
    } catch (error) {
      this.logger.error('Error converting to WebP:', error);
      throw error;
    }
  }

  /**
   * Process image: optimize + generate thumbnails + WebP version
   */
  async processImage(
    buffer: Buffer,
    options: {
      generateThumbnails?: boolean;
      convertToWebP?: boolean;
      resize?: ResizeOptions;
    } = {}
  ): Promise<ProcessedImages> {
    try {
      const result: ProcessedImages = {
        original: buffer,
      };

      // Optimize original
      result.original = await this.optimizeImage(buffer, options.resize);

      // Generate thumbnails
      if (options.generateThumbnails) {
        result.thumbnails = await this.generateThumbnails(buffer);
      }

      // Convert to WebP
      if (options.convertToWebP) {
        result.webp = await this.convertToWebP(buffer);
      }

      return result;
    } catch (error) {
      this.logger.error('Error processing image:', error);
      throw error;
    }
  }

  /**
   * Extract image metadata
   */
  async getMetadata(buffer: Buffer): Promise<sharp.Metadata> {
    try {
      return await sharp(buffer).metadata();
    } catch (error) {
      this.logger.error('Error getting metadata:', error);
      throw error;
    }
  }

  /**
   * Add watermark to image
   */
  async addWatermark(
    buffer: Buffer,
    watermarkBuffer: Buffer,
    options: {
      gravity?: keyof typeof sharp.gravity;
      opacity?: number;
    } = {}
  ): Promise<Buffer> {
    try {
      // Resize watermark to 10% of image width
      const metadata = await sharp(buffer).metadata();
      const watermarkWidth = Math.floor((metadata.width || 800) * 0.1);

      const resizedWatermark = await sharp(watermarkBuffer)
        .resize(watermarkWidth)
        .toBuffer();

      return await sharp(buffer)
        .composite([
          {
            input: resizedWatermark,
            gravity: options.gravity || 'southeast',
            blend: 'over',
          },
        ])
        .toBuffer();
    } catch (error) {
      this.logger.error('Error adding watermark:', error);
      throw error;
    }
  }

  /**
   * Crop image
   */
  async cropImage(
    buffer: Buffer,
    options: {
      left: number;
      top: number;
      width: number;
      height: number;
    }
  ): Promise<Buffer> {
    try {
      return await sharp(buffer)
        .extract(options)
        .toBuffer();
    } catch (error) {
      this.logger.error('Error cropping image:', error);
      throw error;
    }
  }

  /**
   * Rotate image
   */
  async rotateImage(buffer: Buffer, angle: number): Promise<Buffer> {
    try {
      return await sharp(buffer)
        .rotate(angle)
        .toBuffer();
    } catch (error) {
      this.logger.error('Error rotating image:', error);
      throw error;
    }
  }

  /**
   * Auto-orient image based on EXIF data
   */
  async autoOrient(buffer: Buffer): Promise<Buffer> {
    try {
      return await sharp(buffer)
        .rotate() // Auto-rotate based on EXIF
        .toBuffer();
    } catch (error) {
      this.logger.error('Error auto-orienting image:', error);
      throw error;
    }
  }

  /**
   * Validate if buffer is a valid image
   */
  async isValidImage(buffer: Buffer): Promise<boolean> {
    try {
      await sharp(buffer).metadata();
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get image dimensions
   */
  async getImageDimensions(buffer: Buffer): Promise<ImageDimensions> {
    const metadata = await this.getMetadata(buffer);
    return {
      width: metadata.width || 0,
      height: metadata.height || 0,
    };
  }

  /**
   * Generate a unique filename
   */
  generateUniqueFilename(originalFilename: string, suffix?: string): string {
    const ext = path.extname(originalFilename);
    const name = path.basename(originalFilename, ext);
    const hash = crypto.randomBytes(8).toString('hex');
    const safeName = name.replace(/[^a-zA-Z0-9-_]/g, '_').substring(0, 50);
    
    if (suffix) {
      return `${safeName}_${suffix}_${hash}${ext}`;
    }
    
    return `${safeName}_${hash}${ext}`;
  }
}
