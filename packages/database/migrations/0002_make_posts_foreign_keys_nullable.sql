-- Make group_id and page_id nullable in posts table
-- First, set any invalid foreign key references to NULL (if any exist)
--> statement-breakpoint
UPDATE "posts" SET "group_id" = NULL WHERE "group_id" IS NOT NULL AND NOT EXISTS (SELECT 1 FROM "groups" WHERE "groups"."id" = "posts"."group_id");--> statement-breakpoint
UPDATE "posts" SET "page_id" = NULL WHERE "page_id" IS NOT NULL AND NOT EXISTS (SELECT 1 FROM "pages" WHERE "pages"."id" = "posts"."page_id");--> statement-breakpoint
ALTER TABLE "posts" ALTER COLUMN "group_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "posts" ALTER COLUMN "page_id" DROP NOT NULL;
