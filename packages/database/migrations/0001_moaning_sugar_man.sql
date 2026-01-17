CREATE TABLE IF NOT EXISTS "search_queries" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"query" varchar(500) NOT NULL,
	"search_type" varchar(50),
	"userId" bigserial NOT NULL,
	"session_id" varchar(255),
	"ip_address" varchar(45),
	"user_agent" text,
	"result_count" bigint DEFAULT 0 NOT NULL,
	"metadata" jsonb,
	"searched_at" timestamp with time zone DEFAULT now() NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "search_queries_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
ALTER TABLE "enrollments" ALTER COLUMN "subscription_id" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "enrollments" ALTER COLUMN "subscription_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "mention_ids" jsonb;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "search_queries" ADD CONSTRAINT "search_queries_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "search_queries_uuid_idx" ON "search_queries" USING btree ("uuid");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "search_queries_query_idx" ON "search_queries" USING btree ("query");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "search_queries_userId_idx" ON "search_queries" USING btree ("userId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "search_queries_session_id_idx" ON "search_queries" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "search_queries_search_type_idx" ON "search_queries" USING btree ("search_type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "search_queries_searched_at_idx" ON "search_queries" USING btree ("searched_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "search_queries_query_searched_at_idx" ON "search_queries" USING btree ("query","searched_at");