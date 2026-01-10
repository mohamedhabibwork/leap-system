import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { Client } from 'minio';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MinioService implements OnModuleInit {
  private readonly logger = new Logger(MinioService.name);
  private minioClient: Client | null = null;
  private bucketName: string;
  private isInitialized = false;

  constructor(private configService: ConfigService) {
    this.bucketName = this.configService.get<string>('MINIO_BUCKET') || 'leap-lms';
    
    // Support both username/password and access_key/secret_key for backward compatibility
    const username = this.configService.get<string>('MINIO_USERNAME') || this.configService.get<string>('MINIO_ACCESS_KEY');
    const password = this.configService.get<string>('MINIO_PASSWORD') || this.configService.get<string>('MINIO_SECRET_KEY');

    // Only initialize if credentials are provided
    if (username && password) {
      const endpoint = this.configService.get<string>('MINIO_ENDPOINT') || 'localhost';
      const port = parseInt(this.configService.get<string>('MINIO_PORT') || '9000');
      const useSSL = this.configService.get<string>('MINIO_USE_SSL') === 'true';
      const region = this.configService.get<string>('MINIO_REGION') || 'us-east-1';
      const pathStyle = this.configService.get<string>('MINIO_PATH_STYLE') !== 'false'; // Default to true for MinIO

      this.logger.log(`Initializing MinIO client: ${endpoint}:${port}, SSL: ${useSSL}, Region: ${region}`);

      try {
        this.minioClient = new Client({
          endPoint: endpoint,
          port: port,
          useSSL: useSSL,
          accessKey: username,
          secretKey: password,
          region: region,
          pathStyle: pathStyle,
        });
      } catch (error: any) {
        this.logger.error(`Failed to create MinIO client: ${error?.message || JSON.stringify(error)}`);
        this.minioClient = null;
      }
    } else {
      this.logger.warn('MinIO credentials not provided');
    }
  }

  async onModuleInit() {
    if (!this.minioClient) {
      this.logger.warn(
        'MinIO credentials not configured. MinIO service will be disabled. ' +
        'Set MINIO_USERNAME and MINIO_PASSWORD (or MINIO_ACCESS_KEY and MINIO_SECRET_KEY) environment variables.'
      );
      return;
    }

    try {
      // Test connection with a simple operation
      this.logger.log('Testing MinIO connection...');
      
      // List buckets to test connection (this is a lightweight operation)
      // Use Promise.race with proper timeout
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout after 10 seconds')), 10000)
      );
      
      const buckets = await Promise.race([
        this.minioClient.listBuckets(),
        timeoutPromise
      ]) as any[];

      this.logger.log(`MinIO connection successful. Found ${buckets.length} bucket(s)`);

      // Check if bucket exists
      const exists = await this.minioClient.bucketExists(this.bucketName);
      if (!exists) {
        this.logger.log(`Bucket '${this.bucketName}' does not exist. Creating...`);
        await this.minioClient.makeBucket(this.bucketName, this.configService.get<string>('MINIO_REGION') || 'us-east-1');
        this.logger.log(`Created MinIO bucket: ${this.bucketName}`);
      } else {
        this.logger.log(`MinIO bucket '${this.bucketName}' already exists`);
      }
      
      this.isInitialized = true;
      this.logger.log(`MinIO service initialized successfully`);
    } catch (error: any) {
      // Enhanced error logging
      const errorDetails = {
        message: error?.message || 'Unknown error',
        code: error?.code || 'NO_CODE',
        name: error?.name || 'Error',
        stack: error?.stack ? error.stack.split('\n').slice(0, 3).join('\n') : 'No stack trace',
        endpoint: this.configService.get<string>('MINIO_ENDPOINT') || 'localhost',
        port: this.configService.get<string>('MINIO_PORT') || '9000',
        useSSL: this.configService.get<string>('MINIO_USE_SSL') === 'true',
      };

      this.logger.error(
        `MinIO initialization failed:\n` +
        `  Error: ${errorDetails.message}\n` +
        `  Code: ${errorDetails.code}\n` +
        `  Type: ${errorDetails.name}\n` +
        `  Endpoint: ${errorDetails.endpoint}:${errorDetails.port}\n` +
        `  SSL: ${errorDetails.useSSL}\n` +
        `  Stack: ${errorDetails.stack}\n` +
        `\nTroubleshooting steps:\n` +
        `  1. Verify MinIO server is running: curl http://${errorDetails.endpoint}:${errorDetails.port}/minio/health/live\n` +
        `  2. Check credentials (MINIO_USERNAME/MINIO_PASSWORD or MINIO_ACCESS_KEY/MINIO_SECRET_KEY)\n` +
        `  3. Verify endpoint and port are correct\n` +
        `  4. Check network connectivity and firewall rules\n` +
        `  5. If using SSL, verify certificate is valid\n` +
        `  6. Check MinIO server logs for authentication errors`
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
    
    try {
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
    } catch (error: any) {
      this.logger.error(
        `MinIO upload failed for file ${file.originalname}: ${error?.message || JSON.stringify(error)}`
      );
      throw new Error(
        `Failed to upload file to MinIO: ${error?.message || 'Unknown error'}. ` +
        `Please check MinIO connection and credentials.`
      );
    }
  }

  async deleteFile(key: string): Promise<void> {
    this.ensureInitialized();
    try {
      await this.minioClient!.removeObject(this.bucketName, key);
    } catch (error: any) {
      this.logger.error(
        `MinIO delete failed for key ${key}: ${error?.message || JSON.stringify(error)}`
      );
      throw new Error(
        `Failed to delete file from MinIO: ${error?.message || 'Unknown error'}. ` +
        `Please check MinIO connection and credentials.`
      );
    }
  }

  async getPresignedUrl(key: string, expirySeconds: number = 3600): Promise<string> {
    this.ensureInitialized();
    try {
      return await this.minioClient!.presignedGetObject(this.bucketName, key, expirySeconds);
    } catch (error: any) {
      this.logger.error(
        `MinIO presigned URL generation failed for key ${key}: ${error?.message || JSON.stringify(error)}`
      );
      throw new Error(
        `Failed to generate presigned URL from MinIO: ${error?.message || 'Unknown error'}. ` +
        `Please check MinIO connection and credentials.`
      );
    }
  }
}
