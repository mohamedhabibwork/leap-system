CREATE TABLE IF NOT EXISTS "sessions" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"user_id" bigserial NOT NULL,
	"session_token" varchar(255) NOT NULL,
	"access_token" text NOT NULL,
	"refresh_token" text NOT NULL,
	"keycloak_session_id" varchar(255),
	"expires_at" timestamp with time zone NOT NULL,
	"access_token_expires_at" timestamp with time zone NOT NULL,
	"refresh_token_expires_at" timestamp with time zone NOT NULL,
	"user_agent" text,
	"ip_address" varchar(45),
	"device_info" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_activity_at" timestamp with time zone DEFAULT now() NOT NULL,
	"remember_me" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sessions_uuid_unique" UNIQUE("uuid"),
	CONSTRAINT "sessions_session_token_unique" UNIQUE("session_token")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sessions_uuid_idx" ON "sessions" USING btree ("uuid");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sessions_user_id_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sessions_session_token_idx" ON "sessions" USING btree ("session_token");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sessions_keycloak_session_id_idx" ON "sessions" USING btree ("keycloak_session_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sessions_expires_at_idx" ON "sessions" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sessions_is_active_idx" ON "sessions" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sessions_last_activity_at_idx" ON "sessions" USING btree ("last_activity_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sessions_user_active_idx" ON "sessions" USING btree ("user_id","is_active");