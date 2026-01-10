CREATE TABLE IF NOT EXISTS "ad_campaigns" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"budget" numeric(10, 2),
	"spent_amount" numeric(10, 2) DEFAULT '0' NOT NULL,
	"status_id" bigserial NOT NULL,
	"start_date" timestamp with time zone NOT NULL,
	"end_date" timestamp with time zone,
	"created_by" bigserial NOT NULL,
	"isDeleted" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now(),
	"deletedAt" timestamp with time zone,
	CONSTRAINT "ad_campaigns_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ad_clicks" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"ad_id" bigserial NOT NULL,
	"impression_id" bigserial NOT NULL,
	"userId" bigserial NOT NULL,
	"session_id" varchar(255),
	"clicked_at" timestamp with time zone DEFAULT now() NOT NULL,
	"referrer" text,
	"destination_url" varchar(500),
	"converted" boolean DEFAULT false NOT NULL,
	"metadata" jsonb,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ad_clicks_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ad_impressions" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"ad_id" bigserial NOT NULL,
	"userId" bigserial NOT NULL,
	"session_id" varchar(255),
	"placement_id" bigserial NOT NULL,
	"ip_address" varchar(45),
	"user_agent" text,
	"viewed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"metadata" jsonb,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ad_impressions_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ad_payments" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"campaign_id" bigserial NOT NULL,
	"userId" bigserial NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"payment_method" varchar(50),
	"transaction_id" varchar(255),
	"payment_status_id" bigserial NOT NULL,
	"paid_at" timestamp with time zone,
	"metadata" jsonb,
	"isDeleted" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now(),
	"deletedAt" timestamp with time zone,
	CONSTRAINT "ad_payments_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ad_placements" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(100) NOT NULL,
	"name_en" varchar(255) NOT NULL,
	"name_ar" varchar(255),
	"description" text,
	"width" integer,
	"height" integer,
	"max_ads" integer DEFAULT 1 NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"isDeleted" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now(),
	"deletedAt" timestamp with time zone,
	CONSTRAINT "ad_placements_uuid_unique" UNIQUE("uuid"),
	CONSTRAINT "ad_placements_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ad_targeting_rules" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"ad_id" bigserial NOT NULL,
	"target_user_roles" jsonb,
	"target_subscription_plans" jsonb,
	"target_age_range" jsonb,
	"target_locations" jsonb,
	"target_interests" jsonb,
	"target_behavior" jsonb,
	"metadata" jsonb,
	"isDeleted" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now(),
	"deletedAt" timestamp with time zone,
	CONSTRAINT "ad_targeting_rules_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ads" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"campaign_id" bigserial NOT NULL,
	"ad_type_id" bigserial NOT NULL,
	"target_type" varchar(50),
	"target_id" bigserial NOT NULL,
	"external_url" varchar(500),
	"title_en" varchar(255) NOT NULL,
	"title_ar" varchar(255),
	"description_en" text,
	"description_ar" text,
	"media_url" varchar(500),
	"call_to_action" varchar(100),
	"placement_type_id" bigserial NOT NULL,
	"status_id" bigserial NOT NULL,
	"priority" integer DEFAULT 0 NOT NULL,
	"start_date" timestamp with time zone NOT NULL,
	"end_date" timestamp with time zone,
	"is_paid" boolean DEFAULT false NOT NULL,
	"payment_status_id" bigserial NOT NULL,
	"impression_count" integer DEFAULT 0 NOT NULL,
	"click_count" integer DEFAULT 0 NOT NULL,
	"ctr" numeric(5, 2) DEFAULT '0' NOT NULL,
	"created_by" bigserial NOT NULL,
	"isDeleted" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now(),
	"deletedAt" timestamp with time zone,
	CONSTRAINT "ads_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "audit_logs" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"userId" bigserial NOT NULL,
	"auditable_type" varchar(50) NOT NULL,
	"auditable_id" bigserial NOT NULL,
	"action" varchar(50) NOT NULL,
	"old_values" jsonb,
	"new_values" jsonb,
	"description" text,
	"ip_address" varchar(45),
	"user_agent" text,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "audit_logs_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "chat_messages" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"chat_room_id" bigserial NOT NULL,
	"userId" bigserial NOT NULL,
	"content" text,
	"attachment_url" varchar(500),
	"message_type_id" bigserial NOT NULL,
	"reply_to_message_id" bigserial NOT NULL,
	"is_edited" boolean DEFAULT false NOT NULL,
	"isDeleted" boolean DEFAULT false NOT NULL,
	"edited_at" timestamp with time zone,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"deletedAt" timestamp with time zone,
	CONSTRAINT "chat_messages_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "chat_participants" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"chat_room_id" bigserial NOT NULL,
	"userId" bigserial NOT NULL,
	"is_admin" boolean DEFAULT false NOT NULL,
	"is_muted" boolean DEFAULT false NOT NULL,
	"joined_at" timestamp with time zone DEFAULT now(),
	"left_at" timestamp with time zone,
	"last_read_at" timestamp with time zone,
	"isDeleted" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"deletedAt" timestamp with time zone,
	CONSTRAINT "chat_participants_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "chat_rooms" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255),
	"chat_type_id" bigserial NOT NULL,
	"roomable_type" varchar(50),
	"roomable_id" bigserial NOT NULL,
	"created_by" bigserial NOT NULL,
	"last_message_at" timestamp with time zone,
	"isDeleted" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now(),
	"deletedAt" timestamp with time zone,
	CONSTRAINT "chat_rooms_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "message_reads" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"message_id" bigserial NOT NULL,
	"userId" bigserial NOT NULL,
	"read_at" timestamp with time zone DEFAULT now(),
	"isDeleted" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"deletedAt" timestamp with time zone,
	CONSTRAINT "message_reads_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cms_pages" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(255) NOT NULL,
	"page_type_id" bigserial NOT NULL,
	"status_id" bigserial NOT NULL,
	"title_en" varchar(255) NOT NULL,
	"title_ar" varchar(255),
	"content_en" text,
	"content_ar" text,
	"metadata" jsonb,
	"settings" jsonb,
	"is_published" boolean DEFAULT false NOT NULL,
	"isDeleted" boolean DEFAULT false NOT NULL,
	"published_at" timestamp with time zone,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now(),
	"deletedAt" timestamp with time zone,
	CONSTRAINT "cms_pages_uuid_unique" UNIQUE("uuid"),
	CONSTRAINT "cms_pages_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "comment_reactions" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"comment_id" bigserial NOT NULL,
	"userId" bigserial NOT NULL,
	"reaction_type_id" bigserial NOT NULL,
	"isDeleted" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"deletedAt" timestamp with time zone,
	CONSTRAINT "comment_reactions_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "comments" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"userId" bigserial NOT NULL,
	"commentable_type" varchar(50) NOT NULL,
	"commentable_id" bigserial NOT NULL,
	"parent_comment_id" bigserial NOT NULL,
	"content" text NOT NULL,
	"likes_count" integer DEFAULT 0,
	"isDeleted" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now(),
	"deletedAt" timestamp with time zone,
	CONSTRAINT "comments_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "event_categories" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"name_en" varchar(255) NOT NULL,
	"name_ar" varchar(255),
	"slug" varchar(255) NOT NULL,
	"description_en" text,
	"description_ar" text,
	"isDeleted" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now(),
	"deletedAt" timestamp with time zone,
	CONSTRAINT "event_categories_uuid_unique" UNIQUE("uuid"),
	CONSTRAINT "event_categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "event_registrations" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"event_id" bigserial NOT NULL,
	"userId" bigserial NOT NULL,
	"status_id" bigserial NOT NULL,
	"attendance_status_id" bigserial NOT NULL,
	"registered_at" timestamp with time zone DEFAULT now(),
	"attended_at" timestamp with time zone,
	"cancelled_at" timestamp with time zone,
	"isDeleted" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now(),
	"deletedAt" timestamp with time zone,
	CONSTRAINT "event_registrations_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "events" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"title_en" varchar(255) NOT NULL,
	"title_ar" varchar(255),
	"slug" varchar(255) NOT NULL,
	"description_en" text,
	"description_ar" text,
	"seo" jsonb,
	"event_type_id" bigserial NOT NULL,
	"status_id" bigserial NOT NULL,
	"category_id" bigserial NOT NULL,
	"start_date" timestamp with time zone NOT NULL,
	"end_date" timestamp with time zone,
	"location" varchar(500),
	"timezone" varchar(100),
	"meeting_url" varchar(500),
	"capacity" integer,
	"created_by" bigserial NOT NULL,
	"banner_url" varchar(500),
	"is_featured" boolean DEFAULT false NOT NULL,
	"isDeleted" boolean DEFAULT false NOT NULL,
	"registration_count" integer DEFAULT 0,
	"favorite_count" integer DEFAULT 0,
	"share_count" integer DEFAULT 0,
	"going_count" integer DEFAULT 0,
	"interested_count" integer DEFAULT 0,
	"maybe_count" integer DEFAULT 0,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now(),
	"deletedAt" timestamp with time zone,
	CONSTRAINT "events_uuid_unique" UNIQUE("uuid"),
	CONSTRAINT "events_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "favorites" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"userId" bigserial NOT NULL,
	"favoritable_type" varchar(50) NOT NULL,
	"favoritable_id" bigserial NOT NULL,
	"isDeleted" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"deletedAt" timestamp with time zone,
	CONSTRAINT "favorites_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "fcm_tokens" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"user_id" bigint NOT NULL,
	"token" text NOT NULL,
	"device_type" varchar(20),
	"device_info" jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_used_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "fcm_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "lookup_types" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"code" varchar(50) NOT NULL,
	"description" text,
	"parent_id" bigserial NOT NULL,
	"metadata" jsonb,
	"sort_order" integer DEFAULT 0,
	"isActive" boolean DEFAULT true NOT NULL,
	"isDeleted" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now(),
	"deletedAt" timestamp with time zone,
	CONSTRAINT "lookup_types_uuid_unique" UNIQUE("uuid"),
	CONSTRAINT "lookup_types_name_unique" UNIQUE("name"),
	CONSTRAINT "lookup_types_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "lookups" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"lookup_type_id" bigserial NOT NULL,
	"parent_id" bigserial NOT NULL,
	"code" varchar(50) NOT NULL,
	"name_en" varchar(255) NOT NULL,
	"name_ar" varchar(255),
	"description_en" text,
	"description_ar" text,
	"timezone" varchar(100),
	"metadata" jsonb,
	"sort_order" integer DEFAULT 0,
	"display_order" integer DEFAULT 0,
	"isActive" boolean DEFAULT true NOT NULL,
	"isDeleted" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now(),
	"deletedAt" timestamp with time zone,
	CONSTRAINT "lookups_uuid_unique" UNIQUE("uuid"),
	CONSTRAINT "lookups_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "role_permissions" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"role_id" bigserial NOT NULL,
	"permission_id" bigserial NOT NULL,
	"is_granted" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_roles" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"user_id" bigserial NOT NULL,
	"role_id" bigserial NOT NULL,
	"assigned_at" timestamp with time zone DEFAULT now() NOT NULL,
	"assigned_by" bigserial NOT NULL,
	"expires_at" timestamp with time zone,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"username" varchar(50) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(255),
	"keycloak_user_id" varchar(255),
	"firstName" varchar(100),
	"lastName" varchar(100),
	"phone" varchar(20),
	"bio" text,
	"avatar_url" varchar(500),
	"resume_url" varchar(500),
	"role_id" bigserial NOT NULL,
	"status_id" bigserial NOT NULL,
	"preferred_language" varchar(5) DEFAULT 'en',
	"timezone" varchar(50),
	"email_verified_at" timestamp with time zone,
	"email_verification_token" varchar(255),
	"password_reset_token" varchar(255),
	"password_reset_expiry" timestamp with time zone,
	"two_factor_secret" varchar(255),
	"two_factor_temp_secret" varchar(255),
	"two_factor_enabled" boolean DEFAULT false NOT NULL,
	"two_factor_backup_codes" text,
	"last_login_at" timestamp with time zone,
	"last_seen_at" timestamp with time zone,
	"isOnline" boolean DEFAULT false NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"isDeleted" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now(),
	"deletedAt" timestamp with time zone,
	CONSTRAINT "users_uuid_unique" UNIQUE("uuid"),
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_keycloak_user_id_unique" UNIQUE("keycloak_user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "payment_history" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"subscription_id" bigserial NOT NULL,
	"userId" bigserial NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'USD',
	"payment_method" varchar(50),
	"transaction_id" varchar(255),
	"invoice_number" varchar(100),
	"invoice_url" varchar(500),
	"status_id" bigserial NOT NULL,
	"payment_date" timestamp with time zone DEFAULT now(),
	"isDeleted" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"deletedAt" timestamp with time zone,
	CONSTRAINT "payment_history_uuid_unique" UNIQUE("uuid"),
	CONSTRAINT "payment_history_invoice_number_unique" UNIQUE("invoice_number")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "plan_features" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"plan_id" bigserial NOT NULL,
	"feature_id" bigserial NOT NULL,
	"feature_value" varchar(255),
	"isDeleted" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"deletedAt" timestamp with time zone,
	CONSTRAINT "plan_features_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "plans" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"name_en" varchar(255) NOT NULL,
	"name_ar" varchar(255),
	"description_en" text,
	"description_ar" text,
	"price_monthly" numeric(10, 2),
	"price_quarterly" numeric(10, 2),
	"price_annual" numeric(10, 2),
	"max_courses" integer,
	"isActive" boolean DEFAULT true NOT NULL,
	"isDeleted" boolean DEFAULT false NOT NULL,
	"display_order" integer DEFAULT 0,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now(),
	"deletedAt" timestamp with time zone,
	CONSTRAINT "plans_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "subscriptions" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"userId" bigserial NOT NULL,
	"plan_id" bigserial NOT NULL,
	"status_id" bigserial NOT NULL,
	"billing_cycle_id" bigserial NOT NULL,
	"amount_paid" numeric(10, 2),
	"start_date" timestamp with time zone NOT NULL,
	"end_date" timestamp with time zone,
	"cancelled_at" timestamp with time zone,
	"auto_renew" boolean DEFAULT true NOT NULL,
	"isDeleted" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now(),
	"deletedAt" timestamp with time zone,
	CONSTRAINT "subscriptions_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "assignment_submissions" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"assignment_id" bigserial NOT NULL,
	"userId" bigserial NOT NULL,
	"submission_text" text,
	"file_url" varchar(500),
	"status_id" bigserial NOT NULL,
	"score" numeric(5, 2),
	"max_points" numeric(5, 2),
	"feedback" text,
	"submitted_at" timestamp with time zone DEFAULT now(),
	"graded_at" timestamp with time zone,
	"graded_by" bigserial NOT NULL,
	"isDeleted" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now(),
	"deletedAt" timestamp with time zone,
	CONSTRAINT "assignment_submissions_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "assignments" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"section_id" bigserial NOT NULL,
	"title_en" varchar(255) NOT NULL,
	"title_ar" varchar(255),
	"description_en" text,
	"description_ar" text,
	"instructions_en" text,
	"instructions_ar" text,
	"max_points" integer DEFAULT 100,
	"due_date" timestamp with time zone,
	"max_attempts" integer,
	"allow_late_submission" boolean DEFAULT false NOT NULL,
	"isDeleted" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now(),
	"deletedAt" timestamp with time zone,
	CONSTRAINT "assignments_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "certificates" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"enrollment_id" bigserial NOT NULL,
	"certificate_number" varchar(100) NOT NULL,
	"issued_date" timestamp with time zone DEFAULT now(),
	"file_url" varchar(500),
	"download_url" varchar(500),
	"download_count" integer DEFAULT 0,
	"isDeleted" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"deletedAt" timestamp with time zone,
	CONSTRAINT "certificates_uuid_unique" UNIQUE("uuid"),
	CONSTRAINT "certificates_certificate_number_unique" UNIQUE("certificate_number")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "course_categories" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"name_en" varchar(255) NOT NULL,
	"name_ar" varchar(255),
	"slug" varchar(255) NOT NULL,
	"description_en" text,
	"description_ar" text,
	"parent_id" bigserial NOT NULL,
	"display_order" integer DEFAULT 0,
	"isActive" boolean DEFAULT true NOT NULL,
	"isDeleted" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now(),
	"deletedAt" timestamp with time zone,
	CONSTRAINT "course_categories_uuid_unique" UNIQUE("uuid"),
	CONSTRAINT "course_categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "course_resources" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"course_id" bigserial NOT NULL,
	"section_id" bigserial NOT NULL,
	"lesson_id" bigserial NOT NULL,
	"resource_type_id" bigserial NOT NULL,
	"title_en" varchar(255) NOT NULL,
	"title_ar" varchar(255),
	"description_en" text,
	"description_ar" text,
	"file_url" varchar(500) NOT NULL,
	"file_name" varchar(255),
	"file_size" integer,
	"download_count" integer DEFAULT 0,
	"display_order" integer DEFAULT 0,
	"isDeleted" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now(),
	"deletedAt" timestamp with time zone,
	CONSTRAINT "course_resources_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "course_reviews" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"course_id" bigserial NOT NULL,
	"userId" bigserial NOT NULL,
	"rating" integer NOT NULL,
	"review_text" text,
	"isDeleted" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now(),
	"deletedAt" timestamp with time zone,
	CONSTRAINT "course_reviews_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "course_sections" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"course_id" bigserial NOT NULL,
	"title_en" varchar(255) NOT NULL,
	"title_ar" varchar(255),
	"description_en" text,
	"description_ar" text,
	"display_order" integer DEFAULT 0,
	"isDeleted" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now(),
	"deletedAt" timestamp with time zone,
	CONSTRAINT "course_sections_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "courses" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"title_en" varchar(255) NOT NULL,
	"title_ar" varchar(255),
	"slug" varchar(255) NOT NULL,
	"description_en" text,
	"description_ar" text,
	"objectives_en" text,
	"objectives_ar" text,
	"requirements_en" text,
	"requirements_ar" text,
	"seo" jsonb,
	"instructor_id" bigserial NOT NULL,
	"category_id" bigserial NOT NULL,
	"status_id" bigserial NOT NULL,
	"enrollment_type_id" bigserial NOT NULL,
	"price" numeric(10, 2),
	"thumbnail_url" varchar(500),
	"video_url" varchar(500),
	"duration_hours" integer,
	"max_students" integer,
	"allow_subscription_access" boolean DEFAULT true NOT NULL,
	"allow_purchase" boolean DEFAULT true NOT NULL,
	"publish_date" timestamp with time zone,
	"is_featured" boolean DEFAULT false NOT NULL,
	"isDeleted" boolean DEFAULT false NOT NULL,
	"view_count" integer DEFAULT 0,
	"favorite_count" integer DEFAULT 0,
	"share_count" integer DEFAULT 0,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now(),
	"deletedAt" timestamp with time zone,
	CONSTRAINT "courses_uuid_unique" UNIQUE("uuid"),
	CONSTRAINT "courses_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "enrollments" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"userId" bigserial NOT NULL,
	"course_id" bigserial NOT NULL,
	"enrollment_type_id" bigserial NOT NULL,
	"status_id" bigserial NOT NULL,
	"subscription_id" bigserial NOT NULL,
	"amount_paid" numeric(10, 2),
	"enrolled_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"progress_percentage" numeric(5, 2) DEFAULT '0',
	"last_accessed_at" timestamp with time zone,
	"isDeleted" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now(),
	"deletedAt" timestamp with time zone,
	CONSTRAINT "enrollments_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "lesson_progress" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"enrollment_id" bigserial NOT NULL,
	"lesson_id" bigserial NOT NULL,
	"is_completed" boolean DEFAULT false NOT NULL,
	"time_spent_minutes" integer DEFAULT 0,
	"completed_at" timestamp with time zone,
	"last_accessed_at" timestamp with time zone,
	"isDeleted" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now(),
	"deletedAt" timestamp with time zone,
	CONSTRAINT "lesson_progress_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "lesson_sessions" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"lesson_id" bigserial NOT NULL,
	"title_en" varchar(255) NOT NULL,
	"title_ar" varchar(255),
	"session_type_id" bigserial NOT NULL,
	"start_time" timestamp with time zone NOT NULL,
	"end_time" timestamp with time zone NOT NULL,
	"timezone" varchar(100) DEFAULT 'UTC',
	"meeting_url" varchar(500),
	"meeting_password" varchar(255),
	"max_attendees" integer,
	"description_en" text,
	"description_ar" text,
	"recording_url" varchar(500),
	"status_id" bigserial NOT NULL,
	"attendance_count" integer DEFAULT 0,
	"isDeleted" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now(),
	"deletedAt" timestamp with time zone,
	CONSTRAINT "lesson_sessions_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "lessons" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"section_id" bigserial NOT NULL,
	"content_type_id" bigserial NOT NULL,
	"title_en" varchar(255) NOT NULL,
	"title_ar" varchar(255),
	"description_en" text,
	"description_ar" text,
	"content_en" text,
	"content_ar" text,
	"video_url" varchar(500),
	"attachment_url" varchar(500),
	"duration_minutes" integer,
	"display_order" integer DEFAULT 0,
	"is_preview" boolean DEFAULT false NOT NULL,
	"isDeleted" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now(),
	"deletedAt" timestamp with time zone,
	CONSTRAINT "lessons_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "question_bank" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"course_id" bigserial NOT NULL,
	"question_type_id" bigserial NOT NULL,
	"question_text_en" text NOT NULL,
	"question_text_ar" text,
	"explanation_en" text,
	"explanation_ar" text,
	"points" integer DEFAULT 1,
	"isDeleted" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now(),
	"deletedAt" timestamp with time zone,
	CONSTRAINT "question_bank_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "question_options" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"question_id" bigserial NOT NULL,
	"option_text_en" text NOT NULL,
	"option_text_ar" text,
	"is_correct" boolean DEFAULT false NOT NULL,
	"display_order" integer DEFAULT 0,
	"isDeleted" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"deletedAt" timestamp with time zone,
	CONSTRAINT "question_options_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "quiz_answers" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"attempt_id" bigserial NOT NULL,
	"question_id" bigserial NOT NULL,
	"selected_option_id" bigserial NOT NULL,
	"answer_text" text,
	"is_correct" boolean DEFAULT false NOT NULL,
	"points_earned" numeric(5, 2),
	"isDeleted" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"deletedAt" timestamp with time zone,
	CONSTRAINT "quiz_answers_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "quiz_attempts" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"quiz_id" bigserial NOT NULL,
	"userId" bigserial NOT NULL,
	"attempt_number" integer NOT NULL,
	"score" numeric(5, 2),
	"max_score" numeric(5, 2),
	"is_passed" boolean DEFAULT false NOT NULL,
	"started_at" timestamp with time zone DEFAULT now(),
	"completed_at" timestamp with time zone,
	"isDeleted" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"deletedAt" timestamp with time zone,
	CONSTRAINT "quiz_attempts_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "quiz_questions" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"quiz_id" bigserial NOT NULL,
	"question_id" bigserial NOT NULL,
	"display_order" integer DEFAULT 0,
	"isDeleted" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"deletedAt" timestamp with time zone,
	CONSTRAINT "quiz_questions_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "quizzes" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"section_id" bigserial NOT NULL,
	"title_en" varchar(255) NOT NULL,
	"title_ar" varchar(255),
	"description_en" text,
	"description_ar" text,
	"time_limit_minutes" integer,
	"max_attempts" integer,
	"passing_score" integer DEFAULT 60,
	"shuffle_questions" boolean DEFAULT false NOT NULL,
	"show_correct_answers" boolean DEFAULT true NOT NULL,
	"available_from" timestamp with time zone,
	"available_until" timestamp with time zone,
	"isDeleted" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now(),
	"deletedAt" timestamp with time zone,
	CONSTRAINT "quizzes_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "session_attendees" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"session_id" bigserial NOT NULL,
	"userId" bigserial NOT NULL,
	"enrollment_id" bigserial NOT NULL,
	"attendance_status_id" bigserial NOT NULL,
	"joined_at" timestamp with time zone,
	"left_at" timestamp with time zone,
	"duration_minutes" integer,
	"isDeleted" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "session_attendees_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notes" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"userId" bigserial NOT NULL,
	"noteable_type" varchar(50) NOT NULL,
	"noteable_id" bigserial NOT NULL,
	"visibility_id" bigserial NOT NULL,
	"is_pinned" boolean DEFAULT false NOT NULL,
	"is_archived" boolean DEFAULT false NOT NULL,
	"content" text NOT NULL,
	"color" varchar(20),
	"likes_count" integer DEFAULT 0,
	"isDeleted" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now(),
	"archived_at" timestamp with time zone,
	"deletedAt" timestamp with time zone,
	CONSTRAINT "notes_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "shares" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"userId" bigserial NOT NULL,
	"shareable_type" varchar(50) NOT NULL,
	"shareable_id" bigserial NOT NULL,
	"share_type_id" bigserial NOT NULL,
	"shared_to_group_id" bigserial NOT NULL,
	"external_platform" varchar(50),
	"isDeleted" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"deletedAt" timestamp with time zone,
	CONSTRAINT "shares_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "friends" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"userId" bigserial NOT NULL,
	"friend_id" bigserial NOT NULL,
	"status_id" bigserial NOT NULL,
	"requested_at" timestamp with time zone DEFAULT now(),
	"accepted_at" timestamp with time zone,
	"isDeleted" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now(),
	"deletedAt" timestamp with time zone,
	CONSTRAINT "friends_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "group_members" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"group_id" bigserial NOT NULL,
	"userId" bigserial NOT NULL,
	"role_id" bigserial NOT NULL,
	"status_id" bigserial NOT NULL,
	"joined_at" timestamp with time zone DEFAULT now(),
	"isDeleted" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now(),
	"deletedAt" timestamp with time zone,
	CONSTRAINT "group_members_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "groups" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"description" text,
	"seo" jsonb,
	"privacy_type_id" bigserial NOT NULL,
	"cover_image_url" varchar(500),
	"created_by" bigserial NOT NULL,
	"member_count" integer DEFAULT 0,
	"favorite_count" integer DEFAULT 0,
	"isDeleted" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now(),
	"deletedAt" timestamp with time zone,
	CONSTRAINT "groups_uuid_unique" UNIQUE("uuid"),
	CONSTRAINT "groups_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "page_follows" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"page_id" bigserial NOT NULL,
	"userId" bigserial NOT NULL,
	"isDeleted" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"deletedAt" timestamp with time zone,
	CONSTRAINT "page_follows_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "page_likes" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"page_id" bigserial NOT NULL,
	"userId" bigserial NOT NULL,
	"isDeleted" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"deletedAt" timestamp with time zone,
	CONSTRAINT "page_likes_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "page_members" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"page_id" bigserial NOT NULL,
	"userId" bigserial NOT NULL,
	"role_id" bigserial NOT NULL,
	"joined_at" timestamp with time zone DEFAULT now(),
	"isDeleted" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now(),
	"deletedAt" timestamp with time zone,
	CONSTRAINT "page_members_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pages" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"description" text,
	"seo" jsonb,
	"category_id" bigserial NOT NULL,
	"cover_image_url" varchar(500),
	"profile_image_url" varchar(500),
	"created_by" bigserial NOT NULL,
	"follower_count" integer DEFAULT 0,
	"like_count" integer DEFAULT 0,
	"favorite_count" integer DEFAULT 0,
	"isDeleted" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now(),
	"deletedAt" timestamp with time zone,
	CONSTRAINT "pages_uuid_unique" UNIQUE("uuid"),
	CONSTRAINT "pages_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "post_reactions" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"post_id" bigserial NOT NULL,
	"userId" bigserial NOT NULL,
	"reaction_type_id" bigserial NOT NULL,
	"isDeleted" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"deletedAt" timestamp with time zone,
	CONSTRAINT "post_reactions_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "posts" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"userId" bigserial NOT NULL,
	"post_type_id" bigserial NOT NULL,
	"content" text,
	"visibility_id" bigserial NOT NULL,
	"group_id" bigserial NOT NULL,
	"page_id" bigserial NOT NULL,
	"share_count" integer DEFAULT 0,
	"comment_count" integer DEFAULT 0,
	"reaction_count" integer DEFAULT 0,
	"view_count" integer DEFAULT 0,
	"metadata" jsonb,
	"settings" jsonb,
	"isDeleted" boolean DEFAULT false NOT NULL,
	"published_at" timestamp with time zone,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now(),
	"deletedAt" timestamp with time zone,
	CONSTRAINT "posts_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notifications" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"userId" bigserial NOT NULL,
	"notification_type_id" bigserial NOT NULL,
	"title" varchar(255) NOT NULL,
	"message" text NOT NULL,
	"link_url" varchar(500),
	"is_read" boolean DEFAULT false NOT NULL,
	"isDeleted" boolean DEFAULT false NOT NULL,
	"read_at" timestamp with time zone,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"deletedAt" timestamp with time zone,
	CONSTRAINT "notifications_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "job_applications" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"job_id" bigserial NOT NULL,
	"userId" bigserial NOT NULL,
	"status_id" bigserial NOT NULL,
	"cover_letter" text,
	"resume_url" varchar(500),
	"notes" text,
	"reviewed_by" bigserial NOT NULL,
	"reviewed_at" timestamp with time zone,
	"applied_at" timestamp with time zone DEFAULT now(),
	"isDeleted" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now(),
	"deletedAt" timestamp with time zone,
	CONSTRAINT "job_applications_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "jobs" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"title_en" varchar(255) NOT NULL,
	"title_ar" varchar(255),
	"slug" varchar(255) NOT NULL,
	"description_en" text,
	"description_ar" text,
	"requirements_en" text,
	"requirements_ar" text,
	"responsibilities_en" text,
	"responsibilities_ar" text,
	"seo" jsonb,
	"job_type_id" bigserial NOT NULL,
	"experience_level_id" bigserial NOT NULL,
	"status_id" bigserial NOT NULL,
	"location" varchar(255),
	"salary_range" varchar(255),
	"posted_by" bigserial NOT NULL,
	"company_id" bigserial NOT NULL,
	"application_count" integer DEFAULT 0,
	"view_count" integer DEFAULT 0,
	"favorite_count" integer DEFAULT 0,
	"share_count" integer DEFAULT 0,
	"deadline" timestamp with time zone,
	"is_featured" boolean DEFAULT false NOT NULL,
	"isDeleted" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now(),
	"deletedAt" timestamp with time zone,
	CONSTRAINT "jobs_uuid_unique" UNIQUE("uuid"),
	CONSTRAINT "jobs_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "reports" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"reported_by" bigserial NOT NULL,
	"report_type_id" bigserial NOT NULL,
	"status_id" bigserial NOT NULL,
	"reportable_type" varchar(50) NOT NULL,
	"reportable_id" bigserial NOT NULL,
	"reason" text NOT NULL,
	"admin_notes" text,
	"reviewed_by" bigserial NOT NULL,
	"reviewed_at" timestamp with time zone,
	"isDeleted" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now(),
	"deletedAt" timestamp with time zone,
	CONSTRAINT "reports_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ticket_replies" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"ticket_id" bigserial NOT NULL,
	"userId" bigserial NOT NULL,
	"message" text NOT NULL,
	"is_internal" boolean DEFAULT false NOT NULL,
	"attachment_url" varchar(500),
	"isDeleted" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now(),
	"deletedAt" timestamp with time zone,
	CONSTRAINT "ticket_replies_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tickets" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"ticket_number" varchar(100) NOT NULL,
	"userId" bigserial NOT NULL,
	"category_id" bigserial NOT NULL,
	"priority_id" bigserial NOT NULL,
	"status_id" bigserial NOT NULL,
	"subject" varchar(500) NOT NULL,
	"description" text NOT NULL,
	"assigned_to" bigserial NOT NULL,
	"resolved_at" timestamp with time zone,
	"closed_at" timestamp with time zone,
	"isDeleted" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now(),
	"deletedAt" timestamp with time zone,
	CONSTRAINT "tickets_uuid_unique" UNIQUE("uuid"),
	CONSTRAINT "tickets_ticket_number_unique" UNIQUE("ticket_number")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "media_library" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"uploaded_by" bigserial NOT NULL,
	"mediable_type" varchar(50),
	"mediable_id" bigserial NOT NULL,
	"provider_id" bigserial NOT NULL,
	"file_name" varchar(255) NOT NULL,
	"original_name" varchar(255) NOT NULL,
	"file_path" varchar(500) NOT NULL,
	"file_type" varchar(50),
	"mime_type" varchar(100),
	"file_size" integer,
	"alt_text" text,
	"metadata" jsonb,
	"is_temporary" boolean DEFAULT false NOT NULL,
	"temp_expires_at" timestamp with time zone,
	"download_count" integer DEFAULT 0,
	"isDeleted" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now(),
	"deletedAt" timestamp with time zone,
	CONSTRAINT "media_library_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ad_campaigns" ADD CONSTRAINT "ad_campaigns_status_id_lookups_id_fk" FOREIGN KEY ("status_id") REFERENCES "public"."lookups"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ad_campaigns" ADD CONSTRAINT "ad_campaigns_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ad_clicks" ADD CONSTRAINT "ad_clicks_ad_id_ads_id_fk" FOREIGN KEY ("ad_id") REFERENCES "public"."ads"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ad_clicks" ADD CONSTRAINT "ad_clicks_impression_id_ad_impressions_id_fk" FOREIGN KEY ("impression_id") REFERENCES "public"."ad_impressions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ad_clicks" ADD CONSTRAINT "ad_clicks_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ad_impressions" ADD CONSTRAINT "ad_impressions_ad_id_ads_id_fk" FOREIGN KEY ("ad_id") REFERENCES "public"."ads"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ad_impressions" ADD CONSTRAINT "ad_impressions_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ad_impressions" ADD CONSTRAINT "ad_impressions_placement_id_ad_placements_id_fk" FOREIGN KEY ("placement_id") REFERENCES "public"."ad_placements"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ad_payments" ADD CONSTRAINT "ad_payments_campaign_id_ad_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."ad_campaigns"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ad_payments" ADD CONSTRAINT "ad_payments_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ad_payments" ADD CONSTRAINT "ad_payments_payment_status_id_lookups_id_fk" FOREIGN KEY ("payment_status_id") REFERENCES "public"."lookups"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ad_targeting_rules" ADD CONSTRAINT "ad_targeting_rules_ad_id_ads_id_fk" FOREIGN KEY ("ad_id") REFERENCES "public"."ads"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ads" ADD CONSTRAINT "ads_campaign_id_ad_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."ad_campaigns"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ads" ADD CONSTRAINT "ads_ad_type_id_lookups_id_fk" FOREIGN KEY ("ad_type_id") REFERENCES "public"."lookups"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ads" ADD CONSTRAINT "ads_placement_type_id_lookups_id_fk" FOREIGN KEY ("placement_type_id") REFERENCES "public"."lookups"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ads" ADD CONSTRAINT "ads_status_id_lookups_id_fk" FOREIGN KEY ("status_id") REFERENCES "public"."lookups"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ads" ADD CONSTRAINT "ads_payment_status_id_lookups_id_fk" FOREIGN KEY ("payment_status_id") REFERENCES "public"."lookups"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ads" ADD CONSTRAINT "ads_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_chat_room_id_chat_rooms_id_fk" FOREIGN KEY ("chat_room_id") REFERENCES "public"."chat_rooms"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_message_type_id_lookups_id_fk" FOREIGN KEY ("message_type_id") REFERENCES "public"."lookups"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_reply_to_message_id_chat_messages_id_fk" FOREIGN KEY ("reply_to_message_id") REFERENCES "public"."chat_messages"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chat_participants" ADD CONSTRAINT "chat_participants_chat_room_id_chat_rooms_id_fk" FOREIGN KEY ("chat_room_id") REFERENCES "public"."chat_rooms"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chat_participants" ADD CONSTRAINT "chat_participants_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chat_rooms" ADD CONSTRAINT "chat_rooms_chat_type_id_lookups_id_fk" FOREIGN KEY ("chat_type_id") REFERENCES "public"."lookups"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chat_rooms" ADD CONSTRAINT "chat_rooms_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "message_reads" ADD CONSTRAINT "message_reads_message_id_chat_messages_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."chat_messages"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "message_reads" ADD CONSTRAINT "message_reads_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cms_pages" ADD CONSTRAINT "cms_pages_page_type_id_lookups_id_fk" FOREIGN KEY ("page_type_id") REFERENCES "public"."lookups"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cms_pages" ADD CONSTRAINT "cms_pages_status_id_lookups_id_fk" FOREIGN KEY ("status_id") REFERENCES "public"."lookups"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "comment_reactions" ADD CONSTRAINT "comment_reactions_comment_id_comments_id_fk" FOREIGN KEY ("comment_id") REFERENCES "public"."comments"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "comment_reactions" ADD CONSTRAINT "comment_reactions_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "comment_reactions" ADD CONSTRAINT "comment_reactions_reaction_type_id_lookups_id_fk" FOREIGN KEY ("reaction_type_id") REFERENCES "public"."lookups"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "comments" ADD CONSTRAINT "comments_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "comments" ADD CONSTRAINT "comments_parent_comment_id_comments_id_fk" FOREIGN KEY ("parent_comment_id") REFERENCES "public"."comments"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "event_registrations" ADD CONSTRAINT "event_registrations_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "event_registrations" ADD CONSTRAINT "event_registrations_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "event_registrations" ADD CONSTRAINT "event_registrations_status_id_lookups_id_fk" FOREIGN KEY ("status_id") REFERENCES "public"."lookups"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "event_registrations" ADD CONSTRAINT "event_registrations_attendance_status_id_lookups_id_fk" FOREIGN KEY ("attendance_status_id") REFERENCES "public"."lookups"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "events" ADD CONSTRAINT "events_event_type_id_lookups_id_fk" FOREIGN KEY ("event_type_id") REFERENCES "public"."lookups"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "events" ADD CONSTRAINT "events_status_id_lookups_id_fk" FOREIGN KEY ("status_id") REFERENCES "public"."lookups"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "events" ADD CONSTRAINT "events_category_id_event_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."event_categories"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "events" ADD CONSTRAINT "events_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "favorites" ADD CONSTRAINT "favorites_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "fcm_tokens" ADD CONSTRAINT "fcm_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "lookup_types" ADD CONSTRAINT "lookup_types_parent_id_lookup_types_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."lookup_types"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "lookups" ADD CONSTRAINT "lookups_lookup_type_id_lookup_types_id_fk" FOREIGN KEY ("lookup_type_id") REFERENCES "public"."lookup_types"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "lookups" ADD CONSTRAINT "lookups_parent_id_lookups_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."lookups"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_lookups_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."lookups"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_lookups_id_fk" FOREIGN KEY ("permission_id") REFERENCES "public"."lookups"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_lookups_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."lookups"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_assigned_by_users_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users" ADD CONSTRAINT "users_role_id_lookups_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."lookups"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users" ADD CONSTRAINT "users_status_id_lookups_id_fk" FOREIGN KEY ("status_id") REFERENCES "public"."lookups"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "payment_history" ADD CONSTRAINT "payment_history_subscription_id_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "payment_history" ADD CONSTRAINT "payment_history_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "payment_history" ADD CONSTRAINT "payment_history_status_id_lookups_id_fk" FOREIGN KEY ("status_id") REFERENCES "public"."lookups"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "plan_features" ADD CONSTRAINT "plan_features_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "plan_features" ADD CONSTRAINT "plan_features_feature_id_lookups_id_fk" FOREIGN KEY ("feature_id") REFERENCES "public"."lookups"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_status_id_lookups_id_fk" FOREIGN KEY ("status_id") REFERENCES "public"."lookups"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_billing_cycle_id_lookups_id_fk" FOREIGN KEY ("billing_cycle_id") REFERENCES "public"."lookups"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "assignment_submissions" ADD CONSTRAINT "assignment_submissions_assignment_id_assignments_id_fk" FOREIGN KEY ("assignment_id") REFERENCES "public"."assignments"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "assignment_submissions" ADD CONSTRAINT "assignment_submissions_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "assignment_submissions" ADD CONSTRAINT "assignment_submissions_status_id_lookups_id_fk" FOREIGN KEY ("status_id") REFERENCES "public"."lookups"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "assignment_submissions" ADD CONSTRAINT "assignment_submissions_graded_by_users_id_fk" FOREIGN KEY ("graded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "assignments" ADD CONSTRAINT "assignments_section_id_course_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."course_sections"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "certificates" ADD CONSTRAINT "certificates_enrollment_id_enrollments_id_fk" FOREIGN KEY ("enrollment_id") REFERENCES "public"."enrollments"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "course_categories" ADD CONSTRAINT "course_categories_parent_id_course_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."course_categories"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "course_resources" ADD CONSTRAINT "course_resources_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "course_resources" ADD CONSTRAINT "course_resources_section_id_course_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."course_sections"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "course_resources" ADD CONSTRAINT "course_resources_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "course_resources" ADD CONSTRAINT "course_resources_resource_type_id_lookups_id_fk" FOREIGN KEY ("resource_type_id") REFERENCES "public"."lookups"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "course_reviews" ADD CONSTRAINT "course_reviews_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "course_reviews" ADD CONSTRAINT "course_reviews_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "course_sections" ADD CONSTRAINT "course_sections_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "courses" ADD CONSTRAINT "courses_instructor_id_users_id_fk" FOREIGN KEY ("instructor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "courses" ADD CONSTRAINT "courses_category_id_course_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."course_categories"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "courses" ADD CONSTRAINT "courses_status_id_lookups_id_fk" FOREIGN KEY ("status_id") REFERENCES "public"."lookups"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "courses" ADD CONSTRAINT "courses_enrollment_type_id_lookups_id_fk" FOREIGN KEY ("enrollment_type_id") REFERENCES "public"."lookups"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_enrollment_type_id_lookups_id_fk" FOREIGN KEY ("enrollment_type_id") REFERENCES "public"."lookups"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_status_id_lookups_id_fk" FOREIGN KEY ("status_id") REFERENCES "public"."lookups"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_subscription_id_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "lesson_progress" ADD CONSTRAINT "lesson_progress_enrollment_id_enrollments_id_fk" FOREIGN KEY ("enrollment_id") REFERENCES "public"."enrollments"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "lesson_progress" ADD CONSTRAINT "lesson_progress_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "lesson_sessions" ADD CONSTRAINT "lesson_sessions_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "lesson_sessions" ADD CONSTRAINT "lesson_sessions_session_type_id_lookups_id_fk" FOREIGN KEY ("session_type_id") REFERENCES "public"."lookups"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "lesson_sessions" ADD CONSTRAINT "lesson_sessions_status_id_lookups_id_fk" FOREIGN KEY ("status_id") REFERENCES "public"."lookups"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "lessons" ADD CONSTRAINT "lessons_section_id_course_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."course_sections"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "lessons" ADD CONSTRAINT "lessons_content_type_id_lookups_id_fk" FOREIGN KEY ("content_type_id") REFERENCES "public"."lookups"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "question_bank" ADD CONSTRAINT "question_bank_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "question_bank" ADD CONSTRAINT "question_bank_question_type_id_lookups_id_fk" FOREIGN KEY ("question_type_id") REFERENCES "public"."lookups"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "question_options" ADD CONSTRAINT "question_options_question_id_question_bank_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."question_bank"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "quiz_answers" ADD CONSTRAINT "quiz_answers_attempt_id_quiz_attempts_id_fk" FOREIGN KEY ("attempt_id") REFERENCES "public"."quiz_attempts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "quiz_answers" ADD CONSTRAINT "quiz_answers_question_id_question_bank_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."question_bank"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "quiz_answers" ADD CONSTRAINT "quiz_answers_selected_option_id_question_options_id_fk" FOREIGN KEY ("selected_option_id") REFERENCES "public"."question_options"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_quiz_id_quizzes_id_fk" FOREIGN KEY ("quiz_id") REFERENCES "public"."quizzes"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "quiz_questions" ADD CONSTRAINT "quiz_questions_quiz_id_quizzes_id_fk" FOREIGN KEY ("quiz_id") REFERENCES "public"."quizzes"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "quiz_questions" ADD CONSTRAINT "quiz_questions_question_id_question_bank_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."question_bank"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_section_id_course_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."course_sections"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "session_attendees" ADD CONSTRAINT "session_attendees_session_id_lesson_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."lesson_sessions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "session_attendees" ADD CONSTRAINT "session_attendees_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "session_attendees" ADD CONSTRAINT "session_attendees_enrollment_id_enrollments_id_fk" FOREIGN KEY ("enrollment_id") REFERENCES "public"."enrollments"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "session_attendees" ADD CONSTRAINT "session_attendees_attendance_status_id_lookups_id_fk" FOREIGN KEY ("attendance_status_id") REFERENCES "public"."lookups"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "notes" ADD CONSTRAINT "notes_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "notes" ADD CONSTRAINT "notes_visibility_id_lookups_id_fk" FOREIGN KEY ("visibility_id") REFERENCES "public"."lookups"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "shares" ADD CONSTRAINT "shares_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "shares" ADD CONSTRAINT "shares_share_type_id_lookups_id_fk" FOREIGN KEY ("share_type_id") REFERENCES "public"."lookups"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "shares" ADD CONSTRAINT "shares_shared_to_group_id_groups_id_fk" FOREIGN KEY ("shared_to_group_id") REFERENCES "public"."groups"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "friends" ADD CONSTRAINT "friends_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "friends" ADD CONSTRAINT "friends_friend_id_users_id_fk" FOREIGN KEY ("friend_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "friends" ADD CONSTRAINT "friends_status_id_lookups_id_fk" FOREIGN KEY ("status_id") REFERENCES "public"."lookups"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "group_members" ADD CONSTRAINT "group_members_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "group_members" ADD CONSTRAINT "group_members_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "group_members" ADD CONSTRAINT "group_members_role_id_lookups_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."lookups"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "group_members" ADD CONSTRAINT "group_members_status_id_lookups_id_fk" FOREIGN KEY ("status_id") REFERENCES "public"."lookups"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "groups" ADD CONSTRAINT "groups_privacy_type_id_lookups_id_fk" FOREIGN KEY ("privacy_type_id") REFERENCES "public"."lookups"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "groups" ADD CONSTRAINT "groups_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "page_follows" ADD CONSTRAINT "page_follows_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "page_follows" ADD CONSTRAINT "page_follows_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "page_likes" ADD CONSTRAINT "page_likes_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "page_likes" ADD CONSTRAINT "page_likes_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "page_members" ADD CONSTRAINT "page_members_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "page_members" ADD CONSTRAINT "page_members_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "page_members" ADD CONSTRAINT "page_members_role_id_lookups_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."lookups"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pages" ADD CONSTRAINT "pages_category_id_lookups_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."lookups"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pages" ADD CONSTRAINT "pages_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "post_reactions" ADD CONSTRAINT "post_reactions_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "post_reactions" ADD CONSTRAINT "post_reactions_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "post_reactions" ADD CONSTRAINT "post_reactions_reaction_type_id_lookups_id_fk" FOREIGN KEY ("reaction_type_id") REFERENCES "public"."lookups"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "posts" ADD CONSTRAINT "posts_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "posts" ADD CONSTRAINT "posts_post_type_id_lookups_id_fk" FOREIGN KEY ("post_type_id") REFERENCES "public"."lookups"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "posts" ADD CONSTRAINT "posts_visibility_id_lookups_id_fk" FOREIGN KEY ("visibility_id") REFERENCES "public"."lookups"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "posts" ADD CONSTRAINT "posts_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "posts" ADD CONSTRAINT "posts_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "notifications" ADD CONSTRAINT "notifications_notification_type_id_lookups_id_fk" FOREIGN KEY ("notification_type_id") REFERENCES "public"."lookups"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "job_applications" ADD CONSTRAINT "job_applications_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "job_applications" ADD CONSTRAINT "job_applications_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "job_applications" ADD CONSTRAINT "job_applications_status_id_lookups_id_fk" FOREIGN KEY ("status_id") REFERENCES "public"."lookups"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "job_applications" ADD CONSTRAINT "job_applications_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "jobs" ADD CONSTRAINT "jobs_job_type_id_lookups_id_fk" FOREIGN KEY ("job_type_id") REFERENCES "public"."lookups"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "jobs" ADD CONSTRAINT "jobs_experience_level_id_lookups_id_fk" FOREIGN KEY ("experience_level_id") REFERENCES "public"."lookups"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "jobs" ADD CONSTRAINT "jobs_status_id_lookups_id_fk" FOREIGN KEY ("status_id") REFERENCES "public"."lookups"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "jobs" ADD CONSTRAINT "jobs_posted_by_users_id_fk" FOREIGN KEY ("posted_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "jobs" ADD CONSTRAINT "jobs_company_id_pages_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."pages"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "reports" ADD CONSTRAINT "reports_reported_by_users_id_fk" FOREIGN KEY ("reported_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "reports" ADD CONSTRAINT "reports_report_type_id_lookups_id_fk" FOREIGN KEY ("report_type_id") REFERENCES "public"."lookups"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "reports" ADD CONSTRAINT "reports_status_id_lookups_id_fk" FOREIGN KEY ("status_id") REFERENCES "public"."lookups"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "reports" ADD CONSTRAINT "reports_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ticket_replies" ADD CONSTRAINT "ticket_replies_ticket_id_tickets_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."tickets"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ticket_replies" ADD CONSTRAINT "ticket_replies_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tickets" ADD CONSTRAINT "tickets_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tickets" ADD CONSTRAINT "tickets_category_id_lookups_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."lookups"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tickets" ADD CONSTRAINT "tickets_priority_id_lookups_id_fk" FOREIGN KEY ("priority_id") REFERENCES "public"."lookups"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tickets" ADD CONSTRAINT "tickets_status_id_lookups_id_fk" FOREIGN KEY ("status_id") REFERENCES "public"."lookups"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tickets" ADD CONSTRAINT "tickets_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "media_library" ADD CONSTRAINT "media_library_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "media_library" ADD CONSTRAINT "media_library_provider_id_lookups_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."lookups"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ad_campaigns_uuid_idx" ON "ad_campaigns" USING btree ("uuid");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ad_campaigns_created_by_idx" ON "ad_campaigns" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ad_campaigns_status_idx" ON "ad_campaigns" USING btree ("status_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ad_clicks_uuid_idx" ON "ad_clicks" USING btree ("uuid");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ad_clicks_ad_id_idx" ON "ad_clicks" USING btree ("ad_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ad_clicks_impression_id_idx" ON "ad_clicks" USING btree ("impression_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ad_clicks_userId_idx" ON "ad_clicks" USING btree ("userId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ad_clicks_session_id_idx" ON "ad_clicks" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ad_clicks_clicked_at_idx" ON "ad_clicks" USING btree ("clicked_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ad_impressions_uuid_idx" ON "ad_impressions" USING btree ("uuid");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ad_impressions_ad_id_idx" ON "ad_impressions" USING btree ("ad_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ad_impressions_userId_idx" ON "ad_impressions" USING btree ("userId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ad_impressions_session_id_idx" ON "ad_impressions" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ad_impressions_viewed_at_idx" ON "ad_impressions" USING btree ("viewed_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ad_payments_uuid_idx" ON "ad_payments" USING btree ("uuid");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ad_payments_campaign_id_idx" ON "ad_payments" USING btree ("campaign_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ad_payments_userId_idx" ON "ad_payments" USING btree ("userId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ad_payments_status_idx" ON "ad_payments" USING btree ("payment_status_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ad_placements_uuid_idx" ON "ad_placements" USING btree ("uuid");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ad_placements_code_idx" ON "ad_placements" USING btree ("code");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ad_targeting_rules_uuid_idx" ON "ad_targeting_rules" USING btree ("uuid");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ad_targeting_rules_ad_id_idx" ON "ad_targeting_rules" USING btree ("ad_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ads_uuid_idx" ON "ads" USING btree ("uuid");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ads_campaign_id_idx" ON "ads" USING btree ("campaign_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ads_created_by_idx" ON "ads" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ads_status_idx" ON "ads" USING btree ("status_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ads_target_idx" ON "ads" USING btree ("target_type","target_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ads_placement_type_idx" ON "ads" USING btree ("placement_type_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ads_date_idx" ON "ads" USING btree ("start_date","end_date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "audit_logs_uuid_idx" ON "audit_logs" USING btree ("uuid");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "audit_logs_userId_idx" ON "audit_logs" USING btree ("userId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "audit_logs_auditable_idx" ON "audit_logs" USING btree ("auditable_type","auditable_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "audit_logs_action_idx" ON "audit_logs" USING btree ("action");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "audit_logs_createdAt_idx" ON "audit_logs" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "chat_messages_uuid_idx" ON "chat_messages" USING btree ("uuid");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "chat_messages_room_id_idx" ON "chat_messages" USING btree ("chat_room_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "chat_messages_userId_idx" ON "chat_messages" USING btree ("userId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "chat_participants_uuid_idx" ON "chat_participants" USING btree ("uuid");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "chat_participants_room_id_idx" ON "chat_participants" USING btree ("chat_room_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "chat_participants_userId_idx" ON "chat_participants" USING btree ("userId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "chat_rooms_uuid_idx" ON "chat_rooms" USING btree ("uuid");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "chat_rooms_created_by_idx" ON "chat_rooms" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "chat_rooms_roomable_idx" ON "chat_rooms" USING btree ("roomable_type","roomable_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "message_reads_uuid_idx" ON "message_reads" USING btree ("uuid");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "message_reads_message_id_idx" ON "message_reads" USING btree ("message_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "message_reads_userId_idx" ON "message_reads" USING btree ("userId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cms_pages_uuid_idx" ON "cms_pages" USING btree ("uuid");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cms_pages_slug_idx" ON "cms_pages" USING btree ("slug");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "comment_reactions_uuid_idx" ON "comment_reactions" USING btree ("uuid");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "comment_reactions_comment_id_idx" ON "comment_reactions" USING btree ("comment_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "comment_reactions_userId_idx" ON "comment_reactions" USING btree ("userId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "comments_uuid_idx" ON "comments" USING btree ("uuid");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "comments_userId_idx" ON "comments" USING btree ("userId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "comments_commentable_idx" ON "comments" USING btree ("commentable_type","commentable_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "comments_parent_id_idx" ON "comments" USING btree ("parent_comment_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "event_categories_uuid_idx" ON "event_categories" USING btree ("uuid");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "event_categories_slug_idx" ON "event_categories" USING btree ("slug");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "event_registrations_uuid_idx" ON "event_registrations" USING btree ("uuid");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "event_registrations_event_id_idx" ON "event_registrations" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "event_registrations_userId_idx" ON "event_registrations" USING btree ("userId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "events_uuid_idx" ON "events" USING btree ("uuid");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "events_slug_idx" ON "events" USING btree ("slug");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "events_created_by_idx" ON "events" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "events_category_id_idx" ON "events" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "favorites_uuid_idx" ON "favorites" USING btree ("uuid");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "favorites_userId_idx" ON "favorites" USING btree ("userId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "favorites_favoritable_idx" ON "favorites" USING btree ("favoritable_type","favoritable_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "fcm_tokens_user_id_idx" ON "fcm_tokens" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "fcm_tokens_token_idx" ON "fcm_tokens" USING btree ("token");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "fcm_tokens_is_active_idx" ON "fcm_tokens" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "lookup_types_uuid_idx" ON "lookup_types" USING btree ("uuid");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "lookup_types_code_idx" ON "lookup_types" USING btree ("code");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "lookup_types_parent_id_idx" ON "lookup_types" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "lookups_uuid_idx" ON "lookups" USING btree ("uuid");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "lookups_code_idx" ON "lookups" USING btree ("code");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "lookups_type_id_idx" ON "lookups" USING btree ("lookup_type_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "lookups_parent_id_idx" ON "lookups" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "role_permissions_role_id_idx" ON "role_permissions" USING btree ("role_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "role_permissions_permission_id_idx" ON "role_permissions" USING btree ("permission_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "role_permissions_role_permission_unique_idx" ON "role_permissions" USING btree ("role_id","permission_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_roles_user_id_idx" ON "user_roles" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_roles_role_id_idx" ON "user_roles" USING btree ("role_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_roles_user_role_unique_idx" ON "user_roles" USING btree ("user_id","role_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "users_uuid_idx" ON "users" USING btree ("uuid");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "users_username_idx" ON "users" USING btree ("username");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "users_role_id_idx" ON "users" USING btree ("role_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "users_status_id_idx" ON "users" USING btree ("status_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "users_email_verification_token_idx" ON "users" USING btree ("email_verification_token");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "users_password_reset_token_idx" ON "users" USING btree ("password_reset_token");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "users_keycloak_user_id_idx" ON "users" USING btree ("keycloak_user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "payment_history_uuid_idx" ON "payment_history" USING btree ("uuid");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "payment_history_subscription_id_idx" ON "payment_history" USING btree ("subscription_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "payment_history_userId_idx" ON "payment_history" USING btree ("userId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "payment_history_invoice_number_idx" ON "payment_history" USING btree ("invoice_number");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "plan_features_uuid_idx" ON "plan_features" USING btree ("uuid");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "plan_features_plan_id_idx" ON "plan_features" USING btree ("plan_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "plans_uuid_idx" ON "plans" USING btree ("uuid");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "subscriptions_uuid_idx" ON "subscriptions" USING btree ("uuid");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "subscriptions_userId_idx" ON "subscriptions" USING btree ("userId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "subscriptions_plan_id_idx" ON "subscriptions" USING btree ("plan_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "subscriptions_status_id_idx" ON "subscriptions" USING btree ("status_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "assignment_submissions_uuid_idx" ON "assignment_submissions" USING btree ("uuid");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "assignment_submissions_assignment_id_idx" ON "assignment_submissions" USING btree ("assignment_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "assignment_submissions_userId_idx" ON "assignment_submissions" USING btree ("userId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "assignments_uuid_idx" ON "assignments" USING btree ("uuid");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "assignments_section_id_idx" ON "assignments" USING btree ("section_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "certificates_uuid_idx" ON "certificates" USING btree ("uuid");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "certificates_enrollment_id_idx" ON "certificates" USING btree ("enrollment_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "certificates_certificate_number_idx" ON "certificates" USING btree ("certificate_number");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "course_categories_uuid_idx" ON "course_categories" USING btree ("uuid");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "course_categories_slug_idx" ON "course_categories" USING btree ("slug");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "course_categories_parent_id_idx" ON "course_categories" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "course_resources_uuid_idx" ON "course_resources" USING btree ("uuid");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "course_resources_course_id_idx" ON "course_resources" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "course_reviews_uuid_idx" ON "course_reviews" USING btree ("uuid");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "course_reviews_course_id_idx" ON "course_reviews" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "course_reviews_userId_idx" ON "course_reviews" USING btree ("userId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "course_sections_uuid_idx" ON "course_sections" USING btree ("uuid");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "course_sections_course_id_idx" ON "course_sections" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "courses_uuid_idx" ON "courses" USING btree ("uuid");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "courses_slug_idx" ON "courses" USING btree ("slug");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "courses_instructor_id_idx" ON "courses" USING btree ("instructor_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "courses_category_id_idx" ON "courses" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "courses_status_id_idx" ON "courses" USING btree ("status_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "enrollments_uuid_idx" ON "enrollments" USING btree ("uuid");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "enrollments_userId_idx" ON "enrollments" USING btree ("userId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "enrollments_course_id_idx" ON "enrollments" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "lesson_progress_uuid_idx" ON "lesson_progress" USING btree ("uuid");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "lesson_progress_enrollment_id_idx" ON "lesson_progress" USING btree ("enrollment_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "lesson_progress_lesson_id_idx" ON "lesson_progress" USING btree ("lesson_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "lesson_sessions_uuid_idx" ON "lesson_sessions" USING btree ("uuid");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "lesson_sessions_lesson_id_idx" ON "lesson_sessions" USING btree ("lesson_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "lesson_sessions_status_id_idx" ON "lesson_sessions" USING btree ("status_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "lesson_sessions_start_time_idx" ON "lesson_sessions" USING btree ("start_time");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "lessons_uuid_idx" ON "lessons" USING btree ("uuid");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "lessons_section_id_idx" ON "lessons" USING btree ("section_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "question_bank_uuid_idx" ON "question_bank" USING btree ("uuid");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "question_bank_course_id_idx" ON "question_bank" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "question_options_uuid_idx" ON "question_options" USING btree ("uuid");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "question_options_question_id_idx" ON "question_options" USING btree ("question_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "quiz_answers_uuid_idx" ON "quiz_answers" USING btree ("uuid");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "quiz_answers_attempt_id_idx" ON "quiz_answers" USING btree ("attempt_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "quiz_attempts_uuid_idx" ON "quiz_attempts" USING btree ("uuid");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "quiz_attempts_quiz_id_idx" ON "quiz_attempts" USING btree ("quiz_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "quiz_attempts_userId_idx" ON "quiz_attempts" USING btree ("userId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "quiz_questions_uuid_idx" ON "quiz_questions" USING btree ("uuid");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "quiz_questions_quiz_id_idx" ON "quiz_questions" USING btree ("quiz_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "quizzes_uuid_idx" ON "quizzes" USING btree ("uuid");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "quizzes_section_id_idx" ON "quizzes" USING btree ("section_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "session_attendees_uuid_idx" ON "session_attendees" USING btree ("uuid");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "session_attendees_session_id_idx" ON "session_attendees" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "session_attendees_userId_idx" ON "session_attendees" USING btree ("userId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "session_attendees_enrollment_id_idx" ON "session_attendees" USING btree ("enrollment_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "notes_uuid_idx" ON "notes" USING btree ("uuid");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "notes_userId_idx" ON "notes" USING btree ("userId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "notes_noteable_idx" ON "notes" USING btree ("noteable_type","noteable_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "shares_uuid_idx" ON "shares" USING btree ("uuid");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "shares_userId_idx" ON "shares" USING btree ("userId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "shares_shareable_idx" ON "shares" USING btree ("shareable_type","shareable_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "friends_uuid_idx" ON "friends" USING btree ("uuid");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "friends_userId_idx" ON "friends" USING btree ("userId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "friends_friend_id_idx" ON "friends" USING btree ("friend_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "group_members_uuid_idx" ON "group_members" USING btree ("uuid");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "group_members_group_id_idx" ON "group_members" USING btree ("group_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "group_members_userId_idx" ON "group_members" USING btree ("userId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "groups_uuid_idx" ON "groups" USING btree ("uuid");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "groups_slug_idx" ON "groups" USING btree ("slug");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "groups_created_by_idx" ON "groups" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "page_follows_uuid_idx" ON "page_follows" USING btree ("uuid");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "page_follows_page_id_idx" ON "page_follows" USING btree ("page_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "page_follows_userId_idx" ON "page_follows" USING btree ("userId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "page_likes_uuid_idx" ON "page_likes" USING btree ("uuid");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "page_likes_page_id_idx" ON "page_likes" USING btree ("page_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "page_likes_userId_idx" ON "page_likes" USING btree ("userId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "page_members_uuid_idx" ON "page_members" USING btree ("uuid");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "page_members_page_id_idx" ON "page_members" USING btree ("page_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "page_members_userId_idx" ON "page_members" USING btree ("userId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pages_uuid_idx" ON "pages" USING btree ("uuid");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pages_slug_idx" ON "pages" USING btree ("slug");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pages_created_by_idx" ON "pages" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "post_reactions_uuid_idx" ON "post_reactions" USING btree ("uuid");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "post_reactions_post_id_idx" ON "post_reactions" USING btree ("post_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "post_reactions_userId_idx" ON "post_reactions" USING btree ("userId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "posts_uuid_idx" ON "posts" USING btree ("uuid");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "posts_userId_idx" ON "posts" USING btree ("userId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "posts_group_id_idx" ON "posts" USING btree ("group_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "posts_page_id_idx" ON "posts" USING btree ("page_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "notifications_uuid_idx" ON "notifications" USING btree ("uuid");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "notifications_userId_idx" ON "notifications" USING btree ("userId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "notifications_is_read_idx" ON "notifications" USING btree ("is_read");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "job_applications_uuid_idx" ON "job_applications" USING btree ("uuid");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "job_applications_job_id_idx" ON "job_applications" USING btree ("job_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "job_applications_userId_idx" ON "job_applications" USING btree ("userId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "jobs_uuid_idx" ON "jobs" USING btree ("uuid");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "jobs_slug_idx" ON "jobs" USING btree ("slug");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "jobs_posted_by_idx" ON "jobs" USING btree ("posted_by");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "jobs_company_id_idx" ON "jobs" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "reports_uuid_idx" ON "reports" USING btree ("uuid");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "reports_reported_by_idx" ON "reports" USING btree ("reported_by");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "reports_reportable_idx" ON "reports" USING btree ("reportable_type","reportable_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ticket_replies_uuid_idx" ON "ticket_replies" USING btree ("uuid");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ticket_replies_ticket_id_idx" ON "ticket_replies" USING btree ("ticket_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ticket_replies_userId_idx" ON "ticket_replies" USING btree ("userId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tickets_uuid_idx" ON "tickets" USING btree ("uuid");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tickets_ticket_number_idx" ON "tickets" USING btree ("ticket_number");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tickets_userId_idx" ON "tickets" USING btree ("userId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tickets_assigned_to_idx" ON "tickets" USING btree ("assigned_to");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "media_library_uuid_idx" ON "media_library" USING btree ("uuid");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "media_library_uploaded_by_idx" ON "media_library" USING btree ("uploaded_by");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "media_library_mediable_idx" ON "media_library" USING btree ("mediable_type","mediable_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "media_library_temporary_idx" ON "media_library" USING btree ("is_temporary","temp_expires_at");