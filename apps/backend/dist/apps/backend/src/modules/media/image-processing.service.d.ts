import sharp from 'sharp';
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
export declare class ImageProcessingService {
    private readonly logger;
    private readonly defaultThumbnailSizes;
    optimizeImage(buffer: Buffer, options?: ResizeOptions): Promise<Buffer>;
    generateThumbnail(buffer: Buffer, width: number, height: number, quality?: number): Promise<Buffer>;
    generateThumbnails(buffer: Buffer, sizes?: ThumbnailSizes): Promise<{
        small: Buffer;
        medium: Buffer;
        large: Buffer;
    }>;
    convertToWebP(buffer: Buffer, quality?: number): Promise<Buffer>;
    processImage(buffer: Buffer, options?: {
        generateThumbnails?: boolean;
        convertToWebP?: boolean;
        resize?: ResizeOptions;
    }): Promise<ProcessedImages>;
    getMetadata(buffer: Buffer): Promise<sharp.Metadata>;
    addWatermark(buffer: Buffer, watermarkBuffer: Buffer, options?: {
        gravity?: keyof typeof sharp.gravity;
        opacity?: number;
    }): Promise<Buffer>;
    cropImage(buffer: Buffer, options: {
        left: number;
        top: number;
        width: number;
        height: number;
    }): Promise<Buffer>;
    rotateImage(buffer: Buffer, angle: number): Promise<Buffer>;
    autoOrient(buffer: Buffer): Promise<Buffer>;
    isValidImage(buffer: Buffer): Promise<boolean>;
    getImageDimensions(buffer: Buffer): Promise<ImageDimensions>;
    generateUniqueFilename(originalFilename: string, suffix?: string): string;
}
export {};
//# sourceMappingURL=image-processing.service.d.ts.map