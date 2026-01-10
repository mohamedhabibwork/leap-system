CREATE TABLE IF NOT EXISTS "user_notification_preferences" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"user_id" bigserial NOT NULL,
	"email_enabled" boolean DEFAULT true NOT NULL,
	"push_enabled" boolean DEFAULT true NOT NULL,
	"websocket_enabled" boolean DEFAULT true NOT NULL,
	"notify_on_post_likes" boolean DEFAULT true NOT NULL,
	"notify_on_comments" boolean DEFAULT true NOT NULL,
	"notify_on_comment_replies" boolean DEFAULT true NOT NULL,
	"notify_on_shares" boolean DEFAULT true NOT NULL,
	"notify_on_friend_requests" boolean DEFAULT true NOT NULL,
	"notify_on_friend_request_accepted" boolean DEFAULT true NOT NULL,
	"notify_on_group_joins" boolean DEFAULT true NOT NULL,
	"notify_on_page_follows" boolean DEFAULT true NOT NULL,
	"notify_on_mentions" boolean DEFAULT true NOT NULL,
	"notify_on_event_invitations" boolean DEFAULT true NOT NULL,
	"categories" jsonb DEFAULT '{"social":{"email":true,"push":true,"websocket":true},"lms":{"email":true,"push":true,"websocket":true},"jobs":{"email":true,"push":true,"websocket":true},"events":{"email":true,"push":true,"websocket":true},"payments":{"email":true,"push":true,"websocket":true},"system":{"email":true,"push":true,"websocket":true}}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "user_notification_preferences_uuid_unique" UNIQUE("uuid"),
	CONSTRAINT "user_notification_preferences_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_notification_preferences" ADD CONSTRAINT "user_notification_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_notification_preferences_uuid_idx" ON "user_notification_preferences" USING btree ("uuid");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_notification_preferences_user_id_idx" ON "user_notification_preferences" USING btree ("user_id");