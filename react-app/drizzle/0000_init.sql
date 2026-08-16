CREATE TYPE "public"."content_status" AS ENUM('pending', 'published', 'hidden', 'removed');--> statement-breakpoint
CREATE TYPE "public"."job_type" AS ENUM('full_time', 'part_time', 'contract', 'seasonal', 'internship', 'volunteer');--> statement-breakpoint
CREATE TYPE "public"."listing_condition" AS ENUM('new', 'like_new', 'used', 'for_parts');--> statement-breakpoint
CREATE TYPE "public"."project_status" AS ENUM('proposed', 'funded', 'ongoing', 'suspended', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."report_status" AS ENUM('open', 'upheld', 'dismissed');--> statement-breakpoint
CREATE TYPE "public"."target_type" AS ENUM('job', 'listing', 'question', 'answer', 'official_review', 'user');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('citizen', 'moderator', 'admin');--> statement-breakpoint
CREATE TABLE "answers" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "answers_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"question_id" bigint NOT NULL,
	"body" text NOT NULL,
	"answered_by" bigint NOT NULL,
	"is_official" boolean DEFAULT false NOT NULL,
	"is_accepted" boolean DEFAULT false NOT NULL,
	"status" "content_status" DEFAULT 'published' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "jobs" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "jobs_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"town_slug" varchar(64) NOT NULL,
	"title" text NOT NULL,
	"employer" text NOT NULL,
	"description" text NOT NULL,
	"type" "job_type" NOT NULL,
	"salary_min_centavos" bigint,
	"salary_max_centavos" bigint,
	"contact_name" text,
	"contact_phone" varchar(32),
	"contact_email" varchar(320),
	"source" varchar(32) DEFAULT 'user' NOT NULL,
	"source_url" text,
	"posted_by" bigint,
	"status" "content_status" DEFAULT 'published' NOT NULL,
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "listings" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "listings_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"town_slug" varchar(64) NOT NULL,
	"category" varchar(64) NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"price_centavos" bigint,
	"negotiable" boolean DEFAULT false NOT NULL,
	"condition" "listing_condition",
	"images" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"contact_phone" varchar(32),
	"posted_by" bigint NOT NULL,
	"status" "content_status" DEFAULT 'published' NOT NULL,
	"sold_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "moderation_log" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "moderation_log_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"actor_id" bigint NOT NULL,
	"action" varchar(64) NOT NULL,
	"target_type" "target_type" NOT NULL,
	"target_id" bigint NOT NULL,
	"reason" text,
	"snapshot" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "official_ratings" (
	"official_id" bigint NOT NULL,
	"user_id" bigint NOT NULL,
	"score" smallint NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "official_ratings_official_id_user_id_pk" PRIMARY KEY("official_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "official_reviews" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "official_reviews_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"official_id" bigint NOT NULL,
	"user_id" bigint NOT NULL,
	"body" text NOT NULL,
	"status" "content_status" DEFAULT 'published' NOT NULL,
	"report_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "officials" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "officials_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"town_slug" varchar(64),
	"name" text NOT NULL,
	"position" text NOT NULL,
	"office" text,
	"photo_url" text,
	"term_start" timestamp with time zone,
	"term_end" timestamp with time zone,
	"source_url" text,
	"is_current" boolean DEFAULT true NOT NULL,
	"rating_count" integer DEFAULT 0 NOT NULL,
	"rating_sum" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "projects_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"town_slug" varchar(64),
	"title" text NOT NULL,
	"description" text,
	"category" varchar(64) NOT NULL,
	"status" "project_status" NOT NULL,
	"percent_complete" smallint,
	"cost_centavos" bigint,
	"funding_source" text,
	"contractor" text,
	"started_on" timestamp with time zone,
	"target_on" timestamp with time zone,
	"completed_on" timestamp with time zone,
	"source_name" text NOT NULL,
	"source_url" text,
	"verified_on" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "questions" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "questions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"town_slug" varchar(64),
	"category" varchar(64) NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"asked_by" bigint NOT NULL,
	"status" "content_status" DEFAULT 'published' NOT NULL,
	"resolved_at" timestamp with time zone,
	"answer_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rate_limits" (
	"user_id" bigint NOT NULL,
	"action" varchar(64) NOT NULL,
	"window_start" timestamp with time zone NOT NULL,
	"count" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "rate_limits_user_id_action_window_start_pk" PRIMARY KEY("user_id","action","window_start")
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "reports_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"target_type" "target_type" NOT NULL,
	"target_id" bigint NOT NULL,
	"reason" varchar(64) NOT NULL,
	"details" text,
	"reported_by" bigint NOT NULL,
	"status" "report_status" DEFAULT 'open' NOT NULL,
	"resolved_by" bigint,
	"resolved_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"user_id" bigint NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "towns" (
	"slug" varchar(64) PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"lgu_type" varchar(32),
	"income_class" varchar(32),
	"barangays" integer,
	"population" integer,
	"households" integer,
	"land_area_hectares" integer,
	"census_year" integer,
	"market_name" text,
	"official_url" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"egov_sub" varchar(128) NOT NULL,
	"email" varchar(320),
	"display_name" text NOT NULL,
	"verified_at" timestamp with time zone,
	"role" "user_role" DEFAULT 'citizen' NOT NULL,
	"town_slug" varchar(64),
	"banned_at" timestamp with time zone,
	"banned_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_seen_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "answers" ADD CONSTRAINT "answers_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "answers" ADD CONSTRAINT "answers_answered_by_users_id_fk" FOREIGN KEY ("answered_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_town_slug_towns_slug_fk" FOREIGN KEY ("town_slug") REFERENCES "public"."towns"("slug") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_posted_by_users_id_fk" FOREIGN KEY ("posted_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listings" ADD CONSTRAINT "listings_town_slug_towns_slug_fk" FOREIGN KEY ("town_slug") REFERENCES "public"."towns"("slug") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listings" ADD CONSTRAINT "listings_posted_by_users_id_fk" FOREIGN KEY ("posted_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "moderation_log" ADD CONSTRAINT "moderation_log_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "official_ratings" ADD CONSTRAINT "official_ratings_official_id_officials_id_fk" FOREIGN KEY ("official_id") REFERENCES "public"."officials"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "official_ratings" ADD CONSTRAINT "official_ratings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "official_reviews" ADD CONSTRAINT "official_reviews_official_id_officials_id_fk" FOREIGN KEY ("official_id") REFERENCES "public"."officials"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "official_reviews" ADD CONSTRAINT "official_reviews_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "officials" ADD CONSTRAINT "officials_town_slug_towns_slug_fk" FOREIGN KEY ("town_slug") REFERENCES "public"."towns"("slug") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_town_slug_towns_slug_fk" FOREIGN KEY ("town_slug") REFERENCES "public"."towns"("slug") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_town_slug_towns_slug_fk" FOREIGN KEY ("town_slug") REFERENCES "public"."towns"("slug") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_asked_by_users_id_fk" FOREIGN KEY ("asked_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rate_limits" ADD CONSTRAINT "rate_limits_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_reported_by_users_id_fk" FOREIGN KEY ("reported_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_resolved_by_users_id_fk" FOREIGN KEY ("resolved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_town_slug_towns_slug_fk" FOREIGN KEY ("town_slug") REFERENCES "public"."towns"("slug") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "answers_question_idx" ON "answers" USING btree ("question_id","status");--> statement-breakpoint
CREATE INDEX "jobs_town_status_idx" ON "jobs" USING btree ("town_slug","status");--> statement-breakpoint
CREATE INDEX "jobs_created_idx" ON "jobs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "jobs_expiry_idx" ON "jobs" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "listings_town_status_idx" ON "listings" USING btree ("town_slug","status");--> statement-breakpoint
CREATE INDEX "listings_category_idx" ON "listings" USING btree ("category");--> statement-breakpoint
CREATE INDEX "listings_created_idx" ON "listings" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "moderation_log_target_idx" ON "moderation_log" USING btree ("target_type","target_id");--> statement-breakpoint
CREATE INDEX "moderation_log_actor_idx" ON "moderation_log" USING btree ("actor_id","created_at");--> statement-breakpoint
CREATE INDEX "official_ratings_official_idx" ON "official_ratings" USING btree ("official_id");--> statement-breakpoint
CREATE UNIQUE INDEX "official_reviews_one_per_user" ON "official_reviews" USING btree ("official_id","user_id");--> statement-breakpoint
CREATE INDEX "official_reviews_status_idx" ON "official_reviews" USING btree ("official_id","status");--> statement-breakpoint
CREATE INDEX "official_reviews_reports_idx" ON "official_reviews" USING btree ("report_count");--> statement-breakpoint
CREATE INDEX "officials_town_idx" ON "officials" USING btree ("town_slug");--> statement-breakpoint
CREATE INDEX "officials_current_idx" ON "officials" USING btree ("is_current");--> statement-breakpoint
CREATE INDEX "projects_town_idx" ON "projects" USING btree ("town_slug");--> statement-breakpoint
CREATE INDEX "projects_status_idx" ON "projects" USING btree ("status");--> statement-breakpoint
CREATE INDEX "questions_town_status_idx" ON "questions" USING btree ("town_slug","status");--> statement-breakpoint
CREATE INDEX "questions_created_idx" ON "questions" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "reports_one_open_per_user" ON "reports" USING btree ("target_type","target_id","reported_by");--> statement-breakpoint
CREATE INDEX "reports_queue_idx" ON "reports" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "sessions_user_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "sessions_expiry_idx" ON "sessions" USING btree ("expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "users_egov_sub_key" ON "users" USING btree ("egov_sub");--> statement-breakpoint
CREATE INDEX "users_town_idx" ON "users" USING btree ("town_slug");