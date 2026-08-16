/**
 * Demo content for the participation features — 5 jobs, 5 listings, 5 questions.
 *
 * Kept out of `db.mjs seed` on purpose. Reference data (towns, officials) is
 * real and belongs in every environment; this is illustrative content and must
 * never reach production, so it is a separate, explicitly-invoked command:
 *
 *   npm run db:demo
 *
 * Everything is attributed to a clearly-labelled sample account so it can never
 * be mistaken for a citizen's post, and the whole set can be removed with
 * `npm run db:demo -- --clear`.
 */
import postgres from 'postgres';

const url = process.env.DATABASE_URL ?? 'postgres://postgres@127.0.0.1:5432/postgres';
const sql = postgres(url, { max: 1 });
const clear = process.argv.includes('--clear');

const SAMPLE_SUB = 'sample-content';
const SAMPLE_PROVIDER = 'dev';

async function sampleUser() {
  const [existing] = await sql`SELECT id FROM users WHERE auth_provider = ${SAMPLE_PROVIDER} AND auth_subject = ${SAMPLE_SUB}`;
  if (existing) return Number(existing.id);
  const [row] = await sql`
    INSERT INTO users (auth_provider, auth_subject, display_name, email, verified_at)
    VALUES (${SAMPLE_PROVIDER}, ${SAMPLE_SUB}, 'Sample content', 'sample@example.test', now())
    RETURNING id`;
  return Number(row.id);
}

const JOBS = [
  ['ilagan-city', 'Rice mill operator', 'Ilagan Grains Cooperative', 'full_time', 18000, 22000,
   'Operate and maintain milling equipment during the wet season harvest. Experience with recirculating dryers preferred.'],
  ['cauayan-city', 'Agricultural extension worker', 'Cauayan City Agriculture Office', 'contract', 21000, 25000,
   'Field visits to farmer associations, crop monitoring, and reporting. Agriculture degree required.'],
  ['santiago-city', 'Warehouse checker', 'Santiago Grains Terminal', 'full_time', 15000, 17000,
   'Record incoming and outgoing stock, verify weights against delivery receipts, maintain the inventory log.'],
  ['tumauini', 'Farm equipment mechanic', 'Tumauini Machinery Services', 'part_time', 12000, 16000,
   'Service hand tractors, threshers and water pumps. Own tools an advantage.'],
  ['roxas', 'Corn buying station clerk', 'Roxas Trading', 'seasonal', 13000, 15000,
   'Weigh deliveries, test moisture content, and issue payment vouchers during the corn harvest.'],
];

const LISTINGS = [
  ['cauayan-city', 'Farm tools & equipment', 'Hand tractor, working condition', 45000, 'used',
   'Used two seasons. Recently serviced, new belt fitted. Buyer collects from Cauayan.'],
  ['ilagan-city', 'Farm produce', 'Yellow corn, 50 sacks', 32000, 'new',
   'Freshly harvested and sun-dried, moisture around 14 percent. Price is per lot, not per sack.'],
  ['santiago-city', 'Livestock', 'Native pigs, 4 heads', 24000, null,
   'Six months old, healthy and dewormed. Will consider selling individually.'],
  ['tumauini', 'Farm tools & equipment', 'Water pump, 3 inch', 8500, 'like_new',
   'Barely used, bought last year for a plot I no longer farm. Includes suction hose.'],
  ['roxas', 'Vehicles', 'Tricycle sidecar, for repair', null, 'for_parts',
   'Frame is sound, body needs work. Open to offers or trade for farm tools.'],
];

const QUESTIONS = [
  ['ilagan-city', 'Certificates & records', 'What do I need for a barangay clearance?',
   'First time applying. What documents should I bring and roughly how much is the fee?'],
  [null, 'Agriculture', 'How do I register in the RSBSA?',
   'I heard the seed and fertiliser assistance needs RSBSA listing. Where do I sign up and what do I need?'],
  ['cauayan-city', 'Business permits', 'Renewing a business permit — what is the deadline?',
   'Is the deadline still January 20 for renewals, and can it be done at the city hall satellite office?'],
  [null, 'Taxes & payments', 'Can real property tax be paid in instalments?',
   'The full amount is difficult this year. Does the provincial treasurer accept quarterly payments?'],
  ['santiago-city', 'Social welfare', 'Requirements for PSWDO medical assistance?',
   'A relative is confined and we were told to ask PSWDO. What do we need to prepare?'],
];

if (clear) {
  const [u] = await sql`SELECT id FROM users WHERE auth_provider = ${SAMPLE_PROVIDER} AND auth_subject = ${SAMPLE_SUB}`;
  if (u) {
    await sql`DELETE FROM answers WHERE answered_by = ${u.id}`;
    await sql`DELETE FROM questions WHERE asked_by = ${u.id}`;
    await sql`DELETE FROM listings WHERE posted_by = ${u.id}`;
    await sql`DELETE FROM jobs WHERE posted_by = ${u.id}`;
    console.log('Demo content removed.');
  } else {
    console.log('No demo content found.');
  }
  await sql.end();
  process.exit(0);
}

const userId = await sampleUser();

for (const [town, title, employer, type, min, max, description] of JOBS) {
  const [dupe] = await sql`SELECT id FROM jobs WHERE title = ${title} AND posted_by = ${userId}`;
  if (dupe) continue;
  await sql`
    INSERT INTO jobs (town_slug, title, employer, description, type,
                      salary_min_centavos, salary_max_centavos, contact_phone, source, posted_by, expires_at)
    VALUES (${town}, ${title}, ${employer}, ${description}, ${type},
            ${min * 100}, ${max * 100}, '0917 501 8212', 'demo', ${userId}, now() + interval '60 days')`;
}

for (const [town, category, title, price, condition, description] of LISTINGS) {
  const [dupe] = await sql`SELECT id FROM listings WHERE title = ${title} AND posted_by = ${userId}`;
  if (dupe) continue;
  await sql`
    INSERT INTO listings (town_slug, category, title, description, price_centavos,
                          negotiable, condition, contact_phone, posted_by)
    VALUES (${town}, ${category}, ${title}, ${description},
            ${price === null ? null : price * 100}, ${price === null}, ${condition},
            '0917 501 8212', ${userId})`;
}

for (const [town, category, title, body] of QUESTIONS) {
  const [dupe] = await sql`SELECT id FROM questions WHERE title = ${title} AND asked_by = ${userId}`;
  if (dupe) continue;
  await sql`
    INSERT INTO questions (town_slug, category, title, body, asked_by)
    VALUES (${town}, ${category}, ${title}, ${body}, ${userId})`;
}

const [{ j }] = await sql`SELECT count(*)::int AS j FROM jobs WHERE posted_by = ${userId}`;
const [{ l }] = await sql`SELECT count(*)::int AS l FROM listings WHERE posted_by = ${userId}`;
const [{ q }] = await sql`SELECT count(*)::int AS q FROM questions WHERE asked_by = ${userId}`;
console.log(`Demo content: ${j} jobs, ${l} listings, ${q} questions (user "Sample content").`);
await sql.end();
