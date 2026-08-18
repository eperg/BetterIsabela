'use server';

/**
 * Write paths.
 *
 * Every action follows the same order, and the order matters:
 *
 *   1. authenticate  — requireUser() / requireModerator()
 *   2. validate      — zod, before anything touches the database
 *   3. rate limit    — consume() is transactional with the write it guards
 *   4. write
 *   5. revalidate    — so the reader sees their own write immediately
 *
 * Actions return a discriminated result rather than throwing, because these are
 * bound to forms and the message has to reach the citizen who typed it.
 */
import { revalidatePath, revalidateTag } from 'next/cache';
import { and, eq, sql } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/db';
import {
  jobs,
  listings,
  questions,
  answers,
  officials,
  officialRatings,
  officialReviews,
  reports,
  moderationLog,
} from '@/db/schema';
import { requireUser, requireModerator } from '@/lib/session';
import { TAGS } from '@/lib/queries';
import { consume, RateLimited, type LimitedAction } from '@/lib/rate-limit';

export type ActionResult =
  | { ok: true; id?: number }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

/** Wraps an action so auth, validation and limit failures become messages. */
async function run(
  action: LimitedAction | null,
  fn: (userId: number) => Promise<ActionResult>
): Promise<ActionResult> {
  try {
    const user = await requireUser();
    if (action) await consume(user.id, action);
    return await fn(user.id);
  } catch (error) {
    if (error instanceof RateLimited) {
      const hours = Math.ceil(error.retryAfterSeconds / 3600);
      return { ok: false, error: `You have reached today's limit. Try again in about ${hours}h.` };
    }
    if (error instanceof Error && error.message === 'UNAUTHENTICATED') {
      return { ok: false, error: 'Please sign in first.' };
    }
    if (error instanceof Error && error.message === 'FORBIDDEN') {
      return { ok: false, error: 'You do not have permission to do that.' };
    }
    console.error('action failed', error);
    return { ok: false, error: 'Something went wrong. Please try again.' };
  }
}

function invalid(parsed: z.ZodSafeParseResult<unknown>): ActionResult {
  const flat = z.flattenError(parsed.error as z.ZodError);
  return { ok: false, error: 'Please check the highlighted fields.', fieldErrors: flat.fieldErrors as Record<string, string[]> };
}

/** Peso string ("1,500.50") to centavos. Avoids float arithmetic on money. */
function toCentavos(value: FormDataEntryValue | null): number | null {
  if (value == null || String(value).trim() === '') return null;
  const cleaned = String(value).replace(/[^0-9.]/g, '');
  if (!cleaned) return null;
  return Math.round(Number(cleaned) * 100);
}

const nonEmpty = (max: number) => z.string().trim().min(1).max(max);

// ---------------------------------------------------------------------------
// Jobs
// ---------------------------------------------------------------------------

const jobSchema = z.object({
  townSlug: nonEmpty(64),
  title: nonEmpty(160),
  employer: nonEmpty(160),
  description: nonEmpty(5000),
  type: z.enum(['full_time', 'part_time', 'contract', 'seasonal', 'internship', 'volunteer']),
  contactName: z.string().trim().max(160).optional(),
  contactPhone: z.string().trim().max(32).optional(),
  contactEmail: z.union([z.string().trim().email().max(320), z.literal('')]).optional(),
  salaryMinCentavos: z.number().int().nonnegative().nullable(),
  salaryMaxCentavos: z.number().int().nonnegative().nullable(),
});

export async function postJob(form: FormData): Promise<ActionResult> {
  return run('post_job', async (userId) => {
    const parsed = jobSchema.safeParse({
      townSlug: form.get('townSlug'),
      title: form.get('title'),
      employer: form.get('employer'),
      description: form.get('description'),
      type: form.get('type'),
      contactName: form.get('contactName') ?? undefined,
      contactPhone: form.get('contactPhone') ?? undefined,
      contactEmail: form.get('contactEmail') ?? undefined,
      salaryMinCentavos: toCentavos(form.get('salaryMin')),
      salaryMaxCentavos: toCentavos(form.get('salaryMax')),
    });
    if (!parsed.success) return invalid(parsed);
    const d = parsed.data;

    if (d.salaryMinCentavos != null && d.salaryMaxCentavos != null &&
        d.salaryMinCentavos > d.salaryMaxCentavos) {
      return { ok: false, error: 'The minimum salary is higher than the maximum.' };
    }

    const [row] = await db
      .insert(jobs)
      .values({
        townSlug: d.townSlug,
        title: d.title,
        employer: d.employer,
        description: d.description,
        type: d.type,
        salaryMinCentavos: d.salaryMinCentavos,
        salaryMaxCentavos: d.salaryMaxCentavos,
        contactName: d.contactName || null,
        contactPhone: d.contactPhone || null,
        contactEmail: d.contactEmail || null,
        source: 'user',
        postedBy: userId,
        // Job posts go stale fast; expire them rather than leaving ghosts up.
        expiresAt: new Date(Date.now() + 60 * 86_400_000),
      })
      .returning({ id: jobs.id });

    revalidateTag(TAGS.jobs);
    revalidatePath('/jobs');
    revalidatePath('/');
    return { ok: true, id: row.id };
  });
}

// ---------------------------------------------------------------------------
// Buy & sell
// ---------------------------------------------------------------------------

const listingSchema = z.object({
  townSlug: nonEmpty(64),
  category: nonEmpty(64),
  title: nonEmpty(160),
  description: nonEmpty(5000),
  condition: z.enum(['new', 'like_new', 'used', 'for_parts']).nullable(),
  contactPhone: z.string().trim().max(32).optional(),
  priceCentavos: z.number().int().nonnegative().nullable(),
  negotiable: z.boolean(),
});

export async function postListing(form: FormData): Promise<ActionResult> {
  return run('post_listing', async (userId) => {
    const conditionRaw = String(form.get('condition') ?? '');
    const parsed = listingSchema.safeParse({
      townSlug: form.get('townSlug'),
      category: form.get('category'),
      title: form.get('title'),
      description: form.get('description'),
      condition: conditionRaw === '' ? null : conditionRaw,
      contactPhone: form.get('contactPhone') ?? undefined,
      priceCentavos: toCentavos(form.get('price')),
      negotiable: form.get('negotiable') === 'on',
    });
    if (!parsed.success) return invalid(parsed);
    const d = parsed.data;

    // Mirrors the listings_price_or_negotiable CHECK, so the citizen gets a
    // sentence instead of a constraint violation.
    if (d.priceCentavos == null && !d.negotiable) {
      return { ok: false, error: 'Give a price, or tick "open to offers".' };
    }

    const [row] = await db
      .insert(listings)
      .values({
        townSlug: d.townSlug,
        category: d.category,
        title: d.title,
        description: d.description,
        priceCentavos: d.priceCentavos,
        negotiable: d.negotiable,
        condition: d.condition,
        contactPhone: d.contactPhone || null,
        postedBy: userId,
      })
      .returning({ id: listings.id });

    revalidateTag(TAGS.listings);
    revalidatePath('/market');
    revalidatePath('/');
    return { ok: true, id: row.id };
  });
}

export async function markListingSold(form: FormData): Promise<ActionResult> {
  return run(null, async (userId) => {
    const id = Number(form.get('id'));
    if (!Number.isInteger(id)) return { ok: false, error: 'Unknown listing.' };

    const result = await db
      .update(listings)
      .set({ soldAt: new Date(), updatedAt: new Date() })
      .where(and(eq(listings.id, id), eq(listings.postedBy, userId)))
      .returning({ id: listings.id });

    if (!result.length) return { ok: false, error: 'That is not your listing.' };
    revalidatePath('/market');
    // The listing page is cached now, so "sold" would otherwise sit invisible
    // on it until the window expired.
    revalidatePath(`/market/${id}`);
    return { ok: true, id };
  });
}

// ---------------------------------------------------------------------------
// Q&A
// ---------------------------------------------------------------------------

const questionSchema = z.object({
  townSlug: z.string().trim().max(64).nullable(),
  category: nonEmpty(64),
  title: nonEmpty(200),
  body: nonEmpty(5000),
});

export async function askQuestion(form: FormData): Promise<ActionResult> {
  return run('ask_question', async (userId) => {
    const town = String(form.get('townSlug') ?? '');
    const parsed = questionSchema.safeParse({
      townSlug: town === '' ? null : town,
      category: form.get('category'),
      title: form.get('title'),
      body: form.get('body'),
    });
    if (!parsed.success) return invalid(parsed);

    const [row] = await db
      .insert(questions)
      .values({ ...parsed.data, askedBy: userId })
      .returning({ id: questions.id });

    revalidateTag(TAGS.questions);
    revalidatePath('/ask');
    revalidatePath('/');
    return { ok: true, id: row.id };
  });
}

export async function postAnswer(form: FormData): Promise<ActionResult> {
  return run('post_answer', async (userId) => {
    const questionId = Number(form.get('questionId'));
    const body = z.string().trim().min(1).max(5000).safeParse(form.get('body'));
    if (!Number.isInteger(questionId)) return { ok: false, error: 'Unknown question.' };
    if (!body.success) return { ok: false, error: 'Write an answer first.' };

    // Insert and bump the denormalised count together, so a failure leaves
    // neither behind.
    const id = await db.transaction(async (tx) => {
      const [row] = await tx
        .insert(answers)
        .values({ questionId, body: body.data, answeredBy: userId })
        .returning({ id: answers.id });
      await tx
        .update(questions)
        .set({ answerCount: sql`${questions.answerCount} + 1`, updatedAt: new Date() })
        .where(eq(questions.id, questionId));
      return row.id;
    });

    revalidateTag(TAGS.questions);
    revalidatePath(`/ask/${questionId}`);
    return { ok: true, id };
  });
}

// ---------------------------------------------------------------------------
// Officials — ratings and reviews
// ---------------------------------------------------------------------------

export async function rateOfficial(form: FormData): Promise<ActionResult> {
  return run('rate_official', async (userId) => {
    const officialId = Number(form.get('officialId'));
    const score = Number(form.get('score'));
    if (!Number.isInteger(officialId)) return { ok: false, error: 'Unknown official.' };
    if (!Number.isInteger(score) || score < 1 || score > 5) {
      return { ok: false, error: 'Choose a score from 1 to 5.' };
    }

    await db.transaction(async (tx) => {
      const existing = await tx
        .select({ score: officialRatings.score })
        .from(officialRatings)
        .where(and(eq(officialRatings.officialId, officialId), eq(officialRatings.userId, userId)))
        .limit(1);

      if (existing[0]) {
        const delta = score - existing[0].score;
        await tx
          .update(officialRatings)
          .set({ score, updatedAt: new Date() })
          .where(
            and(eq(officialRatings.officialId, officialId), eq(officialRatings.userId, userId))
          );
        await tx
          .update(officials)
          .set({ ratingSum: sql`${officials.ratingSum} + ${delta}`, updatedAt: new Date() })
          .where(eq(officials.id, officialId));
      } else {
        await tx.insert(officialRatings).values({ officialId, userId, score });
        await tx
          .update(officials)
          .set({
            ratingCount: sql`${officials.ratingCount} + 1`,
            ratingSum: sql`${officials.ratingSum} + ${score}`,
            updatedAt: new Date(),
          })
          .where(eq(officials.id, officialId));
      }
    });

    revalidateTag(TAGS.officials);
    revalidatePath(`/officials/${officialId}`);
    revalidatePath('/');
    return { ok: true, id: officialId };
  });
}

export async function reviewOfficial(form: FormData): Promise<ActionResult> {
  return run('review_official', async (userId) => {
    const officialId = Number(form.get('officialId'));
    const body = z.string().trim().min(10).max(2000).safeParse(form.get('body'));
    if (!Number.isInteger(officialId)) return { ok: false, error: 'Unknown official.' };
    if (!body.success) {
      return { ok: false, error: 'Write at least a sentence (10 characters or more).' };
    }

    try {
      const [row] = await db
        .insert(officialReviews)
        .values({ officialId, userId, body: body.data })
        .returning({ id: officialReviews.id });
      revalidateTag(TAGS.officials);
      revalidatePath(`/officials/${officialId}`);
      return { ok: true, id: row.id };
    } catch {
      // official_reviews_one_per_user
      return { ok: false, error: 'You have already reviewed this official.' };
    }
  });
}

// ---------------------------------------------------------------------------
// Reporting and moderation
// ---------------------------------------------------------------------------

const REPORT_REASONS = [
  'spam',
  'harassment',
  'false_information',
  'defamation',
  'personal_data',
  'illegal',
  'other',
] as const;

export async function reportContent(form: FormData): Promise<ActionResult> {
  return run('report_content', async (userId) => {
    const targetType = String(form.get('targetType'));
    const targetId = Number(form.get('targetId'));
    const reason = String(form.get('reason'));

    const valid = ['job', 'listing', 'question', 'answer', 'official_review', 'user'];
    if (!valid.includes(targetType)) return { ok: false, error: 'Unknown content.' };
    if (!Number.isInteger(targetId)) return { ok: false, error: 'Unknown content.' };
    if (!REPORT_REASONS.includes(reason as (typeof REPORT_REASONS)[number])) {
      return { ok: false, error: 'Choose a reason.' };
    }

    try {
      await db.transaction(async (tx) => {
        await tx.insert(reports).values({
          targetType: targetType as (typeof valid)[number] as 'job',
          targetId,
          reason,
          details: String(form.get('details') ?? '').trim() || null,
          reportedBy: userId,
        });
        if (targetType === 'official_review') {
          await tx
            .update(officialReviews)
            .set({ reportCount: sql`${officialReviews.reportCount} + 1` })
            .where(eq(officialReviews.id, targetId));
        }
      });
      return { ok: true, id: targetId };
    } catch {
      // reports_one_open_per_user
      return { ok: false, error: 'You have already reported this.' };
    }
  });
}

/**
 * Takes content down and records why. The snapshot is the point: a removal has
 * to be reviewable after the fact, including by someone who did not make it.
 */
export async function moderateTakedown(form: FormData): Promise<ActionResult> {
  try {
    const mod = await requireModerator();
    const reportId = Number(form.get('reportId'));
    const uphold = String(form.get('decision')) === 'uphold';
    const note = String(form.get('note') ?? '').trim() || null;
    if (!Number.isInteger(reportId)) return { ok: false, error: 'Unknown report.' };

    // Captured inside the transaction, used after it: the page a takedown has to
    // clear depends on the row that was removed.
    let removedFrom: string | null = null;

    await db.transaction(async (tx) => {
      const [report] = await tx
        .select()
        .from(reports)
        .where(and(eq(reports.id, reportId), eq(reports.status, 'open')))
        .limit(1);
      if (!report) throw new Error('NOT_OPEN');

      await tx
        .update(reports)
        .set({
          status: uphold ? 'upheld' : 'dismissed',
          resolvedBy: mod.id,
          resolvedAt: new Date(),
        })
        .where(eq(reports.id, reportId));

      let snapshot: unknown = null;
      if (uphold) {
        const table = {
          job: jobs,
          listing: listings,
          question: questions,
          answer: answers,
          official_review: officialReviews,
        }[report.targetType as 'job'];

        if (table) {
          const [before] = await tx
            .select()
            .from(table)
            .where(eq(table.id, report.targetId))
            .limit(1);
          snapshot = before ?? null;
          await tx
            .update(table)
            .set({ status: 'removed' })
            .where(eq(table.id, report.targetId));
        }
      }

      removedFrom = detailPathFor(
        report.targetType,
        report.targetId,
        snapshot as Record<string, unknown> | null
      );

      await tx.insert(moderationLog).values({
        actorId: mod.id,
        action: uphold ? 'takedown' : 'dismiss_report',
        targetType: report.targetType,
        targetId: report.targetId,
        reason: note,
        snapshot: snapshot as Record<string, unknown> | null,
      });
    });

    for (const tag of [TAGS.jobs, TAGS.listings, TAGS.questions, TAGS.officials]) revalidateTag(tag);
    // Tags only reach the pages that read a tagged query. Detail pages read the
    // row directly, so the page the removed content sits on has to be named. A
    // takedown that stays visible for another fifteen minutes is not a takedown.
    if (uphold && removedFrom) revalidatePath(removedFrom);
    revalidatePath('/moderation');
    return { ok: true, id: reportId };
  } catch (error) {
    if (error instanceof Error && error.message === 'FORBIDDEN') {
      return { ok: false, error: 'Moderators only.' };
    }
    if (error instanceof Error && error.message === 'UNAUTHENTICATED') {
      return { ok: false, error: 'Please sign in first.' };
    }
    if (error instanceof Error && error.message === 'NOT_OPEN') {
      return { ok: false, error: 'That report was already resolved.' };
    }
    console.error('moderation failed', error);
    return { ok: false, error: 'Something went wrong.' };
  }
}

/**
 * The public page a moderated row appears on, so a takedown can clear it.
 *
 * Answers and reviews have no page of their own: they live on their parent's,
 * which is why the snapshot taken before the update is needed here.
 */
function detailPathFor(
  targetType: string,
  targetId: number,
  snapshot: Record<string, unknown> | null
): string | null {
  switch (targetType) {
    case 'job':
      return `/jobs/${targetId}`;
    case 'listing':
      return `/market/${targetId}`;
    case 'question':
      return `/ask/${targetId}`;
    case 'answer': {
      const questionId = snapshot?.questionId;
      return typeof questionId === 'number' ? `/ask/${questionId}` : null;
    }
    case 'official_review': {
      const officialId = snapshot?.officialId;
      return typeof officialId === 'number' ? `/officials/${officialId}` : null;
    }
    default:
      return null;
  }
}
