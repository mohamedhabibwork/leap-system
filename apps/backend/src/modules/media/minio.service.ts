import { Injectable, OnModuleInit } from '@nestjs/common';
import { Client } from 'minio';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MinioService implements OnModuleInit {
  private minioClient: Client | null = null;
  private bucketName: string;
  private isInitialized = false;

  constructor(private configService: ConfigService) {
    this.bucketName = this.configService.get<string>('MINIO_BUCKET') || 'leap-lms';
    
    const accessKey = this.configService.get<string>('MINIO_ACCESS_KEY');
    const secretKey = this.configService.get<string>('MINIO_SECRET_KEY');

    // Only initialize if credentials are provided
    if (accessKey && secretKey) {
      this.minioClient = new Client({
        endPoint: this.configService.get<string>('MINIO_ENDPOINT') || 'localhost',
        port: parseInt(this.configService.get<string>('MINIO_PORT') || '9000'),
        useSSL: this.configService.get<string>('MINIO_USE_SSL') === 'true',
        accessKey,
        secretKey,
      });
    }
  }

  async onModuleInit() {
    if (!this.minioClient) {
      console.warn(
        'MinIO credentials not configured. MinIO service will be disabled. ' +
        'Set MINIO_ACCESS_KEY and MINIO_SECRET_KEY environment variables.'
      );
      return;
    }

    try {
      const exists = await this.minioClient.bucketExists(this.bucketName);
      if (!exists) {
        await this.minioClient.makeBucket(this.bucketName, 'us-east-1');
        console.log(`Created MinIO bucket: ${this.bucketName}`);
      }
      this.isInitialized = true;
      console.log(`MinIO bucket '${this.bucketName}' is accessible`);
    } catch (error: any) {
      const errorMessage = error?.message || error?.code || 'Unknown error';
      console.error(
        `MinIO initialization error: ${errorMessage}. ` +
        'MinIO service will be disabled. Check your MinIO credentials and ensure the server is running.',
        error?.stack || error
      );
      this.isInitialized = false;
      // Don't throw - allow app to continue without MinIO
    }
  }

  private ensureInitialized(): void {
    if (!this.isInitialized || !this.minioClient) {
      throw new Error('MinIO service is not initialized. Please configure MinIO credentials.');
    }
  }

  async uploadFile(file: Express.Multer.File, folder: string): Promise<{ url: string; key: string }> {
    this.ensureInitialized();
    const fileName = `${folder}/${Date.now()}-${file.originalname}`;
    
    await this.minioClient!.putObject(
      this.bucketName,
      fileName,
      file.buffer,
      file.size,
      { 'Content-Type': file.mimetype }
    );
    
    const publicUrl = this.configService.get<string>('MINIO_PUBLIC_URL') || 'http://localhost:9000';
    
    return {
      url: `${publicUrl}/${this.bucketName}/${fileName}`,
      key: fileName,
    };
  }

  async deleteFile(key: string): Promise<void> {
    this.ensureInitialized();
    await this.minioClient!.removeObject(this.bucketName, key);
  }

  async getPresignedUrl(key: string, expirySeconds: number = 3600): Promise<string> {
    this.ensureInitialized();
    return await this.minioClient!.presignedGetObject(this.bucketName, key, expirySeconds);
  }
}
