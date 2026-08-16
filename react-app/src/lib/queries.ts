/**
 * Read queries. Server-only.
 *
 * Every list query filters on `status = 'published'` unless it is explicitly a
 * moderation view — hidden and removed content must never leak into a public
 * listing by omission.
 */
import 'server-only';
import { unstable_cache } from 'next/cache';
import { and, desc, eq, gt, isNull, or, sql, count } from 'drizzle-orm';
import { db } from '@/db';
import {
  towns,
  users,
  jobs,
  listings,
  questions,
  answers,
  projects,
  officials,
  officialReviews,
  officialRatings,
  reports,
} from '@/db/schema';

const PUBLISHED = 'published' as const;

/**
 * Cache tags. A page can be dynamic — because it reads searchParams for
 * filtering — and still avoid touching Postgres on every request: the render is
 * cheap, the query result is cached, and a write invalidates it by tag.
 *
 * Tags are per-entity so posting a job does not evict the officials list.
 */
export const TAGS = {
  towns: 'towns',
  jobs: 'jobs',
  listings: 'listings',
  questions: 'questions',
  projects: 'projects',
  officials: 'officials',
} as const;

/** How long a cached read may serve before it is refreshed anyway. */
const TTL = {
  reference: 86_400, // towns: fixed between deploys
  slow: 900, // projects, officials: curated, changes rarely
  live: 300, // jobs, listings, questions: user-generated
} as const;

/** Items shown in each homepage panel. */
export const SNIPPET_LIMIT = 3;

// ---------------------------------------------------------------------------
// Towns
// ---------------------------------------------------------------------------

export const listTowns = unstable_cache(
  async () => db.select().from(towns).orderBy(towns.name),
  ['towns:all'],
  { tags: [TAGS.towns], revalidate: TTL.reference }
);

export async function getTown(slug: string) {
  const rows = await db.select().from(towns).where(eq(towns.slug, slug)).limit(1);
  return rows[0] ?? null;
}

// ---------------------------------------------------------------------------
// Jobs
// ---------------------------------------------------------------------------

/** Live jobs only: published, and not past their expiry. */
const jobIsLive = and(
  eq(jobs.status, PUBLISHED),
  or(isNull(jobs.expiresAt), gt(jobs.expiresAt, sql`now()`))
);

const listJobsUncached = async (opts: { townSlug?: string; limit?: number } = {}) => {
  const where = opts.townSlug ? and(jobIsLive, eq(jobs.townSlug, opts.townSlug)) : jobIsLive;
  return db
    .select({
      id: jobs.id,
      title: jobs.title,
      employer: jobs.employer,
      type: jobs.type,
      townSlug: jobs.townSlug,
      townName: towns.name,
      salaryMinCentavos: jobs.salaryMinCentavos,
      salaryMaxCentavos: jobs.salaryMaxCentavos,
      createdAt: jobs.createdAt,
    })
    .from(jobs)
    .innerJoin(towns, eq(towns.slug, jobs.townSlug))
    .where(where)
    .orderBy(desc(jobs.createdAt))
    .limit(opts.limit ?? 50);
};

export const listJobs = unstable_cache(listJobsUncached, ['jobs:list'], { tags: [TAGS.jobs], revalidate: TTL.live });
export async function getJob(id: number) {
  const rows = await db
    .select({ job: jobs, townName: towns.name })
    .from(jobs)
    .innerJoin(towns, eq(towns.slug, jobs.townSlug))
    .where(and(eq(jobs.id, id), eq(jobs.status, PUBLISHED)))
    .limit(1);
  return rows[0] ?? null;
}

// ---------------------------------------------------------------------------
// Buy & sell
// ---------------------------------------------------------------------------

const listListingsUncached = async (opts: { townSlug?: string; category?: string; limit?: number } = {}) => {
  const clauses = [eq(listings.status, PUBLISHED), isNull(listings.soldAt)];
  if (opts.townSlug) clauses.push(eq(listings.townSlug, opts.townSlug));
  if (opts.category) clauses.push(eq(listings.category, opts.category));

  return db
    .select({
      id: listings.id,
      title: listings.title,
      category: listings.category,
      priceCentavos: listings.priceCentavos,
      negotiable: listings.negotiable,
      condition: listings.condition,
      townSlug: listings.townSlug,
      townName: towns.name,
      createdAt: listings.createdAt,
      sellerName: users.displayName,
    })
    .from(listings)
    .innerJoin(towns, eq(towns.slug, listings.townSlug))
    .innerJoin(users, eq(users.id, listings.postedBy))
    .where(and(...clauses))
    .orderBy(desc(listings.createdAt))
    .limit(opts.limit ?? 50);
};

export const listListings = unstable_cache(listListingsUncached, ['listings:list'], { tags: [TAGS.listings], revalidate: TTL.live });
export async function getListing(id: number) {
  const rows = await db
    .select({ listing: listings, townName: towns.name, sellerName: users.displayName })
    .from(listings)
    .innerJoin(towns, eq(towns.slug, listings.townSlug))
    .innerJoin(users, eq(users.id, listings.postedBy))
    .where(and(eq(listings.id, id), eq(listings.status, PUBLISHED)))
    .limit(1);
  return rows[0] ?? null;
}

const listingCategoriesUncached = async () => {
  return db
    .select({ category: listings.category, n: count() })
    .from(listings)
    .where(and(eq(listings.status, PUBLISHED), isNull(listings.soldAt)))
    .groupBy(listings.category)
    .orderBy(desc(count()));
};

export const listingCategories = unstable_cache(listingCategoriesUncached, ['listings:categories'], { tags: [TAGS.listings], revalidate: TTL.live });
// ---------------------------------------------------------------------------
// Q&A
// ---------------------------------------------------------------------------

const listQuestionsUncached = async (opts: { townSlug?: string; limit?: number } = {}) => {
  const clauses = [eq(questions.status, PUBLISHED)];
  if (opts.townSlug) clauses.push(eq(questions.townSlug, opts.townSlug));

  return db
    .select({
      id: questions.id,
      title: questions.title,
      category: questions.category,
      townSlug: questions.townSlug,
      answerCount: questions.answerCount,
      resolvedAt: questions.resolvedAt,
      createdAt: questions.createdAt,
      askerName: users.displayName,
    })
    .from(questions)
    .innerJoin(users, eq(users.id, questions.askedBy))
    .where(and(...clauses))
    .orderBy(desc(questions.createdAt))
    .limit(opts.limit ?? 50);
};

export const listQuestions = unstable_cache(listQuestionsUncached, ['questions:list'], { tags: [TAGS.questions], revalidate: TTL.live });
export async function getQuestion(id: number) {
  const rows = await db
    .select({ question: questions, askerName: users.displayName })
    .from(questions)
    .innerJoin(users, eq(users.id, questions.askedBy))
    .where(and(eq(questions.id, id), eq(questions.status, PUBLISHED)))
    .limit(1);
  if (!rows[0]) return null;

  const replies = await db
    .select({
      id: answers.id,
      body: answers.body,
      isOfficial: answers.isOfficial,
      isAccepted: answers.isAccepted,
      createdAt: answers.createdAt,
      authorName: users.displayName,
    })
    .from(answers)
    .innerJoin(users, eq(users.id, answers.answeredBy))
    .where(and(eq(answers.questionId, id), eq(answers.status, PUBLISHED)))
    .orderBy(desc(answers.isAccepted), answers.createdAt);

  return { ...rows[0], answers: replies };
}

// ---------------------------------------------------------------------------
// Town progress
// ---------------------------------------------------------------------------

const listProjectsUncached = async (opts: { townSlug?: string; limit?: number } = {}) => {
  const where = opts.townSlug ? eq(projects.townSlug, opts.townSlug) : undefined;
  return db
    .select({
      id: projects.id,
      title: projects.title,
      description: projects.description,
      category: projects.category,
      status: projects.status,
      percentComplete: projects.percentComplete,
      costCentavos: projects.costCentavos,
      townSlug: projects.townSlug,
      sourceName: projects.sourceName,
      sourceUrl: projects.sourceUrl,
      targetOn: projects.targetOn,
    })
    .from(projects)
    .where(where)
    .orderBy(desc(projects.updatedAt))
    .limit(opts.limit ?? 50);
};

export const listProjects = unstable_cache(listProjectsUncached, ['projects:list'], { tags: [TAGS.projects], revalidate: TTL.slow });
/** Counts by status, for the tracker's summary strip. */
const projectSummaryUncached = async (townSlug?: string) => {
  const rows = await db
    .select({ status: projects.status, n: count() })
    .from(projects)
    .where(townSlug ? eq(projects.townSlug, townSlug) : undefined)
    .groupBy(projects.status);
  return rows;
};

export const projectSummary = unstable_cache(projectSummaryUncached, ['projects:summary'], { tags: [TAGS.projects], revalidate: TTL.slow });
// ---------------------------------------------------------------------------
// Officials
// ---------------------------------------------------------------------------

const listOfficialsUncached = async (opts: { townSlug?: string | null; limit?: number } = {}) => {
  const clauses = [eq(officials.isCurrent, true)];
  if (opts.townSlug === null) clauses.push(isNull(officials.townSlug));
  else if (opts.townSlug) clauses.push(eq(officials.townSlug, opts.townSlug));

  return db
    .select({
      id: officials.id,
      name: officials.name,
      position: officials.position,
      office: officials.office,
      townSlug: officials.townSlug,
      townName: towns.name,
      ratingCount: officials.ratingCount,
      ratingSum: officials.ratingSum,
    })
    .from(officials)
    .leftJoin(towns, eq(towns.slug, officials.townSlug))
    .where(and(...clauses))
    .orderBy(officials.position, officials.name)
    .limit(opts.limit ?? 200);
};

export const listOfficials = unstable_cache(listOfficialsUncached, ['officials:list'], { tags: [TAGS.officials], revalidate: TTL.slow });
export async function getOfficial(id: number, viewerId?: number) {
  const rows = await db
    .select({ official: officials, townName: towns.name })
    .from(officials)
    .leftJoin(towns, eq(towns.slug, officials.townSlug))
    .where(eq(officials.id, id))
    .limit(1);
  if (!rows[0]) return null;

  const reviews = await db
    .select({
      id: officialReviews.id,
      body: officialReviews.body,
      createdAt: officialReviews.createdAt,
      authorName: users.displayName,
      authorId: users.id,
    })
    .from(officialReviews)
    .innerJoin(users, eq(users.id, officialReviews.userId))
    .where(and(eq(officialReviews.officialId, id), eq(officialReviews.status, PUBLISHED)))
    .orderBy(desc(officialReviews.createdAt))
    .limit(100);

  let myRating: number | null = null;
  if (viewerId) {
    const mine = await db
      .select({ score: officialRatings.score })
      .from(officialRatings)
      .where(and(eq(officialRatings.officialId, id), eq(officialRatings.userId, viewerId)))
      .limit(1);
    myRating = mine[0]?.score ?? null;
  }

  return { ...rows[0], reviews, myRating };
}

// ---------------------------------------------------------------------------
// Moderation
// ---------------------------------------------------------------------------

export async function openReports(limit = 100) {
  return db
    .select({
      id: reports.id,
      targetType: reports.targetType,
      targetId: reports.targetId,
      reason: reports.reason,
      details: reports.details,
      createdAt: reports.createdAt,
      reporterName: users.displayName,
    })
    .from(reports)
    .innerJoin(users, eq(users.id, reports.reportedBy))
    .where(eq(reports.status, 'open'))
    .orderBy(desc(reports.createdAt))
    .limit(limit);
}

// ---------------------------------------------------------------------------
// Homepage snippets
// ---------------------------------------------------------------------------

/**
 * Everything the homepage needs, in one round of parallel queries.
 *
 * Each query is settled independently: a database problem should cost the panel
 * that needed it, not the whole page. `degraded` tells the view to say so
 * plainly rather than render an empty panel that looks like "no content yet".
 */
export async function homepageSnippets() {
  const settled = await Promise.allSettled([
      listJobs({ limit: SNIPPET_LIMIT }),
      listListings({ limit: SNIPPET_LIMIT }),
      listQuestions({ limit: SNIPPET_LIMIT }),
      listProjects({ limit: SNIPPET_LIMIT }),
      // Rated officials first, then provincial ones, so the panel is never sparse
      // just because nobody has voted yet.
      db
        .select({
          id: officials.id,
          name: officials.name,
          position: officials.position,
          townName: towns.name,
          ratingCount: officials.ratingCount,
          ratingSum: officials.ratingSum,
        })
        .from(officials)
        .leftJoin(towns, eq(towns.slug, officials.townSlug))
        .where(eq(officials.isCurrent, true))
        .orderBy(
          desc(sql`${officials.ratingCount} > 0`),
          desc(sql`${officials.ratingSum}::numeric / NULLIF(${officials.ratingCount},0)`),
          desc(sql`${officials.townSlug} IS NULL`),
          officials.name
        )
        .limit(SNIPPET_LIMIT),
      db
        .select({
          jobs: sql<number>`(SELECT count(*) FROM ${jobs} WHERE status='published')`,
          listings: sql<number>`(SELECT count(*) FROM ${listings} WHERE status='published' AND sold_at IS NULL)`,
          questions: sql<number>`(SELECT count(*) FROM ${questions} WHERE status='published')`,
          projects: sql<number>`(SELECT count(*) FROM ${projects})`,
          officials: sql<number>`(SELECT count(*) FROM ${officials} WHERE is_current)`,
        })
        .from(sql`(SELECT 1) AS one`),
    ]);

  const failures = settled.filter((r) => r.status === 'rejected');
  if (failures.length) {
    console.error(
      `homepage: ${failures.length} of ${settled.length} queries failed`,
      (failures[0] as PromiseRejectedResult).reason
    );
    // The homepage is prerendered, so every render of it is either the build or
    // an ISR revalidation. Swallowing a failure here would bake a hollow page
    // and serve it to everyone for the whole window. Throwing is safer in both
    // cases: the build stops loudly, and a failed revalidation makes Next keep
    // serving the last good copy.
    throw new AggregateError(
      failures.map((f) => (f as PromiseRejectedResult).reason),
      `homepage: ${failures.length} of ${settled.length} queries failed`
    );
  }
  const value = <T>(i: number, fallback: T): T =>
    settled[i].status === 'fulfilled' ? ((settled[i] as PromiseFulfilledResult<T>).value as T) : fallback;

  const counts = value<{ jobs: number; listings: number; questions: number; projects: number; officials: number }[]>(5, []);

  return {
    jobs: value<Awaited<ReturnType<typeof listJobs>>>(0, []),
    listings: value<Awaited<ReturnType<typeof listListings>>>(1, []),
    questions: value<Awaited<ReturnType<typeof listQuestions>>>(2, []),
    projects: value<Awaited<ReturnType<typeof listProjects>>>(3, []),
    officials: value<{ id: number; name: string; position: string; townName: string | null; ratingCount: number; ratingSum: number }[]>(4, []),
    counts: counts[0] ?? { jobs: 0, listings: 0, questions: 0, projects: 0, officials: 0 },
  };
}
