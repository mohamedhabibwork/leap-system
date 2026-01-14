ALTER TABLE "course_resources" ALTER COLUMN "course_id" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "course_resources" ALTER COLUMN "section_id" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "course_resources" ALTER COLUMN "section_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "course_resources" ALTER COLUMN "lesson_id" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "course_resources" ALTER COLUMN "lesson_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "course_resources" ALTER COLUMN "resource_type_id" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "question_bank" ALTER COLUMN "course_id" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "question_bank" ALTER COLUMN "course_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "quiz_attempts" ALTER COLUMN "quiz_id" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "quiz_attempts" ALTER COLUMN "userId" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "quizzes" ALTER COLUMN "section_id" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "quizzes" ALTER COLUMN "lesson_id" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "quizzes" ALTER COLUMN "lesson_id" DROP NOT NULL;