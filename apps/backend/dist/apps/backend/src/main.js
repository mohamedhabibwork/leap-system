"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const config_1 = require("@nestjs/config");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        cors: true,
        logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });
    const configService = app.get(config_1.ConfigService);
    app.setGlobalPrefix('api');
    app.enableVersioning({
        type: common_1.VersioningType.URI,
        defaultVersion: '1',
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    const config = new swagger_1.DocumentBuilder()
        .setTitle('LEAP LMS API')
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
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/docs', app, document, {
        swaggerOptions: {
            persistAuthorization: true,
        },
    });
    const port = configService.get('PORT') || 3000;
    const host = configService.get('HOST') || 'localhost';
    const appUrl = `http://${host}:${port}`;
    await app.listen(port, host, () => {
        console.log(`🚀 Application is running on: ${appUrl}`);
        console.log(`📚 Swagger API Documentation: ${appUrl}/api/docs`);
        console.log(`🔥 GraphQL Playground: ${appUrl}/graphql`);
    });
}
bootstrap();
//# sourceMappingURL=main.js.map