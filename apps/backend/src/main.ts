import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import { join } from 'path';
import { AppModule } from './app.module';
import { HttpExceptionFilter, AllExceptionsFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const configService = app.get(ConfigService);

  // Parse CORS origins from environment variable
  // Supports comma-separated values or single origin
  const corsOrigin = configService.get<string>('CORS_ORIGIN') || '';
  const frontendUrl = configService.get<string>('FRONTEND_URL') || 'http://localhost:3001';
  
  let allowedOrigins: string[] | string;
  if (corsOrigin) {
    // Parse comma-separated origins
    allowedOrigins = corsOrigin.split(',').map(origin => origin.trim()).filter(Boolean);
    // If only one origin, use string format; otherwise use array
    if (allowedOrigins.length === 1) {
      allowedOrigins = allowedOrigins[0];
    }
  } else {
    // Default to frontend URL and common development origins
    // Note: Only include frontend origins, not the backend's own URL
    allowedOrigins = [
      frontendUrl,
      'http://localhost:3001',
      'http://127.0.0.1:3001',
      // Add common Next.js dev server variations
      'http://localhost:3002',
      'http://127.0.0.1:3002',
    ];
  }
  
  // Log CORS configuration in development
  if (process.env.NODE_ENV === 'development') {
    console.log('🌐 CORS Configuration:', {
      allowedOrigins: Array.isArray(allowedOrigins) ? allowedOrigins : [allowedOrigins],
      credentials: true,
    });
  }

  // Configure CORS with proper settings for credentials
  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'X-Requested-With',
      'Cookie',
      'Set-Cookie',
      'Origin',
      'Access-Control-Request-Method',
      'Access-Control-Request-Headers',
    ],
    exposedHeaders: [
      'Content-Length',
      'Content-Type',
      'Set-Cookie',
    ],
    maxAge: 86400, // 24 hours
  });

  // Enable cookie parser for session management
  app.use(cookieParser());

  // API Versioning
  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // Global Exception Filters (order matters - more specific first)
  // HttpExceptionFilter handles all HTTP exceptions including validation errors
  // AllExceptionsFilter catches any unhandled exceptions as a safety net
  app.useGlobalFilters(
    new HttpExceptionFilter(),
    new AllExceptionsFilter(),
  );

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      stopAtFirstError: false, // Collect all validation errors
      enableDebugMessages: true,
    }),
  );

  // Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('LEAP PM API')
    .setDescription('Comprehensive Learning Management System API with Social Features')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Authentication', 'User authentication and authorization')
    .addTag('Users', 'User management')
    .addTag('Lookups', 'System lookup values')
    .addTag('Courses', 'Course management')
    .addTag('Enrollments', 'Course enrollments')
    .addTag('Subscriptions', 'Subscription plans and management')
    .addTag('Payments', 'Payment processing')
    .addTag('Social', 'Social features (posts, groups, pages)')
    .addTag('Events', 'Event management')
    .addTag('Jobs', 'Job postings and applications')
    .addTag('Chat', 'Real-time messaging')
    .addTag('Notifications', 'User notifications')
    .addTag('Media', 'File uploads and management')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  // gRPC Microservice Configuration
  const grpcHost = configService.get<string>('GRPC_HOST') || '0.0.0.0';
  const grpcPort = configService.get<number>('GRPC_PORT') || 5000;

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: [
        'users',
        'courses',
        'lookups',
        'subscriptions',
        'media',
        'audit',
        'polymorphic',
        'social',
        'lms.assessments',
        'lms.student',
      ],
      protoPath: [
        join(__dirname, 'grpc/proto/users.proto'),
        join(__dirname, 'grpc/proto/courses.proto'),
        join(__dirname, 'grpc/proto/lookups.proto'),
        join(__dirname, 'grpc/proto/subscriptions.proto'),
        join(__dirname, 'grpc/proto/media.proto'),
        join(__dirname, 'grpc/proto/audit.proto'),
        join(__dirname, 'grpc/proto/polymorphic.proto'),
        join(__dirname, 'grpc/proto/social.proto'),
        join(__dirname, 'grpc/proto/lms-assessments.proto'),
        join(__dirname, 'grpc/proto/lms-student.proto'),
      ],
      url: `${grpcHost}:${grpcPort}`,
      loader: {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true,
      },
    },
  });

  // Start all microservices (gRPC)
  await app.startAllMicroservices();

  const port = configService.get<number>('PORT') || 3000;
  const host = configService.get<string>('HOST') || 'localhost';
  const appUrl = `http://${host}:${port}`;
  await app.listen(port, host, () => {
    console.log(`🚀 Application is running on: ${appUrl}`);
    console.log(`📚 Swagger API Documentation: ${appUrl}/api/docs`);
    console.log(`🔥 GraphQL Playground: ${appUrl}/graphql`);
    console.log(`🔌 gRPC Server running on: ${grpcHost}:${grpcPort}`);
  });

}

bootstrap();
