import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ValidationExceptionFilter } from './common/filters/validation-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
      // origin: [
      //   'http://localhost:3001',
      //   'http://localhost:3000',
      //   process.env.FRONTEND_URL || 'http://localhost:3001'
      // ],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    },
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const configService = app.get(ConfigService);

  // Enable cookie parser for session management
  app.use(cookieParser());

  // API Versioning
  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // Global Exception Filters (order matters - more specific first)
  app.useGlobalFilters(
    new ValidationExceptionFilter(),
    new HttpExceptionFilter(),
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

  const port = configService.get<number>('PORT') || 3000;
  const host = configService.get<string>('HOST') || 'localhost';
  const appUrl = `http://${host}:${port}`;
  await app.listen(port, host, () => {
    console.log(`🚀 Application is running on: ${appUrl}`);
    console.log(`📚 Swagger API Documentation: ${appUrl}/api/docs`);
    console.log(`🔥 GraphQL Playground: ${appUrl}/graphql`);
  });

}

bootstrap();
