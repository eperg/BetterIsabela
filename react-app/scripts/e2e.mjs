// Run from the repo root:  node react-app/scripts/e2e.mjs
// Requires:  npm run db:serve  and  npm run dev  (in react-app/)
import { chromium } from 'playwright';
import { execFileSync } from 'node:child_process';

const BASE = 'http://localhost:3000';

// Repeatable runs need a known starting state.
execFileSync('node', ['scripts/db.mjs', 'reset'], {
  cwd: new URL('..', import.meta.url).pathname,
  env: { ...process.env, DATABASE_URL: 'postgres://postgres@127.0.0.1:5432/postgres' },
  stdio: 'pipe',
});
console.log('database reset — 37 towns, 88 officials, no user content\n');
const b = await chromium.launch();
const ctx = await b.newContext();
const p = await ctx.newPage();
const errs = [];
p.on('pageerror', (e) => errs.push(String(e.message)));
p.on('console', (m) => { if (m.type() === 'error') errs.push('console: ' + m.text()); });

const step = async (label, fn) => {
  try { const r = await fn(); console.log(`  ok    ${label}${r ? ' — ' + r : ''}`); return true; }
  catch (e) { console.log(`  FAIL  ${label} — ${e.message.split('\n')[0]}`); return false; }
};

console.log('AUTH');
await step('dev sign-in as citizen', async () => {
  await p.goto(BASE, { waitUntil: 'networkidle' });
  await p.fill('input[name=handle]', 'maria');
  await p.locator('.devlogin button[type=submit]').click();
  await p.waitForLoadState('networkidle');
  return await p.locator('.authbar-who').innerText();
});

console.log('\nJOB BOARD');
await step('post a job', async () => {
  await p.goto(BASE + '/jobs/new', { waitUntil: 'networkidle' });
  await p.fill('input[name=title]', 'Rice mill operator');
  await p.fill('input[name=employer]', 'Ilagan Grains Co-op');
  await p.selectOption('select[name=townSlug]', 'ilagan-city');
  await p.selectOption('select[name=type]', 'full_time');
  await p.fill('input[name=salaryMin]', '18000');
  await p.fill('input[name=salaryMax]', '22000');
  await p.fill('textarea[name=description]', 'Operate and maintain the mill. Experience preferred.');
  await p.fill('input[name=contactPhone]', '0917 501 8212');
  await p.locator('form.stack button[type=submit]').click();
  await p.waitForSelector('.formmsg--ok', { timeout: 15000 });
  return await p.locator('.formmsg--ok').innerText();
});
await step('job appears on the board', async () => {
  await p.goto(BASE + '/jobs', { waitUntil: 'networkidle' });
  const t = await p.locator('.card-title').first().innerText();
  if (!t.includes('Rice mill')) throw new Error('not listed: ' + t);
  return t + ' | ' + (await p.locator('.card-meta').first().innerText()).replace(/\n/g, ' ');
});

console.log('\nBUY & SELL');
await step('reject a listing with no price and no "open to offers"', async () => {
  await p.goto(BASE + '/market/new', { waitUntil: 'networkidle' });
  await p.fill('input[name=title]', 'Hand tractor');
  await p.selectOption('select[name=category]', 'Farm tools & equipment');
  await p.selectOption('select[name=townSlug]', 'cauayan-city');
  await p.fill('textarea[name=description]', 'Working condition, used two seasons.');
  await p.locator('form.stack button[type=submit]').click();
  await p.waitForSelector('.formmsg--error', { timeout: 15000 });
  return await p.locator('.formmsg--error').innerText();
});
await step('accept it once a price is given', async () => {
  await p.fill('input[name=price]', '45000');
  await p.locator('form.stack button[type=submit]').click();
  await p.waitForSelector('.formmsg--ok', { timeout: 15000 });
  await p.goto(BASE + '/market', { waitUntil: 'networkidle' });
  return await p.locator('.card-price').first().innerText();
});

console.log('\nQ&A');
await step('ask a question', async () => {
  await p.goto(BASE + '/ask/new', { waitUntil: 'networkidle' });
  await p.fill('input[name=title]', 'What do I need for a barangay clearance?');
  await p.selectOption('select[name=category]', 'Certificates & records');
  await p.fill('textarea[name=body]', 'First time applying. What should I bring?');
  await p.locator('form.stack button[type=submit]').click();
  await p.waitForSelector('.formmsg--ok', { timeout: 15000 });
  return 'posted';
});
await step('answer it, and the count updates', async () => {
  await p.goto(BASE + '/ask', { waitUntil: 'networkidle' });
  await p.click('.card-title a');
  await p.waitForLoadState('networkidle');
  await p.fill('textarea[name=body]', 'Bring a valid ID and proof of residence. Fee is around fifty pesos.');
  await p.locator('form.stack button[type=submit]').click();
  await p.waitForSelector('.formmsg--ok', { timeout: 15000 });
  await p.goto(BASE + '/ask', { waitUntil: 'networkidle' });
  return await p.locator('.card-meta').first().innerText().then(s => s.replace(/\n/g, ' '));
});

console.log('\nOFFICIALS');
await step('rate an official', async () => {
  await p.goto(BASE + '/officials?town=ilagan-city', { waitUntil: 'networkidle' });
  // Filtering happens in the browser, so non-matching rows are still in the DOM
  // and hidden. Scope the click to what a reader can actually see.
  await p.locator('#officialslist > li:visible .card-title a').first().click();
  await p.waitForLoadState('networkidle');
  const who = await p.locator('h1').innerText();
  await p.click('.rate-star:nth-child(4)');
  await p.waitForSelector('.formmsg--ok', { timeout: 15000 });
  await p.reload({ waitUntil: 'networkidle' });
  return who + ' → ' + (await p.locator('.stars').first().innerText()).replace(/\n/g, ' ');
});
await step('re-rating updates rather than double-counting', async () => {
  await p.click('.rate-star:nth-child(2)');
  await p.waitForSelector('.formmsg--ok', { timeout: 15000 });
  await p.reload({ waitUntil: 'networkidle' });
  const s = (await p.locator('.stars').first().innerText()).replace(/\n/g, ' ');
  if (!s.includes('(1)')) throw new Error('count should still be 1: ' + s);
  return s;
});
await step('publish a review', async () => {
  await p.fill('textarea[name=body]', 'Office replied to my request within two days.');
  await p.locator('form.stack button[type=submit]').click();
  await p.waitForSelector('.formmsg--ok', { timeout: 15000 });
  await p.reload({ waitUntil: 'networkidle' });
  return (await p.locator('.answerlist .answer').count()) + ' review(s) shown';
});
await step('a second review by the same user is refused', async () => {
  await p.fill('textarea[name=body]', 'Trying to post again to see what happens.');
  await p.locator('form.stack button[type=submit]').click();
  await p.waitForSelector('.formmsg--error', { timeout: 15000 });
  return await p.locator('.formmsg--error').innerText();
});

console.log('\nMODERATION');
const reviewUrl = p.url();
await step('report the review', async () => {
  await p.locator('.answer .linkish').first().click();
  await p.selectOption('.reportform select[name=reason]', 'defamation');
  await p.locator('.reportform button[type=submit]').click();
  await p.waitForSelector('.reported', { timeout: 15000 });
  return 'reported';
});
await step('citizen cannot reach the queue', async () => {
  await p.goto(BASE + '/moderation', { waitUntil: 'networkidle' });
  const txt = await p.locator('main').innerText();
  if (!txt.includes('Moderators only')) throw new Error('citizen saw the queue');
  return 'blocked';
});
await step('sign in as moderator and uphold the report', async () => {
  await p.goto(BASE, { waitUntil: 'networkidle' });
  await p.click('.authbar-link--button');           // sign out
  await p.waitForLoadState('networkidle');
  await p.fill('input[name=handle]', 'mod');
  await p.selectOption('.devlogin select[name=role]', 'moderator');
  await p.locator('.devlogin button[type=submit]').click();
  await p.waitForLoadState('networkidle');
  await p.goto(BASE + '/moderation', { waitUntil: 'networkidle' });
  const n = await p.locator('.card').count();
  if (!n) throw new Error('queue empty');
  await p.fill('input[name=note]', 'Unsubstantiated allegation about a named person.');
  await p.locator('.modactions form').first().locator('button[type=submit]').click();
  // revalidatePath drops the resolved report from the queue, so the card
  // unmounting IS the success signal — there is nowhere for a message to render.
  await p.waitForFunction((before) => document.querySelectorAll('.card').length < before, n,
    { timeout: 15000 });
  return `queue ${n} -> ${await p.locator('.card').count()}`;
});
await step('removed review is gone from the public page', async () => {
  await p.goto(reviewUrl, { waitUntil: 'networkidle' });
  const n = await p.locator('.answerlist .answer').count();
  if (n !== 0) throw new Error(`${n} review(s) still visible`);
  return '0 reviews visible';
});

await step('the takedown is recorded in the audit log', async () => {
  const { default: postgres } = await import('postgres');
  const sql = postgres('postgres://postgres@127.0.0.1:5432/postgres', { max: 1 });
  const [log] = await sql`SELECT action, target_type, reason, snapshot IS NOT NULL AS has_snapshot
                          FROM moderation_log ORDER BY id DESC LIMIT 1`;
  const [rep] = await sql`SELECT status, resolved_by FROM reports ORDER BY id DESC LIMIT 1`;
  await sql.end();
  if (!log || log.action !== 'takedown') throw new Error('no takedown logged');
  if (!log.has_snapshot) throw new Error('takedown logged without a content snapshot');
  if (rep.status !== 'upheld' || !rep.resolved_by) throw new Error('report not resolved');
  return `${log.action} · snapshot kept · report ${rep.status}`;
});

console.log('\nFILTERS (applied in the browser, so the pages stay cacheable)');
await step('town filter narrows the job board and survives a reload', async () => {
  await p.goto(BASE + '/jobs', { waitUntil: 'networkidle' });
  const all = await p.locator('#jobboard > li:visible').count();
  if (all < 1) throw new Error('no jobs on the board to filter');
  // The seeded job is in Ilagan; pick a town that is not, so the count must drop.
  await p.selectOption('.filterbar select', 'tumauini');
  await p.waitForFunction(
    (n) => document.querySelectorAll('#jobboard > li:not([style*="display"])').length >= 0 &&
      [...document.querySelectorAll('#jobboard > li')].filter((li) => getComputedStyle(li).display !== 'none').length !== n,
    all,
    { timeout: 5000 }
  );
  const filtered = await p.locator('#jobboard > li:visible').count();
  if (filtered >= all) throw new Error(`filter did not narrow: ${all} -> ${filtered}`);
  if (!p.url().includes('town=tumauini')) throw new Error('URL did not record the filter: ' + p.url());
  await p.reload({ waitUntil: 'networkidle' });
  const afterReload = await p.locator('#jobboard > li:visible').count();
  if (afterReload !== filtered) throw new Error(`reload lost the filter: ${filtered} -> ${afterReload}`);
  return `${all} jobs -> ${filtered} in Tumauini, filter held across reload`;
});

await step('clearing the filter restores every row', async () => {
  await p.click('.filterbar button');
  await p.waitForFunction(() => !location.search.includes('town='), null, { timeout: 5000 });
  const n = await p.locator('#jobboard > li:visible').count();
  if (n < 1) throw new Error('clear left the board empty');
  return `${n} jobs visible again`;
});

await step('services search filters without a page load', async () => {
  await p.goto(BASE + '/services', { waitUntil: 'networkidle' });
  const total = await p.locator('#servicelist > li:visible').count();
  await p.fill('.filterbar input[type=search]', 'birth certificate');
  await p.waitForFunction(
    (n) => [...document.querySelectorAll('#servicelist > li')]
      .filter((li) => getComputedStyle(li).display !== 'none').length < n,
    total,
    { timeout: 5000 }
  );
  const found = await p.locator('#servicelist > li:visible').count();
  const count = await p.locator('.resultcount').innerText();
  if (found === 0) throw new Error('search matched nothing');
  return `${total} services -> ${found} for "birth certificate" (${count})`;
});

await step('an unknown filter value is ignored rather than hiding everything', async () => {
  await p.goto(BASE + '/jobs?town=%22%3E%3Cscript%3E', { waitUntil: 'networkidle' });
  const n = await p.locator('#jobboard > li:visible').count();
  if (n < 1) throw new Error('a bogus town value hid the whole board');
  return `${n} jobs still shown`;
});

console.log('\nHOMEPAGE');
await step('snippets show the new content', async () => {
  await p.goto(BASE, { waitUntil: 'networkidle' });
  const panels = await p.locator('.hpanel').count();
  const links = await p.locator('.hlist a').allInnerTexts();
  return `${panels} panels · ${links.length} items · ${links.slice(0, 3).join(' / ')}`;
});

console.log('\nJS errors:', errs.length ? errs.slice(0, 5) : 'none');
await b.close();

// The run starts from a clean database, which would otherwise leave the dev
// environment empty. Put the demo content and sourced projects back.
for (const script of ['seed-demo.mjs', 'seed-projects.mjs']) {
  execFileSync('node', [`scripts/${script}`], {
    cwd: new URL('..', import.meta.url).pathname,
    env: { ...process.env, DATABASE_URL: 'postgres://postgres@127.0.0.1:5432/postgres' },
    stdio: 'pipe',
  });
}
console.log('demo content and projects restored');
