import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand, HeadBucketCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class R2Service implements OnModuleInit {
  private readonly logger = new Logger(R2Service.name);
  private s3Client: S3Client | null = null;
  private bucketName: string;
  private publicUrl: string;
  private isInitialized = false;
  private initializationPromise: Promise<void> | null = null;
  private readonly isMainStorage: boolean;

  constructor(private configService: ConfigService) {
    // Check if R2 is the main storage provider
    this.isMainStorage = this.configService.get<string>('STORAGE_PROVIDER') === 'r2';
    
    this.bucketName = this.configService.get<string>('R2_BUCKET') || 'leap-lms';
    this.publicUrl = this.configService.get<string>('R2_PUBLIC_URL') || '';

    // Only create client if it's the main storage or if credentials are provided
    // But don't initialize until needed (unless it's main storage)
    if (this.isMainStorage) {
      this.initializeClient();
    }
  }

  private initializeClient(): void {
    const accountId = this.configService.get<string>('R2_ACCOUNT_ID');
    const accessKeyId = this.configService.get<string>('R2_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>('R2_SECRET_ACCESS_KEY');

    // Only initialize if credentials are provided
    if (accountId && accessKeyId && secretAccessKey) {
      // Cloudflare R2 endpoint format: https://<accountid>.r2.cloudflarestorage.com
      const endpoint = `https://${accountId}.r2.cloudflarestorage.com`;

      this.s3Client = new S3Client({
        region: 'auto', // R2 uses 'auto' as region
        endpoint,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      });
    }
  }

  async onModuleInit() {
    // Only initialize on startup if R2 is the main storage provider
    if (!this.isMainStorage) {
      this.logger.log('R2 is not the main storage provider. R2 service will initialize lazily when needed.');
      return;
    }

    // If it's the main storage, initialize immediately
    if (!this.s3Client) {
      this.logger.warn(
        'R2 credentials not configured. R2 service will be disabled. ' +
        'Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, and R2_SECRET_ACCESS_KEY environment variables.'
      );
      return;
    }

    try {
      // Verify bucket access
      await this.s3Client.send(new HeadBucketCommand({ Bucket: this.bucketName }));
      this.isInitialized = true;
      this.logger.log(`R2 bucket '${this.bucketName}' is accessible`);
    } catch (error: any) {
      const errorMessage = error?.message || error?.code || 'Unknown error';
      this.logger.warn(
        `R2 initialization error: ${errorMessage}. ` +
        'R2 service will be disabled. Check your R2 credentials and bucket configuration.'
      );
      this.isInitialized = false;
      // Don't throw - allow app to continue without R2
    }
  }

  private async ensureInitialized(): Promise<void> {
    // If already initialized, return immediately
    if (this.isInitialized && this.s3Client) {
      return;
    }

    // If initialization is in progress, wait for it
    if (this.initializationPromise) {
      await this.initializationPromise;
      return;
    }

    // Start lazy initialization
    this.initializationPromise = this.initializeLazy();
    await this.initializationPromise;
  }

  private async initializeLazy(): Promise<void> {
    // Initialize client if not already done
    if (!this.s3Client) {
      this.initializeClient();
    }

    if (!this.s3Client) {
      throw new Error(
        'R2 service is not initialized. Please configure R2 credentials. ' +
        'Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, and R2_SECRET_ACCESS_KEY environment variables.'
      );
    }

    try {
      // Verify bucket access
      await this.s3Client.send(new HeadBucketCommand({ Bucket: this.bucketName }));
      this.isInitialized = true;
      this.logger.log(`R2 service initialized lazily. Bucket '${this.bucketName}' is accessible`);
    } catch (error: any) {
      const errorMessage = error?.message || error?.code || 'Unknown error';
      this.logger.error(
        `R2 lazy initialization error: ${errorMessage}. ` +
        'Check your R2 credentials and bucket configuration.'
      );
      throw new Error(
        `R2 service initialization failed: ${errorMessage}. ` +
        'Please check your R2 credentials and ensure the bucket exists.'
      );
    } finally {
      this.initializationPromise = null;
    }
  }

  async uploadFile(file: Express.Multer.File, folder: string): Promise<{ url: string; key: string }> {
    await this.ensureInitialized();
    const key = `${folder}/${Date.now()}-${file.originalname}`;
    
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      // Make file publicly accessible if you have a custom domain
      // ACL: 'public-read', // R2 doesn't support ACLs, use bucket policies instead
    });

    await this.s3Client.send(command);
    
    // If you have a custom domain configured for R2, use that
    // Otherwise, generate a signed URL (valid for 1 hour by default)
    const url = this.publicUrl 
      ? `${this.publicUrl}/${key}`
      : await this.getPresignedUrl(key);

    return {
      url,
      key,
    };
  }

  async deleteFile(key: string): Promise<void> {
    await this.ensureInitialized();
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    await this.s3Client!.send(command);
  }

  async getPresignedUrl(key: string, expirySeconds: number = 3600): Promise<string> {
    await this.ensureInitialized();
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    return await getSignedUrl(this.s3Client!, command, { expiresIn: expirySeconds });
  }

  async getFile(key: string): Promise<Buffer> {
    await this.ensureInitialized();
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    const response = await this.s3Client!.send(command);
    const stream = response.Body as any;
    
    if (!stream || typeof stream.on !== 'function') {
      throw new Error('Invalid stream response from S3');
    }
    
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      stream.on('data', (chunk: Buffer) => chunks.push(chunk));
      stream.on('error', reject);
      stream.on('end', () => resolve(Buffer.concat(chunks)));
    });
  }
}
