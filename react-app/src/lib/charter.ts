/**
 * Reading the Citizen's Charter as data.
 *
 * The catalogue states processing time and fee as human prose ("15-30 minutes",
 * "₱50-150", "Varies"), which is fine for a poster and useless for a comparison.
 * These helpers turn the prose into an upper bound where one is stated, and say
 * so plainly where none is. Nothing here guesses: a service whose charter says
 * "Varies" is reported as having made no promise, not as having a slow one.
 */

/** A working day, not a calendar one: the office is open eight hours. */
const WORKING_DAY_MINUTES = 480;
const WORKING_WEEK_MINUTES = WORKING_DAY_MINUTES * 5;

const UNIT_MINUTES: Record<string, number> = {
  min: 1,
  mins: 1,
  minute: 1,
  minutes: 1,
  hr: 60,
  hrs: 60,
  hour: 60,
  hours: 60,
  day: WORKING_DAY_MINUTES,
  days: WORKING_DAY_MINUTES,
  week: WORKING_WEEK_MINUTES,
  weeks: WORKING_WEEK_MINUTES,
};

export interface CharterTime {
  /** The charter's own wording, always shown as written. */
  text: string;
  /** Upper bound in minutes, or null where the charter commits to nothing. */
  maxMinutes: number | null;
}

/** Sums every "<number> <unit>" pair in one side of a range. */
function sumSide(side: string, fallbackUnit: string | null): number | null {
  const pairs = [...side.matchAll(/(\d+(?:\.\d+)?)\s*([a-z]+)?/g)];
  if (!pairs.length) return null;

  let total = 0;
  let matched = false;
  for (const [, amount, unit] of pairs) {
    const key = unit ?? fallbackUnit;
    const factor = key ? UNIT_MINUTES[key] : undefined;
    if (factor === undefined) continue;
    total += Number(amount) * factor;
    matched = true;
  }
  return matched ? Math.round(total) : null;
}

export function parseCharterTime(text: string): CharterTime {
  const raw = text.trim();
  const normalised = raw.toLowerCase();

  if (/varies|scheduled|depends|appointment/.test(normalised)) {
    return { text: raw, maxMinutes: null };
  }
  if (/immediate|walk-?in|over the counter/.test(normalised)) {
    return { text: raw, maxMinutes: 0 };
  }
  if (/same\s*day/.test(normalised)) {
    return { text: raw, maxMinutes: WORKING_DAY_MINUTES };
  }

  // A range takes its upper bound from the far side; anything else is additive,
  // so "1 hour 35 minutes" is 95 rather than 35.
  const sides = normalised.split(/\s*(?:-|–|to)\s*/);
  if (sides.length > 1) {
    // "15-30 minutes" leaves the unit off the first side, so borrow the last one.
    const lastUnit = [...normalised.matchAll(/[a-z]+/g)].map((m) => m[0]).filter((u) => u in UNIT_MINUTES).pop();
    const values = sides.map((side) => sumSide(side, lastUnit ?? null)).filter((v): v is number => v !== null);
    return { text: raw, maxMinutes: values.length ? Math.max(...values) : null };
  }

  return { text: raw, maxMinutes: sumSide(normalised, null) };
}

export interface CharterFee {
  text: string;
  /** Upper bound in centavos, or null where the charter commits to nothing. */
  maxCentavos: number | null;
}

export function parseCharterFee(text: string): CharterFee {
  const raw = text.trim();
  const normalised = raw.toLowerCase();

  // "Free" is a commitment; "varies" and "subsidized" are not, and "₱5+" is an
  // open-ended floor rather than a ceiling. "Free/Subsidized" counts as
  // open-ended despite starting with "free": free for some people is not a
  // stated price, and treating it as zero would invent a breach every time
  // somebody who did not qualify paid something.
  if (/varies|subsidi[sz]ed|included|depends/.test(normalised)) {
    return { text: raw, maxCentavos: null };
  }
  if (/^free\b/.test(normalised) && !/\d/.test(normalised)) {
    return { text: raw, maxCentavos: 0 };
  }
  if (/\+/.test(normalised)) return { text: raw, maxCentavos: null };

  const amounts = [...normalised.matchAll(/(\d+(?:[.,]\d+)?)/g)].map((m) =>
    Math.round(Number(m[1].replace(',', '')) * 100)
  );
  return { text: raw, maxCentavos: amounts.length ? Math.max(...amounts) : null };
}

// ---------------------------------------------------------------------------
// What residents report
// ---------------------------------------------------------------------------

export const WAIT_VALUES = [
  'under_30m',
  '30m_1h',
  '1_3h',
  'same_day',
  '1_3d',
  '4_7d',
  'over_week',
  'unresolved',
] as const;

export type WaitValue = (typeof WAIT_VALUES)[number];

export const isWaitValue = (value: string): value is WaitValue =>
  (WAIT_VALUES as readonly string[]).includes(value);

/**
 * Each bucket's label and its upper edge in minutes. `unresolved` has no
 * duration because it never finished, which is a different thing from slow.
 */
export const WAIT_BUCKETS: Record<WaitValue, { label: string; short: string; maxMinutes: number | null }> = {
  under_30m: { label: 'Under 30 minutes', short: '<30 min', maxMinutes: 30 },
  '30m_1h': { label: '30 minutes to an hour', short: '30–60 min', maxMinutes: 60 },
  '1_3h': { label: 'One to three hours', short: '1–3 hrs', maxMinutes: 180 },
  same_day: { label: 'Most of the day', short: 'Same day', maxMinutes: WORKING_DAY_MINUTES },
  '1_3d': { label: 'One to three days', short: '1–3 days', maxMinutes: WORKING_DAY_MINUTES * 3 },
  '4_7d': { label: 'Four to seven days', short: '4–7 days', maxMinutes: WORKING_DAY_MINUTES * 7 },
  over_week: { label: 'More than a week', short: '>1 week', maxMinutes: WORKING_WEEK_MINUTES * 2 },
  unresolved: { label: 'Never completed it', short: 'Unresolved', maxMinutes: null },
};

export type Verdict = 'within' | 'over' | 'unresolved' | 'no_promise' | 'no_reports';

/**
 * How the reported median stands against the charter. Deliberately blunt: it
 * only says "over" when the charter stated a bound and the median exceeded it.
 */
export function verdictFor(charter: CharterTime, median: WaitValue | null): Verdict {
  if (median === null) return 'no_reports';
  if (median === 'unresolved') return 'unresolved';
  if (charter.maxMinutes === null) return 'no_promise';
  const reported = WAIT_BUCKETS[median].maxMinutes;
  if (reported === null) return 'unresolved';
  return reported <= charter.maxMinutes ? 'within' : 'over';
}

export const VERDICT_LABEL: Record<Verdict, string> = {
  within: 'Matches the charter',
  over: 'Slower than the charter',
  unresolved: 'Often not completed',
  no_promise: 'Charter states no time',
  no_reports: 'No reports yet',
};

/**
 * The middle report by duration. Buckets are ordered, so the median is the
 * middle one rather than an average of made-up numbers.
 */
export function medianWait(counts: Partial<Record<WaitValue, number>>): WaitValue | null {
  const total = WAIT_VALUES.reduce((n, v) => n + (counts[v] ?? 0), 0);
  if (total === 0) return null;
  const middle = Math.floor(total / 2);
  let seen = 0;
  for (const value of WAIT_VALUES) {
    seen += counts[value] ?? 0;
    if (seen > middle) return value;
  }
  return null;
}
