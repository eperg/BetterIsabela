#!/usr/bin/env node
/**
 * Town profile sync.
 *
 * Builds data/towns.json — the profile shown for each of Isabela's 37 cities and
 * municipalities — from the province's own directory at
 * provinceofisabela.gov.ph/citiesmunicipalities/.
 *
 * Each town page carries a consistent "Basic Profile" block (LGU type, income
 * class, barangay count, land area, population, households) plus the incumbent
 * mayor and vice mayor. That is the authoritative source for this data; nothing
 * here is inferred or estimated.
 *
 * Unlike the price sync this is NOT scheduled. Town profiles change on the
 * electoral cycle, not daily, so hammering the provincial site would be rude and
 * pointless. Run it by hand after an election or when a profile is known to have
 * changed:
 *
 *     npm run sync:towns
 *
 * ENV (all optional):
 *   TOWNS_JSON_PATH    output path (default <repo>/data/towns.json)
 *   TOWNS_TIMEOUT_MS   per-request timeout (default 30000)
 *   TOWNS_DELAY_MS     pause between town requests (default 400 — be polite)
 *   TOWNS_LIMIT        stop after N towns (for testing)
 *
 * Failure behaviour: a town that cannot be fetched or parsed is reported and
 * skipped; its previous entry is carried over from the existing file if present.
 * The file is only written if at least one town resolved.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const CONFIG = {
  outPath: process.env.TOWNS_JSON_PATH || path.resolve(__dirname, '..', 'data', 'towns.json'),
  timeoutMs: parseInt(process.env.TOWNS_TIMEOUT_MS || '30000', 10),
  delayMs: parseInt(process.env.TOWNS_DELAY_MS || '400', 10),
  limit: parseInt(process.env.TOWNS_LIMIT || '0', 10),
};

const INDEX_URL = 'https://provinceofisabela.gov.ph/citiesmunicipalities/';
const USER_AGENT =
  'BetterIsabela-TownSync/1.0 (+https://betterisabela.org; civic-tech, non-commercial)';

// Markets in the DA Bantay Presyo Region II panel, mapped to their town slug.
// Only these five Isabela towns have monitored retail prices.
const MONITORED_MARKETS = {
  'ilagan-city': 'ILAGAN CITY PUBLIC MARKET',
  'cauayan-city': 'CAUAYAN CITY PUBLIC MARKET',
  'santiago-city': 'SANTIAGO CITY PUBLIC MARKET',
  roxas: 'ROXAS PUBLIC MARKET',
  tumauini: 'TUMAUINI PUBLIC MARKET',
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT },
    signal: AbortSignal.timeout(CONFIG.timeoutMs),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.text();
}

function decode(value) {
  return String(value)
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#0?39;|&apos;|&#8217;|’/g, "'")
    .replace(/&#8211;|&ndash;/g, '-')
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

/** Strips markup and collapses whitespace into a flat line list. */
function textLines(html) {
  const stripped = html
    .replace(/<(script|style|nav|footer)[\s\S]*?<\/\1>/gi, '')
    .replace(/<[^>]+>/g, '\n');
  return decode(stripped)
    .split('\n')
    .map((l) => l.replace(/\s+/g, ' ').trim())
    .filter(Boolean);
}

/**
 * Takes the FIRST number in the string. Values arrive as "73,874 (CY 2020)" or
 * "139,370.0", so consuming every digit would splice the census year onto the
 * population.
 */
function toNumber(value) {
  if (!value) return null;
  const m = String(value).match(/-?[\d,]*\d(?:\.\d+)?/);
  if (!m) return null;
  const n = Number(m[0].replace(/,/g, ''));
  return Number.isFinite(n) ? n : null;
}

/**
 * The profile block renders as "Label: value" on one line, or a "Label :" line
 * followed by the value on the next. Handle both.
 */
function findField(lines, label) {
  const re = new RegExp('^' + label + '\\s*:?\\s*(.*)$', 'i');
  for (let i = 0; i < lines.length; i += 1) {
    const m = lines[i].match(re);
    if (!m) continue;
    const inline = m[1].trim();
    if (inline) return inline;
    if (lines[i + 1]) return lines[i + 1].trim();
  }
  return '';
}

/** Title-cases a slug as a last-resort name: "benito-soliven" -> "Benito Soliven". */
function nameFromSlug(slug) {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function parseTown(slug, html) {
  const lines = textLines(html);

  // The <title> is "Ilagan City - Official Website of the Province of Isabela".
  const titleMatch = html.match(/<title>([^<]*)<\/title>/i);
  const name = titleMatch
    ? decode(titleMatch[1])
        .split(/\s+[-–|]\s+/)[0]
        .trim() || nameFromSlug(slug)
    : nameFromSlug(slug);
  const lguType = findField(lines, 'LGU Type');
  const incomeClass = findField(lines, 'Income Class');
  const barangays = toNumber(findField(lines, 'No\\. of Barangays'));
  const landArea = toNumber(findField(lines, 'Total Land area in Hectares'));

  const populationRaw = findField(lines, 'Population');
  const householdsRaw = findField(lines, 'No\\. of Households');
  const population = toNumber(populationRaw);
  const households = toNumber(householdsRaw);
  const censusYear = (populationRaw.match(/CY\s*(\d{4})/i) || [])[1] || null;

  const mayor = findField(lines, 'Mayor').replace(/^Hon\.\s*/i, '');
  const viceMayor = findField(lines, 'Vice Mayor').replace(/^Hon\.\s*/i, '');

  // The profile prose is the first long line after the officials block. Exclude
  // the councillor roll and the shared nav/footer boilerplate.
  const NOISE =
    /^(office of the|senate|house of|supreme court|court of appeals|sandiganbayan|copyright|district \d)/i;
  const description =
    lines.find(
      (l) => l.length > 100 && !NOISE.test(l) && !/^Hon\./i.test(l) && !/^Councilors/i.test(l)
    ) || '';

  if (!lguType && !barangays && !population) {
    throw new Error('profile block not recognised');
  }

  return {
    slug,
    name,
    lguType: lguType || null,
    incomeClass: incomeClass || null,
    barangays,
    landAreaHectares: landArea,
    population,
    households,
    censusYear: censusYear ? Number(censusYear) : null,
    mayor: mayor || null,
    viceMayor: viceMayor || null,
    description,
    market: MONITORED_MARKETS[slug] || null,
    url: `${INDEX_URL}${slug}/`,
  };
}

function readExisting() {
  try {
    return JSON.parse(fs.readFileSync(CONFIG.outPath, 'utf8'));
  } catch {
    return null;
  }
}

async function main() {
  console.log('Fetching the cities & municipalities index…');
  const index = await fetchText(INDEX_URL);

  const slugs = [
    ...new Set(
      [...index.matchAll(/citiesmunicipalities\/([a-z0-9-]+)\/"/g)]
        .map((m) => m[1])
        .filter((s) => s !== 'feed')
    ),
  ].sort();

  if (!slugs.length) throw new Error('no town links found on the index page');
  console.log(`Found ${slugs.length} town page(s).`);

  const existing = readExisting();
  const previous = new Map((existing?.towns || []).map((t) => [t.slug, t]));

  const towns = [];
  const problems = [];
  const list = CONFIG.limit ? slugs.slice(0, CONFIG.limit) : slugs;

  for (const slug of list) {
    try {
      const html = await fetchText(`${INDEX_URL}${slug}/`);
      const town = parseTown(slug, html);
      towns.push(town);
      const tag = town.market ? ' [market monitored]' : '';
      console.log(
        `  ${town.name} — ${town.lguType}, ${town.barangays} brgy, ` +
          `pop ${town.population?.toLocaleString('en-PH') ?? '?'}${tag}`
      );
    } catch (error) {
      problems.push(`${slug}: ${error.message}`);
      if (previous.has(slug)) {
        towns.push(previous.get(slug));
        console.warn(`  ${slug} failed (${error.message}) — kept previous entry`);
      } else {
        console.warn(`  ${slug} failed (${error.message}) — skipped`);
      }
    }
    if (CONFIG.delayMs) await sleep(CONFIG.delayMs);
  }

  if (!towns.length) {
    console.error('No towns resolved; leaving the file untouched.');
    process.exitCode = 1;
    return;
  }

  towns.sort((a, b) => a.name.localeCompare(b.name));

  const payload = {
    _schema_version: '1.0',
    _generated: new Date().toISOString(),
    _generator: 'scripts/sync-towns.js',
    _source: INDEX_URL,
    _sourceName: 'Province of Isabela — Cities and Municipalities directory',
    _note:
      'Machine-generated from the official provincial directory. Re-run npm run sync:towns ' +
      'after an election or a boundary/profile change. Population and household figures are ' +
      'the CY2020 census values published by the province.',
    _problems: problems,
    _monitoredMarkets: Object.values(MONITORED_MARKETS),
    towns,
  };

  fs.mkdirSync(path.dirname(CONFIG.outPath), { recursive: true });
  fs.writeFileSync(CONFIG.outPath, `${JSON.stringify(payload, null, 2)}\n`);
  console.log(
    `\nWrote ${path.relative(process.cwd(), CONFIG.outPath)} — ` +
      `${towns.length} town(s), ${problems.length} problem(s).`
  );
}

main().catch((error) => {
  console.error(`sync-towns failed: ${error.stack || error.message}`);
  process.exitCode = 1;
});
