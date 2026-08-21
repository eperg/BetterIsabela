/**
 * Read queries. Server-only.
 *
 * Every list query filters on `status = 'published'` unless it is explicitly a
 * moderation view — hidden and removed content must never leak into a public
 * listing by omission.
 */
import 'server-only';
import { cache } from 'react';
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
  serviceReports,
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
  serviceReports: 'service-reports',
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
/**
 * Per-request memoised: generateMetadata and the page body both need the same
 * row, and React's cache() collapses that into one query per request. Not
 * unstable_cache — a detail page renders per request and must not serve a
 * stale row from a cross-request cache.
 */
export const getJob = cache(async (id: number) => {
  const rows = await db
    .select({ job: jobs, townName: towns.name })
    .from(jobs)
    .innerJoin(towns, eq(towns.slug, jobs.townSlug))
    .where(and(eq(jobs.id, id), eq(jobs.status, PUBLISHED)))
    .limit(1);
  return rows[0] ?? null;
});

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
/** Per-request memoised, see getJob. */
export const getListing = cache(async (id: number) => {
  const rows = await db
    .select({ listing: listings, townName: towns.name, sellerName: users.displayName })
    .from(listings)
    .innerJoin(towns, eq(towns.slug, listings.townSlug))
    .innerJoin(users, eq(users.id, listings.postedBy))
    .where(and(eq(listings.id, id), eq(listings.status, PUBLISHED)))
    .limit(1);
  return rows[0] ?? null;
});

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
/** Per-request memoised, see getJob. */
export const getQuestion = cache(async (id: number) => {
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
});

// ---------------------------------------------------------------------------
// Town progress
// ---------------------------------------------------------------------------

const listProjectsUncached = async (
  opts: { townSlug?: string; limit?: number; offset?: number } = {}
) => {
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
    // A bulk sync stamps every row with the same updated_at, which leaves the
    // sort order undefined, and an undefined order paginates by repeating some
    // rows and skipping others. The id breaks the tie.
    .orderBy(desc(projects.updatedAt), desc(projects.id))
    .limit(opts.limit ?? 50)
    .offset(opts.offset ?? 0);
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

/**
 * One row per town: how many projects, how many still running, and what they
 * cost together. The tracker holds thousands of contracts, far more than a page
 * can carry, so the province view is this breakdown rather than a list — and a
 * town's own page holds the projects themselves.
 *
 * Projects that cross municipal boundaries carry no town and are counted
 * separately by `projectsProvinceWide`, not silently dropped.
 */
const projectTownTotalsUncached = async () => {
  const rows = await db
    .select({
      townSlug: projects.townSlug,
      total: count(),
      ongoing: sql<number>`count(*) FILTER (WHERE ${projects.status} = 'ongoing')::int`,
      completed: sql<number>`count(*) FILTER (WHERE ${projects.status} = 'completed')::int`,
      costCentavos: sql<number | null>`sum(${projects.costCentavos})::bigint`,
    })
    .from(projects)
    .groupBy(projects.townSlug);
  return rows;
};

export const projectTownTotals = unstable_cache(projectTownTotalsUncached, ['projects:towns'], { tags: [TAGS.projects], revalidate: TTL.slow });

/** Contracts that span more than one municipality, so belong to no single town. */
const projectsProvinceWideUncached = async (limit = 40) =>
  db
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
    .where(isNull(projects.townSlug))
    .orderBy(desc(projects.costCentavos))
    .limit(limit);

export const projectsProvinceWide = unstable_cache(projectsProvinceWideUncached, ['projects:province'], { tags: [TAGS.projects], revalidate: TTL.slow });
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
/**
 * Per-request memoised, see getJob. The viewer's own rating is deliberately not
 * fetched here: it varies per user and would make the row uncacheable for the
 * metadata pass. Call getMyOfficialRating for that.
 */
export const getOfficial = cache(async (id: number) => {
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

  return { ...rows[0], reviews };
});

/** The signed-in viewer's own score for one official, or null if unrated. */
export async function getMyOfficialRating(officialId: number, viewerId: number) {
  const mine = await db
    .select({ score: officialRatings.score })
    .from(officialRatings)
    .where(and(eq(officialRatings.officialId, officialId), eq(officialRatings.userId, viewerId)))
    .limit(1);
  return mine[0]?.score ?? null;
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

// ---------------------------------------------------------------------------
// Citizen's Charter: what residents report against what the charter promises
// ---------------------------------------------------------------------------

export interface ServiceReportTally {
  serviceId: string;
  /** Count per wait bucket, for the median. */
  waits: Record<string, number>;
  total: number;
  succeeded: number;
  /** Median of what people actually paid, in centavos, or null if nobody said. */
  medianPaidCentavos: number | null;
}

/**
 * One tally per service, for every service anybody has reported on.
 *
 * Aggregated in SQL and cached: the charter index compares 52 services at once,
 * and doing that by fetching rows would be a query per service or a large read
 * per page view. Medians are taken over the enum's own ordering, which is why
 * the enum is declared quickest-first.
 */
const serviceReportTalliesUncached = async (): Promise<ServiceReportTally[]> => {
  const rows = await db
    .select({
      serviceId: serviceReports.serviceId,
      waited: serviceReports.waited,
      n: count(),
      succeeded: sql<number>`count(*) filter (where ${serviceReports.succeeded})`.mapWith(Number),
    })
    .from(serviceReports)
    .where(eq(serviceReports.status, PUBLISHED))
    .groupBy(serviceReports.serviceId, serviceReports.waited);

  const paid = await db
    .select({
      serviceId: serviceReports.serviceId,
      median:
        sql<number | null>`percentile_disc(0.5) within group (order by ${serviceReports.paidCentavos})`.mapWith(
          (v) => (v === null ? null : Number(v))
        ),
    })
    .from(serviceReports)
    .where(and(eq(serviceReports.status, PUBLISHED), sql`${serviceReports.paidCentavos} is not null`))
    .groupBy(serviceReports.serviceId);

  const medianById = new Map(paid.map((p) => [p.serviceId, p.median]));
  const byService = new Map<string, ServiceReportTally>();
  for (const row of rows) {
    const entry = byService.get(row.serviceId) ?? {
      serviceId: row.serviceId,
      waits: {},
      total: 0,
      succeeded: 0,
      medianPaidCentavos: medianById.get(row.serviceId) ?? null,
    };
    entry.waits[row.waited] = row.n;
    entry.total += row.n;
    entry.succeeded += row.succeeded;
    byService.set(row.serviceId, entry);
  }
  return [...byService.values()];
};

export const serviceReportTallies = unstable_cache(
  serviceReportTalliesUncached,
  ['service-reports:tallies'],
  { tags: [TAGS.serviceReports], revalidate: TTL.live }
);

/** The published notes for one service, newest first. */
const serviceReportNotesUncached = async (serviceId: string) =>
  db
    .select({
      id: serviceReports.id,
      waited: serviceReports.waited,
      paidCentavos: serviceReports.paidCentavos,
      succeeded: serviceReports.succeeded,
      note: serviceReports.note,
      createdAt: serviceReports.createdAt,
      townName: towns.name,
      authorName: users.displayName,
    })
    .from(serviceReports)
    .innerJoin(users, eq(users.id, serviceReports.userId))
    .leftJoin(towns, eq(towns.slug, serviceReports.townSlug))
    .where(and(eq(serviceReports.serviceId, serviceId), eq(serviceReports.status, PUBLISHED)))
    .orderBy(desc(serviceReports.createdAt))
    .limit(50);

export const serviceReportNotes = unstable_cache(
  serviceReportNotesUncached,
  ['service-reports:notes'],
  { tags: [TAGS.serviceReports], revalidate: TTL.live }
);

/** The reader's own report for one service, so the form can be pre-filled. */
export async function getMyServiceReport(serviceId: string, userId: number) {
  const rows = await db
    .select({
      waited: serviceReports.waited,
      paidCentavos: serviceReports.paidCentavos,
      succeeded: serviceReports.succeeded,
      townSlug: serviceReports.townSlug,
      note: serviceReports.note,
    })
    .from(serviceReports)
    .where(and(eq(serviceReports.serviceId, serviceId), eq(serviceReports.userId, userId)))
    .limit(1);
  return rows[0] ?? null;
}
