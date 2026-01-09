import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const configService = app.get(ConfigService);

  // API Versioning
  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
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
