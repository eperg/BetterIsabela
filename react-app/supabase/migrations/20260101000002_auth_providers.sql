-- Mirrored from drizzle/0002_auth_providers.sql by scripts/supabase-migrations.mjs.
-- Edit the drizzle original, never this copy.

-- Identity is no longer eGov-only. Supabase Auth provides email registration so
-- citizens can sign in before the eGov SSO scope is available, and the two must
-- coexist: one person, one row, whichever provider they used.
--
-- `egov_sub` becomes `auth_subject` — the provider's stable identifier — and
-- `auth_provider` records which provider issued it. Uniqueness moves to the
-- pair, so the same subject string from two providers can never collide.

ALTER TABLE "users" RENAME COLUMN "egov_sub" TO "auth_subject";

ALTER TABLE "users"
  ADD COLUMN "auth_provider" varchar(32) NOT NULL DEFAULT 'egov';

DROP INDEX IF EXISTS "users_egov_sub_key";

CREATE UNIQUE INDEX "users_provider_subject_key"
  ON "users" ("auth_provider", "auth_subject");

-- An account may only be reached through the provider that created it.
ALTER TABLE "users"
  ADD CONSTRAINT "users_auth_provider_known"
  CHECK ("auth_provider" IN ('egov', 'supabase', 'dev'));
