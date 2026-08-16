#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const siteRoot = path.resolve(projectRoot, process.env.CRAWL_ROOT || 'dist');
const baseUrl = new URL(process.argv[2] || process.env.CRAWL_BASE_URL || 'http://localhost:8080/');
const concurrency = 16;

const queued = new Set();
const queue = [];
const failures = [];
let htmlCount = 0;

function enqueue(rawUrl, source = 'seed') {
  let url;
  try {
    url = new URL(rawUrl, baseUrl);
  } catch {
    return;
  }

  if (url.origin !== baseUrl.origin || !['http:', 'https:'].includes(url.protocol)) return;
  url.hash = '';

  const key = url.href;
  if (queued.has(key)) return;
  queued.add(key);
  queue.push({ url, source });
}

function collectHtmlSeeds(directory) {
  if (!fs.existsSync(directory)) return;

  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      collectHtmlSeeds(absolutePath);
      continue;
    }
    if (!entry.isFile() || !entry.name.endsWith('.html')) continue;

    const relativePath = path.relative(siteRoot, absolutePath).split(path.sep).join('/');
    let publicPath;
    if (relativePath === 'index.html') {
      publicPath = '/';
    } else if (relativePath.endsWith('/index.html')) {
      publicPath = `/${relativePath.slice(0, -'index.html'.length)}`;
    } else {
      publicPath = `/${relativePath.slice(0, -'.html'.length)}`;
    }
    enqueue(publicPath, `file:${relativePath}`);
  }
}

function enqueueHtmlReferences(html, responseUrl) {
  const attributePattern = /\b(?:href|src|action|poster|data-src)\s*=\s*["']([^"']+)["']/gi;
  for (const match of html.matchAll(attributePattern)) {
    const reference = match[1].trim();
    if (!reference || /^(?:#|data:|javascript:|mailto:|tel:|\/\/)/i.test(reference)) continue;
    enqueue(new URL(reference, responseUrl), responseUrl);
  }

  const srcsetPattern = /\bsrcset\s*=\s*["']([^"']+)["']/gi;
  for (const match of html.matchAll(srcsetPattern)) {
    for (const candidate of match[1].split(',')) {
      const reference = candidate.trim().split(/\s+/, 1)[0];
      if (reference) enqueue(new URL(reference, responseUrl), responseUrl);
    }
  }
}

function enqueueCssReferences(css, responseUrl) {
  const urlPattern = /url\(\s*["']?([^"')]+)["']?\s*\)/gi;
  for (const match of css.matchAll(urlPattern)) {
    const reference = match[1].trim();
    if (!reference || /^(?:data:|\/\/)/i.test(reference)) continue;
    enqueue(new URL(reference, responseUrl), responseUrl);
  }
}

function enqueueSitemapReferences(xml) {
  for (const match of xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi)) {
    try {
      const publishedUrl = new URL(match[1]);
      enqueue(`${publishedUrl.pathname}${publishedUrl.search}`, '/sitemap.xml');
    } catch {
      failures.push({ status: 'INVALID', url: match[1], source: '/sitemap.xml' });
    }
  }
}

function enqueueManifestReferences(value, responseUrl, key = '') {
  if (Array.isArray(value)) {
    for (const item of value) enqueueManifestReferences(item, responseUrl, key);
    return;
  }
  if (value && typeof value === 'object') {
    for (const [childKey, childValue] of Object.entries(value)) {
      enqueueManifestReferences(childValue, responseUrl, childKey);
    }
    return;
  }
  if (typeof value !== 'string' || !['src', 'start_url', 'url'].includes(key)) return;
  if (/^(?:data:|https?:|\/\/)/i.test(value)) {
    if (value.startsWith('/')) enqueue(new URL(value, responseUrl), responseUrl);
    return;
  }
  enqueue(new URL(value, responseUrl), responseUrl);
}

async function checkUrl(item) {
  let response;
  try {
    response = await fetch(item.url, { redirect: 'follow' });
  } catch (error) {
    failures.push({
      status: 'NETWORK',
      url: item.url.href,
      source: item.source,
      detail: error.message,
    });
    return;
  }

  if (!response.ok) {
    failures.push({ status: response.status, url: item.url.href, source: item.source });
    return;
  }

  const contentType = response.headers.get('content-type') || '';
  if (
    !/(?:text\/html|text\/css|application\/(?:manifest\+json|xml|xhtml\+xml)|text\/xml)/i.test(
      contentType
    )
  ) {
    await response.arrayBuffer();
    return;
  }

  const body = await response.text();
  if (/text\/html|application\/xhtml\+xml/i.test(contentType)) {
    htmlCount += 1;
    enqueueHtmlReferences(body, response.url);
  } else if (/text\/css/i.test(contentType)) {
    enqueueCssReferences(body, response.url);
  } else if (/manifest\+json/i.test(contentType)) {
    try {
      enqueueManifestReferences(JSON.parse(body), response.url);
    } catch (error) {
      failures.push({
        status: 'INVALID',
        url: response.url,
        source: item.source,
        detail: `Invalid web manifest: ${error.message}`,
      });
    }
  } else if (/xml/i.test(contentType)) {
    enqueueSitemapReferences(body);
  }
}

async function main() {
  collectHtmlSeeds(siteRoot);
  enqueue('/sitemap.xml');

  for (let cursor = 0; cursor < queue.length; cursor += concurrency) {
    const batch = queue.slice(cursor, cursor + concurrency);
    await Promise.all(batch.map(checkUrl));
  }

  if (failures.length > 0) {
    console.error(`Found ${failures.length} failing localhost URL(s):`);
    for (const failure of failures) {
      const detail = failure.detail ? ` — ${failure.detail}` : '';
      console.error(`- ${failure.status} ${failure.url} (from ${failure.source})${detail}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log(
    `Crawled ${queued.size} local URL(s), including ${htmlCount} HTML responses; all returned successfully.`
  );
}

main();
