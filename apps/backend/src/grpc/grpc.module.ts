import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { env } from '../config/env';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'GRPC_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: [
            'users',
            'courses',
            'lookups',
            'subscriptions',
            'media',
            'audit',
            'polymorphic', // Contains: comments, notes, favorites, shares
            'social', // Contains: posts, groups
            'lms.assessments', // Assignments, Quizzes services
            'lms.student', // Enrollments service
          ],
          protoPath: [
            join(__dirname, 'proto/users.proto'),
            join(__dirname, 'proto/courses.proto'),
            join(__dirname, 'proto/lookups.proto'),
            join(__dirname, 'proto/subscriptions.proto'),
            join(__dirname, 'proto/media.proto'),
            join(__dirname, 'proto/audit.proto'),
            join(__dirname, 'proto/polymorphic.proto'), // Comments, Notes, Favorites, Shares
            join(__dirname, 'proto/social.proto'), // Posts, Groups
            join(__dirname, 'proto/lms-assessments.proto'),
            join(__dirname, 'proto/lms-student.proto'),
          ],
          url: env.GRPC_URL || `${env.GRPC_HOST}:${env.GRPC_PORT}`,
          loader: {
            keepCase: true,
            longs: String,
            enums: String,
            defaults: true,
            oneofs: true,
          },
        },
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class GrpcModule {}
