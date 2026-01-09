import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { lookupTypes, lookups } from '@leap-lms/database';
import { eq, and } from 'drizzle-orm';

export async function seedLookups() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool);

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
            .set({ name, description })
            .where(eq(lookupTypes.id, existing.id));
          console.log(`  ↻ Updated lookup type: ${code}`);
        }
        return existing;
      } else {
        const [newType] = await db
          .insert(lookupTypes)
          .values({ code, name, description })
          .returning();
        console.log(`  ✓ Created lookup type: ${code}`);
        return newType;
      }
    };

    // Helper function to upsert lookup value
    const upsertLookup = async (lookup: any) => {
      const [existing] = await db
        .select()
        .from(lookups)
        .where(
          and(
            eq(lookups.lookupTypeId, lookup.lookupTypeId),
            eq(lookups.code, lookup.code)
          )
        )
        .limit(1);

      if (existing) {
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
            })
            .where(eq(lookups.id, existing.id));
        }
        return existing;
      } else {
        const [newLookup] = await db.insert(lookups).values(lookup).returning();
        return newLookup;
      }
    };

    // ===== LOOKUP TYPES =====

    // User Management
    const userRoleType = await upsertLookupType('user_role', 'User Role', 'System user roles');
    const userStatusType = await upsertLookupType('user_status', 'User Status', 'User account status');
    const permissionType = await upsertLookupType('permission', 'Permission', 'System permissions');

    // Course System
    const courseLevelType = await upsertLookupType('course_level', 'Course Level', 'Course difficulty levels');
    const courseStatusType = await upsertLookupType('course_status', 'Course Status', 'Course publication status');
    const enrollmentTypeType = await upsertLookupType('enrollment_type', 'Enrollment Type', 'Course enrollment types');
    const enrollmentStatusType = await upsertLookupType('enrollment_status', 'Enrollment Status', 'Student enrollment status');

    // Social Features
    const postTypeType = await upsertLookupType('post_type', 'Post Type', 'Social post types');
    const postVisibilityType = await upsertLookupType('post_visibility', 'Post Visibility', 'Post visibility levels');
    const groupRoleType = await upsertLookupType('group_role', 'Group Role', 'Group member roles');
    const groupPrivacyType = await upsertLookupType('group_privacy', 'Group Privacy', 'Group privacy settings');
    const pageRoleType = await upsertLookupType('page_role', 'Page Role', 'Page member roles');
    const friendRequestStatusType = await upsertLookupType('friend_request_status', 'Friend Request Status', 'Friend request statuses');
    const reactionTypeType = await upsertLookupType('reaction_type', 'Reaction Type', 'Post reaction types');

    // Events
    const eventTypeType = await upsertLookupType('event_type', 'Event Type', 'Event types');
    const eventStatusType = await upsertLookupType('event_status', 'Event Status', 'Event statuses');
    const eventAttendanceStatusType = await upsertLookupType('event_attendance_status', 'Event Attendance Status', 'Event attendance statuses');

    // Jobs Module
    const jobTypeType = await upsertLookupType('job_type', 'Job Type', 'Employment types');
    const experienceLevelType = await upsertLookupType('experience_level', 'Experience Level', 'Job experience levels');
    const jobStatusType = await upsertLookupType('job_status', 'Job Status', 'Job posting statuses');
    const jobApplicationStatusType = await upsertLookupType('job_application_status', 'Job Application Status', 'Application statuses');

    // Tickets & Reports
    const ticketCategoryType = await upsertLookupType('ticket_category', 'Ticket Category', 'Support ticket categories');
    const ticketStatusType = await upsertLookupType('ticket_status', 'Ticket Status', 'Support ticket statuses');
    const ticketPriorityType = await upsertLookupType('ticket_priority', 'Ticket Priority', 'Support ticket priorities');
    const reportTypeType = await upsertLookupType('report_type', 'Report Type', 'Report types');
    const reportStatusType = await upsertLookupType('report_status', 'Report Status', 'Report statuses');

    // Subscriptions
    const subscriptionStatusType = await upsertLookupType('subscription_status', 'Subscription Status', 'Subscription statuses');
    const billingCycleType = await upsertLookupType('billing_cycle', 'Billing Cycle', 'Billing cycle types');
    const planFeatureType = await upsertLookupType('plan_feature', 'Plan Feature', 'Subscription plan features');

    // Content & Resources
    const quizQuestionTypeType = await upsertLookupType('quiz_question_type', 'Quiz Question Type', 'Quiz question types');
    const assignmentStatusType = await upsertLookupType('assignment_status', 'Assignment Status', 'Assignment submission statuses');
    const contentTypeType = await upsertLookupType('content_type', 'Content Type', 'Course content types');
    const resourceTypeType = await upsertLookupType('resource_type', 'Resource Type', 'Course resource types');

    // Chat & Messaging
    const chatTypeType = await upsertLookupType('chat_type', 'Chat Type', 'Chat types');
    const messageTypeType = await upsertLookupType('message_type', 'Message Type', 'Message types');
    const messageStatusType = await upsertLookupType('message_status', 'Message Status', 'Message delivery statuses');

    // System Configuration
    const languageType = await upsertLookupType('language', 'Language', 'System languages');
    const timezoneType = await upsertLookupType('timezone', 'Timezone', 'System timezones');
    const mediaProviderType = await upsertLookupType('media_provider', 'Media Provider', 'Media storage providers');
    const visibilityTypeType = await upsertLookupType('visibility_type', 'Visibility Type', 'Content visibility types');
    const paymentStatusType = await upsertLookupType('payment_status', 'Payment Status', 'Payment statuses');
    const paymentMethodType = await upsertLookupType('payment_method', 'Payment Method', 'Payment methods');
    const notificationTypeType = await upsertLookupType('notification_type', 'Notification Type', 'Notification types');

    console.log('\n📊 Seeding lookup values...\n');

    // ===== LOOKUP VALUES =====

    // 1. User Roles
    await upsertLookup({ lookupTypeId: userRoleType.id, code: 'admin', nameEn: 'Admin', nameAr: 'مدير', descriptionEn: 'System administrator', descriptionAr: 'مدير النظام', sortOrder: 1 });
    await upsertLookup({ lookupTypeId: userRoleType.id, code: 'instructor', nameEn: 'Instructor', nameAr: 'مدرس', descriptionEn: 'Course instructor', descriptionAr: 'مدرس الدورة', sortOrder: 2 });
    await upsertLookup({ lookupTypeId: userRoleType.id, code: 'user', nameEn: 'User', nameAr: 'مستخدم', descriptionEn: 'Regular user/student', descriptionAr: 'مستخدم عادي/طالب', sortOrder: 3 });
    await upsertLookup({ lookupTypeId: userRoleType.id, code: 'recruiter', nameEn: 'Recruiter', nameAr: 'موظف توظيف', descriptionEn: 'Job recruiter', descriptionAr: 'موظف التوظيف', sortOrder: 4 });

    // 2. User Status
    await upsertLookup({ lookupTypeId: userStatusType.id, code: 'active', nameEn: 'Active', nameAr: 'نشط', descriptionEn: 'Account is active', descriptionAr: 'الحساب نشط', sortOrder: 1 });
    await upsertLookup({ lookupTypeId: userStatusType.id, code: 'inactive', nameEn: 'Inactive', nameAr: 'غير نشط', descriptionEn: 'Account is inactive', descriptionAr: 'الحساب غير نشط', sortOrder: 2 });
    await upsertLookup({ lookupTypeId: userStatusType.id, code: 'suspended', nameEn: 'Suspended', nameAr: 'معلق', descriptionEn: 'Account is suspended', descriptionAr: 'الحساب معلق', sortOrder: 3 });
    await upsertLookup({ lookupTypeId: userStatusType.id, code: 'banned', nameEn: 'Banned', nameAr: 'محظور', descriptionEn: 'Account is banned', descriptionAr: 'الحساب محظور', sortOrder: 4 });

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
    await upsertLookup({ lookupTypeId: courseLevelType.id, code: 'beginner', nameEn: 'Beginner', nameAr: 'مبتدئ', descriptionEn: 'Suitable for beginners', descriptionAr: 'مناسب للمبتدئين', sortOrder: 1 });
    await upsertLookup({ lookupTypeId: courseLevelType.id, code: 'intermediate', nameEn: 'Intermediate', nameAr: 'متوسط', descriptionEn: 'Requires basic knowledge', descriptionAr: 'يتطلب معرفة أساسية', sortOrder: 2 });
    await upsertLookup({ lookupTypeId: courseLevelType.id, code: 'advanced', nameEn: 'Advanced', nameAr: 'متقدم', descriptionEn: 'For experienced learners', descriptionAr: 'للمتعلمين ذوي الخبرة', sortOrder: 3 });

    // 5. Course Status
    await upsertLookup({ lookupTypeId: courseStatusType.id, code: 'draft', nameEn: 'Draft', nameAr: 'مسودة', descriptionEn: 'Course is being prepared', descriptionAr: 'جاري تحضير الدورة', sortOrder: 1 });
    await upsertLookup({ lookupTypeId: courseStatusType.id, code: 'published', nameEn: 'Published', nameAr: 'منشور', descriptionEn: 'Course is live', descriptionAr: 'الدورة منشورة', sortOrder: 2 });
    await upsertLookup({ lookupTypeId: courseStatusType.id, code: 'archived', nameEn: 'Archived', nameAr: 'مؤرشف', descriptionEn: 'Course is archived', descriptionAr: 'الدورة مؤرشفة', sortOrder: 3 });

    // 6. Enrollment Type
    await upsertLookup({ lookupTypeId: enrollmentTypeType.id, code: 'purchase', nameEn: 'Purchase', nameAr: 'شراء', descriptionEn: 'One-time purchase', descriptionAr: 'شراء لمرة واحدة', sortOrder: 1 });
    await upsertLookup({ lookupTypeId: enrollmentTypeType.id, code: 'subscription', nameEn: 'Subscription', nameAr: 'اشتراك', descriptionEn: 'Subscription-based', descriptionAr: 'قائم على الاشتراك', sortOrder: 2 });

    // 7. Enrollment Status
    await upsertLookup({ lookupTypeId: enrollmentStatusType.id, code: 'active', nameEn: 'Active', nameAr: 'نشط', descriptionEn: 'Enrollment is active', descriptionAr: 'التسجيل نشط', sortOrder: 1 });
    await upsertLookup({ lookupTypeId: enrollmentStatusType.id, code: 'completed', nameEn: 'Completed', nameAr: 'مكتمل', descriptionEn: 'Course completed', descriptionAr: 'الدورة مكتملة', sortOrder: 2 });
    await upsertLookup({ lookupTypeId: enrollmentStatusType.id, code: 'expired', nameEn: 'Expired', nameAr: 'منتهي', descriptionEn: 'Enrollment expired', descriptionAr: 'التسجيل منتهي', sortOrder: 3 });
    await upsertLookup({ lookupTypeId: enrollmentStatusType.id, code: 'dropped', nameEn: 'Dropped', nameAr: 'متروك', descriptionEn: 'Student dropped course', descriptionAr: 'الطالب ترك الدورة', sortOrder: 4 });
    await upsertLookup({ lookupTypeId: enrollmentStatusType.id, code: 'cancelled', nameEn: 'Cancelled', nameAr: 'ملغي', descriptionEn: 'Enrollment cancelled', descriptionAr: 'التسجيل ملغي', sortOrder: 5 });

    // 8. Post Type
    await upsertLookup({ lookupTypeId: postTypeType.id, code: 'text', nameEn: 'Text', nameAr: 'نص', descriptionEn: 'Text post', descriptionAr: 'منشور نصي', sortOrder: 1 });
    await upsertLookup({ lookupTypeId: postTypeType.id, code: 'image', nameEn: 'Image', nameAr: 'صورة', descriptionEn: 'Image post', descriptionAr: 'منشور صورة', sortOrder: 2 });
    await upsertLookup({ lookupTypeId: postTypeType.id, code: 'video', nameEn: 'Video', nameAr: 'فيديو', descriptionEn: 'Video post', descriptionAr: 'منشور فيديو', sortOrder: 3 });
    await upsertLookup({ lookupTypeId: postTypeType.id, code: 'link', nameEn: 'Link', nameAr: 'رابط', descriptionEn: 'Link post', descriptionAr: 'منشور رابط', sortOrder: 4 });
    await upsertLookup({ lookupTypeId: postTypeType.id, code: 'poll', nameEn: 'Poll', nameAr: 'استطلاع', descriptionEn: 'Poll post', descriptionAr: 'منشور استطلاع', sortOrder: 5 });

    // 9. Post Visibility
    await upsertLookup({ lookupTypeId: postVisibilityType.id, code: 'public', nameEn: 'Public', nameAr: 'عام', descriptionEn: 'Visible to everyone', descriptionAr: 'مرئي للجميع', sortOrder: 1 });
    await upsertLookup({ lookupTypeId: postVisibilityType.id, code: 'private', nameEn: 'Private', nameAr: 'خاص', descriptionEn: 'Visible to owner only', descriptionAr: 'مرئي للمالك فقط', sortOrder: 2 });
    await upsertLookup({ lookupTypeId: postVisibilityType.id, code: 'friends', nameEn: 'Friends Only', nameAr: 'الأصدقاء فقط', descriptionEn: 'Visible to friends', descriptionAr: 'مرئي للأصدقاء', sortOrder: 3 });
    await upsertLookup({ lookupTypeId: postVisibilityType.id, code: 'custom', nameEn: 'Custom', nameAr: 'مخصص', descriptionEn: 'Custom visibility', descriptionAr: 'رؤية مخصصة', sortOrder: 4 });

    // 10. Group Role
    await upsertLookup({ lookupTypeId: groupRoleType.id, code: 'owner', nameEn: 'Owner', nameAr: 'مالك', descriptionEn: 'Group owner', descriptionAr: 'مالك المجموعة', sortOrder: 1 });
    await upsertLookup({ lookupTypeId: groupRoleType.id, code: 'moderator', nameEn: 'Moderator', nameAr: 'مشرف', descriptionEn: 'Group moderator', descriptionAr: 'مشرف المجموعة', sortOrder: 2 });
    await upsertLookup({ lookupTypeId: groupRoleType.id, code: 'member', nameEn: 'Member', nameAr: 'عضو', descriptionEn: 'Group member', descriptionAr: 'عضو المجموعة', sortOrder: 3 });

    // 11. Group Privacy
    await upsertLookup({ lookupTypeId: groupPrivacyType.id, code: 'public', nameEn: 'Public', nameAr: 'عام', descriptionEn: 'Anyone can join', descriptionAr: 'يمكن لأي شخص الانضمام', sortOrder: 1 });
    await upsertLookup({ lookupTypeId: groupPrivacyType.id, code: 'private', nameEn: 'Private', nameAr: 'خاص', descriptionEn: 'Request to join', descriptionAr: 'طلب الانضمام', sortOrder: 2 });
    await upsertLookup({ lookupTypeId: groupPrivacyType.id, code: 'secret', nameEn: 'Secret', nameAr: 'سري', descriptionEn: 'Invite only', descriptionAr: 'بالدعوة فقط', sortOrder: 3 });

    // 12. Page Role
    await upsertLookup({ lookupTypeId: pageRoleType.id, code: 'owner', nameEn: 'Owner', nameAr: 'مالك', descriptionEn: 'Page owner', descriptionAr: 'مالك الصفحة', sortOrder: 1 });
    await upsertLookup({ lookupTypeId: pageRoleType.id, code: 'admin', nameEn: 'Admin', nameAr: 'مدير', descriptionEn: 'Page admin', descriptionAr: 'مدير الصفحة', sortOrder: 2 });
    await upsertLookup({ lookupTypeId: pageRoleType.id, code: 'editor', nameEn: 'Editor', nameAr: 'محرر', descriptionEn: 'Page editor', descriptionAr: 'محرر الصفحة', sortOrder: 3 });
    await upsertLookup({ lookupTypeId: pageRoleType.id, code: 'viewer', nameEn: 'Viewer', nameAr: 'مشاهد', descriptionEn: 'Page viewer', descriptionAr: 'مشاهد الصفحة', sortOrder: 4 });

    // 13. Friend Request Status
    await upsertLookup({ lookupTypeId: friendRequestStatusType.id, code: 'pending', nameEn: 'Pending', nameAr: 'قيد الانتظار', descriptionEn: 'Request pending', descriptionAr: 'طلب قيد الانتظار', sortOrder: 1 });
    await upsertLookup({ lookupTypeId: friendRequestStatusType.id, code: 'accepted', nameEn: 'Accepted', nameAr: 'مقبول', descriptionEn: 'Request accepted', descriptionAr: 'طلب مقبول', sortOrder: 2 });
    await upsertLookup({ lookupTypeId: friendRequestStatusType.id, code: 'declined', nameEn: 'Declined', nameAr: 'مرفوض', descriptionEn: 'Request declined', descriptionAr: 'طلب مرفوض', sortOrder: 3 });
    await upsertLookup({ lookupTypeId: friendRequestStatusType.id, code: 'blocked', nameEn: 'Blocked', nameAr: 'محظور', descriptionEn: 'User blocked', descriptionAr: 'مستخدم محظور', sortOrder: 4 });

    // 14. Reaction Type
    await upsertLookup({ lookupTypeId: reactionTypeType.id, code: 'like', nameEn: 'Like', nameAr: 'إعجاب', descriptionEn: 'Like reaction', descriptionAr: 'تفاعل إعجاب', sortOrder: 1 });
    await upsertLookup({ lookupTypeId: reactionTypeType.id, code: 'love', nameEn: 'Love', nameAr: 'حب', descriptionEn: 'Love reaction', descriptionAr: 'تفاعل حب', sortOrder: 2 });
    await upsertLookup({ lookupTypeId: reactionTypeType.id, code: 'celebrate', nameEn: 'Celebrate', nameAr: 'احتفال', descriptionEn: 'Celebrate reaction', descriptionAr: 'تفاعل احتفال', sortOrder: 3 });
    await upsertLookup({ lookupTypeId: reactionTypeType.id, code: 'insightful', nameEn: 'Insightful', nameAr: 'ثاقب', descriptionEn: 'Insightful reaction', descriptionAr: 'تفاعل ثاقب', sortOrder: 4 });
    await upsertLookup({ lookupTypeId: reactionTypeType.id, code: 'curious', nameEn: 'Curious', nameAr: 'فضولي', descriptionEn: 'Curious reaction', descriptionAr: 'تفاعل فضولي', sortOrder: 5 });

    // 15. Event Type
    await upsertLookup({ lookupTypeId: eventTypeType.id, code: 'online', nameEn: 'Online', nameAr: 'عن بعد', descriptionEn: 'Online event', descriptionAr: 'حدث عن بعد', sortOrder: 1 });
    await upsertLookup({ lookupTypeId: eventTypeType.id, code: 'in_person', nameEn: 'In Person', nameAr: 'حضوري', descriptionEn: 'In-person event', descriptionAr: 'حدث حضوري', sortOrder: 2 });
    await upsertLookup({ lookupTypeId: eventTypeType.id, code: 'hybrid', nameEn: 'Hybrid', nameAr: 'مختلط', descriptionEn: 'Hybrid event', descriptionAr: 'حدث مختلط', sortOrder: 3 });

    // 16. Event Status
    await upsertLookup({ lookupTypeId: eventStatusType.id, code: 'upcoming', nameEn: 'Upcoming', nameAr: 'قادم', descriptionEn: 'Event is upcoming', descriptionAr: 'الحدث قادم', sortOrder: 1 });
    await upsertLookup({ lookupTypeId: eventStatusType.id, code: 'ongoing', nameEn: 'Ongoing', nameAr: 'جاري', descriptionEn: 'Event is ongoing', descriptionAr: 'الحدث جاري', sortOrder: 2 });
    await upsertLookup({ lookupTypeId: eventStatusType.id, code: 'completed', nameEn: 'Completed', nameAr: 'مكتمل', descriptionEn: 'Event completed', descriptionAr: 'الحدث مكتمل', sortOrder: 3 });
    await upsertLookup({ lookupTypeId: eventStatusType.id, code: 'cancelled', nameEn: 'Cancelled', nameAr: 'ملغي', descriptionEn: 'Event cancelled', descriptionAr: 'الحدث ملغي', sortOrder: 4 });

    // 17. Event Attendance Status
    await upsertLookup({ lookupTypeId: eventAttendanceStatusType.id, code: 'going', nameEn: 'Going', nameAr: 'سأحضر', descriptionEn: 'Attending event', descriptionAr: 'سأحضر الحدث', sortOrder: 1 });
    await upsertLookup({ lookupTypeId: eventAttendanceStatusType.id, code: 'interested', nameEn: 'Interested', nameAr: 'مهتم', descriptionEn: 'Interested in event', descriptionAr: 'مهتم بالحدث', sortOrder: 2 });
    await upsertLookup({ lookupTypeId: eventAttendanceStatusType.id, code: 'maybe', nameEn: 'Maybe', nameAr: 'ربما', descriptionEn: 'Maybe attending', descriptionAr: 'ربما سأحضر', sortOrder: 3 });
    await upsertLookup({ lookupTypeId: eventAttendanceStatusType.id, code: 'not_going', nameEn: 'Not Going', nameAr: 'لن أحضر', descriptionEn: 'Not attending', descriptionAr: 'لن أحضر', sortOrder: 4 });

    // 18. Job Type
    await upsertLookup({ lookupTypeId: jobTypeType.id, code: 'full_time', nameEn: 'Full Time', nameAr: 'دوام كامل', descriptionEn: 'Full-time position', descriptionAr: 'وظيفة دوام كامل', sortOrder: 1 });
    await upsertLookup({ lookupTypeId: jobTypeType.id, code: 'part_time', nameEn: 'Part Time', nameAr: 'دوام جزئي', descriptionEn: 'Part-time position', descriptionAr: 'وظيفة دوام جزئي', sortOrder: 2 });
    await upsertLookup({ lookupTypeId: jobTypeType.id, code: 'contract', nameEn: 'Contract', nameAr: 'عقد', descriptionEn: 'Contract position', descriptionAr: 'وظيفة عقد', sortOrder: 3 });
    await upsertLookup({ lookupTypeId: jobTypeType.id, code: 'internship', nameEn: 'Internship', nameAr: 'تدريب', descriptionEn: 'Internship position', descriptionAr: 'تدريب', sortOrder: 4 });

    // 19. Experience Level
    await upsertLookup({ lookupTypeId: experienceLevelType.id, code: 'entry', nameEn: 'Entry Level', nameAr: 'مبتدئ', descriptionEn: 'Entry level position', descriptionAr: 'وظيفة مبتدئ', sortOrder: 1 });
    await upsertLookup({ lookupTypeId: experienceLevelType.id, code: 'mid', nameEn: 'Mid Level', nameAr: 'متوسط', descriptionEn: 'Mid level position', descriptionAr: 'وظيفة متوسطة', sortOrder: 2 });
    await upsertLookup({ lookupTypeId: experienceLevelType.id, code: 'senior', nameEn: 'Senior Level', nameAr: 'كبير', descriptionEn: 'Senior level position', descriptionAr: 'وظيفة كبيرة', sortOrder: 3 });
    await upsertLookup({ lookupTypeId: experienceLevelType.id, code: 'executive', nameEn: 'Executive', nameAr: 'تنفيذي', descriptionEn: 'Executive position', descriptionAr: 'وظيفة تنفيذية', sortOrder: 4 });

    // 20. Job Status
    await upsertLookup({ lookupTypeId: jobStatusType.id, code: 'open', nameEn: 'Open', nameAr: 'مفتوح', descriptionEn: 'Job is open', descriptionAr: 'الوظيفة مفتوحة', sortOrder: 1 });
    await upsertLookup({ lookupTypeId: jobStatusType.id, code: 'closed', nameEn: 'Closed', nameAr: 'مغلق', descriptionEn: 'Job is closed', descriptionAr: 'الوظيفة مغلقة', sortOrder: 2 });
    await upsertLookup({ lookupTypeId: jobStatusType.id, code: 'filled', nameEn: 'Filled', nameAr: 'مملوء', descriptionEn: 'Position filled', descriptionAr: 'الوظيفة مملوءة', sortOrder: 3 });
    await upsertLookup({ lookupTypeId: jobStatusType.id, code: 'on_hold', nameEn: 'On Hold', nameAr: 'معلق', descriptionEn: 'Job on hold', descriptionAr: 'الوظيفة معلقة', sortOrder: 4 });

    // 21. Job Application Status
    await upsertLookup({ lookupTypeId: jobApplicationStatusType.id, code: 'applied', nameEn: 'Applied', nameAr: 'متقدم', descriptionEn: 'Application submitted', descriptionAr: 'تم تقديم الطلب', sortOrder: 1 });
    await upsertLookup({ lookupTypeId: jobApplicationStatusType.id, code: 'under_review', nameEn: 'Under Review', nameAr: 'قيد المراجعة', descriptionEn: 'Under review', descriptionAr: 'قيد المراجعة', sortOrder: 2 });
    await upsertLookup({ lookupTypeId: jobApplicationStatusType.id, code: 'shortlisted', nameEn: 'Shortlisted', nameAr: 'مرشح', descriptionEn: 'Shortlisted for interview', descriptionAr: 'مرشح للمقابلة', sortOrder: 3 });
    await upsertLookup({ lookupTypeId: jobApplicationStatusType.id, code: 'interview_scheduled', nameEn: 'Interview Scheduled', nameAr: 'موعد مقابلة', descriptionEn: 'Interview scheduled', descriptionAr: 'موعد مقابلة محدد', sortOrder: 4 });
    await upsertLookup({ lookupTypeId: jobApplicationStatusType.id, code: 'rejected', nameEn: 'Rejected', nameAr: 'مرفوض', descriptionEn: 'Application rejected', descriptionAr: 'الطلب مرفوض', sortOrder: 5 });
    await upsertLookup({ lookupTypeId: jobApplicationStatusType.id, code: 'accepted', nameEn: 'Accepted', nameAr: 'مقبول', descriptionEn: 'Application accepted', descriptionAr: 'الطلب مقبول', sortOrder: 6 });
    await upsertLookup({ lookupTypeId: jobApplicationStatusType.id, code: 'withdrawn', nameEn: 'Withdrawn', nameAr: 'منسحب', descriptionEn: 'Application withdrawn', descriptionAr: 'الطلب منسحب', sortOrder: 7 });

    // 22. Ticket Category
    await upsertLookup({ lookupTypeId: ticketCategoryType.id, code: 'technical', nameEn: 'Technical', nameAr: 'تقني', descriptionEn: 'Technical support', descriptionAr: 'دعم فني', sortOrder: 1 });
    await upsertLookup({ lookupTypeId: ticketCategoryType.id, code: 'billing', nameEn: 'Billing', nameAr: 'فوترة', descriptionEn: 'Billing inquiry', descriptionAr: 'استفسار فوترة', sortOrder: 2 });
    await upsertLookup({ lookupTypeId: ticketCategoryType.id, code: 'general', nameEn: 'General', nameAr: 'عام', descriptionEn: 'General inquiry', descriptionAr: 'استفسار عام', sortOrder: 3 });
    await upsertLookup({ lookupTypeId: ticketCategoryType.id, code: 'content', nameEn: 'Content', nameAr: 'محتوى', descriptionEn: 'Content issue', descriptionAr: 'مشكلة محتوى', sortOrder: 4 });
    await upsertLookup({ lookupTypeId: ticketCategoryType.id, code: 'job_related', nameEn: 'Job Related', nameAr: 'متعلق بالوظائف', descriptionEn: 'Job related inquiry', descriptionAr: 'استفسار متعلق بالوظائف', sortOrder: 5 });

    // 23. Ticket Status
    await upsertLookup({ lookupTypeId: ticketStatusType.id, code: 'open', nameEn: 'Open', nameAr: 'مفتوح', descriptionEn: 'Ticket is open', descriptionAr: 'التذكرة مفتوحة', sortOrder: 1 });
    await upsertLookup({ lookupTypeId: ticketStatusType.id, code: 'in_progress', nameEn: 'In Progress', nameAr: 'قيد التقدم', descriptionEn: 'Ticket in progress', descriptionAr: 'التذكرة قيد التقدم', sortOrder: 2 });
    await upsertLookup({ lookupTypeId: ticketStatusType.id, code: 'waiting', nameEn: 'Waiting', nameAr: 'انتظار', descriptionEn: 'Waiting for response', descriptionAr: 'في انتظار الرد', sortOrder: 3 });
    await upsertLookup({ lookupTypeId: ticketStatusType.id, code: 'resolved', nameEn: 'Resolved', nameAr: 'محلول', descriptionEn: 'Ticket resolved', descriptionAr: 'التذكرة محلولة', sortOrder: 4 });
    await upsertLookup({ lookupTypeId: ticketStatusType.id, code: 'closed', nameEn: 'Closed', nameAr: 'مغلق', descriptionEn: 'Ticket closed', descriptionAr: 'التذكرة مغلقة', sortOrder: 5 });

    // 24. Ticket Priority
    await upsertLookup({ lookupTypeId: ticketPriorityType.id, code: 'low', nameEn: 'Low', nameAr: 'منخفض', descriptionEn: 'Low priority', descriptionAr: 'أولوية منخفضة', sortOrder: 1 });
    await upsertLookup({ lookupTypeId: ticketPriorityType.id, code: 'medium', nameEn: 'Medium', nameAr: 'متوسط', descriptionEn: 'Medium priority', descriptionAr: 'أولوية متوسطة', sortOrder: 2 });
    await upsertLookup({ lookupTypeId: ticketPriorityType.id, code: 'high', nameEn: 'High', nameAr: 'عالي', descriptionEn: 'High priority', descriptionAr: 'أولوية عالية', sortOrder: 3 });
    await upsertLookup({ lookupTypeId: ticketPriorityType.id, code: 'urgent', nameEn: 'Urgent', nameAr: 'عاجل', descriptionEn: 'Urgent priority', descriptionAr: 'أولوية عاجلة', sortOrder: 4 });

    // 25. Report Type
    await upsertLookup({ lookupTypeId: reportTypeType.id, code: 'spam', nameEn: 'Spam', nameAr: 'بريد مزعج', descriptionEn: 'Spam content', descriptionAr: 'محتوى مزعج', sortOrder: 1 });
    await upsertLookup({ lookupTypeId: reportTypeType.id, code: 'harassment', nameEn: 'Harassment', nameAr: 'تحرش', descriptionEn: 'Harassment', descriptionAr: 'تحرش', sortOrder: 2 });
    await upsertLookup({ lookupTypeId: reportTypeType.id, code: 'inappropriate', nameEn: 'Inappropriate', nameAr: 'غير لائق', descriptionEn: 'Inappropriate content', descriptionAr: 'محتوى غير لائق', sortOrder: 3 });
    await upsertLookup({ lookupTypeId: reportTypeType.id, code: 'copyright', nameEn: 'Copyright', nameAr: 'حقوق نشر', descriptionEn: 'Copyright violation', descriptionAr: 'انتهاك حقوق نشر', sortOrder: 4 });
    await upsertLookup({ lookupTypeId: reportTypeType.id, code: 'fake_job', nameEn: 'Fake Job', nameAr: 'وظيفة مزيفة', descriptionEn: 'Fake job posting', descriptionAr: 'إعلان وظيفة مزيف', sortOrder: 5 });
    await upsertLookup({ lookupTypeId: reportTypeType.id, code: 'other', nameEn: 'Other', nameAr: 'آخر', descriptionEn: 'Other issue', descriptionAr: 'مشكلة أخرى', sortOrder: 6 });

    // 26. Report Status
    await upsertLookup({ lookupTypeId: reportStatusType.id, code: 'pending', nameEn: 'Pending', nameAr: 'قيد الانتظار', descriptionEn: 'Report pending', descriptionAr: 'التقرير قيد الانتظار', sortOrder: 1 });
    await upsertLookup({ lookupTypeId: reportStatusType.id, code: 'under_review', nameEn: 'Under Review', nameAr: 'قيد المراجعة', descriptionEn: 'Under review', descriptionAr: 'قيد المراجعة', sortOrder: 2 });
    await upsertLookup({ lookupTypeId: reportStatusType.id, code: 'resolved', nameEn: 'Resolved', nameAr: 'محلول', descriptionEn: 'Report resolved', descriptionAr: 'التقرير محلول', sortOrder: 3 });
    await upsertLookup({ lookupTypeId: reportStatusType.id, code: 'dismissed', nameEn: 'Dismissed', nameAr: 'مرفوض', descriptionEn: 'Report dismissed', descriptionAr: 'التقرير مرفوض', sortOrder: 4 });

    // 27. Subscription Status
    await upsertLookup({ lookupTypeId: subscriptionStatusType.id, code: 'active', nameEn: 'Active', nameAr: 'نشط', descriptionEn: 'Subscription active', descriptionAr: 'الاشتراك نشط', sortOrder: 1 });
    await upsertLookup({ lookupTypeId: subscriptionStatusType.id, code: 'expired', nameEn: 'Expired', nameAr: 'منتهي', descriptionEn: 'Subscription expired', descriptionAr: 'الاشتراك منتهي', sortOrder: 2 });
    await upsertLookup({ lookupTypeId: subscriptionStatusType.id, code: 'cancelled', nameEn: 'Cancelled', nameAr: 'ملغي', descriptionEn: 'Subscription cancelled', descriptionAr: 'الاشتراك ملغي', sortOrder: 3 });
    await upsertLookup({ lookupTypeId: subscriptionStatusType.id, code: 'suspended', nameEn: 'Suspended', nameAr: 'معلق', descriptionEn: 'Subscription suspended', descriptionAr: 'الاشتراك معلق', sortOrder: 4 });
    await upsertLookup({ lookupTypeId: subscriptionStatusType.id, code: 'trial', nameEn: 'Trial', nameAr: 'تجريبي', descriptionEn: 'Trial period', descriptionAr: 'فترة تجريبية', sortOrder: 5 });

    // 28. Billing Cycle
    await upsertLookup({ lookupTypeId: billingCycleType.id, code: 'monthly', nameEn: 'Monthly', nameAr: 'شهري', descriptionEn: 'Monthly billing', descriptionAr: 'فوترة شهرية', sortOrder: 1 });
    await upsertLookup({ lookupTypeId: billingCycleType.id, code: 'quarterly', nameEn: 'Quarterly', nameAr: 'ربع سنوي', descriptionEn: 'Quarterly billing', descriptionAr: 'فوترة ربع سنوية', sortOrder: 2 });
    await upsertLookup({ lookupTypeId: billingCycleType.id, code: 'annual', nameEn: 'Annual', nameAr: 'سنوي', descriptionEn: 'Annual billing', descriptionAr: 'فوترة سنوية', sortOrder: 3 });

    // 29. Plan Feature
    await upsertLookup({ lookupTypeId: planFeatureType.id, code: 'course_access', nameEn: 'Course Access', nameAr: 'الوصول للدورات', descriptionEn: 'Access to courses', descriptionAr: 'الوصول إلى الدورات', sortOrder: 1 });
    await upsertLookup({ lookupTypeId: planFeatureType.id, code: 'chat_access', nameEn: 'Chat Access', nameAr: 'الوصول للدردشة', descriptionEn: 'Access to chat', descriptionAr: 'الوصول إلى الدردشة', sortOrder: 2 });
    await upsertLookup({ lookupTypeId: planFeatureType.id, code: 'downloads', nameEn: 'Downloads', nameAr: 'التحميلات', descriptionEn: 'Download resources', descriptionAr: 'تحميل الموارد', sortOrder: 3 });
    await upsertLookup({ lookupTypeId: planFeatureType.id, code: 'certificates', nameEn: 'Certificates', nameAr: 'الشهادات', descriptionEn: 'Course certificates', descriptionAr: 'شهادات الدورة', sortOrder: 4 });
    await upsertLookup({ lookupTypeId: planFeatureType.id, code: 'priority_support', nameEn: 'Priority Support', nameAr: 'دعم أولوية', descriptionEn: 'Priority support', descriptionAr: 'دعم الأولوية', sortOrder: 5 });
    await upsertLookup({ lookupTypeId: planFeatureType.id, code: 'job_postings', nameEn: 'Job Postings', nameAr: 'إعلانات الوظائف', descriptionEn: 'Post job listings', descriptionAr: 'نشر إعلانات الوظائف', sortOrder: 6 });

    // 30. Quiz Question Type
    await upsertLookup({ lookupTypeId: quizQuestionTypeType.id, code: 'multiple_choice', nameEn: 'Multiple Choice', nameAr: 'اختيار متعدد', descriptionEn: 'Multiple choice question', descriptionAr: 'سؤال اختيار متعدد', sortOrder: 1 });
    await upsertLookup({ lookupTypeId: quizQuestionTypeType.id, code: 'true_false', nameEn: 'True/False', nameAr: 'صح/خطأ', descriptionEn: 'True/False question', descriptionAr: 'سؤال صح/خطأ', sortOrder: 2 });
    await upsertLookup({ lookupTypeId: quizQuestionTypeType.id, code: 'short_answer', nameEn: 'Short Answer', nameAr: 'إجابة قصيرة', descriptionEn: 'Short answer question', descriptionAr: 'سؤال إجابة قصيرة', sortOrder: 3 });
    await upsertLookup({ lookupTypeId: quizQuestionTypeType.id, code: 'essay', nameEn: 'Essay', nameAr: 'مقال', descriptionEn: 'Essay question', descriptionAr: 'سؤال مقال', sortOrder: 4 });

    // 31. Assignment Status
    await upsertLookup({ lookupTypeId: assignmentStatusType.id, code: 'not_submitted', nameEn: 'Not Submitted', nameAr: 'لم يتم التقديم', descriptionEn: 'Not submitted', descriptionAr: 'لم يتم التقديم', sortOrder: 1 });
    await upsertLookup({ lookupTypeId: assignmentStatusType.id, code: 'submitted', nameEn: 'Submitted', nameAr: 'تم التقديم', descriptionEn: 'Submitted', descriptionAr: 'تم التقديم', sortOrder: 2 });
    await upsertLookup({ lookupTypeId: assignmentStatusType.id, code: 'graded', nameEn: 'Graded', nameAr: 'تم التقييم', descriptionEn: 'Graded', descriptionAr: 'تم التقييم', sortOrder: 3 });

    // 32. Content Type
    await upsertLookup({ lookupTypeId: contentTypeType.id, code: 'video', nameEn: 'Video', nameAr: 'فيديو', descriptionEn: 'Video content', descriptionAr: 'محتوى فيديو', sortOrder: 1 });
    await upsertLookup({ lookupTypeId: contentTypeType.id, code: 'document', nameEn: 'Document', nameAr: 'مستند', descriptionEn: 'Document content', descriptionAr: 'محتوى مستند', sortOrder: 2 });
    await upsertLookup({ lookupTypeId: contentTypeType.id, code: 'quiz', nameEn: 'Quiz', nameAr: 'اختبار', descriptionEn: 'Quiz', descriptionAr: 'اختبار', sortOrder: 3 });
    await upsertLookup({ lookupTypeId: contentTypeType.id, code: 'assignment', nameEn: 'Assignment', nameAr: 'واجب', descriptionEn: 'Assignment', descriptionAr: 'واجب', sortOrder: 4 });
    await upsertLookup({ lookupTypeId: contentTypeType.id, code: 'text', nameEn: 'Text', nameAr: 'نص', descriptionEn: 'Text content', descriptionAr: 'محتوى نصي', sortOrder: 5 });

    // 33. Resource Type
    await upsertLookup({ lookupTypeId: resourceTypeType.id, code: 'pdf', nameEn: 'PDF', nameAr: 'PDF', descriptionEn: 'PDF file', descriptionAr: 'ملف PDF', sortOrder: 1 });
    await upsertLookup({ lookupTypeId: resourceTypeType.id, code: 'video', nameEn: 'Video', nameAr: 'فيديو', descriptionEn: 'Video file', descriptionAr: 'ملف فيديو', sortOrder: 2 });
    await upsertLookup({ lookupTypeId: resourceTypeType.id, code: 'document', nameEn: 'Document', nameAr: 'مستند', descriptionEn: 'Document file', descriptionAr: 'ملف مستند', sortOrder: 3 });
    await upsertLookup({ lookupTypeId: resourceTypeType.id, code: 'link', nameEn: 'Link', nameAr: 'رابط', descriptionEn: 'External link', descriptionAr: 'رابط خارجي', sortOrder: 4 });
    await upsertLookup({ lookupTypeId: resourceTypeType.id, code: 'file', nameEn: 'File', nameAr: 'ملف', descriptionEn: 'Generic file', descriptionAr: 'ملف عام', sortOrder: 5 });
    await upsertLookup({ lookupTypeId: resourceTypeType.id, code: 'archive', nameEn: 'Archive', nameAr: 'أرشيف', descriptionEn: 'Archive file', descriptionAr: 'ملف أرشيف', sortOrder: 6 });

    // 34. Chat Type
    await upsertLookup({ lookupTypeId: chatTypeType.id, code: 'public', nameEn: 'Public', nameAr: 'عام', descriptionEn: 'Public chat', descriptionAr: 'دردشة عامة', sortOrder: 1 });
    await upsertLookup({ lookupTypeId: chatTypeType.id, code: 'private', nameEn: 'Private', nameAr: 'خاص', descriptionEn: 'Private chat', descriptionAr: 'دردشة خاصة', sortOrder: 2 });
    await upsertLookup({ lookupTypeId: chatTypeType.id, code: 'group', nameEn: 'Group', nameAr: 'مجموعة', descriptionEn: 'Group chat', descriptionAr: 'دردشة جماعية', sortOrder: 3 });

    // 35. Message Type
    await upsertLookup({ lookupTypeId: messageTypeType.id, code: 'text', nameEn: 'Text', nameAr: 'نص', descriptionEn: 'Text message', descriptionAr: 'رسالة نصية', sortOrder: 1 });
    await upsertLookup({ lookupTypeId: messageTypeType.id, code: 'image', nameEn: 'Image', nameAr: 'صورة', descriptionEn: 'Image message', descriptionAr: 'رسالة صورة', sortOrder: 2 });
    await upsertLookup({ lookupTypeId: messageTypeType.id, code: 'file', nameEn: 'File', nameAr: 'ملف', descriptionEn: 'File message', descriptionAr: 'رسالة ملف', sortOrder: 3 });
    await upsertLookup({ lookupTypeId: messageTypeType.id, code: 'voice', nameEn: 'Voice', nameAr: 'صوت', descriptionEn: 'Voice message', descriptionAr: 'رسالة صوتية', sortOrder: 4 });

    // 36. Message Status
    await upsertLookup({ lookupTypeId: messageStatusType.id, code: 'sent', nameEn: 'Sent', nameAr: 'مرسل', descriptionEn: 'Message sent', descriptionAr: 'الرسالة مرسلة', sortOrder: 1 });
    await upsertLookup({ lookupTypeId: messageStatusType.id, code: 'delivered', nameEn: 'Delivered', nameAr: 'تم التسليم', descriptionEn: 'Message delivered', descriptionAr: 'الرسالة تم تسليمها', sortOrder: 2 });
    await upsertLookup({ lookupTypeId: messageStatusType.id, code: 'read', nameEn: 'Read', nameAr: 'مقروء', descriptionEn: 'Message read', descriptionAr: 'الرسالة مقروءة', sortOrder: 3 });

    // 37. Language
    await upsertLookup({ lookupTypeId: languageType.id, code: 'en', nameEn: 'English', nameAr: 'الإنجليزية', descriptionEn: 'English language', descriptionAr: 'اللغة الإنجليزية', sortOrder: 1 });
    await upsertLookup({ lookupTypeId: languageType.id, code: 'ar', nameEn: 'Arabic', nameAr: 'العربية', descriptionEn: 'Arabic language', descriptionAr: 'اللغة العربية', sortOrder: 2 });

    // 38. Timezone
    await upsertLookup({ lookupTypeId: timezoneType.id, code: 'UTC', nameEn: 'UTC', nameAr: 'UTC', descriptionEn: 'Coordinated Universal Time', descriptionAr: 'التوقيت العالمي المنسق', sortOrder: 1 });
    await upsertLookup({ lookupTypeId: timezoneType.id, code: 'Africa/Cairo', nameEn: 'Cairo', nameAr: 'القاهرة', descriptionEn: 'Cairo timezone', descriptionAr: 'توقيت القاهرة', sortOrder: 2 });
    await upsertLookup({ lookupTypeId: timezoneType.id, code: 'Asia/Dubai', nameEn: 'Dubai', nameAr: 'دبي', descriptionEn: 'Dubai timezone', descriptionAr: 'توقيت دبي', sortOrder: 3 });
    await upsertLookup({ lookupTypeId: timezoneType.id, code: 'Asia/Riyadh', nameEn: 'Riyadh', nameAr: 'الرياض', descriptionEn: 'Riyadh timezone', descriptionAr: 'توقيت الرياض', sortOrder: 4 });

    // 39. Media Provider
    await upsertLookup({ lookupTypeId: mediaProviderType.id, code: 'local', nameEn: 'Local', nameAr: 'محلي', descriptionEn: 'Local storage', descriptionAr: 'تخزين محلي', sortOrder: 1 });
    await upsertLookup({ lookupTypeId: mediaProviderType.id, code: 'minio', nameEn: 'MinIO', nameAr: 'MinIO', descriptionEn: 'MinIO storage', descriptionAr: 'تخزين MinIO', sortOrder: 2 });
    await upsertLookup({ lookupTypeId: mediaProviderType.id, code: 'r2', nameEn: 'Cloudflare R2', nameAr: 'Cloudflare R2', descriptionEn: 'Cloudflare R2 storage', descriptionAr: 'تخزين Cloudflare R2', sortOrder: 3 });
    await upsertLookup({ lookupTypeId: mediaProviderType.id, code: 's3', nameEn: 'AWS S3', nameAr: 'AWS S3', descriptionEn: 'AWS S3 storage', descriptionAr: 'تخزين AWS S3', sortOrder: 4 });

    // 40. Visibility Type
    await upsertLookup({ lookupTypeId: visibilityTypeType.id, code: 'public', nameEn: 'Public', nameAr: 'عام', descriptionEn: 'Visible to everyone', descriptionAr: 'مرئي للجميع', sortOrder: 1 });
    await upsertLookup({ lookupTypeId: visibilityTypeType.id, code: 'private', nameEn: 'Private', nameAr: 'خاص', descriptionEn: 'Visible to owner', descriptionAr: 'مرئي للمالك', sortOrder: 2 });
    await upsertLookup({ lookupTypeId: visibilityTypeType.id, code: 'friends_only', nameEn: 'Friends Only', nameAr: 'الأصدقاء فقط', descriptionEn: 'Visible to friends', descriptionAr: 'مرئي للأصدقاء', sortOrder: 3 });
    await upsertLookup({ lookupTypeId: visibilityTypeType.id, code: 'custom', nameEn: 'Custom', nameAr: 'مخصص', descriptionEn: 'Custom visibility', descriptionAr: 'رؤية مخصصة', sortOrder: 4 });

    // 41. Payment Status
    await upsertLookup({ lookupTypeId: paymentStatusType.id, code: 'pending', nameEn: 'Pending', nameAr: 'قيد الانتظار', descriptionEn: 'Payment pending', descriptionAr: 'الدفع قيد الانتظار', sortOrder: 1 });
    await upsertLookup({ lookupTypeId: paymentStatusType.id, code: 'completed', nameEn: 'Completed', nameAr: 'مكتمل', descriptionEn: 'Payment completed', descriptionAr: 'الدفع مكتمل', sortOrder: 2 });
    await upsertLookup({ lookupTypeId: paymentStatusType.id, code: 'failed', nameEn: 'Failed', nameAr: 'فشل', descriptionEn: 'Payment failed', descriptionAr: 'الدفع فشل', sortOrder: 3 });
    await upsertLookup({ lookupTypeId: paymentStatusType.id, code: 'refunded', nameEn: 'Refunded', nameAr: 'مسترد', descriptionEn: 'Payment refunded', descriptionAr: 'الدفع مسترد', sortOrder: 4 });

    // 42. Payment Method
    await upsertLookup({ lookupTypeId: paymentMethodType.id, code: 'paypal', nameEn: 'PayPal', nameAr: 'باي بال', descriptionEn: 'Pay with PayPal', descriptionAr: 'الدفع عبر باي بال', sortOrder: 1 });
    await upsertLookup({ lookupTypeId: paymentMethodType.id, code: 'stripe', nameEn: 'Stripe', nameAr: 'سترايب', descriptionEn: 'Pay with Stripe', descriptionAr: 'الدفع عبر سترايب', sortOrder: 2 });
    await upsertLookup({ lookupTypeId: paymentMethodType.id, code: 'bank_transfer', nameEn: 'Bank Transfer', nameAr: 'تحويل بنكي', descriptionEn: 'Bank transfer', descriptionAr: 'تحويل بنكي', sortOrder: 3 });

    // 43. Notification Types - LMS (12 types)
    await upsertLookup({ lookupTypeId: notificationTypeType.id, code: 'course_enrollment', nameEn: 'Course Enrollment', nameAr: 'تسجيل في دورة', descriptionEn: 'User enrolled in course', descriptionAr: 'تم تسجيل المستخدم في دورة', sortOrder: 1 });
    await upsertLookup({ lookupTypeId: notificationTypeType.id, code: 'course_enrollment_approved', nameEn: 'Enrollment Approved', nameAr: 'الموافقة على التسجيل', descriptionEn: 'Enrollment approved by instructor', descriptionAr: 'تمت الموافقة على التسجيل من قبل المدرس', sortOrder: 2 });
    await upsertLookup({ lookupTypeId: notificationTypeType.id, code: 'course_completion', nameEn: 'Course Completion', nameAr: 'إكمال الدورة', descriptionEn: 'Course completed with certificate', descriptionAr: 'تم إكمال الدورة مع الشهادة', sortOrder: 3 });
    await upsertLookup({ lookupTypeId: notificationTypeType.id, code: 'lesson_unlocked', nameEn: 'Lesson Unlocked', nameAr: 'درس مفتوح', descriptionEn: 'New lesson available', descriptionAr: 'درس جديد متاح', sortOrder: 4 });
    await upsertLookup({ lookupTypeId: notificationTypeType.id, code: 'assignment_assigned', nameEn: 'Assignment Assigned', nameAr: 'واجب معين', descriptionEn: 'New assignment available', descriptionAr: 'واجب جديد متاح', sortOrder: 5 });
    await upsertLookup({ lookupTypeId: notificationTypeType.id, code: 'assignment_submitted', nameEn: 'Assignment Submitted', nameAr: 'تم تقديم الواجب', descriptionEn: 'Assignment submitted successfully', descriptionAr: 'تم تقديم الواجب بنجاح', sortOrder: 6 });
    await upsertLookup({ lookupTypeId: notificationTypeType.id, code: 'assignment_graded', nameEn: 'Assignment Graded', nameAr: 'تم تقييم الواجب', descriptionEn: 'Assignment graded by instructor', descriptionAr: 'تم تقييم الواجب من قبل المدرس', sortOrder: 7 });
    await upsertLookup({ lookupTypeId: notificationTypeType.id, code: 'assignment_due_soon', nameEn: 'Assignment Due Soon', nameAr: 'موعد الواجب قريب', descriptionEn: 'Assignment due in 24 hours', descriptionAr: 'موعد تسليم الواجب خلال 24 ساعة', sortOrder: 8 });
    await upsertLookup({ lookupTypeId: notificationTypeType.id, code: 'quiz_graded', nameEn: 'Quiz Graded', nameAr: 'تم تقييم الاختبار', descriptionEn: 'Quiz results available', descriptionAr: 'نتائج الاختبار متاحة', sortOrder: 9 });
    await upsertLookup({ lookupTypeId: notificationTypeType.id, code: 'certificate_issued', nameEn: 'Certificate Issued', nameAr: 'شهادة صادرة', descriptionEn: 'Certificate earned', descriptionAr: 'تم الحصول على الشهادة', sortOrder: 10 });
    await upsertLookup({ lookupTypeId: notificationTypeType.id, code: 'instructor_message', nameEn: 'Instructor Message', nameAr: 'رسالة من المدرس', descriptionEn: 'Message from instructor', descriptionAr: 'رسالة من المدرس', sortOrder: 11 });
    await upsertLookup({ lookupTypeId: notificationTypeType.id, code: 'course_updated', nameEn: 'Course Updated', nameAr: 'تحديث الدورة', descriptionEn: 'Course content updated', descriptionAr: 'تم تحديث محتوى الدورة', sortOrder: 12 });

    // 44. Notification Types - Job (8 types)
    await upsertLookup({ lookupTypeId: notificationTypeType.id, code: 'job_posted', nameEn: 'Job Posted', nameAr: 'وظيفة منشورة', descriptionEn: 'New job matching criteria posted', descriptionAr: 'تم نشر وظيفة جديدة مطابقة', sortOrder: 13 });
    await upsertLookup({ lookupTypeId: notificationTypeType.id, code: 'job_application_received', nameEn: 'Application Received', nameAr: 'تم استلام الطلب', descriptionEn: 'Application received by recruiter', descriptionAr: 'تم استلام الطلب من قبل المجند', sortOrder: 14 });
    await upsertLookup({ lookupTypeId: notificationTypeType.id, code: 'job_application_reviewed', nameEn: 'Application Reviewed', nameAr: 'تمت مراجعة الطلب', descriptionEn: 'Application under review', descriptionAr: 'الطلب قيد المراجعة', sortOrder: 15 });
    await upsertLookup({ lookupTypeId: notificationTypeType.id, code: 'job_application_shortlisted', nameEn: 'Application Shortlisted', nameAr: 'تم ترشيح الطلب', descriptionEn: 'Shortlisted for interview', descriptionAr: 'تم الترشيح للمقابلة', sortOrder: 16 });
    await upsertLookup({ lookupTypeId: notificationTypeType.id, code: 'job_interview_scheduled', nameEn: 'Interview Scheduled', nameAr: 'موعد المقابلة محدد', descriptionEn: 'Interview scheduled', descriptionAr: 'تم تحديد موعد المقابلة', sortOrder: 17 });
    await upsertLookup({ lookupTypeId: notificationTypeType.id, code: 'job_application_accepted', nameEn: 'Application Accepted', nameAr: 'تم قبول الطلب', descriptionEn: 'Application accepted', descriptionAr: 'تم قبول الطلب', sortOrder: 18 });
    await upsertLookup({ lookupTypeId: notificationTypeType.id, code: 'job_application_rejected', nameEn: 'Application Rejected', nameAr: 'تم رفض الطلب', descriptionEn: 'Application rejected', descriptionAr: 'تم رفض الطلب', sortOrder: 19 });
    await upsertLookup({ lookupTypeId: notificationTypeType.id, code: 'job_expired', nameEn: 'Job Expired', nameAr: 'انتهت صلاحية الوظيفة', descriptionEn: 'Job posting expired', descriptionAr: 'انتهت صلاحية إعلان الوظيفة', sortOrder: 20 });

    // 45. Notification Types - Social (10 types)
    await upsertLookup({ lookupTypeId: notificationTypeType.id, code: 'friend_request_received', nameEn: 'Friend Request Received', nameAr: 'طلب صداقة مستلم', descriptionEn: 'Friend request received', descriptionAr: 'تم استلام طلب صداقة', sortOrder: 21 });
    await upsertLookup({ lookupTypeId: notificationTypeType.id, code: 'friend_request_accepted', nameEn: 'Friend Request Accepted', nameAr: 'تم قبول طلب الصداقة', descriptionEn: 'Friend request accepted', descriptionAr: 'تم قبول طلب الصداقة', sortOrder: 22 });
    await upsertLookup({ lookupTypeId: notificationTypeType.id, code: 'group_invitation', nameEn: 'Group Invitation', nameAr: 'دعوة لمجموعة', descriptionEn: 'Invited to group', descriptionAr: 'تمت دعوتك لمجموعة', sortOrder: 23 });
    await upsertLookup({ lookupTypeId: notificationTypeType.id, code: 'group_joined', nameEn: 'Group Joined', nameAr: 'انضمام لمجموعة', descriptionEn: 'User joined your group', descriptionAr: 'انضم مستخدم لمجموعتك', sortOrder: 24 });
    await upsertLookup({ lookupTypeId: notificationTypeType.id, code: 'post_commented', nameEn: 'Post Commented', nameAr: 'تعليق على المنشور', descriptionEn: 'Comment on your post', descriptionAr: 'تعليق على منشورك', sortOrder: 25 });
    await upsertLookup({ lookupTypeId: notificationTypeType.id, code: 'post_reaction', nameEn: 'Post Reaction', nameAr: 'تفاعل على المنشور', descriptionEn: 'Reaction to your post', descriptionAr: 'تفاعل على منشورك', sortOrder: 26 });
    await upsertLookup({ lookupTypeId: notificationTypeType.id, code: 'comment_reply', nameEn: 'Comment Reply', nameAr: 'رد على التعليق', descriptionEn: 'Reply to your comment', descriptionAr: 'رد على تعليقك', sortOrder: 27 });
    await upsertLookup({ lookupTypeId: notificationTypeType.id, code: 'mention_in_post', nameEn: 'Mentioned in Post', nameAr: 'إشارة في منشور', descriptionEn: 'Mentioned in post', descriptionAr: 'تمت الإشارة إليك في منشور', sortOrder: 28 });
    await upsertLookup({ lookupTypeId: notificationTypeType.id, code: 'event_invitation', nameEn: 'Event Invitation', nameAr: 'دعوة لحدث', descriptionEn: 'Event invitation', descriptionAr: 'دعوة لحدث', sortOrder: 29 });
    await upsertLookup({ lookupTypeId: notificationTypeType.id, code: 'event_reminder', nameEn: 'Event Reminder', nameAr: 'تذكير بحدث', descriptionEn: 'Event starts in 1 hour', descriptionAr: 'الحدث يبدأ خلال ساعة', sortOrder: 30 });

    // 46. Notification Types - Ticket (6 types)
    await upsertLookup({ lookupTypeId: notificationTypeType.id, code: 'ticket_created', nameEn: 'Ticket Created', nameAr: 'تم إنشاء تذكرة', descriptionEn: 'Support ticket created', descriptionAr: 'تم إنشاء تذكرة دعم', sortOrder: 31 });
    await upsertLookup({ lookupTypeId: notificationTypeType.id, code: 'ticket_assigned', nameEn: 'Ticket Assigned', nameAr: 'تم تعيين التذكرة', descriptionEn: 'Ticket assigned to agent', descriptionAr: 'تم تعيين التذكرة لوكيل', sortOrder: 32 });
    await upsertLookup({ lookupTypeId: notificationTypeType.id, code: 'ticket_reply', nameEn: 'Ticket Reply', nameAr: 'رد على التذكرة', descriptionEn: 'New reply to ticket', descriptionAr: 'رد جديد على التذكرة', sortOrder: 33 });
    await upsertLookup({ lookupTypeId: notificationTypeType.id, code: 'ticket_status_changed', nameEn: 'Ticket Status Changed', nameAr: 'تغيير حالة التذكرة', descriptionEn: 'Ticket status updated', descriptionAr: 'تم تحديث حالة التذكرة', sortOrder: 34 });
    await upsertLookup({ lookupTypeId: notificationTypeType.id, code: 'ticket_resolved', nameEn: 'Ticket Resolved', nameAr: 'تم حل التذكرة', descriptionEn: 'Ticket marked as resolved', descriptionAr: 'تم تحديد التذكرة كمحلولة', sortOrder: 35 });
    await upsertLookup({ lookupTypeId: notificationTypeType.id, code: 'ticket_reopened', nameEn: 'Ticket Reopened', nameAr: 'إعادة فتح التذكرة', descriptionEn: 'Ticket reopened', descriptionAr: 'تم إعادة فتح التذكرة', sortOrder: 36 });

    // 47. Notification Types - Payment (6 types)
    await upsertLookup({ lookupTypeId: notificationTypeType.id, code: 'payment_successful', nameEn: 'Payment Successful', nameAr: 'دفع ناجح', descriptionEn: 'Payment processed successfully', descriptionAr: 'تمت معالجة الدفع بنجاح', sortOrder: 37 });
    await upsertLookup({ lookupTypeId: notificationTypeType.id, code: 'payment_failed', nameEn: 'Payment Failed', nameAr: 'فشل الدفع', descriptionEn: 'Payment failed', descriptionAr: 'فشل الدفع', sortOrder: 38 });
    await upsertLookup({ lookupTypeId: notificationTypeType.id, code: 'refund_processed', nameEn: 'Refund Processed', nameAr: 'تمت معالجة الاسترداد', descriptionEn: 'Refund issued', descriptionAr: 'تم إصدار الاسترداد', sortOrder: 39 });
    await upsertLookup({ lookupTypeId: notificationTypeType.id, code: 'subscription_renewed', nameEn: 'Subscription Renewed', nameAr: 'تجديد الاشتراك', descriptionEn: 'Subscription renewed', descriptionAr: 'تم تجديد الاشتراك', sortOrder: 40 });
    await upsertLookup({ lookupTypeId: notificationTypeType.id, code: 'subscription_expiring', nameEn: 'Subscription Expiring', nameAr: 'اشتراك ينتهي', descriptionEn: 'Subscription expires in 7 days', descriptionAr: 'ينتهي الاشتراك خلال 7 أيام', sortOrder: 41 });
    await upsertLookup({ lookupTypeId: notificationTypeType.id, code: 'subscription_cancelled', nameEn: 'Subscription Cancelled', nameAr: 'تم إلغاء الاشتراك', descriptionEn: 'Subscription cancelled', descriptionAr: 'تم إلغاء الاشتراك', sortOrder: 42 });

    // 48. Notification Types - System (8 types)
    await upsertLookup({ lookupTypeId: notificationTypeType.id, code: 'account_verified', nameEn: 'Account Verified', nameAr: 'حساب موثق', descriptionEn: 'Email verified', descriptionAr: 'تم التحقق من البريد الإلكتروني', sortOrder: 43 });
    await upsertLookup({ lookupTypeId: notificationTypeType.id, code: 'password_changed', nameEn: 'Password Changed', nameAr: 'تم تغيير كلمة المرور', descriptionEn: 'Password changed successfully', descriptionAr: 'تم تغيير كلمة المرور بنجاح', sortOrder: 44 });
    await upsertLookup({ lookupTypeId: notificationTypeType.id, code: 'security_alert', nameEn: 'Security Alert', nameAr: 'تنبيه أمني', descriptionEn: 'Unusual login detected', descriptionAr: 'تم اكتشاف تسجيل دخول غير عادي', sortOrder: 45 });
    await upsertLookup({ lookupTypeId: notificationTypeType.id, code: 'profile_updated', nameEn: 'Profile Updated', nameAr: 'تم تحديث الملف الشخصي', descriptionEn: 'Profile updated', descriptionAr: 'تم تحديث الملف الشخصي', sortOrder: 46 });
    await upsertLookup({ lookupTypeId: notificationTypeType.id, code: 'maintenance_scheduled', nameEn: 'Maintenance Scheduled', nameAr: 'صيانة مجدولة', descriptionEn: 'System maintenance scheduled', descriptionAr: 'تم جدولة صيانة النظام', sortOrder: 47 });
    await upsertLookup({ lookupTypeId: notificationTypeType.id, code: 'welcome_to_platform', nameEn: 'Welcome', nameAr: 'مرحبا', descriptionEn: 'New user welcome', descriptionAr: 'ترحيب بمستخدم جديد', sortOrder: 48 });
    await upsertLookup({ lookupTypeId: notificationTypeType.id, code: 'inactivity_reminder', nameEn: 'Inactivity Reminder', nameAr: 'تذكير بعدم النشاط', descriptionEn: 'Haven\'t logged in for 30 days', descriptionAr: 'لم تسجل الدخول لمدة 30 يومًا', sortOrder: 49 });
    await upsertLookup({ lookupTypeId: notificationTypeType.id, code: 'account_suspended', nameEn: 'Account Suspended', nameAr: 'حساب معلق', descriptionEn: 'Account suspended', descriptionAr: 'تم تعليق الحساب', sortOrder: 50 });

    console.log('\n✅ Lookups seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding lookups:', error);
    throw error;
  } finally {
    await pool.end();
  }
}
