import { lookupTypes, lookups } from '@leap-lms/database';
import { eq, and } from 'drizzle-orm';
import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { createDrizzleDatabase } from './db-helper';
import {
  LookupTypeCode,
  UserRoleCode,
  UserStatusCode,
  CourseLevelCode,
  CourseStatusCode,
  EnrollmentTypeCode,
  EnrollmentStatusCode,
  PostTypeCode,
  PostVisibilityCode,
  GroupRoleCode,
  GroupPrivacyCode,
  GroupMemberStatusCode,
  PageRoleCode,
  FriendRequestStatusCode,
  FriendStatusCode,
  ReactionTypeCode,
  EventTypeCode,
  EventStatusCode,
  EventAttendanceStatusCode,
  JobTypeCode,
  ExperienceLevelCode,
  JobStatusCode,
  JobApplicationStatusCode,
  TicketCategoryCode,
  TicketStatusCode,
  TicketPriorityCode,
  ReportTypeCode,
  ReportStatusCode,
  SubscriptionStatusCode,
  BillingCycleCode,
  PlanFeatureCode,
  QuizQuestionTypeCode,
  AssignmentStatusCode,
  ContentTypeCode,
  ResourceTypeCode,
  ChatTypeCode,
  MessageTypeCode,
  MessageStatusCode,
  LanguageCode,
  TimezoneCode,
  MediaProviderCode,
  VisibilityTypeCode,
  PaymentStatusCode,
  PaymentMethodCode,
  NotificationTypeCode,
} from '@leap-lms/shared-types';

export async function seedLookups() {
  const { db, pool } = createDrizzleDatabase();

  console.log('🌱 Seeding lookup types and lookups...');

  try {
    // Helper function to upsert lookup type
    const upsertLookupType = async (code: string, name: string, description: string) => {
      const [existing] = await db
        .select()
        .from(lookupTypes)
        .where(eq(lookupTypes.code, code))
        .limit(1);

      if (existing) {
        // Update if different
        if (existing.name !== name || existing.description !== description) {
          await db
            .update(lookupTypes)
            .set({ name, description: description || null } )
            .where(eq(lookupTypes.id, existing.id));
          console.log(`  ↻ Updated lookup type: ${code}`);
        }
        return existing;
      } else {
        const result = await db
          .insert(lookupTypes)
          .values({ code, name, description: description || null } as InferInsertModel<typeof lookupTypes>)
          .returning() as InferSelectModel<typeof lookupTypes>[];
        const newType = result[0];
        if (!newType) {
          throw new Error(`Failed to create lookup type: ${code}`);
        }
        console.log(`  ✓ Created lookup type: ${code}`);
        return newType;
      }
    };

    // Helper function to upsert lookup value
    const upsertLookup = async (lookup: any) => {
      // First check by code (since code is unique across all lookups)
      const [existingByCode] = await db
        .select()
        .from(lookups)
        .where(eq(lookups.code, lookup.code))
        .limit(1);

      // Also check by lookupTypeId + code combination
      const [existingByTypeAndCode] = await db
        .select()
        .from(lookups)
        .where(
          and(
            eq(lookups.lookupTypeId, lookup.lookupTypeId),
            eq(lookups.code, lookup.code)
          )
        )
        .limit(1);

      const existing = existingByTypeAndCode || existingByCode;

      if (existing) {
        // If found by code but different lookupTypeId, update the lookupTypeId
        if (existing.lookupTypeId !== lookup.lookupTypeId) {
          await db
            .update(lookups)
            .set({
              lookupTypeId: lookup.lookupTypeId,
              nameEn: lookup.nameEn,
              nameAr: lookup.nameAr,
              descriptionEn: lookup.descriptionEn,
              descriptionAr: lookup.descriptionAr,
              sortOrder: lookup.sortOrder,
            } )
            .where(eq(lookups.id, existing.id));
          return existing;
        }

        // Update if different
        const needsUpdate =
          existing.nameEn !== lookup.nameEn ||
          existing.nameAr !== lookup.nameAr ||
          existing.descriptionEn !== lookup.descriptionEn ||
          existing.descriptionAr !== lookup.descriptionAr ||
          existing.sortOrder !== lookup.sortOrder;

        if (needsUpdate) {
          await db
            .update(lookups)
            .set({
              nameEn: lookup.nameEn,
              nameAr: lookup.nameAr,
              descriptionEn: lookup.descriptionEn,
              descriptionAr: lookup.descriptionAr,
              sortOrder: lookup.sortOrder,
            } )
            .where(eq(lookups.id, existing.id));
        }
        return existing;
      } else {
        try {
          const result = await db.insert(lookups).values(lookup as InferInsertModel<typeof lookups>).returning() as InferSelectModel<typeof lookups>[];
          const newLookup = result[0];
          if (!newLookup) {
            throw new Error(`Failed to create lookup: ${lookup.code}`);
          }
          return newLookup;
        } catch (error: any) {
          // Handle duplicate key error - try to find and update
          if (error.code === '23505' && error.constraint === 'lookups_code_unique') {
            const [existing] = await db
              .select()
              .from(lookups)
              .where(eq(lookups.code, lookup.code))
              .limit(1);
            
            if (existing) {
              await db
                .update(lookups)
                .set({
                  lookupTypeId: lookup.lookupTypeId,
                  nameEn: lookup.nameEn,
                  nameAr: lookup.nameAr,
                  descriptionEn: lookup.descriptionEn,
                  descriptionAr: lookup.descriptionAr,
                  sortOrder: lookup.sortOrder,
                } )
                .where(eq(lookups.id, existing.id));
              return existing;
            }
          }
          throw error;
        }
      }
    };

    // ===== LOOKUP TYPES =====

    // User Management
    const userRoleType = await upsertLookupType(LookupTypeCode.USER_ROLE, 'User Role', 'System user roles');
    const userStatusType = await upsertLookupType(LookupTypeCode.USER_STATUS, 'User Status', 'User account status');
    const permissionType = await upsertLookupType(LookupTypeCode.PERMISSION, 'Permission', 'System permissions');

    // Course System
    const courseLevelType = await upsertLookupType(LookupTypeCode.COURSE_LEVEL, 'Course Level', 'Course difficulty levels');
    const courseStatusType = await upsertLookupType(LookupTypeCode.COURSE_STATUS, 'Course Status', 'Course publication status');
    const enrollmentTypeType = await upsertLookupType(LookupTypeCode.ENROLLMENT_TYPE, 'Enrollment Type', 'Course enrollment types');
    const enrollmentStatusType = await upsertLookupType(LookupTypeCode.ENROLLMENT_STATUS, 'Enrollment Status', 'Student enrollment status');

    // Social Features
    const postTypeType = await upsertLookupType(LookupTypeCode.POST_TYPE, 'Post Type', 'Social post types');
    const postVisibilityType = await upsertLookupType(LookupTypeCode.POST_VISIBILITY, 'Post Visibility', 'Post visibility levels');
    const groupRoleType = await upsertLookupType(LookupTypeCode.GROUP_ROLE, 'Group Role', 'Group member roles');
    const groupPrivacyType = await upsertLookupType(LookupTypeCode.GROUP_PRIVACY, 'Group Privacy', 'Group privacy settings');
    const groupMemberStatusType = await upsertLookupType(LookupTypeCode.GROUP_MEMBER_STATUS, 'Group Member Status', 'Group member statuses');
    const pageRoleType = await upsertLookupType(LookupTypeCode.PAGE_ROLE, 'Page Role', 'Page member roles');
    const friendRequestStatusType = await upsertLookupType(LookupTypeCode.FRIEND_REQUEST_STATUS, 'Friend Request Status', 'Friend request statuses');
    const friendStatusType = await upsertLookupType(LookupTypeCode.FRIEND_STATUS, 'Friend Status', 'Friendship statuses');
    const reactionTypeType = await upsertLookupType(LookupTypeCode.REACTION_TYPE, 'Reaction Type', 'Post reaction types');

    // Events
    const eventTypeType = await upsertLookupType(LookupTypeCode.EVENT_TYPE, 'Event Type', 'Event types');
    const eventStatusType = await upsertLookupType(LookupTypeCode.EVENT_STATUS, 'Event Status', 'Event statuses');
    const eventAttendanceStatusType = await upsertLookupType(LookupTypeCode.EVENT_ATTENDANCE_STATUS, 'Event Attendance Status', 'Event attendance statuses');

    // Jobs Module
    const jobTypeType = await upsertLookupType(LookupTypeCode.JOB_TYPE, 'Job Type', 'Employment types');
    const experienceLevelType = await upsertLookupType(LookupTypeCode.EXPERIENCE_LEVEL, 'Experience Level', 'Job experience levels');
    const jobStatusType = await upsertLookupType(LookupTypeCode.JOB_STATUS, 'Job Status', 'Job posting statuses');
    const jobApplicationStatusType = await upsertLookupType(LookupTypeCode.JOB_APPLICATION_STATUS, 'Job Application Status', 'Application statuses');

    // Tickets & Reports
    const ticketCategoryType = await upsertLookupType(LookupTypeCode.TICKET_CATEGORY, 'Ticket Category', 'Support ticket categories');
    const ticketStatusType = await upsertLookupType(LookupTypeCode.TICKET_STATUS, 'Ticket Status', 'Support ticket statuses');
    const ticketPriorityType = await upsertLookupType(LookupTypeCode.TICKET_PRIORITY, 'Ticket Priority', 'Support ticket priorities');
    const reportTypeType = await upsertLookupType(LookupTypeCode.REPORT_TYPE, 'Report Type', 'Report types');
    const reportStatusType = await upsertLookupType(LookupTypeCode.REPORT_STATUS, 'Report Status', 'Report statuses');

    // Subscriptions
    const subscriptionStatusType = await upsertLookupType(LookupTypeCode.SUBSCRIPTION_STATUS, 'Subscription Status', 'Subscription statuses');
    const billingCycleType = await upsertLookupType(LookupTypeCode.BILLING_CYCLE, 'Billing Cycle', 'Billing cycle types');
    const planFeatureType = await upsertLookupType(LookupTypeCode.PLAN_FEATURE, 'Plan Feature', 'Subscription plan features');

    // Content & Resources
    const quizQuestionTypeType = await upsertLookupType(LookupTypeCode.QUIZ_QUESTION_TYPE, 'Quiz Question Type', 'Quiz question types');
    const assignmentStatusType = await upsertLookupType(LookupTypeCode.ASSIGNMENT_STATUS, 'Assignment Status', 'Assignment submission statuses');
    const contentTypeType = await upsertLookupType(LookupTypeCode.CONTENT_TYPE, 'Content Type', 'Course content types');
    const resourceTypeType = await upsertLookupType(LookupTypeCode.RESOURCE_TYPE, 'Resource Type', 'Course resource types');

    // Chat & Messaging
    const chatTypeType = await upsertLookupType(LookupTypeCode.CHAT_TYPE, 'Chat Type', 'Chat types');
    const messageTypeType = await upsertLookupType(LookupTypeCode.MESSAGE_TYPE, 'Message Type', 'Message types');
    const messageStatusType = await upsertLookupType(LookupTypeCode.MESSAGE_STATUS, 'Message Status', 'Message delivery statuses');

    // System Configuration
    const languageType = await upsertLookupType(LookupTypeCode.LANGUAGE, 'Language', 'System languages');
    const timezoneType = await upsertLookupType(LookupTypeCode.TIMEZONE, 'Timezone', 'System timezones');
    const mediaProviderType = await upsertLookupType(LookupTypeCode.MEDIA_PROVIDER, 'Media Provider', 'Media storage providers');
    const visibilityTypeType = await upsertLookupType(LookupTypeCode.VISIBILITY_TYPE, 'Visibility Type', 'Content visibility types');
    const paymentStatusType = await upsertLookupType(LookupTypeCode.PAYMENT_STATUS, 'Payment Status', 'Payment statuses');
    const paymentMethodType = await upsertLookupType(LookupTypeCode.PAYMENT_METHOD, 'Payment Method', 'Payment methods');
    const notificationTypeType = await upsertLookupType(LookupTypeCode.NOTIFICATION_TYPE, 'Notification Type', 'Notification types');

    console.log('\n📊 Seeding lookup values...\n');

    // ===== LOOKUP VALUES =====

    // 1. User Roles
    await upsertLookup({ lookupTypeId: userRoleType.id, code: UserRoleCode.ADMIN, nameEn: 'Admin', nameAr: 'مدير', descriptionEn: 'System administrator', descriptionAr: 'مدير النظام', sortOrder: 1 });
    await upsertLookup({ lookupTypeId: userRoleType.id, code: UserRoleCode.INSTRUCTOR, nameEn: 'Instructor', nameAr: 'مدرس', descriptionEn: 'Course instructor', descriptionAr: 'مدرس الدورة', sortOrder: 2 });
    await upsertLookup({ lookupTypeId: userRoleType.id, code: UserRoleCode.USER, nameEn: 'User', nameAr: 'مستخدم', descriptionEn: 'Regular user/student', descriptionAr: 'مستخدم عادي/طالب', sortOrder: 3 });
    await upsertLookup({ lookupTypeId: userRoleType.id, code: UserRoleCode.RECRUITER, nameEn: 'Recruiter', nameAr: 'موظف توظيف', descriptionEn: 'Job recruiter', descriptionAr: 'موظف التوظيف', sortOrder: 4 });

    // 2. User Status
    await upsertLookup({ lookupTypeId: userStatusType.id, code: UserStatusCode.ACTIVE, nameEn: 'Active', nameAr: 'نشط', descriptionEn: 'Account is active', descriptionAr: 'الحساب نشط', sortOrder: 1 });
    await upsertLookup({ lookupTypeId: userStatusType.id, code: UserStatusCode.INACTIVE, nameEn: 'Inactive', nameAr: 'غير نشط', descriptionEn: 'Account is inactive', descriptionAr: 'الحساب غير نشط', sortOrder: 2 });
    await upsertLookup({ lookupTypeId: userStatusType.id, code: UserStatusCode.SUSPENDED, nameEn: 'Suspended', nameAr: 'معلق', descriptionEn: 'Account is suspended', descriptionAr: 'الحساب معلق', sortOrder: 3 });
    await upsertLookup({ lookupTypeId: userStatusType.id, code: UserStatusCode.BANNED, nameEn: 'Banned', nameAr: 'محظور', descriptionEn: 'Account is banned', descriptionAr: 'الحساب محظور', sortOrder: 4 });

    // 3. Permissions (CRUD for each module)
    const modules = ['course', 'user', 'enrollment', 'post', 'group', 'page', 'event', 'job', 'ticket', 'report', 'subscription', 'content', 'message', 'notification'];
    const actions = ['create', 'read', 'update', 'delete'];
    let permOrder = 1;
    for (const module of modules) {
      for (const action of actions) {
        await upsertLookup({
          lookupTypeId: permissionType.id,
          code: `${module}.${action}`,
          nameEn: `${action.charAt(0).toUpperCase() + action.slice(1)} ${module.charAt(0).toUpperCase() + module.slice(1)}`,
          nameAr: `${action === 'create' ? 'إنشاء' : action === 'read' ? 'قراءة' : action === 'update' ? 'تحديث' : 'حذف'} ${module}`,
          descriptionEn: `Permission to ${action} ${module}`,
          descriptionAr: `صلاحية ${action === 'create' ? 'إنشاء' : action === 'read' ? 'قراءة' : action === 'update' ? 'تحديث' : 'حذف'} ${module}`,
          sortOrder: permOrder++,
        });
      }
    }

    // 4. Course Levels
    await upsertLookup({ lookupTypeId: courseLevelType.id, code: CourseLevelCode.BEGINNER, nameEn: 'Beginner', nameAr: 'مبتدئ', descriptionEn: 'Suitable for beginners', descriptionAr: 'مناسب للمبتدئين', sortOrder: 1 });
    await upsertLookup({ lookupTypeId: courseLevelType.id, code: CourseLevelCode.INTERMEDIATE, nameEn: 'Intermediate', nameAr: 'متوسط', descriptionEn: 'Requires basic knowledge', descriptionAr: 'يتطلب معرفة أساسية', sortOrder: 2 });
    await upsertLookup({ lookupTypeId: courseLevelType.id, code: CourseLevelCode.ADVANCED, nameEn: 'Advanced', nameAr: 'متقدم', descriptionEn: 'For experienced learners', descriptionAr: 'للمتعلمين ذوي الخبرة', sortOrder: 3 });

    // 5. Course Status
    await upsertLookup({ lookupTypeId: courseStatusType.id, code: CourseStatusCode.DRAFT, nameEn: 'Draft', nameAr: 'مسودة', descriptionEn: 'Course is being prepared', descriptionAr: 'جاري تحضير الدورة', sortOrder: 1 });
    await upsertLookup({ lookupTypeId: courseStatusType.id, code: CourseStatusCode.PUBLISHED, nameEn: 'Published', nameAr: 'منشور', descriptionEn: 'Course is live', descriptionAr: 'الدورة منشورة', sortOrder: 2 });
    await upsertLookup({ lookupTypeId: courseStatusType.id, code: CourseStatusCode.ARCHIVED, nameEn: 'Archived', nameAr: 'مؤرشف', descriptionEn: 'Course is archived', descriptionAr: 'الدورة مؤرشفة', sortOrder: 3 });

    // 6. Enrollment Type
    await upsertLookup({ lookupTypeId: enrollmentTypeType.id, code: EnrollmentTypeCode.PURCHASE, nameEn: 'Purchase', nameAr: 'شراء', descriptionEn: 'One-time purchase', descriptionAr: 'شراء لمرة واحدة', sortOrder: 1 });
    await upsertLookup({ lookupTypeId: enrollmentTypeType.id, code: EnrollmentTypeCode.SUBSCRIPTION, nameEn: 'Subscription', nameAr: 'اشتراك', descriptionEn: 'Subscription-based', descriptionAr: 'قائم على الاشتراك', sortOrder: 2 });

    // 7. Enrollment Status
    await upsertLookup({ lookupTypeId: enrollmentStatusType.id, code: EnrollmentStatusCode.ACTIVE, nameEn: 'Active', nameAr: 'نشط', descriptionEn: 'Enrollment is active', descriptionAr: 'التسجيل نشط', sortOrder: 1 });
    await upsertLookup({ lookupTypeId: enrollmentStatusType.id, code: EnrollmentStatusCode.COMPLETED, nameEn: 'Completed', nameAr: 'مكتمل', descriptionEn: 'Course completed', descriptionAr: 'الدورة مكتملة', sortOrder: 2 });
    await upsertLookup({ lookupTypeId: enrollmentStatusType.id, code: EnrollmentStatusCode.EXPIRED, nameEn: 'Expired', nameAr: 'منتهي', descriptionEn: 'Enrollment expired', descriptionAr: 'التسجيل منتهي', sortOrder: 3 });
    await upsertLookup({ lookupTypeId: enrollmentStatusType.id, code: EnrollmentStatusCode.DROPPED, nameEn: 'Dropped', nameAr: 'متروك', descriptionEn: 'Student dropped course', descriptionAr: 'الطالب ترك الدورة', sortOrder: 4 });
    await upsertLookup({ lookupTypeId: enrollmentStatusType.id, code: EnrollmentStatusCode.CANCELLED, nameEn: 'Cancelled', nameAr: 'ملغي', descriptionEn: 'Enrollment cancelled', descriptionAr: 'التسجيل ملغي', sortOrder: 5 });

    // 8. Post Type
    await upsertLookup({ lookupTypeId: postTypeType.id, code: PostTypeCode.TEXT, nameEn: 'Text', nameAr: 'نص', descriptionEn: 'Text post', descriptionAr: 'منشور نصي', sortOrder: 1 });
    await upsertLookup({ lookupTypeId: postTypeType.id, code: PostTypeCode.IMAGE, nameEn: 'Image', nameAr: 'صورة', descriptionEn: 'Image post', descriptionAr: 'منشور صورة', sortOrder: 2 });
    await upsertLookup({ lookupTypeId: postTypeType.id, code: PostTypeCode.VIDEO, nameEn: 'Video', nameAr: 'فيديو', descriptionEn: 'Video post', descriptionAr: 'منشور فيديو', sortOrder: 3 });
    await upsertLookup({ lookupTypeId: postTypeType.id, code: PostTypeCode.LINK, nameEn: 'Link', nameAr: 'رابط', descriptionEn: 'Link post', descriptionAr: 'منشور رابط', sortOrder: 4 });
    await upsertLookup({ lookupTypeId: postTypeType.id, code: PostTypeCode.POLL, nameEn: 'Poll', nameAr: 'استطلاع', descriptionEn: 'Poll post', descriptionAr: 'منشور استطلاع', sortOrder: 5 });

    // 9. Post Visibility
    await upsertLookup({ lookupTypeId: postVisibilityType.id, code: PostVisibilityCode.PUBLIC, nameEn: 'Public', nameAr: 'عام', descriptionEn: 'Visible to everyone', descriptionAr: 'مرئي للجميع', sortOrder: 1 });
    await upsertLookup({ lookupTypeId: postVisibilityType.id, code: PostVisibilityCode.PRIVATE, nameEn: 'Private', nameAr: 'خاص', descriptionEn: 'Visible to owner only', descriptionAr: 'مرئي للمالك فقط', sortOrder: 2 });
    await upsertLookup({ lookupTypeId: postVisibilityType.id, code: PostVisibilityCode.FRIENDS, nameEn: 'Friends Only', nameAr: 'الأصدقاء فقط', descriptionEn: 'Visible to friends', descriptionAr: 'مرئي للأصدقاء', sortOrder: 3 });
    await upsertLookup({ lookupTypeId: postVisibilityType.id, code: PostVisibilityCode.CUSTOM, nameEn: 'Custom', nameAr: 'مخصص', descriptionEn: 'Custom visibility', descriptionAr: 'رؤية مخصصة', sortOrder: 4 });

    // 10. Group Role
    await upsertLookup({ lookupTypeId: groupRoleType.id, code: GroupRoleCode.OWNER, nameEn: 'Owner', nameAr: 'مالك', descriptionEn: 'Group owner', descriptionAr: 'مالك المجموعة', sortOrder: 1 });
    await upsertLookup({ lookupTypeId: groupRoleType.id, code: GroupRoleCode.ADMIN, nameEn: 'Admin', nameAr: 'مدير', descriptionEn: 'Group admin', descriptionAr: 'مدير المجموعة', sortOrder: 2 });
    await upsertLookup({ lookupTypeId: groupRoleType.id, code: GroupRoleCode.MODERATOR, nameEn: 'Moderator', nameAr: 'مشرف', descriptionEn: 'Group moderator', descriptionAr: 'مشرف المجموعة', sortOrder: 3 });
    await upsertLookup({ lookupTypeId: groupRoleType.id, code: GroupRoleCode.MEMBER, nameEn: 'Member', nameAr: 'عضو', descriptionEn: 'Group member', descriptionAr: 'عضو المجموعة', sortOrder: 4 });

    // 11. Group Privacy
    await upsertLookup({ lookupTypeId: groupPrivacyType.id, code: GroupPrivacyCode.PUBLIC, nameEn: 'Public', nameAr: 'عام', descriptionEn: 'Anyone can join', descriptionAr: 'يمكن لأي شخص الانضمام', sortOrder: 1 });
    await upsertLookup({ lookupTypeId: groupPrivacyType.id, code: GroupPrivacyCode.PRIVATE, nameEn: 'Private', nameAr: 'خاص', descriptionEn: 'Request to join', descriptionAr: 'طلب الانضمام', sortOrder: 2 });
    await upsertLookup({ lookupTypeId: groupPrivacyType.id, code: GroupPrivacyCode.SECRET, nameEn: 'Secret', nameAr: 'سري', descriptionEn: 'Invite only', descriptionAr: 'بالدعوة فقط', sortOrder: 3 });

    // 11a. Group Member Status
    await upsertLookup({ lookupTypeId: groupMemberStatusType.id, code: GroupMemberStatusCode.ACTIVE, nameEn: 'Active', nameAr: 'نشط', descriptionEn: 'Active member', descriptionAr: 'عضو نشط', sortOrder: 1 });
    await upsertLookup({ lookupTypeId: groupMemberStatusType.id, code: GroupMemberStatusCode.PENDING, nameEn: 'Pending', nameAr: 'قيد الانتظار', descriptionEn: 'Pending approval', descriptionAr: 'قيد الموافقة', sortOrder: 2 });
    await upsertLookup({ lookupTypeId: groupMemberStatusType.id, code: GroupMemberStatusCode.BANNED, nameEn: 'Banned', nameAr: 'محظور', descriptionEn: 'Banned from group', descriptionAr: 'محظور من المجموعة', sortOrder: 3 });

    // 12. Page Role
    await upsertLookup({ lookupTypeId: pageRoleType.id, code: PageRoleCode.OWNER, nameEn: 'Owner', nameAr: 'مالك', descriptionEn: 'Page owner', descriptionAr: 'مالك الصفحة', sortOrder: 1 });
    await upsertLookup({ lookupTypeId: pageRoleType.id, code: PageRoleCode.ADMIN, nameEn: 'Admin', nameAr: 'مدير', descriptionEn: 'Page admin', descriptionAr: 'مدير الصفحة', sortOrder: 2 });
    await upsertLookup({ lookupTypeId: pageRoleType.id, code: PageRoleCode.EDITOR, nameEn: 'Editor', nameAr: 'محرر', descriptionEn: 'Page editor', descriptionAr: 'محرر الصفحة', sortOrder: 3 });
    await upsertLookup({ lookupTypeId: pageRoleType.id, code: PageRoleCode.VIEWER, nameEn: 'Viewer', nameAr: 'مشاهد', descriptionEn: 'Page viewer', descriptionAr: 'مشاهد الصفحة', sortOrder: 4 });

    // 13. Friend Request Status
    await upsertLookup({ lookupTypeId: friendRequestStatusType.id, code: FriendRequestStatusCode.PENDING, nameEn: 'Pending', nameAr: 'قيد الانتظار', descriptionEn: 'Request pending', descriptionAr: 'طلب قيد الانتظار', sortOrder: 1 });
    await upsertLookup({ lookupTypeId: friendRequestStatusType.id, code: FriendRequestStatusCode.ACCEPTED, nameEn: 'Accepted', nameAr: 'مقبول', descriptionEn: 'Request accepted', descriptionAr: 'طلب مقبول', sortOrder: 2 });
    await upsertLookup({ lookupTypeId: friendRequestStatusType.id, code: FriendRequestStatusCode.DECLINED, nameEn: 'Declined', nameAr: 'مرفوض', descriptionEn: 'Request declined', descriptionAr: 'طلب مرفوض', sortOrder: 3 });
    await upsertLookup({ lookupTypeId: friendRequestStatusType.id, code: FriendRequestStatusCode.BLOCKED, nameEn: 'Blocked', nameAr: 'محظور', descriptionEn: 'User blocked', descriptionAr: 'مستخدم محظور', sortOrder: 4 });

    // 13a. Friend Status
    await upsertLookup({ lookupTypeId: friendStatusType.id, code: FriendStatusCode.PENDING, nameEn: 'Pending', nameAr: 'قيد الانتظار', descriptionEn: 'Friendship pending', descriptionAr: 'صداقة قيد الانتظار', sortOrder: 1 });
    await upsertLookup({ lookupTypeId: friendStatusType.id, code: FriendStatusCode.ACCEPTED, nameEn: 'Accepted', nameAr: 'مقبول', descriptionEn: 'Friendship accepted', descriptionAr: 'صداقة مقبولة', sortOrder: 2 });
    await upsertLookup({ lookupTypeId: friendStatusType.id, code: FriendStatusCode.DECLINED, nameEn: 'Declined', nameAr: 'مرفوض', descriptionEn: 'Friendship declined', descriptionAr: 'صداقة مرفوضة', sortOrder: 3 });
    await upsertLookup({ lookupTypeId: friendStatusType.id, code: FriendStatusCode.BLOCKED, nameEn: 'Blocked', nameAr: 'محظور', descriptionEn: 'User blocked', descriptionAr: 'مستخدم محظور', sortOrder: 4 });

    // 14. Reaction Type
    await upsertLookup({ lookupTypeId: reactionTypeType.id, code: ReactionTypeCode.LIKE, nameEn: 'Like', nameAr: 'إعجاب', descriptionEn: 'Like reaction', descriptionAr: 'تفاعل إعجاب', sortOrder: 1 });
    await upsertLookup({ lookupTypeId: reactionTypeType.id, code: ReactionTypeCode.LOVE, nameEn: 'Love', nameAr: 'حب', descriptionEn: 'Love reaction', descriptionAr: 'تفاعل حب', sortOrder: 2 });
    await upsertLookup({ lookupTypeId: reactionTypeType.id, code: ReactionTypeCode.CELEBRATE, nameEn: 'Celebrate', nameAr: 'احتفال', descriptionEn: 'Celebrate reaction', descriptionAr: 'تفاعل احتفال', sortOrder: 3 });
    await upsertLookup({ lookupTypeId: reactionTypeType.id, code: ReactionTypeCode.INSIGHTFUL, nameEn: 'Insightful', nameAr: 'ثاقب', descriptionEn: 'Insightful reaction', descriptionAr: 'تفاعل ثاقب', sortOrder: 4 });
    await upsertLookup({ lookupTypeId: reactionTypeType.id, code: ReactionTypeCode.CURIOUS, nameEn: 'Curious', nameAr: 'فضولي', descriptionEn: 'Curious reaction', descriptionAr: 'تفاعل فضولي', sortOrder: 5 });

    // 15. Event Type
    await upsertLookup({ lookupTypeId: eventTypeType.id, code: EventTypeCode.ONLINE, nameEn: 'Online', nameAr: 'عن بعد', descriptionEn: 'Online event', descriptionAr: 'حدث عن بعد', sortOrder: 1 });
    await upsertLookup({ lookupTypeId: eventTypeType.id, code: EventTypeCode.IN_PERSON, nameEn: 'In Person', nameAr: 'حضوري', descriptionEn: 'In-person event', descriptionAr: 'حدث حضوري', sortOrder: 2 });
    await upsertLookup({ lookupTypeId: eventTypeType.id, code: EventTypeCode.HYBRID, nameEn: 'Hybrid', nameAr: 'مختلط', descriptionEn: 'Hybrid event', descriptionAr: 'حدث مختلط', sortOrder: 3 });

    // 16. Event Status
    await upsertLookup({ lookupTypeId: eventStatusType.id, code: EventStatusCode.UPCOMING, nameEn: 'Upcoming', nameAr: 'قادم', descriptionEn: 'Event is upcoming', descriptionAr: 'الحدث قادم', sortOrder: 1 });
    await upsertLookup({ lookupTypeId: eventStatusType.id, code: EventStatusCode.ONGOING, nameEn: 'Ongoing', nameAr: 'جاري', descriptionEn: 'Event is ongoing', descriptionAr: 'الحدث جاري', sortOrder: 2 });
    await upsertLookup({ lookupTypeId: eventStatusType.id, code: EventStatusCode.COMPLETED, nameEn: 'Completed', nameAr: 'مكتمل', descriptionEn: 'Event completed', descriptionAr: 'الحدث مكتمل', sortOrder: 3 });
    await upsertLookup({ lookupTypeId: eventStatusType.id, code: EventStatusCode.CANCELLED, nameEn: 'Cancelled', nameAr: 'ملغي', descriptionEn: 'Event cancelled', descriptionAr: 'الحدث ملغي', sortOrder: 4 });

    // 17. Event Attendance Status
    await upsertLookup({ lookupTypeId: eventAttendanceStatusType.id, code: EventAttendanceStatusCode.GOING, nameEn: 'Going', nameAr: 'سأحضر', descriptionEn: 'Attending event', descriptionAr: 'سأحضر الحدث', sortOrder: 1 });
    await upsertLookup({ lookupTypeId: eventAttendanceStatusType.id, code: EventAttendanceStatusCode.INTERESTED, nameEn: 'Interested', nameAr: 'مهتم', descriptionEn: 'Interested in event', descriptionAr: 'مهتم بالحدث', sortOrder: 2 });
    await upsertLookup({ lookupTypeId: eventAttendanceStatusType.id, code: EventAttendanceStatusCode.MAYBE, nameEn: 'Maybe', nameAr: 'ربما', descriptionEn: 'Maybe attending', descriptionAr: 'ربما سأحضر', sortOrder: 3 });
    await upsertLookup({ lookupTypeId: eventAttendanceStatusType.id, code: EventAttendanceStatusCode.NOT_GOING, nameEn: 'Not Going', nameAr: 'لن أحضر', descriptionEn: 'Not attending', descriptionAr: 'لن أحضر', sortOrder: 4 });

    // 18. Job Type
    await upsertLookup({ lookupTypeId: jobTypeType.id, code: JobTypeCode.FULL_TIME, nameEn: 'Full Time', nameAr: 'دوام كامل', descriptionEn: 'Full-time position', descriptionAr: 'وظيفة دوام كامل', sortOrder: 1 });
    await upsertLookup({ lookupTypeId: jobTypeType.id, code: JobTypeCode.PART_TIME, nameEn: 'Part Time', nameAr: 'دوام جزئي', descriptionEn: 'Part-time position', descriptionAr: 'وظيفة دوام جزئي', sortOrder: 2 });
    await upsertLookup({ lookupTypeId: jobTypeType.id, code: JobTypeCode.CONTRACT, nameEn: 'Contract', nameAr: 'عقد', descriptionEn: 'Contract position', descriptionAr: 'وظيفة عقد', sortOrder: 3 });
    await upsertLookup({ lookupTypeId: jobTypeType.id, code: JobTypeCode.INTERNSHIP, nameEn: 'Internship', nameAr: 'تدريب', descriptionEn: 'Internship position', descriptionAr: 'تدريب', sortOrder: 4 });

    // 19. Experience Level
    await upsertLookup({ lookupTypeId: experienceLevelType.id, code: ExperienceLevelCode.ENTRY, nameEn: 'Entry Level', nameAr: 'مبتدئ', descriptionEn: 'Entry level position', descriptionAr: 'وظيفة مبتدئ', sortOrder: 1 });
    await upsertLookup({ lookupTypeId: experienceLevelType.id, code: ExperienceLevelCode.MID, nameEn: 'Mid Level', nameAr: 'متوسط', descriptionEn: 'Mid level position', descriptionAr: 'وظيفة متوسطة', sortOrder: 2 });
    await upsertLookup({ lookupTypeId: experienceLevelType.id, code: ExperienceLevelCode.SENIOR, nameEn: 'Senior Level', nameAr: 'كبير', descriptionEn: 'Senior level position', descriptionAr: 'وظيفة كبيرة', sortOrder: 3 });
    await upsertLookup({ lookupTypeId: experienceLevelType.id, code: ExperienceLevelCode.EXECUTIVE, nameEn: 'Executive', nameAr: 'تنفيذي', descriptionEn: 'Executive position', descriptionAr: 'وظيفة تنفيذية', sortOrder: 4 });

    // 20. Job Status
    await upsertLookup({ lookupTypeId: jobStatusType.id, code: JobStatusCode.OPEN, nameEn: 'Open', nameAr: 'مفتوح', descriptionEn: 'Job is open', descriptionAr: 'الوظيفة مفتوحة', sortOrder: 1 });
    await upsertLookup({ lookupTypeId: jobStatusType.id, code: JobStatusCode.CLOSED, nameEn: 'Closed', nameAr: 'مغلق', descriptionEn: 'Job is closed', descriptionAr: 'الوظيفة مغلقة', sortOrder: 2 });
    await upsertLookup({ lookupTypeId: jobStatusType.id, code: JobStatusCode.FILLED, nameEn: 'Filled', nameAr: 'مملوء', descriptionEn: 'Position filled', descriptionAr: 'الوظيفة مملوءة', sortOrder: 3 });
    await upsertLookup({ lookupTypeId: jobStatusType.id, code: JobStatusCode.ON_HOLD, nameEn: 'On Hold', nameAr: 'معلق', descriptionEn: 'Job on hold', descriptionAr: 'الوظيفة معلقة', sortOrder: 4 });

    // 21. Job Application Status
    await upsertLookup({ lookupTypeId: jobApplicationStatusType.id, code: JobApplicationStatusCode.APPLIED, nameEn: 'Applied', nameAr: 'متقدم', descriptionEn: 'Application submitted', descriptionAr: 'تم تقديم الطلب', sortOrder: 1 });
    await upsertLookup({ lookupTypeId: jobApplicationStatusType.id, code: JobApplicationStatusCode.UNDER_REVIEW, nameEn: 'Under Review', nameAr: 'قيد المراجعة', descriptionEn: 'Under review', descriptionAr: 'قيد المراجعة', sortOrder: 2 });
    await upsertLookup({ lookupTypeId: jobApplicationStatusType.id, code: JobApplicationStatusCode.SHORTLISTED, nameEn: 'Shortlisted', nameAr: 'مرشح', descriptionEn: 'Shortlisted for interview', descriptionAr: 'مرشح للمقابلة', sortOrder: 3 });
    await upsertLookup({ lookupTypeId: jobApplicationStatusType.id, code: JobApplicationStatusCode.INTERVIEW_SCHEDULED, nameEn: 'Interview Scheduled', nameAr: 'موعد مقابلة', descriptionEn: 'Interview scheduled', descriptionAr: 'موعد مقابلة محدد', sortOrder: 4 });
    await upsertLookup({ lookupTypeId: jobApplicationStatusType.id, code: JobApplicationStatusCode.REJECTED, nameEn: 'Rejected', nameAr: 'مرفوض', descriptionEn: 'Application rejected', descriptionAr: 'الطلب مرفوض', sortOrder: 5 });
    await upsertLookup({ lookupTypeId: jobApplicationStatusType.id, code: JobApplicationStatusCode.ACCEPTED, nameEn: 'Accepted', nameAr: 'مقبول', descriptionEn: 'Application accepted', descriptionAr: 'الطلب مقبول', sortOrder: 6 });
    await upsertLookup({ lookupTypeId: jobApplicationStatusType.id, code: JobApplicationStatusCode.WITHDRAWN, nameEn: 'Withdrawn', nameAr: 'منسحب', descriptionEn: 'Application withdrawn', descriptionAr: 'الطلب منسحب', sortOrder: 7 });

    // 22. Ticket Category
    await upsertLookup({ lookupTypeId: ticketCategoryType.id, code: TicketCategoryCode.TECHNICAL, nameEn: 'Technical', nameAr: 'تقني', descriptionEn: 'Technical support', descriptionAr: 'دعم فني', sortOrder: 1 });
    await upsertLookup({ lookupTypeId: ticketCategoryType.id, code: TicketCategoryCode.BILLING, nameEn: 'Billing', nameAr: 'فوترة', descriptionEn: 'Billing inquiry', descriptionAr: 'استفسار فوترة', sortOrder: 2 });
    await upsertLookup({ lookupTypeId: ticketCategoryType.id, code: TicketCategoryCode.GENERAL, nameEn: 'General', nameAr: 'عام', descriptionEn: 'General inquiry', descriptionAr: 'استفسار عام', sortOrder: 3 });
    await upsertLookup({ lookupTypeId: ticketCategoryType.id, code: TicketCategoryCode.CONTENT, nameEn: 'Content', nameAr: 'محتوى', descriptionEn: 'Content issue', descriptionAr: 'مشكلة محتوى', sortOrder: 4 });
    await upsertLookup({ lookupTypeId: ticketCategoryType.id, code: TicketCategoryCode.JOB_RELATED, nameEn: 'Job Related', nameAr: 'متعلق بالوظائف', descriptionEn: 'Job related inquiry', descriptionAr: 'استفسار متعلق بالوظائف', sortOrder: 5 });

    // 23. Ticket Status
    await upsertLookup({ lookupTypeId: ticketStatusType.id, code: TicketStatusCode.OPEN, nameEn: 'Open', nameAr: 'مفتوح', descriptionEn: 'Ticket is open', descriptionAr: 'التذكرة مفتوحة', sortOrder: 1 });
    await upsertLookup({ lookupTypeId: ticketStatusType.id, code: TicketStatusCode.IN_PROGRESS, nameEn: 'In Progress', nameAr: 'قيد التقدم', descriptionEn: 'Ticket in progress', descriptionAr: 'التذكرة قيد التقدم', sortOrder: 2 });
    await upsertLookup({ lookupTypeId: ticketStatusType.id, code: TicketStatusCode.WAITING, nameEn: 'Waiting', nameAr: 'انتظار', descriptionEn: 'Waiting for response', descriptionAr: 'في انتظار الرد', sortOrder: 3 });
    await upsertLookup({ lookupTypeId: ticketStatusType.id, code: TicketStatusCode.RESOLVED, nameEn: 'Resolved', nameAr: 'محلول', descriptionEn: 'Ticket resolved', descriptionAr: 'التذكرة محلولة', sortOrder: 4 });
    await upsertLookup({ lookupTypeId: ticketStatusType.id, code: TicketStatusCode.CLOSED, nameEn: 'Closed', nameAr: 'مغلق', descriptionEn: 'Ticket closed', descriptionAr: 'التذكرة مغلقة', sortOrder: 5 });

    // 24. Ticket Priority
    await upsertLookup({ lookupTypeId: ticketPriorityType.id, code: TicketPriorityCode.LOW, nameEn: 'Low', nameAr: 'منخفض', descriptionEn: 'Low priority', descriptionAr: 'أولوية منخفضة', sortOrder: 1 });
    await upsertLookup({ lookupTypeId: ticketPriorityType.id, code: TicketPriorityCode.MEDIUM, nameEn: 'Medium', nameAr: 'متوسط', descriptionEn: 'Medium priority', descriptionAr: 'أولوية متوسطة', sortOrder: 2 });
    await upsertLookup({ lookupTypeId: ticketPriorityType.id, code: TicketPriorityCode.HIGH, nameEn: 'High', nameAr: 'عالي', descriptionEn: 'High priority', descriptionAr: 'أولوية عالية', sortOrder: 3 });
    await upsertLookup({ lookupTypeId: ticketPriorityType.id, code: TicketPriorityCode.URGENT, nameEn: 'Urgent', nameAr: 'عاجل', descriptionEn: 'Urgent priority', descriptionAr: 'أولوية عاجلة', sortOrder: 4 });

    // 25. Report Type
    await upsertLookup({ lookupTypeId: reportTypeType.id, code: ReportTypeCode.SPAM, nameEn: 'Spam', nameAr: 'بريد مزعج', descriptionEn: 'Spam content', descriptionAr: 'محتوى مزعج', sortOrder: 1 });
    await upsertLookup({ lookupTypeId: reportTypeType.id, code: ReportTypeCode.HARASSMENT, nameEn: 'Harassment', nameAr: 'تحرش', descriptionEn: 'Harassment', descriptionAr: 'تحرش', sortOrder: 2 });
    await upsertLookup({ lookupTypeId: reportTypeType.id, code: ReportTypeCode.INAPPROPRIATE, nameEn: 'Inappropriate', nameAr: 'غير لائق', descriptionEn: 'Inappropriate content', descriptionAr: 'محتوى غير لائق', sortOrder: 3 });
    await upsertLookup({ lookupTypeId: reportTypeType.id, code: ReportTypeCode.COPYRIGHT, nameEn: 'Copyright', nameAr: 'حقوق نشر', descriptionEn: 'Copyright violation', descriptionAr: 'انتهاك حقوق نشر', sortOrder: 4 });
    await upsertLookup({ lookupTypeId: reportTypeType.id, code: ReportTypeCode.FAKE_JOB, nameEn: 'Fake Job', nameAr: 'وظيفة مزيفة', descriptionEn: 'Fake job posting', descriptionAr: 'إعلان وظيفة مزيف', sortOrder: 5 });
    await upsertLookup({ lookupTypeId: reportTypeType.id, code: ReportTypeCode.OTHER, nameEn: 'Other', nameAr: 'آخر', descriptionEn: 'Other issue', descriptionAr: 'مشكلة أخرى', sortOrder: 6 });

    // 26. Report Status
    await upsertLookup({ lookupTypeId: reportStatusType.id, code: ReportStatusCode.PENDING, nameEn: 'Pending', nameAr: 'قيد الانتظار', descriptionEn: 'Report pending', descriptionAr: 'التقرير قيد الانتظار', sortOrder: 1 });
    await upsertLookup({ lookupTypeId: reportStatusType.id, code: ReportStatusCode.UNDER_REVIEW, nameEn: 'Under Review', nameAr: 'قيد المراجعة', descriptionEn: 'Under review', descriptionAr: 'قيد المراجعة', sortOrder: 2 });
    await upsertLookup({ lookupTypeId: reportStatusType.id, code: ReportStatusCode.RESOLVED, nameEn: 'Resolved', nameAr: 'محلول', descriptionEn: 'Report resolved', descriptionAr: 'التقرير محلول', sortOrder: 3 });
    await upsertLookup({ lookupTypeId: reportStatusType.id, code: ReportStatusCode.DISMISSED, nameEn: 'Dismissed', nameAr: 'مرفوض', descriptionEn: 'Report dismissed', descriptionAr: 'التقرير مرفوض', sortOrder: 4 });

    // 27. Subscription Status
    await upsertLookup({ lookupTypeId: subscriptionStatusType.id, code: SubscriptionStatusCode.ACTIVE, nameEn: 'Active', nameAr: 'نشط', descriptionEn: 'Subscription active', descriptionAr: 'الاشتراك نشط', sortOrder: 1 });
    await upsertLookup({ lookupTypeId: subscriptionStatusType.id, code: SubscriptionStatusCode.EXPIRED, nameEn: 'Expired', nameAr: 'منتهي', descriptionEn: 'Subscription expired', descriptionAr: 'الاشتراك منتهي', sortOrder: 2 });
    await upsertLookup({ lookupTypeId: subscriptionStatusType.id, code: SubscriptionStatusCode.CANCELLED, nameEn: 'Cancelled', nameAr: 'ملغي', descriptionEn: 'Subscription cancelled', descriptionAr: 'الاشتراك ملغي', sortOrder: 3 });
    await upsertLookup({ lookupTypeId: subscriptionStatusType.id, code: SubscriptionStatusCode.SUSPENDED, nameEn: 'Suspended', nameAr: 'معلق', descriptionEn: 'Subscription suspended', descriptionAr: 'الاشتراك معلق', sortOrder: 4 });
    await upsertLookup({ lookupTypeId: subscriptionStatusType.id, code: SubscriptionStatusCode.TRIAL, nameEn: 'Trial', nameAr: 'تجريبي', descriptionEn: 'Trial period', descriptionAr: 'فترة تجريبية', sortOrder: 5 });

    // 28. Billing Cycle
    await upsertLookup({ lookupTypeId: billingCycleType.id, code: BillingCycleCode.MONTHLY, nameEn: 'Monthly', nameAr: 'شهري', descriptionEn: 'Monthly billing', descriptionAr: 'فوترة شهرية', sortOrder: 1 });
    await upsertLookup({ lookupTypeId: billingCycleType.id, code: BillingCycleCode.QUARTERLY, nameEn: 'Quarterly', nameAr: 'ربع سنوي', descriptionEn: 'Quarterly billing', descriptionAr: 'فوترة ربع سنوية', sortOrder: 2 });
    await upsertLookup({ lookupTypeId: billingCycleType.id, code: BillingCycleCode.ANNUAL, nameEn: 'Annual', nameAr: 'سنوي', descriptionEn: 'Annual billing', descriptionAr: 'فوترة سنوية', sortOrder: 3 });

    // 29. Plan Feature
    await upsertLookup({ lookupTypeId: planFeatureType.id, code: PlanFeatureCode.COURSE_ACCESS, nameEn: 'Course Access', nameAr: 'الوصول للدورات', descriptionEn: 'Access to courses', descriptionAr: 'الوصول إلى الدورات', sortOrder: 1 });
    await upsertLookup({ lookupTypeId: planFeatureType.id, code: PlanFeatureCode.CHAT_ACCESS, nameEn: 'Chat Access', nameAr: 'الوصول للدردشة', descriptionEn: 'Access to chat', descriptionAr: 'الوصول إلى الدردشة', sortOrder: 2 });
    await upsertLookup({ lookupTypeId: planFeatureType.id, code: PlanFeatureCode.DOWNLOADS, nameEn: 'Downloads', nameAr: 'التحميلات', descriptionEn: 'Download resources', descriptionAr: 'تحميل الموارد', sortOrder: 3 });
    await upsertLookup({ lookupTypeId: planFeatureType.id, code: PlanFeatureCode.CERTIFICATES, nameEn: 'Certificates', nameAr: 'الشهادات', descriptionEn: 'Course certificates', descriptionAr: 'شهادات الدورة', sortOrder: 4 });
    await upsertLookup({ lookupTypeId: planFeatureType.id, code: PlanFeatureCode.PRIORITY_SUPPORT, nameEn: 'Priority Support', nameAr: 'دعم أولوية', descriptionEn: 'Priority support', descriptionAr: 'دعم الأولوية', sortOrder: 5 });
    await upsertLookup({ lookupTypeId: planFeatureType.id, code: PlanFeatureCode.JOB_POSTINGS, nameEn: 'Job Postings', nameAr: 'إعلانات الوظائف', descriptionEn: 'Post job listings', descriptionAr: 'نشر إعلانات الوظائف', sortOrder: 6 });

    // 30. Quiz Question Type
    await upsertLookup({ lookupTypeId: quizQuestionTypeType.id, code: QuizQuestionTypeCode.MULTIPLE_CHOICE, nameEn: 'Multiple Choice', nameAr: 'اختيار متعدد', descriptionEn: 'Multiple choice question', descriptionAr: 'سؤال اختيار متعدد', sortOrder: 1 });
    await upsertLookup({ lookupTypeId: quizQuestionTypeType.id, code: QuizQuestionTypeCode.TRUE_FALSE, nameEn: 'True/False', nameAr: 'صح/خطأ', descriptionEn: 'True/False question', descriptionAr: 'سؤال صح/خطأ', sortOrder: 2 });
    await upsertLookup({ lookupTypeId: quizQuestionTypeType.id, code: QuizQuestionTypeCode.SHORT_ANSWER, nameEn: 'Short Answer', nameAr: 'إجابة قصيرة', descriptionEn: 'Short answer question', descriptionAr: 'سؤال إجابة قصيرة', sortOrder: 3 });
    await upsertLookup({ lookupTypeId: quizQuestionTypeType.id, code: QuizQuestionTypeCode.ESSAY, nameEn: 'Essay', nameAr: 'مقال', descriptionEn: 'Essay question', descriptionAr: 'سؤال مقال', sortOrder: 4 });

    // 31. Assignment Status
    await upsertLookup({ lookupTypeId: assignmentStatusType.id, code: AssignmentStatusCode.NOT_SUBMITTED, nameEn: 'Not Submitted', nameAr: 'لم يتم التقديم', descriptionEn: 'Not submitted', descriptionAr: 'لم يتم التقديم', sortOrder: 1 });
    await upsertLookup({ lookupTypeId: assignmentStatusType.id, code: AssignmentStatusCode.SUBMITTED, nameEn: 'Submitted', nameAr: 'تم التقديم', descriptionEn: 'Submitted', descriptionAr: 'تم التقديم', sortOrder: 2 });
    await upsertLookup({ lookupTypeId: assignmentStatusType.id, code: AssignmentStatusCode.GRADED, nameEn: 'Graded', nameAr: 'تم التقييم', descriptionEn: 'Graded', descriptionAr: 'تم التقييم', sortOrder: 3 });

    // 32. Content Type
    await upsertLookup({ lookupTypeId: contentTypeType.id, code: ContentTypeCode.VIDEO, nameEn: 'Video', nameAr: 'فيديو', descriptionEn: 'Video content', descriptionAr: 'محتوى فيديو', sortOrder: 1 });
    await upsertLookup({ lookupTypeId: contentTypeType.id, code: ContentTypeCode.DOCUMENT, nameEn: 'Document', nameAr: 'مستند', descriptionEn: 'Document content', descriptionAr: 'محتوى مستند', sortOrder: 2 });
    await upsertLookup({ lookupTypeId: contentTypeType.id, code: ContentTypeCode.QUIZ, nameEn: 'Quiz', nameAr: 'اختبار', descriptionEn: 'Quiz', descriptionAr: 'اختبار', sortOrder: 3 });
    await upsertLookup({ lookupTypeId: contentTypeType.id, code: ContentTypeCode.ASSIGNMENT, nameEn: 'Assignment', nameAr: 'واجب', descriptionEn: 'Assignment', descriptionAr: 'واجب', sortOrder: 4 });
    await upsertLookup({ lookupTypeId: contentTypeType.id, code: ContentTypeCode.TEXT, nameEn: 'Text', nameAr: 'نص', descriptionEn: 'Text content', descriptionAr: 'محتوى نصي', sortOrder: 5 });

    // 33. Resource Type
    await upsertLookup({ lookupTypeId: resourceTypeType.id, code: ResourceTypeCode.PDF, nameEn: 'PDF', nameAr: 'PDF', descriptionEn: 'PDF file', descriptionAr: 'ملف PDF', sortOrder: 1 });
    await upsertLookup({ lookupTypeId: resourceTypeType.id, code: ResourceTypeCode.VIDEO, nameEn: 'Video', nameAr: 'فيديو', descriptionEn: 'Video file', descriptionAr: 'ملف فيديو', sortOrder: 2 });
    await upsertLookup({ lookupTypeId: resourceTypeType.id, code: ResourceTypeCode.DOCUMENT, nameEn: 'Document', nameAr: 'مستند', descriptionEn: 'Document file', descriptionAr: 'ملف مستند', sortOrder: 3 });
    await upsertLookup({ lookupTypeId: resourceTypeType.id, code: ResourceTypeCode.LINK, nameEn: 'Link', nameAr: 'رابط', descriptionEn: 'External link', descriptionAr: 'رابط خارجي', sortOrder: 4 });
    await upsertLookup({ lookupTypeId: resourceTypeType.id, code: ResourceTypeCode.FILE, nameEn: 'File', nameAr: 'ملف', descriptionEn: 'Generic file', descriptionAr: 'ملف عام', sortOrder: 5 });
    await upsertLookup({ lookupTypeId: resourceTypeType.id, code: ResourceTypeCode.ARCHIVE, nameEn: 'Archive', nameAr: 'أرشيف', descriptionEn: 'Archive file', descriptionAr: 'ملف أرشيف', sortOrder: 6 });

    // 34. Chat Type
    await upsertLookup({ lookupTypeId: chatTypeType.id, code: ChatTypeCode.PUBLIC, nameEn: 'Public', nameAr: 'عام', descriptionEn: 'Public chat', descriptionAr: 'دردشة عامة', sortOrder: 1 });
    await upsertLookup({ lookupTypeId: chatTypeType.id, code: ChatTypeCode.PRIVATE, nameEn: 'Private', nameAr: 'خاص', descriptionEn: 'Private chat', descriptionAr: 'دردشة خاصة', sortOrder: 2 });
    await upsertLookup({ lookupTypeId: chatTypeType.id, code: ChatTypeCode.GROUP, nameEn: 'Group', nameAr: 'مجموعة', descriptionEn: 'Group chat', descriptionAr: 'دردشة جماعية', sortOrder: 3 });

    // 35. Message Type
    await upsertLookup({ lookupTypeId: messageTypeType.id, code: MessageTypeCode.TEXT, nameEn: 'Text', nameAr: 'نص', descriptionEn: 'Text message', descriptionAr: 'رسالة نصية', sortOrder: 1 });
    await upsertLookup({ lookupTypeId: messageTypeType.id, code: MessageTypeCode.IMAGE, nameEn: 'Image', nameAr: 'صورة', descriptionEn: 'Image message', descriptionAr: 'رسالة صورة', sortOrder: 2 });
    await upsertLookup({ lookupTypeId: messageTypeType.id, code: MessageTypeCode.FILE, nameEn: 'File', nameAr: 'ملف', descriptionEn: 'File message', descriptionAr: 'رسالة ملف', sortOrder: 3 });
    await upsertLookup({ lookupTypeId: messageTypeType.id, code: MessageTypeCode.VOICE, nameEn: 'Voice', nameAr: 'صوت', descriptionEn: 'Voice message', descriptionAr: 'رسالة صوتية', sortOrder: 4 });

    // 36. Message Status
    await upsertLookup({ lookupTypeId: messageStatusType.id, code: MessageStatusCode.SENT, nameEn: 'Sent', nameAr: 'مرسل', descriptionEn: 'Message sent', descriptionAr: 'الرسالة مرسلة', sortOrder: 1 });
    await upsertLookup({ lookupTypeId: messageStatusType.id, code: MessageStatusCode.DELIVERED, nameEn: 'Delivered', nameAr: 'تم التسليم', descriptionEn: 'Message delivered', descriptionAr: 'الرسالة تم تسليمها', sortOrder: 2 });
    await upsertLookup({ lookupTypeId: messageStatusType.id, code: MessageStatusCode.READ, nameEn: 'Read', nameAr: 'مقروء', descriptionEn: 'Message read', descriptionAr: 'الرسالة مقروءة', sortOrder: 3 });

    // 37. Language
    await upsertLookup({ lookupTypeId: languageType.id, code: LanguageCode.EN, nameEn: 'English', nameAr: 'الإنجليزية', descriptionEn: 'English language', descriptionAr: 'اللغة الإنجليزية', sortOrder: 1 });
    await upsertLookup({ lookupTypeId: languageType.id, code: LanguageCode.AR, nameEn: 'Arabic', nameAr: 'العربية', descriptionEn: 'Arabic language', descriptionAr: 'اللغة العربية', sortOrder: 2 });

    // 38. Timezone
    await upsertLookup({ lookupTypeId: timezoneType.id, code: TimezoneCode.UTC, nameEn: 'UTC', nameAr: 'UTC', descriptionEn: 'Coordinated Universal Time', descriptionAr: 'التوقيت العالمي المنسق', sortOrder: 1 });
    await upsertLookup({ lookupTypeId: timezoneType.id, code: TimezoneCode.AFRICA_CAIRO, nameEn: 'Cairo', nameAr: 'القاهرة', descriptionEn: 'Cairo timezone', descriptionAr: 'توقيت القاهرة', sortOrder: 2 });
    await upsertLookup({ lookupTypeId: timezoneType.id, code: TimezoneCode.ASIA_DUBAI, nameEn: 'Dubai', nameAr: 'دبي', descriptionEn: 'Dubai timezone', descriptionAr: 'توقيت دبي', sortOrder: 3 });
    await upsertLookup({ lookupTypeId: timezoneType.id, code: TimezoneCode.ASIA_RIYADH, nameEn: 'Riyadh', nameAr: 'الرياض', descriptionEn: 'Riyadh timezone', descriptionAr: 'توقيت الرياض', sortOrder: 4 });

    // 39. Media Provider
    await upsertLookup({ lookupTypeId: mediaProviderType.id, code: MediaProviderCode.LOCAL, nameEn: 'Local', nameAr: 'محلي', descriptionEn: 'Local storage', descriptionAr: 'تخزين محلي', sortOrder: 1 });
    await upsertLookup({ lookupTypeId: mediaProviderType.id, code: MediaProviderCode.MINIO, nameEn: 'MinIO', nameAr: 'MinIO', descriptionEn: 'MinIO storage', descriptionAr: 'تخزين MinIO', sortOrder: 2 });
    await upsertLookup({ lookupTypeId: mediaProviderType.id, code: MediaProviderCode.R2, nameEn: 'Cloudflare R2', nameAr: 'Cloudflare R2', descriptionEn: 'Cloudflare R2 storage', descriptionAr: 'تخزين Cloudflare R2', sortOrder: 3 });
    await upsertLookup({ lookupTypeId: mediaProviderType.id, code: MediaProviderCode.S3, nameEn: 'AWS S3', nameAr: 'AWS S3', descriptionEn: 'AWS S3 storage', descriptionAr: 'تخزين AWS S3', sortOrder: 4 });

    // 40. Visibility Type
    await upsertLookup({ lookupTypeId: visibilityTypeType.id, code: VisibilityTypeCode.PUBLIC, nameEn: 'Public', nameAr: 'عام', descriptionEn: 'Visible to everyone', descriptionAr: 'مرئي للجميع', sortOrder: 1 });
    await upsertLookup({ lookupTypeId: visibilityTypeType.id, code: VisibilityTypeCode.PRIVATE, nameEn: 'Private', nameAr: 'خاص', descriptionEn: 'Visible to owner', descriptionAr: 'مرئي للمالك', sortOrder: 2 });
    await upsertLookup({ lookupTypeId: visibilityTypeType.id, code: VisibilityTypeCode.FRIENDS_ONLY, nameEn: 'Friends Only', nameAr: 'الأصدقاء فقط', descriptionEn: 'Visible to friends', descriptionAr: 'مرئي للأصدقاء', sortOrder: 3 });
    await upsertLookup({ lookupTypeId: visibilityTypeType.id, code: VisibilityTypeCode.CUSTOM, nameEn: 'Custom', nameAr: 'مخصص', descriptionEn: 'Custom visibility', descriptionAr: 'رؤية مخصصة', sortOrder: 4 });

    // 41. Payment Status
    await upsertLookup({ lookupTypeId: paymentStatusType.id, code: PaymentStatusCode.PENDING, nameEn: 'Pending', nameAr: 'قيد الانتظار', descriptionEn: 'Payment pending', descriptionAr: 'الدفع قيد الانتظار', sortOrder: 1 });
    await upsertLookup({ lookupTypeId: paymentStatusType.id, code: PaymentStatusCode.COMPLETED, nameEn: 'Completed', nameAr: 'مكتمل', descriptionEn: 'Payment completed', descriptionAr: 'الدفع مكتمل', sortOrder: 2 });
    await upsertLookup({ lookupTypeId: paymentStatusType.id, code: PaymentStatusCode.FAILED, nameEn: 'Failed', nameAr: 'فشل', descriptionEn: 'Payment failed', descriptionAr: 'الدفع فشل', sortOrder: 3 });
    await upsertLookup({ lookupTypeId: paymentStatusType.id, code: PaymentStatusCode.REFUNDED, nameEn: 'Refunded', nameAr: 'مسترد', descriptionEn: 'Payment refunded', descriptionAr: 'الدفع مسترد', sortOrder: 4 });

    // 42. Payment Method
    await upsertLookup({ lookupTypeId: paymentMethodType.id, code: PaymentMethodCode.PAYPAL, nameEn: 'PayPal', nameAr: 'باي بال', descriptionEn: 'Pay with PayPal', descriptionAr: 'الدفع عبر باي بال', sortOrder: 1 });
    await upsertLookup({ lookupTypeId: paymentMethodType.id, code: PaymentMethodCode.STRIPE, nameEn: 'Stripe', nameAr: 'سترايب', descriptionEn: 'Pay with Stripe', descriptionAr: 'الدفع عبر سترايب', sortOrder: 2 });
    await upsertLookup({ lookupTypeId: paymentMethodType.id, code: PaymentMethodCode.BANK_TRANSFER, nameEn: 'Bank Transfer', nameAr: 'تحويل بنكي', descriptionEn: 'Bank transfer', descriptionAr: 'تحويل بنكي', sortOrder: 3 });

    // 43. Notification Types - LMS (12 types)
    await upsertLookup({ lookupTypeId: notificationTypeType.id, code: NotificationTypeCode.COURSE_ENROLLMENT, nameEn: 'Course Enrollment', nameAr: 'تسجيل في دورة', descriptionEn: 'User enrolled in course', descriptionAr: 'تم تسجيل المستخدم في دورة', sortOrder: 1 });
    await upsertLookup({ lookupTypeId: notificationTypeType.id, code: NotificationTypeCode.COURSE_ENROLLMENT_APPROVED, nameEn: 'Enrollment Approved', nameAr: 'الموافقة على التسجيل', descriptionEn: 'Enrollment approved by instructor', descriptionAr: 'تمت الموافقة على التسجيل من قبل المدرس', sortOrder: 2 });
    await upsertLookup({ lookupTypeId: notificationTypeType.id, code: NotificationTypeCode.COURSE_COMPLETION, nameEn: 'Course Completion', nameAr: 'إكمال الدورة', descriptionEn: 'Course completed with certificate', descriptionAr: 'تم إكمال الدورة مع الشهادة', sortOrder: 3 });
    await upsertLookup({ lookupTypeId: notificationTypeType.id, code: NotificationTypeCode.LESSON_UNLOCKED, nameEn: 'Lesson Unlocked', nameAr: 'درس مفتوح', descriptionEn: 'New lesson available', descriptionAr: 'درس جديد متاح', sortOrder: 4 });
    await upsertLookup({ lookupTypeId: notificationTypeType.id, code: NotificationTypeCode.ASSIGNMENT_ASSIGNED, nameEn: 'Assignment Assigned', nameAr: 'واجب معين', descriptionEn: 'New assignment available', descriptionAr: 'واجب جديد متاح', sortOrder: 5 });
    await upsertLookup({ lookupTypeId: notificationTypeType.id, code: NotificationTypeCode.ASSIGNMENT_SUBMITTED, nameEn: 'Assignment Submitted', nameAr: 'تم تقديم الواجب', descriptionEn: 'Assignment submitted successfully', descriptionAr: 'تم تقديم الواجب بنجاح', sortOrder: 6 });
    await upsertLookup({ lookupTypeId: notificationTypeType.id, code: NotificationTypeCode.ASSIGNMENT_GRADED, nameEn: 'Assignment Graded', nameAr: 'تم تقييم الواجب', descriptionEn: 'Assignment graded by instructor', descriptionAr: 'تم تقييم الواجب من قبل المدرس', sortOrder: 7 });
    await upsertLookup({ lookupTypeId: notificationTypeType.id, code: NotificationTypeCode.ASSIGNMENT_DUE_SOON, nameEn: 'Assignment Due Soon', nameAr: 'موعد الواجب قريب', descriptionEn: 'Assignment due in 24 hours', descriptionAr: 'موعد تسليم الواجب خلال 24 ساعة', sortOrder: 8 });
    await upsertLookup({ lookupTypeId: notificationTypeType.id, code: NotificationTypeCode.QUIZ_GRADED, nameEn: 'Quiz Graded', nameAr: 'تم تقييم الاختبار', descriptionEn: 'Quiz results available', descriptionAr: 'نتائج الاختبار متاحة', sortOrder: 9 });
    await upsertLookup({ lookupTypeId: notificationTypeType.id, code: NotificationTypeCode.CERTIFICATE_ISSUED, nameEn: 'Certificate Issued', nameAr: 'شهادة صادرة', descriptionEn: 'Certificate earned', descriptionAr: 'تم الحصول على الشهادة', sortOrder: 10 });
    await upsertLookup({ lookupTypeId: notificationTypeType.id, code: NotificationTypeCode.INSTRUCTOR_MESSAGE, nameEn: 'Instructor Message', nameAr: 'رسالة من المدرس', descriptionEn: 'Message from instructor', descriptionAr: 'رسالة من المدرس', sortOrder: 11 });
    await upsertLookup({ lookupTypeId: notificationTypeType.id, code: NotificationTypeCode.COURSE_UPDATED, nameEn: 'Course Updated', nameAr: 'تحديث الدورة', descriptionEn: 'Course content updated', descriptionAr: 'تم تحديث محتوى الدورة', sortOrder: 12 });

    // 44. Notification Types - Job (8 types)
    await upsertLookup({ lookupTypeId: notificationTypeType.id, code: NotificationTypeCode.JOB_POSTED, nameEn: 'Job Posted', nameAr: 'وظيفة منشورة', descriptionEn: 'New job matching criteria posted', descriptionAr: 'تم نشر وظيفة جديدة مطابقة', sortOrder: 13 });
    await upsertLookup({ lookupTypeId: notificationTypeType.id, code: NotificationTypeCode.JOB_APPLICATION_RECEIVED, nameEn: 'Application Received', nameAr: 'تم استلام الطلب', descriptionEn: 'Application received by recruiter', descriptionAr: 'تم استلام الطلب من قبل المجند', sortOrder: 14 });
    await upsertLookup({ lookupTypeId: notificationTypeType.id, code: NotificationTypeCode.JOB_APPLICATION_REVIEWED, nameEn: 'Application Reviewed', nameAr: 'تمت مراجعة الطلب', descriptionEn: 'Application under review', descriptionAr: 'الطلب قيد المراجعة', sortOrder: 15 });
    await upsertLookup({ lookupTypeId: notificationTypeType.id, code: NotificationTypeCode.JOB_APPLICATION_SHORTLISTED, nameEn: 'Application Shortlisted', nameAr: 'تم ترشيح الطلب', descriptionEn: 'Shortlisted for interview', descriptionAr: 'تم الترشيح للمقابلة', sortOrder: 16 });
    await upsertLookup({ lookupTypeId: notificationTypeType.id, code: NotificationTypeCode.JOB_INTERVIEW_SCHEDULED, nameEn: 'Interview Scheduled', nameAr: 'موعد المقابلة محدد', descriptionEn: 'Interview scheduled', descriptionAr: 'تم تحديد موعد المقابلة', sortOrder: 17 });
    await upsertLookup({ lookupTypeId: notificationTypeType.id, code: NotificationTypeCode.JOB_APPLICATION_ACCEPTED, nameEn: 'Application Accepted', nameAr: 'تم قبول الطلب', descriptionEn: 'Application accepted', descriptionAr: 'تم قبول الطلب', sortOrder: 18 });
    await upsertLookup({ lookupTypeId: notificationTypeType.id, code: NotificationTypeCode.JOB_APPLICATION_REJECTED, nameEn: 'Application Rejected', nameAr: 'تم رفض الطلب', descriptionEn: 'Application rejected', descriptionAr: 'تم رفض الطلب', sortOrder: 19 });
    await upsertLookup({ lookupTypeId: notificationTypeType.id, code: NotificationTypeCode.JOB_EXPIRED, nameEn: 'Job Expired', nameAr: 'انتهت صلاحية الوظيفة', descriptionEn: 'Job posting expired', descriptionAr: 'انتهت صلاحية إعلان الوظيفة', sortOrder: 20 });

    // 45. Notification Types - Social (13 types)
    await upsertLookup({ lookupTypeId: notificationTypeType.id, code: NotificationTypeCode.FRIEND_REQUEST_RECEIVED, nameEn: 'Friend Request Received', nameAr: 'طلب صداقة مستلم', descriptionEn: 'Friend request received', descriptionAr: 'تم استلام طلب صداقة', sortOrder: 21 });
    await upsertLookup({ lookupTypeId: notificationTypeType.id, code: NotificationTypeCode.FRIEND_REQUEST_ACCEPTED, nameEn: 'Friend Request Accepted', nameAr: 'تم قبول طلب الصداقة', descriptionEn: 'Friend request accepted', descriptionAr: 'تم قبول طلب الصداقة', sortOrder: 22 });
    await upsertLookup({ lookupTypeId: notificationTypeType.id, code: NotificationTypeCode.GROUP_INVITATION, nameEn: 'Group Invitation', nameAr: 'دعوة لمجموعة', descriptionEn: 'Invited to group', descriptionAr: 'تمت دعوتك لمجموعة', sortOrder: 23 });
    await upsertLookup({ lookupTypeId: notificationTypeType.id, code: NotificationTypeCode.GROUP_JOINED, nameEn: 'Group Joined', nameAr: 'انضمام لمجموعة', descriptionEn: 'User joined your group', descriptionAr: 'انضم مستخدم لمجموعتك', sortOrder: 24 });
    await upsertLookup({ lookupTypeId: notificationTypeType.id, code: NotificationTypeCode.GROUP_JOIN, nameEn: 'Group Join', nameAr: 'انضمام المجموعة', descriptionEn: 'User joined your group', descriptionAr: 'انضم مستخدم لمجموعتك', sortOrder: 24 });
    await upsertLookup({ lookupTypeId: notificationTypeType.id, code: NotificationTypeCode.POST_COMMENTED, nameEn: 'Post Commented', nameAr: 'تعليق على المنشور', descriptionEn: 'Comment on your post', descriptionAr: 'تعليق على منشورك', sortOrder: 25 });
    await upsertLookup({ lookupTypeId: notificationTypeType.id, code: NotificationTypeCode.POST_COMMENT, nameEn: 'Post Comment', nameAr: 'تعليق المنشور', descriptionEn: 'Comment on your post', descriptionAr: 'تعليق على منشورك', sortOrder: 25 });
    await upsertLookup({ lookupTypeId: notificationTypeType.id, code: NotificationTypeCode.POST_REACTION, nameEn: 'Post Reaction', nameAr: 'تفاعل على المنشور', descriptionEn: 'Reaction to your post', descriptionAr: 'تفاعل على منشورك', sortOrder: 26 });
    await upsertLookup({ lookupTypeId: notificationTypeType.id, code: NotificationTypeCode.POST_SHARE, nameEn: 'Post Share', nameAr: 'مشاركة المنشور', descriptionEn: 'Someone shared your post', descriptionAr: 'شارك أحد منشورك', sortOrder: 27 });
    await upsertLookup({ lookupTypeId: notificationTypeType.id, code: NotificationTypeCode.COMMENT_REPLY, nameEn: 'Comment Reply', nameAr: 'رد على التعليق', descriptionEn: 'Reply to your comment', descriptionAr: 'رد على تعليقك', sortOrder: 28 });
    await upsertLookup({ lookupTypeId: notificationTypeType.id, code: NotificationTypeCode.MENTION_IN_POST, nameEn: 'Mentioned in Post', nameAr: 'إشارة في منشور', descriptionEn: 'Mentioned in post', descriptionAr: 'تمت الإشارة إليك في منشور', sortOrder: 29 });
    await upsertLookup({ lookupTypeId: notificationTypeType.id, code: NotificationTypeCode.MENTION, nameEn: 'Mention', nameAr: 'الإشارة', descriptionEn: 'Mentioned in content', descriptionAr: 'تمت الإشارة إليك في المحتوى', sortOrder: 29 });
    await upsertLookup({ lookupTypeId: notificationTypeType.id, code: NotificationTypeCode.PAGE_FOLLOW, nameEn: 'Page Follow', nameAr: 'متابعة الصفحة', descriptionEn: 'Someone followed your page', descriptionAr: 'تابع أحد صفحتك', sortOrder: 30 });
    await upsertLookup({ lookupTypeId: notificationTypeType.id, code: NotificationTypeCode.PAGE_LIKE, nameEn: 'Page Like', nameAr: 'إعجاب الصفحة', descriptionEn: 'Someone liked your page', descriptionAr: 'أعجب أحد بصفحتك', sortOrder: 31 });
    await upsertLookup({ lookupTypeId: notificationTypeType.id, code: NotificationTypeCode.EVENT_INVITATION, nameEn: 'Event Invitation', nameAr: 'دعوة لحدث', descriptionEn: 'Event invitation', descriptionAr: 'دعوة لحدث', sortOrder: 32 });
    await upsertLookup({ lookupTypeId: notificationTypeType.id, code: NotificationTypeCode.EVENT_REMINDER, nameEn: 'Event Reminder', nameAr: 'تذكير بحدث', descriptionEn: 'Event starts in 1 hour', descriptionAr: 'الحدث يبدأ خلال ساعة', sortOrder: 33 });

    // 46. Notification Types - Ticket (6 types)
    await upsertLookup({ lookupTypeId: notificationTypeType.id, code: NotificationTypeCode.TICKET_CREATED, nameEn: 'Ticket Created', nameAr: 'تم إنشاء تذكرة', descriptionEn: 'Support ticket created', descriptionAr: 'تم إنشاء تذكرة دعم', sortOrder: 34 });
    await upsertLookup({ lookupTypeId: notificationTypeType.id, code: NotificationTypeCode.TICKET_ASSIGNED, nameEn: 'Ticket Assigned', nameAr: 'تم تعيين التذكرة', descriptionEn: 'Ticket assigned to agent', descriptionAr: 'تم تعيين التذكرة لوكيل', sortOrder: 35 });
    await upsertLookup({ lookupTypeId: notificationTypeType.id, code: NotificationTypeCode.TICKET_REPLY, nameEn: 'Ticket Reply', nameAr: 'رد على التذكرة', descriptionEn: 'New reply to ticket', descriptionAr: 'رد جديد على التذكرة', sortOrder: 36 });
    await upsertLookup({ lookupTypeId: notificationTypeType.id, code: NotificationTypeCode.TICKET_STATUS_CHANGED, nameEn: 'Ticket Status Changed', nameAr: 'تغيير حالة التذكرة', descriptionEn: 'Ticket status updated', descriptionAr: 'تم تحديث حالة التذكرة', sortOrder: 37 });
    await upsertLookup({ lookupTypeId: notificationTypeType.id, code: NotificationTypeCode.TICKET_RESOLVED, nameEn: 'Ticket Resolved', nameAr: 'تم حل التذكرة', descriptionEn: 'Ticket marked as resolved', descriptionAr: 'تم تحديد التذكرة كمحلولة', sortOrder: 38 });
    await upsertLookup({ lookupTypeId: notificationTypeType.id, code: NotificationTypeCode.TICKET_REOPENED, nameEn: 'Ticket Reopened', nameAr: 'إعادة فتح التذكرة', descriptionEn: 'Ticket reopened', descriptionAr: 'تم إعادة فتح التذكرة', sortOrder: 39 });

    // 47. Notification Types - Payment (6 types)
    await upsertLookup({ lookupTypeId: notificationTypeType.id, code: NotificationTypeCode.PAYMENT_SUCCESSFUL, nameEn: 'Payment Successful', nameAr: 'دفع ناجح', descriptionEn: 'Payment processed successfully', descriptionAr: 'تمت معالجة الدفع بنجاح', sortOrder: 40 });
    await upsertLookup({ lookupTypeId: notificationTypeType.id, code: NotificationTypeCode.PAYMENT_FAILED, nameEn: 'Payment Failed', nameAr: 'فشل الدفع', descriptionEn: 'Payment failed', descriptionAr: 'فشل الدفع', sortOrder: 41 });
    await upsertLookup({ lookupTypeId: notificationTypeType.id, code: NotificationTypeCode.REFUND_PROCESSED, nameEn: 'Refund Processed', nameAr: 'تمت معالجة الاسترداد', descriptionEn: 'Refund issued', descriptionAr: 'تم إصدار الاسترداد', sortOrder: 42 });
    await upsertLookup({ lookupTypeId: notificationTypeType.id, code: NotificationTypeCode.SUBSCRIPTION_RENEWED, nameEn: 'Subscription Renewed', nameAr: 'تجديد الاشتراك', descriptionEn: 'Subscription renewed', descriptionAr: 'تم تجديد الاشتراك', sortOrder: 43 });
    await upsertLookup({ lookupTypeId: notificationTypeType.id, code: NotificationTypeCode.SUBSCRIPTION_EXPIRING, nameEn: 'Subscription Expiring', nameAr: 'اشتراك ينتهي', descriptionEn: 'Subscription expires in 7 days', descriptionAr: 'ينتهي الاشتراك خلال 7 أيام', sortOrder: 44 });
    await upsertLookup({ lookupTypeId: notificationTypeType.id, code: NotificationTypeCode.SUBSCRIPTION_CANCELLED, nameEn: 'Subscription Cancelled', nameAr: 'تم إلغاء الاشتراك', descriptionEn: 'Subscription cancelled', descriptionAr: 'تم إلغاء الاشتراك', sortOrder: 45 });

    // 48. Notification Types - System (8 types)
    await upsertLookup({ lookupTypeId: notificationTypeType.id, code: NotificationTypeCode.ACCOUNT_VERIFIED, nameEn: 'Account Verified', nameAr: 'حساب موثق', descriptionEn: 'Email verified', descriptionAr: 'تم التحقق من البريد الإلكتروني', sortOrder: 46 });
    await upsertLookup({ lookupTypeId: notificationTypeType.id, code: NotificationTypeCode.PASSWORD_CHANGED, nameEn: 'Password Changed', nameAr: 'تم تغيير كلمة المرور', descriptionEn: 'Password changed successfully', descriptionAr: 'تم تغيير كلمة المرور بنجاح', sortOrder: 47 });
    await upsertLookup({ lookupTypeId: notificationTypeType.id, code: NotificationTypeCode.SECURITY_ALERT, nameEn: 'Security Alert', nameAr: 'تنبيه أمني', descriptionEn: 'Unusual login detected', descriptionAr: 'تم اكتشاف تسجيل دخول غير عادي', sortOrder: 48 });
    await upsertLookup({ lookupTypeId: notificationTypeType.id, code: NotificationTypeCode.PROFILE_UPDATED, nameEn: 'Profile Updated', nameAr: 'تم تحديث الملف الشخصي', descriptionEn: 'Profile updated', descriptionAr: 'تم تحديث الملف الشخصي', sortOrder: 49 });
    await upsertLookup({ lookupTypeId: notificationTypeType.id, code: NotificationTypeCode.MAINTENANCE_SCHEDULED, nameEn: 'Maintenance Scheduled', nameAr: 'صيانة مجدولة', descriptionEn: 'System maintenance scheduled', descriptionAr: 'تم جدولة صيانة النظام', sortOrder: 50 });
    await upsertLookup({ lookupTypeId: notificationTypeType.id, code: NotificationTypeCode.WELCOME_TO_PLATFORM, nameEn: 'Welcome', nameAr: 'مرحبا', descriptionEn: 'New user welcome', descriptionAr: 'ترحيب بمستخدم جديد', sortOrder: 51 });
    await upsertLookup({ lookupTypeId: notificationTypeType.id, code: NotificationTypeCode.INACTIVITY_REMINDER, nameEn: 'Inactivity Reminder', nameAr: 'تذكير بعدم النشاط', descriptionEn: 'Haven\'t logged in for 30 days', descriptionAr: 'لم تسجل الدخول لمدة 30 يومًا', sortOrder: 52 });
    await upsertLookup({ lookupTypeId: notificationTypeType.id, code: NotificationTypeCode.ACCOUNT_SUSPENDED, nameEn: 'Account Suspended', nameAr: 'حساب معلق', descriptionEn: 'Account suspended', descriptionAr: 'تم تعليق الحساب', sortOrder: 53 });

    console.log('\n✅ Lookups seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding lookups:', error);
    throw error;
  } finally {
    await pool.end();
  }
}
