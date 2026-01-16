CREATE TABLE IF NOT EXISTS "course_tags" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"course_id" bigserial NOT NULL,
	"tag_id" bigserial NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "course_tags_uuid_unique" UNIQUE("uuid"),
	CONSTRAINT "course_tags_unique" UNIQUE("course_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tags" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"description" text,
	"usage_count" integer DEFAULT 0,
	"isDeleted" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now(),
	"deletedAt" timestamp with time zone,
	CONSTRAINT "tags_uuid_unique" UNIQUE("uuid"),
	CONSTRAINT "tags_name_unique" UNIQUE("name"),
	CONSTRAINT "tags_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_current_subscription_id_subscriptions_id_fk";
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "current_subscription_id" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "current_subscription_id" DROP NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "course_tags" ADD CONSTRAINT "course_tags_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "course_tags" ADD CONSTRAINT "course_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "course_tags_uuid_idx" ON "course_tags" USING btree ("uuid");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "course_tags_course_id_idx" ON "course_tags" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "course_tags_tag_id_idx" ON "course_tags" USING btree ("tag_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tags_uuid_idx" ON "tags" USING btree ("uuid");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tags_slug_idx" ON "tags" USING btree ("slug");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tags_name_idx" ON "tags" USING btree ("name");