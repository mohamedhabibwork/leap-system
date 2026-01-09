import { Injectable, OnModuleInit } from '@nestjs/common';
import { Client } from 'minio';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MinioService implements OnModuleInit {
  private minioClient: Client;
  private bucketName: string;

  constructor(private configService: ConfigService) {
    this.bucketName = this.configService.get<string>('MINIO_BUCKET') || 'leap-lms';
    
    this.minioClient = new Client({
      endPoint: this.configService.get<string>('MINIO_ENDPOINT') || 'localhost',
      port: parseInt(this.configService.get<string>('MINIO_PORT') || '9000'),
      useSSL: this.configService.get<string>('MINIO_USE_SSL') === 'true',
      accessKey: this.configService.get<string>('MINIO_ACCESS_KEY'),
      secretKey: this.configService.get<string>('MINIO_SECRET_KEY'),
    });
  }

  async onModuleInit() {
    try {
      const exists = await this.minioClient.bucketExists(this.bucketName);
      if (!exists) {
        await this.minioClient.makeBucket(this.bucketName, 'us-east-1');
        console.log(`Created bucket: ${this.bucketName}`);
      }
    } catch (error) {
      console.error('MinIO initialization error:', error);
    }
  }

  async uploadFile(file: Express.Multer.File, folder: string): Promise<{ url: string; key: string }> {
    const fileName = `${folder}/${Date.now()}-${file.originalname}`;
    
    await this.minioClient.putObject(
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
    await this.minioClient.removeObject(this.bucketName, key);
  }

  async getPresignedUrl(key: string, expirySeconds: number = 3600): Promise<string> {
    return await this.minioClient.presignedGetObject(this.bucketName, key, expirySeconds);
  }
}
