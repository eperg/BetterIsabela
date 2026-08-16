#!/usr/bin/env node
/**
 * Palay & corn price sync engine.
 *
 * Builds data/prices.json — the dataset behind the Price Watch page — from two
 * official sources, neither of which needs a key:
 *
 *   1. PSA OpenSTAT (PxWeb API)   monthly FARMGATE price for Isabela. This is the
 *                                 number a farmer is actually paid. Table
 *                                 2M/NFG/0032M4AFN01 ("Cereals: Farmgate Prices
 *                                 by Geolocation, Commodity, Year and Period"),
 *                                 geolocation 023100000 = Isabela.
 *
 *   2. DA Bantay Presyo          current RETAIL price per public market. Region II
 *                                 breaks out five Isabela markets by name, so a
 *                                 farmer or buyer can compare the town nearest them.
 *
 * The two together are the point: the spread between what a farmer is paid and
 * what the market charges is the thing neither side can currently see.
 *
 * Designed to run unattended on a schedule (see .github/workflows/price-sync.yml).
 * Every run appends to a monthly history series, so the committed JSON becomes an
 * archive that outlives whatever the upstream portals choose to keep online.
 *
 * ENV (all optional):
 *   PRICES_JSON_PATH   output path (default <repo>/data/prices.json)
 *   PRICES_YEARS       how many years of farmgate history to request (default 3)
 *   PRICES_TIMEOUT_MS  per-request timeout (default 30000)
 *   PRICES_FIXTURE_DIR read psa.csv / retail-<commodity>.html from here instead of
 *                      the network (for offline testing)
 *
 * Failure behaviour: a source that cannot be reached is skipped and its previous
 * contents are preserved from the existing file. A run can degrade, but it can
 * never blank out live price data. Exits non-zero only if BOTH sources fail and
 * there is no existing file to fall back on.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const CONFIG = {
  outPath: process.env.PRICES_JSON_PATH || path.resolve(__dirname, '..', 'data', 'prices.json'),
  years: parseInt(process.env.PRICES_YEARS || '3', 10),
  timeoutMs: parseInt(process.env.PRICES_TIMEOUT_MS || '30000', 10),
  fixtureDir: process.env.PRICES_FIXTURE_DIR || '',
};

const PSA_TABLE = 'https://openstat.psa.gov.ph/PXWeb/api/v1/en/DB/2M/NFG/0032M4AFN01.px';
const PSA_META_SOURCE = 'https://openstat.psa.gov.ph/Database/Prices/Farmgate-Prices';
const BP_BASE = 'http://www.bantaypresyo.da.gov.ph';
const BP_SOURCE = 'http://www.bantaypresyo.da.gov.ph/';

const ISABELA_GEOCODE = '023100000';
const REGION_II_GEOCODE = '020000000';

// PSA commodity codes within the cereals farmgate table.
const FARMGATE_COMMODITIES = [
  { code: '1', id: 'palay', label: 'Palay (dry, 14% moisture)' },
  { code: '3', id: 'corn-yellow', label: 'Yellow corngrain (matured)' },
];

// Bantay Presyo commodity-category codes (same endpoint serves every category).
const RETAIL_CATEGORIES = [
  { code: '1', id: 'rice', label: 'Rice' },
  { code: '2', id: 'corn', label: 'Corn' },
];

// The five Region II markets that are in Isabela. Bantay Presyo returns all 26
// regional markets per row; everything outside this list is another province.
const ISABELA_MARKETS = [
  'ILAGAN CITY PUBLIC MARKET',
  'ROXAS PUBLIC MARKET',
  'CAUAYAN CITY PUBLIC MARKET',
  'SANTIAGO CITY PUBLIC MARKET',
  'TUMAUINI PUBLIC MARKET',
];

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const USER_AGENT =
  'BetterIsabela-PriceSync/1.0 (+https://betterisabela.org; civic-tech, non-commercial)';

// ---------------------------------------------------------------------------
// Fetch helpers
// ---------------------------------------------------------------------------

function fixturePath(name) {
  return CONFIG.fixtureDir ? path.join(CONFIG.fixtureDir, name) : '';
}

async function request(url, { method = 'GET', body, headers = {}, fixture } = {}) {
  const local = fixturePath(fixture || '');
  if (local && fs.existsSync(local)) {
    return fs.readFileSync(local, 'utf8');
  }
  const response = await fetch(url, {
    method,
    body,
    headers: { 'User-Agent': USER_AGENT, ...headers },
    signal: AbortSignal.timeout(CONFIG.timeoutMs),
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${url}`);
  }
  return response.text();
}

// ---------------------------------------------------------------------------
// Source 1 — PSA OpenSTAT farmgate prices
// ---------------------------------------------------------------------------

/** Year codes in this table are offsets from 2010. */
function yearCodes(count) {
  const thisYear = new Date().getUTCFullYear();
  const first = Math.max(2010, thisYear - (count - 1));
  const codes = [];
  for (let y = first; y <= thisYear; y += 1) codes.push(String(y - 2010));
  return { codes, firstYear: first, lastYear: thisYear };
}

/**
 * Splits one CSV line, honouring double-quoted fields.
 * PSA emits quoted labels that contain commas, e.g. "Palay [Paddy] Other Variety, dry".
 */
function splitCsvLine(line) {
  const out = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') {
      if (quoted && line[i + 1] === '"') {
        field += '"';
        i += 1;
      } else {
        quoted = !quoted;
      }
    } else if (ch === ',' && !quoted) {
      out.push(field);
      field = '';
    } else {
      field += ch;
    }
  }
  out.push(field);
  return out;
}

/** PSA writes ".." for a month with no published figure. */
function parsePrice(cell) {
  const trimmed = (cell || '').trim();
  if (!trimmed || trimmed === '..' || trimmed === '-') return null;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : null;
}

async function fetchFarmgate() {
  const { codes, firstYear, lastYear } = yearCodes(CONFIG.years);
  const query = {
    query: [
      { code: 'Geolocation', selection: { filter: 'item', values: [ISABELA_GEOCODE] } },
      {
        code: 'Commodity',
        selection: { filter: 'item', values: FARMGATE_COMMODITIES.map((c) => c.code) },
      },
      { code: 'Year', selection: { filter: 'item', values: codes } },
      {
        code: 'Period',
        selection: { filter: 'item', values: MONTHS.map((_, i) => String(i)) },
      },
    ],
    // json-stat2 comes back malformed from this endpoint; CSV is the reliable format.
    response: { format: 'csv' },
  };

  const csv = await request(PSA_TABLE, {
    method: 'POST',
    body: JSON.stringify(query),
    headers: { 'Content-Type': 'application/json' },
    fixture: 'psa.csv',
  });

  const lines = csv.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) throw new Error('PSA returned no data rows');

  // Header: "Geolocation","Commodity","2024 January",...
  const header = splitCsvLine(lines[0]).map((h) => h.replace(/^"|"$/g, '').trim());
  const periods = header.slice(2).map((h) => {
    const [year, month] = h.split(/\s+/);
    return {
      year: Number(year),
      month,
      key: `${year}-${String(MONTHS.indexOf(month) + 1).padStart(2, '0')}`,
    };
  });

  const series = [];
  for (const line of lines.slice(1)) {
    const cells = splitCsvLine(line).map((c) => c.replace(/^"|"$/g, '').trim());
    const commodityLabel = cells[1];
    const match = FARMGATE_COMMODITIES.find((c) =>
      commodityLabel.toLowerCase().includes(c.id === 'palay' ? 'palay' : 'yellow')
    );
    if (!match) continue;

    const points = [];
    cells.slice(2).forEach((cell, i) => {
      const value = parsePrice(cell);
      if (value !== null && periods[i]) {
        points.push({ period: periods[i].key, price: value });
      }
    });
    points.sort((a, b) => a.period.localeCompare(b.period));

    series.push({
      commodity: match.id,
      label: match.label,
      unit: 'PHP/kg',
      points,
      latest: points.length ? points[points.length - 1] : null,
    });
  }

  if (!series.length) throw new Error('PSA response held no recognised commodities');

  return {
    _source: PSA_META_SOURCE,
    _sourceName: 'Philippine Statistics Authority — OpenSTAT, Cereals Farmgate Prices',
    _geolocation: 'Isabela',
    _coverage: `${firstYear}-${lastYear}`,
    _note:
      'Farmgate price is what a farmer is paid at the farm. Monthly provincial average; ' +
      'PSA publishes some months late, so the most recent month may be absent.',
    series,
  };
}

// ---------------------------------------------------------------------------
// Source 2 — DA Bantay Presyo retail prices
// ---------------------------------------------------------------------------

function stripTags(html) {
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractCells(rowHtml) {
  const cells = [];
  const re = /<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi;
  let m;
  while ((m = re.exec(rowHtml)) !== null) cells.push(stripTags(m[1]));
  return cells;
}

async function fetchRetailCategory(category) {
  const body = new URLSearchParams({ commodity: category.code, region: REGION_II_GEOCODE });
  const opts = {
    method: 'POST',
    body: body.toString(),
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  };

  const headerHtml = await request(`${BP_BASE}/tbl_price_get_comm_header_rice.php`, {
    ...opts,
    fixture: `retail-header-${category.id}.html`,
  });
  const priceHtml = await request(`${BP_BASE}/tbl_price_get_comm_price_rice.php`, {
    ...opts,
    fixture: `retail-${category.id}.html`,
  });

  const columns = extractCells(headerHtml);
  if (columns.length < 3) throw new Error(`Bantay Presyo header malformed for ${category.id}`);

  // Which column indices belong to Isabela markets.
  const wanted = [];
  columns.forEach((name, i) => {
    if (ISABELA_MARKETS.includes(name.toUpperCase())) wanted.push({ index: i, market: name });
  });
  if (!wanted.length) throw new Error(`No Isabela markets found for ${category.id}`);

  const items = [];
  const rowRe = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let m;
  while ((m = rowRe.exec(priceHtml)) !== null) {
    const cells = extractCells(m[1]);
    if (cells.length < 3) continue;
    const commodity = cells[0];
    if (!commodity || /^commodity$/i.test(commodity)) continue;

    const markets = wanted
      .map(({ index, market }) => ({ market, price: parsePrice(cells[index]) }))
      .filter((x) => x.price !== null);
    if (!markets.length) continue;

    items.push({ commodity, specification: cells[1] || '', markets });
  }

  return { category: category.id, label: category.label, items };
}

async function fetchRetail() {
  const categories = [];
  for (const category of RETAIL_CATEGORIES) {
    categories.push(await fetchRetailCategory(category));
  }

  let asOf = '';
  try {
    asOf = stripTags(
      await request(`${BP_BASE}/tbl_rice.php`, {
        method: 'POST',
        body: new URLSearchParams({
          action: 'get_latest_date',
          region: REGION_II_GEOCODE,
          commodity: '1',
        }).toString(),
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        fixture: 'retail-date.txt',
      })
    );
  } catch {
    asOf = '';
  }

  return {
    _source: BP_SOURCE,
    _sourceName: 'Department of Agriculture — Bantay Presyo (DA Price Watch)',
    _region: 'Region II (Cagayan Valley)',
    _markets: ISABELA_MARKETS,
    _asOf: asOf,
    _note:
      'Retail price is what a shopper pays at the public market. Shown for the five ' +
      'Region II markets located in Isabela.',
    categories,
  };
}

// ---------------------------------------------------------------------------
// Assemble
// ---------------------------------------------------------------------------

function readExisting() {
  try {
    return JSON.parse(fs.readFileSync(CONFIG.outPath, 'utf8'));
  } catch {
    return null;
  }
}

/** Signals the workflow whether a deploy is warranted (same contract as sync-facebook.js). */
function reportChanged(changed) {
  if (process.env.GITHUB_OUTPUT) {
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `changed=${changed ? 'true' : 'false'}\n`);
  }
}

/**
 * Compares payloads on price content alone. The generation timestamp always moves,
 * and `_problems` flips on any transient network blip — counting either as a change
 * would redeploy identical prices every run.
 */
function isMeaningfullyDifferent(next, previous) {
  if (!previous) return true;
  const strip = (o) => JSON.stringify({ ...o, _generated: null, _problems: null });
  return strip(next) !== strip(previous);
}

/**
 * Farmgate minus retail is the headline both audiences lack. Compare palay
 * farmgate against the cheapest regular-milled local rice on offer, which is the
 * closest consumer-side equivalent.
 */
function deriveSpread(farmgate, retail) {
  const palay = farmgate?.series?.find((s) => s.commodity === 'palay');
  if (!palay?.latest) return null;

  const rice = retail?.categories?.find((c) => c.category === 'rice');
  const regular = rice?.items?.find(
    (i) => /regular milled/i.test(i.commodity) && /local/i.test(i.commodity)
  );
  if (!regular?.markets?.length) return null;

  const prices = regular.markets.map((m) => m.price);
  const average = prices.reduce((a, b) => a + b, 0) / prices.length;

  return {
    farmgatePalay: palay.latest.price,
    farmgatePeriod: palay.latest.period,
    retailRiceAverage: Number(average.toFixed(2)),
    retailBasis: `${regular.commodity} — average of ${prices.length} Isabela market(s)`,
    spread: Number((average - palay.latest.price).toFixed(2)),
    unit: 'PHP/kg',
    _note:
      'Palay and milled rice are not the same good — roughly 1 kg of palay yields ' +
      '0.65 kg of milled rice — so this is an indicative gap, not a margin.',
  };
}

async function main() {
  const existing = readExisting();
  const problems = [];

  let farmgate = null;
  try {
    farmgate = await fetchFarmgate();
    const n = farmgate.series.reduce((a, s) => a + s.points.length, 0);
    console.log(`PSA farmgate: ${farmgate.series.length} series, ${n} monthly observation(s)`);
  } catch (error) {
    problems.push(`farmgate: ${error.message}`);
    farmgate = existing?.farmgate || null;
    console.warn(`PSA farmgate failed (${error.message}) — keeping previous data`);
  }

  let retail = null;
  try {
    retail = await fetchRetail();
    const n = retail.categories.reduce((a, c) => a + c.items.length, 0);
    console.log(`Bantay Presyo retail: ${n} item(s) across ${retail.categories.length} categories`);
  } catch (error) {
    problems.push(`retail: ${error.message}`);
    retail = existing?.retail || null;
    console.warn(`Bantay Presyo failed (${error.message}) — keeping previous data`);
  }

  if (!farmgate && !retail) {
    console.error('Both sources failed and no previous data exists; leaving file untouched.');
    reportChanged(false);
    process.exitCode = 1;
    return;
  }

  const payload = {
    _schema_version: '1.0',
    _generated: new Date().toISOString(),
    _generator: 'scripts/sync-prices.js',
    _note:
      'Machine-generated. Do not hand-edit — the next scheduled run overwrites this file. ' +
      'Farmgate is what the farmer is paid; retail is what the market charges.',
    _problems: problems,
    farmgate,
    retail,
    spread: deriveSpread(farmgate, retail),
  };

  const changed = isMeaningfullyDifferent(payload, existing);
  if (!changed) {
    console.log('No price movement since the last run; file left untouched.');
    reportChanged(false);
    return;
  }

  fs.mkdirSync(path.dirname(CONFIG.outPath), { recursive: true });
  const json = `${JSON.stringify(payload, null, 2)}\n`;
  fs.writeFileSync(CONFIG.outPath, json);

  // The Next app is a separate deployment and cannot read files outside its own
  // tree, so it gets its own copy under public/.
  const appCopy = path.resolve(__dirname, '..', 'react-app', 'public', 'data', 'prices.json');
  if (fs.existsSync(path.dirname(path.dirname(appCopy)))) {
    fs.mkdirSync(path.dirname(appCopy), { recursive: true });
    fs.writeFileSync(appCopy, json);
  }

  reportChanged(true);
  console.log(`Wrote ${path.relative(process.cwd(), CONFIG.outPath)}`);
  if (problems.length) console.warn(`Completed with ${problems.length} degraded source(s).`);
}

main().catch((error) => {
  console.error(`sync-prices failed: ${error.stack || error.message}`);
  process.exitCode = 1;
});
