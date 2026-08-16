#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const ignoredDirectories = new Set([
  '.git',
  '.next',
  'dist',
  'node_modules',
  'out',
  'playwright-report',
  'test-results',
]);
const sourceFiles = [];
const links = new Map();
const concurrency = 6;

function collectSourceFiles(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (ignoredDirectories.has(entry.name)) continue;
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      collectSourceFiles(absolutePath);
    } else if (entry.isFile() && /\.(?:html|tsx)$/.test(entry.name)) {
      sourceFiles.push(absolutePath);
    }
  }
}

function recordLink(rawUrl, sourceFile) {
  const url = rawUrl.replaceAll('&amp;', '&');
  if (!links.has(url)) links.set(url, new Set());
  links.get(url).add(path.relative(projectRoot, sourceFile));
}

async function request(url, method) {
  return fetch(url, {
    method,
    redirect: 'follow',
    signal: AbortSignal.timeout(15_000),
    headers: {
      'User-Agent': 'BetterIsabela-LinkAudit/1.0 (+https://betterisabela.org)',
      ...(method === 'GET' ? { Range: 'bytes=0-0' } : {}),
    },
  });
}

async function checkLink(url, sources) {
  try {
    let response = await request(url, 'HEAD');
    if ([400, 403, 405, 406, 429, 501].includes(response.status)) {
      response = await request(url, 'GET');
    }
    await response.body?.cancel();
    return {
      url,
      status: response.status,
      finalUrl: response.url,
      sources: [...sources],
    };
  } catch (error) {
    return {
      url,
      status: 'NETWORK',
      finalUrl: '',
      sources: [...sources],
      error: error.cause?.message || error.message,
    };
  }
}

async function main() {
  collectSourceFiles(projectRoot);

  const anchorPattern = /<a\b[^>]*\bhref=["'](https?:\/\/[^"']+)["']/gi;
  for (const sourceFile of sourceFiles) {
    const source = fs.readFileSync(sourceFile, 'utf8');
    for (const match of source.matchAll(anchorPattern)) recordLink(match[1], sourceFile);
  }

  const entries = [...links.entries()].sort(([left], [right]) => left.localeCompare(right));
  const results = [];
  for (let cursor = 0; cursor < entries.length; cursor += concurrency) {
    const batch = entries.slice(cursor, cursor + concurrency);
    results.push(...(await Promise.all(batch.map(([url, sources]) => checkLink(url, sources)))));
  }

  for (const result of results) {
    const redirected =
      result.finalUrl && result.finalUrl !== result.url ? ` -> ${result.finalUrl}` : '';
    const detail = result.error ? ` (${result.error})` : '';
    console.log(
      `${result.status}\t${result.url}${redirected}\t${result.sources.length} source(s)${detail}`
    );
  }

  const hardFailures = results.filter(
    (result) => result.status === 'NETWORK' || result.status === 404 || result.status === 410
  );
  console.log(`\nAudited ${results.length} unique user-facing external link(s).`);
  if (hardFailures.length > 0) {
    console.error(`${hardFailures.length} link(s) are unreachable or explicitly missing.`);
    process.exitCode = 1;
  }
}

main();
