"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const database_module_1 = require("./database/database.module");
const common_module_1 = require("./common/common.module");
const graphql_module_1 = require("./graphql/graphql.module");
const background_jobs_module_1 = require("./modules/background-jobs/background-jobs.module");
const auth_module_1 = require("./modules/auth/auth.module");
const lookups_module_1 = require("./modules/lookups/lookups.module");
const users_module_1 = require("./modules/users/users.module");
const subscriptions_module_1 = require("./modules/subscriptions/subscriptions.module");
const plans_module_1 = require("./modules/plans/plans.module");
const media_module_1 = require("./modules/media/media.module");
const comments_module_1 = require("./modules/comments/comments.module");
const notes_module_1 = require("./modules/notes/notes.module");
const courses_module_1 = require("./modules/lms/courses/courses.module");
const enrollments_module_1 = require("./modules/lms/enrollments/enrollments.module");
const favorites_module_1 = require("./modules/favorites/favorites.module");
const shares_module_1 = require("./modules/shares/shares.module");
const events_module_1 = require("./modules/events/events.module");
const jobs_module_1 = require("./modules/jobs/jobs.module");
const tickets_module_1 = require("./modules/tickets/tickets.module");
const cms_module_1 = require("./modules/cms/cms.module");
const audit_module_1 = require("./modules/audit/audit.module");
const payments_module_1 = require("./modules/payments/payments.module");
const notifications_module_1 = require("./modules/notifications/notifications.module");
const posts_module_1 = require("./modules/social/posts/posts.module");
const groups_module_1 = require("./modules/social/groups/groups.module");
const chat_module_1 = require("./modules/chat/chat.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: ['.env.local', '.env'],
            }),
            graphql_module_1.GraphqlConfigModule,
            background_jobs_module_1.BackgroundJobsModule,
            database_module_1.DatabaseModule,
            common_module_1.CommonModule,
            auth_module_1.AuthModule,
            lookups_module_1.LookupsModule,
            users_module_1.UsersModule,
            subscriptions_module_1.SubscriptionsModule,
            plans_module_1.PlansModule,
            media_module_1.MediaModule,
            comments_module_1.CommentsModule,
            notes_module_1.NotesModule,
            courses_module_1.CoursesModule,
            enrollments_module_1.EnrollmentsModule,
            favorites_module_1.FavoritesModule,
            shares_module_1.SharesModule,
            events_module_1.EventsModule,
            jobs_module_1.JobsModule,
            tickets_module_1.TicketsModule,
            cms_module_1.CmsModule,
            audit_module_1.AuditModule,
            payments_module_1.PaymentsModule,
            notifications_module_1.NotificationsModule,
            posts_module_1.PostsModule,
            groups_module_1.GroupsModule,
            chat_module_1.ChatModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map