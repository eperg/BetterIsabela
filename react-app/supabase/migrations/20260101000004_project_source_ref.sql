-- Mirrored from drizzle/0004_project_source_ref.sql by scripts/supabase-migrations.mjs.
-- Edit the drizzle original, never this copy.

-- The tracker could only ever be filled by hand. A project carried no
-- identifier from whoever published it, so `db:projects` had nothing to match a
-- second run against and deduped on the title string — which means a status or
-- a cost that changes upstream could never be brought in, only re-inserted.
--
-- An automated ingest needs a key the publisher owns. `source_ref` is that key,
-- namespaced by source (`dime:P01001928LZ`) so a second publisher cannot
-- collide with the first.
--
-- Null for the hand-written rows, which have no upstream record to point at.
-- Postgres treats nulls as distinct in a unique index, so any number of them
-- coexist under the constraint below.

ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "source_ref" varchar(64);
--> statement-breakpoint

CREATE UNIQUE INDEX IF NOT EXISTS "projects_source_ref_key"
  ON "projects" ("source_ref");
