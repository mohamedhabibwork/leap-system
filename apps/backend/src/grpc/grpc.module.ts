import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';

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
            'comments',
            'notes',
            'favorites',
            'shares',
            'posts',
            'groups',
            'events',
            'jobs',
            'tickets',
            'cms',
            'ads',
            'chat',
            'notifications',
          ],
          protoPath: [
            join(__dirname, 'proto/users.proto'),
            join(__dirname, 'proto/courses.proto'),
            join(__dirname, 'proto/lookups.proto'),
            join(__dirname, 'proto/subscriptions.proto'),
            join(__dirname, 'proto/media.proto'),
            join(__dirname, 'proto/audit.proto'),
            join(__dirname, 'proto/comments.proto'),
            join(__dirname, 'proto/notes.proto'),
            join(__dirname, 'proto/favorites.proto'),
            join(__dirname, 'proto/shares.proto'),
            join(__dirname, 'proto/posts.proto'),
            join(__dirname, 'proto/groups.proto'),
            join(__dirname, 'proto/events.proto'),
            join(__dirname, 'proto/jobs.proto'),
            join(__dirname, 'proto/tickets.proto'),
            join(__dirname, 'proto/cms.proto'),
            join(__dirname, 'proto/ads.proto'),
            join(__dirname, 'proto/chat.proto'),
            join(__dirname, 'proto/notifications.proto'),
          ],
          url: process.env.GRPC_URL || '0.0.0.0:5000',
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
