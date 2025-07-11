CREATE TABLE "plans" (
	"id" varchar PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"price" integer,
	"billing_cycle" varchar,
	"max_classes" integer,
	"max_students" integer,
	"max_questions_per_month" integer,
	"max_games_per_month" integer,
	"max_storage_mb" integer,
	"features" jsonb,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "usage_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"action" varchar NOT NULL,
	"resource_type" varchar NOT NULL,
	"resource_id" varchar,
	"metadata" jsonb,
	"timestamp" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "plan_id" varchar DEFAULT 'free';--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "plan_status" varchar DEFAULT 'active';--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "subscription_id" varchar;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "current_period_start" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "current_period_end" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "monthly_usage" jsonb DEFAULT '{"questions":0,"games":0,"classes":0,"students":0,"storage":0}'::jsonb;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "usage_reset_date" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "data_retention_consent" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "marketing_consent" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "last_privacy_update" timestamp;--> statement-breakpoint
ALTER TABLE "usage_logs" ADD CONSTRAINT "usage_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;