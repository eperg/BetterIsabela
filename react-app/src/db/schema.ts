/**
 * BetterIsabela database schema.
 *
 * Covers the six participation features: job board, buy & sell, Q&A board,
 * town progress tracker, officials directory with citizen ratings/reviews, and
 * the moderation machinery that all user-generated content depends on.
 *
 * Conventions
 * -----------
 * - Every user-generated table carries `status` so nothing is hard-deleted and
 *   a moderator decision is always reversible and auditable.
 * - `townSlug` references `towns.slug` — the 37 LGU slugs already in
 *   data/towns.json, seeded from the official provincial directory.
 * - Timestamps are `timestamptz`. Philippine local time is a presentation
 *   concern, never a storage one.
 * - Money is stored in centavos as an integer. Never float.
 */
import {
  pgTable,
  pgEnum,
  text,
  varchar,
  integer,
  bigint,
  boolean,
  timestamp,
  uniqueIndex,
  index,
  primaryKey,
  smallint,
  jsonb,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

/** Who may act. Citizens post; moderators triage; admins manage moderators. */
export const userRole = pgEnum('user_role', ['citizen', 'moderator', 'admin']);

/**
 * Lifecycle shared by every piece of user-generated content.
 * `published` is the default for post-moderated content; `pending` exists for
 * content types we choose to pre-moderate later without a migration.
 */
export const contentStatus = pgEnum('content_status', [
  'pending',
  'published',
  'hidden',
  'removed',
]);

export const jobType = pgEnum('job_type', [
  'full_time',
  'part_time',
  'contract',
  'seasonal',
  'internship',
  'volunteer',
]);

export const listingCondition = pgEnum('listing_condition', ['new', 'like_new', 'used', 'for_parts']);

export const projectStatus = pgEnum('project_status', [
  'proposed',
  'funded',
  'ongoing',
  'suspended',
  'completed',
  'cancelled',
]);

export const reportStatus = pgEnum('report_status', ['open', 'upheld', 'dismissed']);

/** What a report or moderation action points at. Kept as an enum so a typo
 *  cannot orphan a report against a table that does not exist. */
export const targetType = pgEnum('target_type', [
  'job',
  'listing',
  'question',
  'answer',
  'official_review',
  'user',
]);

// ---------------------------------------------------------------------------
// Reference data
// ---------------------------------------------------------------------------

/** The 37 cities and municipalities. Seeded from data/towns.json. */
export const towns = pgTable('towns', {
  slug: varchar('slug', { length: 64 }).primaryKey(),
  name: text('name').notNull(),
  lguType: varchar('lgu_type', { length: 32 }),
  incomeClass: varchar('income_class', { length: 32 }),
  barangays: integer('barangays'),
  population: integer('population'),
  households: integer('households'),
  landAreaHectares: integer('land_area_hectares'),
  censusYear: integer('census_year'),
  /** Bantay Presyo market name, when the DA monitors one here. */
  marketName: text('market_name'),
  officialUrl: text('official_url'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// Identity
// ---------------------------------------------------------------------------

/**
 * A citizen. Identity comes from an external provider — eGov SSO or Supabase
 * Auth — never a password stored here. `authProvider` plus `authSubject` is the
 * unique key, so the same subject string from two providers stays two people.
 */
export const users = pgTable(
  'users',
  {
    id: bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
    /** Stable identifier issued by whichever provider signed this person in. */
    authSubject: varchar('auth_subject', { length: 128 }).notNull(),
    /** 'egov' | 'supabase' | 'dev' — constrained in the migration. */
    authProvider: varchar('auth_provider', { length: 32 }).notNull().default('egov'),
    email: varchar('email', { length: 320 }),
    displayName: text('display_name').notNull(),
    /** Set when eVerify confirms the identity, not merely when SSO succeeds. */
    verifiedAt: timestamp('verified_at', { withTimezone: true }),
    role: userRole('role').notNull().default('citizen'),
    townSlug: varchar('town_slug', { length: 64 }).references(() => towns.slug),
    /** Populated on ban. A banned user keeps their content history for audit. */
    bannedAt: timestamp('banned_at', { withTimezone: true }),
    bannedReason: text('banned_reason'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    lastSeenAt: timestamp('last_seen_at', { withTimezone: true }),
  },
  (t) => [
    uniqueIndex('users_provider_subject_key').on(t.authProvider, t.authSubject),
    index('users_town_idx').on(t.townSlug),
  ]
);

/**
 * Server-side sessions. Deliberately not JWT: a moderator banning someone must
 * be able to revoke access immediately, which a stateless token cannot do.
 * The cookie carries only the random id.
 */
export const sessions = pgTable(
  'sessions',
  {
    id: varchar('id', { length: 64 }).primaryKey(),
    userId: bigint('user_id', { mode: 'number' })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    userAgent: text('user_agent'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('sessions_user_idx').on(t.userId), index('sessions_expiry_idx').on(t.expiresAt)]
);

// ---------------------------------------------------------------------------
// Job board
// ---------------------------------------------------------------------------

export const jobs = pgTable(
  'jobs',
  {
    id: bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
    townSlug: varchar('town_slug', { length: 64 })
      .notNull()
      .references(() => towns.slug),
    title: text('title').notNull(),
    employer: text('employer').notNull(),
    description: text('description').notNull(),
    type: jobType('type').notNull(),
    /** Centavos per month. Null where the employer does not disclose. */
    salaryMinCentavos: bigint('salary_min_centavos', { mode: 'number' }),
    salaryMaxCentavos: bigint('salary_max_centavos', { mode: 'number' }),
    contactName: text('contact_name'),
    contactPhone: varchar('contact_phone', { length: 32 }),
    contactEmail: varchar('contact_email', { length: 320 }),
    /** 'peso' for scraped PESO listings, 'user' for citizen submissions. */
    source: varchar('source', { length: 32 }).notNull().default('user'),
    sourceUrl: text('source_url'),
    postedBy: bigint('posted_by', { mode: 'number' }).references(() => users.id),
    status: contentStatus('status').notNull().default('published'),
    expiresAt: timestamp('expires_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('jobs_town_status_idx').on(t.townSlug, t.status),
    index('jobs_created_idx').on(t.createdAt),
    index('jobs_expiry_idx').on(t.expiresAt),
  ]
);

// ---------------------------------------------------------------------------
// Buy & sell
// ---------------------------------------------------------------------------

export const listings = pgTable(
  'listings',
  {
    id: bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
    townSlug: varchar('town_slug', { length: 64 })
      .notNull()
      .references(() => towns.slug),
    category: varchar('category', { length: 64 }).notNull(),
    title: text('title').notNull(),
    description: text('description').notNull(),
    priceCentavos: bigint('price_centavos', { mode: 'number' }),
    /** True for "make an offer" / barter listings, where price is absent. */
    negotiable: boolean('negotiable').notNull().default(false),
    condition: listingCondition('condition'),
    /** Blob/object-store keys, not data URIs. */
    images: jsonb('images').$type<string[]>().notNull().default(sql`'[]'::jsonb`),
    contactPhone: varchar('contact_phone', { length: 32 }),
    postedBy: bigint('posted_by', { mode: 'number' })
      .notNull()
      .references(() => users.id),
    status: contentStatus('status').notNull().default('published'),
    soldAt: timestamp('sold_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('listings_town_status_idx').on(t.townSlug, t.status),
    index('listings_category_idx').on(t.category),
    index('listings_created_idx').on(t.createdAt),
  ]
);

// ---------------------------------------------------------------------------
// Q&A board
// ---------------------------------------------------------------------------

export const questions = pgTable(
  'questions',
  {
    id: bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
    /** Null for province-wide questions. */
    townSlug: varchar('town_slug', { length: 64 }).references(() => towns.slug),
    category: varchar('category', { length: 64 }).notNull(),
    title: text('title').notNull(),
    body: text('body').notNull(),
    askedBy: bigint('asked_by', { mode: 'number' })
      .notNull()
      .references(() => users.id),
    status: contentStatus('status').notNull().default('published'),
    /** Set when an answer is marked as resolving the question. */
    resolvedAt: timestamp('resolved_at', { withTimezone: true }),
    answerCount: integer('answer_count').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('questions_town_status_idx').on(t.townSlug, t.status),
    index('questions_created_idx').on(t.createdAt),
  ]
);

export const answers = pgTable(
  'answers',
  {
    id: bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
    questionId: bigint('question_id', { mode: 'number' })
      .notNull()
      .references(() => questions.id, { onDelete: 'cascade' }),
    body: text('body').notNull(),
    answeredBy: bigint('answered_by', { mode: 'number' })
      .notNull()
      .references(() => users.id),
    /** True when posted by a verified LGU account, so it can be badged. */
    isOfficial: boolean('is_official').notNull().default(false),
    /** Marked by the asker or a moderator as the resolving answer. */
    isAccepted: boolean('is_accepted').notNull().default(false),
    status: contentStatus('status').notNull().default('published'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('answers_question_idx').on(t.questionId, t.status)]
);

// ---------------------------------------------------------------------------
// Town progress tracker
// ---------------------------------------------------------------------------

export const projects = pgTable(
  'projects',
  {
    id: bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
    townSlug: varchar('town_slug', { length: 64 }).references(() => towns.slug),
    title: text('title').notNull(),
    description: text('description'),
    category: varchar('category', { length: 64 }).notNull(),
    status: projectStatus('status').notNull(),
    /** 0-100. Null where the implementing agency publishes no percentage. */
    percentComplete: smallint('percent_complete'),
    costCentavos: bigint('cost_centavos', { mode: 'number' }),
    fundingSource: text('funding_source'),
    contractor: text('contractor'),
    startedOn: timestamp('started_on', { withTimezone: true }),
    targetOn: timestamp('target_on', { withTimezone: true }),
    completedOn: timestamp('completed_on', { withTimezone: true }),
    /** Every figure here must be traceable to a published record. */
    sourceName: text('source_name').notNull(),
    sourceUrl: text('source_url'),
    verifiedOn: timestamp('verified_on', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('projects_town_idx').on(t.townSlug),
    index('projects_status_idx').on(t.status),
  ]
);

// ---------------------------------------------------------------------------
// Officials, ratings and reviews
// ---------------------------------------------------------------------------

export const officials = pgTable(
  'officials',
  {
    id: bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
    /** Null for provincial-level officials (Governor, Board Members). */
    townSlug: varchar('town_slug', { length: 64 }).references(() => towns.slug),
    name: text('name').notNull(),
    position: text('position').notNull(),
    office: text('office'),
    photoUrl: text('photo_url'),
    termStart: timestamp('term_start', { withTimezone: true }),
    termEnd: timestamp('term_end', { withTimezone: true }),
    /** Officials are public record — every entry cites where it came from. */
    sourceUrl: text('source_url'),
    isCurrent: boolean('is_current').notNull().default(true),
    /** Denormalised for listing pages; recomputed on rating write. */
    ratingCount: integer('rating_count').notNull().default(0),
    ratingSum: integer('rating_sum').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('officials_town_idx').on(t.townSlug),
    index('officials_current_idx').on(t.isCurrent),
  ]
);

/**
 * One score per citizen per official, enforced by the primary key rather than
 * by application logic — the constraint is the anti-brigading mechanism.
 */
export const officialRatings = pgTable(
  'official_ratings',
  {
    officialId: bigint('official_id', { mode: 'number' })
      .notNull()
      .references(() => officials.id, { onDelete: 'cascade' }),
    userId: bigint('user_id', { mode: 'number' })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    /** 1-5, constrained in the migration. */
    score: smallint('score').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    primaryKey({ columns: [t.officialId, t.userId] }),
    index('official_ratings_official_idx').on(t.officialId),
  ]
);

/**
 * Free-text reviews of a named public official. Post-moderated by product
 * decision: published on write, taken down on an upheld report. That makes the
 * report queue and the audit log load-bearing rather than optional.
 */
export const officialReviews = pgTable(
  'official_reviews',
  {
    id: bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
    officialId: bigint('official_id', { mode: 'number' })
      .notNull()
      .references(() => officials.id, { onDelete: 'cascade' }),
    userId: bigint('user_id', { mode: 'number' })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    body: text('body').notNull(),
    status: contentStatus('status').notNull().default('published'),
    /** Denormalised count so the queue can sort by most-reported. */
    reportCount: integer('report_count').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('official_reviews_one_per_user').on(t.officialId, t.userId),
    index('official_reviews_status_idx').on(t.officialId, t.status),
    index('official_reviews_reports_idx').on(t.reportCount),
  ]
);

// ---------------------------------------------------------------------------
// Moderation
// ---------------------------------------------------------------------------

/** A citizen flagging content. One open report per user per target. */
export const reports = pgTable(
  'reports',
  {
    id: bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
    targetType: targetType('target_type').notNull(),
    targetId: bigint('target_id', { mode: 'number' }).notNull(),
    reason: varchar('reason', { length: 64 }).notNull(),
    details: text('details'),
    reportedBy: bigint('reported_by', { mode: 'number' })
      .notNull()
      .references(() => users.id),
    status: reportStatus('status').notNull().default('open'),
    resolvedBy: bigint('resolved_by', { mode: 'number' }).references(() => users.id),
    resolvedAt: timestamp('resolved_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('reports_one_open_per_user').on(t.targetType, t.targetId, t.reportedBy),
    index('reports_queue_idx').on(t.status, t.createdAt),
  ]
);

/**
 * Append-only record of every moderator action. Nothing in here is ever
 * updated or deleted: it is the answer to "who took this down, and why".
 */
export const moderationLog = pgTable(
  'moderation_log',
  {
    id: bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
    actorId: bigint('actor_id', { mode: 'number' })
      .notNull()
      .references(() => users.id),
    action: varchar('action', { length: 64 }).notNull(),
    targetType: targetType('target_type').notNull(),
    targetId: bigint('target_id', { mode: 'number' }).notNull(),
    reason: text('reason'),
    /** Snapshot of the content as it stood, so a takedown is reviewable. */
    snapshot: jsonb('snapshot'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('moderation_log_target_idx').on(t.targetType, t.targetId),
    index('moderation_log_actor_idx').on(t.actorId, t.createdAt),
  ]
);

/**
 * Per-user, per-action counters. Postgres rather than Redis for now: the write
 * volume of a provincial civic site does not justify another moving part, and
 * this keeps rate limits transactional with the write they guard.
 */
export const rateLimits = pgTable(
  'rate_limits',
  {
    userId: bigint('user_id', { mode: 'number' })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    action: varchar('action', { length: 64 }).notNull(),
    /** Start of the current fixed window. */
    windowStart: timestamp('window_start', { withTimezone: true }).notNull(),
    count: integer('count').notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.userId, t.action, t.windowStart] })]
);
