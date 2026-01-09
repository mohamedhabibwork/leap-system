import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand, HeadBucketCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class R2Service implements OnModuleInit {
  private s3Client: S3Client | null = null;
  private bucketName: string;
  private publicUrl: string;
  private isInitialized = false;

  constructor(private configService: ConfigService) {
    const accountId = this.configService.get<string>('R2_ACCOUNT_ID');
    const accessKeyId = this.configService.get<string>('R2_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>('R2_SECRET_ACCESS_KEY');
    
    this.bucketName = this.configService.get<string>('R2_BUCKET') || 'leap-lms';
    this.publicUrl = this.configService.get<string>('R2_PUBLIC_URL') || '';

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
    if (!this.s3Client) {
      console.warn(
        'R2 credentials not configured. R2 service will be disabled. ' +
        'Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, and R2_SECRET_ACCESS_KEY environment variables.'
      );
      return;
    }

    try {
      // Verify bucket access
      await this.s3Client.send(new HeadBucketCommand({ Bucket: this.bucketName }));
      this.isInitialized = true;
      console.log(`R2 bucket '${this.bucketName}' is accessible`);
    } catch (error: any) {
      const errorMessage = error?.message || error?.code || 'Unknown error';
      console.error(
        `R2 initialization error: ${errorMessage}. ` +
        'R2 service will be disabled. Check your R2 credentials and bucket configuration.',
        error?.stack || error
      );
      this.isInitialized = false;
      // Don't throw - allow app to continue without R2
    }
  }

  private ensureInitialized(): void {
    if (!this.isInitialized || !this.s3Client) {
      throw new Error('R2 service is not initialized. Please configure R2 credentials.');
    }
  }

  async uploadFile(file: Express.Multer.File, folder: string): Promise<{ url: string; key: string }> {
    this.ensureInitialized();
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
    this.ensureInitialized();
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    await this.s3Client!.send(command);
  }

  async getPresignedUrl(key: string, expirySeconds: number = 3600): Promise<string> {
    this.ensureInitialized();
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    return await getSignedUrl(this.s3Client!, command, { expiresIn: expirySeconds });
  }

  async getFile(key: string): Promise<Buffer> {
    this.ensureInitialized();
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    const response = await this.s3Client!.send(command);
    const stream = response.Body as any;
    
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      stream.on('data', (chunk: Buffer) => chunks.push(chunk));
      stream.on('error', reject);
      stream.on('end', () => resolve(Buffer.concat(chunks)));
    });
  }
}
