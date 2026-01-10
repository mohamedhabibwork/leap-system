import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { CommonModule } from './common/common.module';
import { GraphqlConfigModule } from './graphql/graphql.module';
import { GrpcModule } from './grpc/grpc.module';
import { PrometheusMonitoringModule } from './monitoring/prometheus.module';
import { BackgroundJobsModule } from './modules/background-jobs/background-jobs.module';
import { AuthModule } from './modules/auth/auth.module';
import { LookupsModule } from './modules/lookups/lookups.module';
import { UsersModule } from './modules/users/users.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { PlansModule } from './modules/plans/plans.module';
import { MediaModule } from './modules/media/media.module';
import { CommentsModule } from './modules/comments/comments.module';
import { NotesModule } from './modules/notes/notes.module';
import { CoursesModule } from './modules/lms/courses/courses.module';
import { EnrollmentsModule } from './modules/lms/enrollments/enrollments.module';
import { InstructorModule } from './modules/lms/instructor/instructor.module';
import { StudentModule } from './modules/lms/student/student.module';
import { FavoritesModule } from './modules/favorites/favorites.module';
import { SharesModule } from './modules/shares/shares.module';
import { EventsModule } from './modules/events/events.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { TicketsModule } from './modules/tickets/tickets.module';
import { CmsModule } from './modules/cms/cms.module';
import { AuditModule } from './modules/audit/audit.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { PostsModule } from './modules/social/posts/posts.module';
import { GroupsModule } from './modules/social/groups/groups.module';
import { ChatModule } from './modules/chat/chat.module';
import { AdsModule } from './modules/ads/ads.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    PrometheusMonitoringModule,
    GraphqlConfigModule,
    GrpcModule,
    BackgroundJobsModule,
    DatabaseModule,
    CommonModule,
    AuthModule,
    LookupsModule,
    UsersModule,
    SubscriptionsModule,
    PlansModule,
    MediaModule,
    CommentsModule,
    NotesModule,
    CoursesModule,
    EnrollmentsModule,
    InstructorModule,
    StudentModule,
    FavoritesModule,
    SharesModule,
    EventsModule,
    JobsModule,
    TicketsModule,
    CmsModule,
    AuditModule,
    PaymentsModule,
    NotificationsModule,
    PostsModule,
    GroupsModule,
    ChatModule,
    AdsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
