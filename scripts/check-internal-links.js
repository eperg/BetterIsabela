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
const htmlFiles = [];

function collectHtmlFiles(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (ignoredDirectories.has(entry.name)) continue;

    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      collectHtmlFiles(absolutePath);
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      htmlFiles.push(absolutePath);
    }
  }
}

function resolvesToFile(candidate) {
  const possibilities = [candidate];
  if (!path.extname(candidate)) {
    possibilities.push(`${candidate}.html`, path.join(candidate, 'index.html'));
  }
  return possibilities.some((possibility) => fs.existsSync(possibility));
}

function resolveReference(sourceFile, rawReference) {
  const reference = rawReference.trim();
  if (
    !reference ||
    reference.startsWith('#') ||
    reference.startsWith('//') ||
    /^(?:data|https?|javascript|mailto|tel):/i.test(reference) ||
    reference.includes('{{')
  ) {
    return null;
  }

  const cleanReference = reference.split(/[?#]/, 1)[0];
  if (!cleanReference) return null;

  return cleanReference.startsWith('/')
    ? path.join(projectRoot, cleanReference)
    : path.resolve(path.dirname(sourceFile), cleanReference);
}

collectHtmlFiles(projectRoot);

const missingReferences = [];
const attributePattern = /\b(?:href|src)\s*=\s*["']([^"']+)["']/gi;

for (const htmlFile of htmlFiles) {
  const html = fs.readFileSync(htmlFile, 'utf8');
  for (const match of html.matchAll(attributePattern)) {
    const target = resolveReference(htmlFile, match[1]);
    if (target && !resolvesToFile(target)) {
      missingReferences.push({
        source: path.relative(projectRoot, htmlFile),
        reference: match[1],
      });
    }
  }
}

const servicesFile = path.join(projectRoot, 'data', 'services.json');
if (fs.existsSync(servicesFile)) {
  const servicesData = JSON.parse(fs.readFileSync(servicesFile, 'utf8'));
  const servicesPage = path.join(projectRoot, 'services', 'index.html');

  for (const service of servicesData.services || []) {
    if (typeof service.url !== 'string') continue;
    const target = resolveReference(servicesPage, service.url);
    if (target && !resolvesToFile(target)) {
      missingReferences.push({
        source: `data/services.json#${service.id || 'unknown'}`,
        reference: service.url,
      });
    }
  }
}

if (missingReferences.length > 0) {
  console.error(`Found ${missingReferences.length} missing internal reference(s):`);
  for (const missing of missingReferences) {
    console.error(`- ${missing.source}: ${missing.reference}`);
  }
  process.exitCode = 1;
} else {
  console.log(`Validated ${htmlFiles.length} HTML files; all internal href/src targets resolve.`);
}
