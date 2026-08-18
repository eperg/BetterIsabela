-- Mirrored from drizzle/0001_constraints.sql by scripts/supabase-migrations.mjs.
-- Edit the drizzle original, never this copy.

-- Integrity rules the ORM schema cannot express.
-- These are the guarantees the application must never be able to violate,
-- so they live in the database rather than in a validation layer.

-- Ratings are 1-5. Anything else is a bug or an attack.
ALTER TABLE "official_ratings"
  ADD CONSTRAINT "official_ratings_score_range" CHECK ("score" BETWEEN 1 AND 5);

-- Progress is a percentage or unknown.
ALTER TABLE "projects"
  ADD CONSTRAINT "projects_percent_range"
  CHECK ("percent_complete" IS NULL OR "percent_complete" BETWEEN 0 AND 100);

-- Money is never negative, and a range is never inverted.
ALTER TABLE "jobs"
  ADD CONSTRAINT "jobs_salary_non_negative"
  CHECK (
    ("salary_min_centavos" IS NULL OR "salary_min_centavos" >= 0) AND
    ("salary_max_centavos" IS NULL OR "salary_max_centavos" >= 0)
  );

ALTER TABLE "jobs"
  ADD CONSTRAINT "jobs_salary_range_ordered"
  CHECK (
    "salary_min_centavos" IS NULL OR "salary_max_centavos" IS NULL
    OR "salary_min_centavos" <= "salary_max_centavos"
  );

ALTER TABLE "listings"
  ADD CONSTRAINT "listings_price_non_negative"
  CHECK ("price_centavos" IS NULL OR "price_centavos" >= 0);

ALTER TABLE "projects"
  ADD CONSTRAINT "projects_cost_non_negative"
  CHECK ("cost_centavos" IS NULL OR "cost_centavos" >= 0);

-- A listing must carry a price or be explicitly negotiable, so "free" and
-- "forgot to fill it in" are distinguishable.
ALTER TABLE "listings"
  ADD CONSTRAINT "listings_price_or_negotiable"
  CHECK ("price_centavos" IS NOT NULL OR "negotiable" = true);

-- Denormalised rating aggregates must stay self-consistent.
ALTER TABLE "officials"
  ADD CONSTRAINT "officials_rating_aggregate_sane"
  CHECK (
    "rating_count" >= 0 AND "rating_sum" >= 0
    AND "rating_sum" >= "rating_count"          -- min score is 1
    AND "rating_sum" <= "rating_count" * 5      -- max score is 5
  );

-- Content must not be empty after trimming.
ALTER TABLE "official_reviews"
  ADD CONSTRAINT "official_reviews_body_not_blank" CHECK (btrim("body") <> '');
ALTER TABLE "questions"
  ADD CONSTRAINT "questions_body_not_blank" CHECK (btrim("body") <> '');
ALTER TABLE "answers"
  ADD CONSTRAINT "answers_body_not_blank" CHECK (btrim("body") <> '');

-- A resolved report records who resolved it and when; an open one records neither.
ALTER TABLE "reports"
  ADD CONSTRAINT "reports_resolution_complete"
  CHECK (
    ("status" = 'open' AND "resolved_by" IS NULL AND "resolved_at" IS NULL)
    OR ("status" <> 'open' AND "resolved_by" IS NOT NULL AND "resolved_at" IS NOT NULL)
  );

-- Sessions must expire in the future when created; expired rows are swept.
ALTER TABLE "sessions"
  ADD CONSTRAINT "sessions_expiry_after_creation" CHECK ("expires_at" > "created_at");
