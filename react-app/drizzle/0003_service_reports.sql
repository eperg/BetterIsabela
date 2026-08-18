-- The Citizen's Charter states what a service should cost and how long it
-- should take. Nothing has ever recorded what it actually costs and how long it
-- actually takes, so the promise has never been measurable. This table is the
-- other half of that comparison, written by the people who queued.
--
-- One row per person per service, updated rather than appended: somebody who
-- transacts twice is correcting their report, not voting twice. Same shape as
-- official_ratings, for the same reason.

ALTER TYPE "target_type" ADD VALUE IF NOT EXISTS 'service_report';
--> statement-breakpoint

-- Declaration order is the sort order Postgres uses for the type, which is what
-- makes percentile_disc over this column a meaningful median. Quickest first;
-- `unresolved` last because a transaction that never completed is the worst
-- outcome rather than an absent one.
CREATE TYPE "service_wait" AS ENUM (
  'under_30m',
  '30m_1h',
  '1_3h',
  'same_day',
  '1_3d',
  '4_7d',
  'over_week',
  'unresolved'
);
--> statement-breakpoint

CREATE TABLE "service_reports" (
  "id" bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  -- References services.json, which ships with the app rather than living in
  -- the database. Writes check the id against the catalogue.
  "service_id" varchar(64) NOT NULL,
  "user_id" bigint NOT NULL REFERENCES "users" ("id") ON DELETE CASCADE,
  "town_slug" varchar(64) REFERENCES "towns" ("slug"),
  "waited" "service_wait" NOT NULL,
  -- Null where they did not say. Capped well above any real provincial fee so a
  -- fat-fingered entry cannot drag the median.
  "paid_centavos" bigint CHECK ("paid_centavos" IS NULL OR ("paid_centavos" >= 0 AND "paid_centavos" <= 10000000)),
  "succeeded" boolean NOT NULL,
  "note" text CHECK ("note" IS NULL OR length("note") <= 2000),
  "status" "content_status" NOT NULL DEFAULT 'published',
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);
--> statement-breakpoint

CREATE UNIQUE INDEX "service_reports_one_per_user"
  ON "service_reports" ("service_id", "user_id");
--> statement-breakpoint

CREATE INDEX "service_reports_service_idx"
  ON "service_reports" ("service_id", "status");
--> statement-breakpoint

-- Production tables are owned by `postgres` and read and written by a
-- least-privilege `betterisabela_app` role, which cannot create anything. This
-- migration therefore has to be applied as the owner, and the new table needs
-- the same grants every other table already has.
--
-- Guarded so the same file still applies to a local PGlite database, where that
-- role does not exist.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'betterisabela_app') THEN
    GRANT SELECT, INSERT, UPDATE, DELETE ON "service_reports" TO betterisabela_app;
  END IF;
END $$;
