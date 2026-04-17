#!/usr/bin/env node
/**
 * Lint i18n & localized routing.
 *
 * The project provides:
 *   - useLocalizedNavigate (wrap useNavigate with locale prefix)
 *   - LocalizedLink from @/components/i18n (wrap react-router Link)
 *
 * This linter detects files that bypass these wrappers:
 *
 *  1. `useNavigate` imported from 'react-router-dom' (use useLocalizedNavigate).
 *  2. `<Link to="/abs">` when Link is the raw react-router-dom import (use LocalizedLink).
 *     Files that alias `LocalizedLink as Link` from @/components/i18n are exempt.
 *
 * Allowlist: i18n infra files, integrations, tests.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');

const ALLOWLIST_FILES = new Set([
  'src/hooks/useLocalizedNavigate.ts',
  'src/hooks/useLocalizedPath.tsx',
  'src/hooks/useLocalizedPath.ts',
  'src/components/i18n/LocalizedLink.tsx',
  'src/components/i18n/LanguageRouter.tsx',
  'src/components/i18n/index.ts',
  'src/App.tsx',
  'src/routes/AppRoutes.tsx',
  'src/router/index.tsx',
  'src/i18n.ts',
]);

const ALLOWLIST_DIRS = ['src/integrations/', 'src/test/', 'src/__tests__/'];

const violations = [];

function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === 'node_modules' || e.name.startsWith('.')) continue;
      walk(full);
    } else if (/\.(tsx?|jsx?)$/.test(e.name)) {
      checkFile(full);
    }
  }
}

function isAllowed(rel) {
  if (ALLOWLIST_FILES.has(rel)) return true;
  return ALLOWLIST_DIRS.some((d) => rel.startsWith(d));
}

function checkFile(absPath) {
  const rel = path.relative(ROOT, absPath).replaceAll('\\', '/');
  if (isAllowed(rel)) return;
  if (/\.(test|spec)\.(t|j)sx?$/.test(rel)) return;

  const src = fs.readFileSync(absPath, 'utf8');

  // File-level analysis: where does `Link` come from?
  const importsRawLink =
    /import\s+\{[^}]*\bLink\b(?!\s+as)[^}]*\}\s+from\s+['"]react-router-dom['"]/.test(src);
  const aliasesLocalizedLinkAsLink =
    /import\s+\{[^}]*LocalizedLink\s+as\s+Link[^}]*\}\s+from\s+['"]@\/components\/i18n['"]/.test(src);
  // If the file aliases LocalizedLink as Link, all <Link> usages are safe.
  const linkIsLocalized = aliasesLocalizedLinkAsLink && !importsRawLink;

  const lines = src.split('\n');
  lines.forEach((line, i) => {
    const lineNo = i + 1;
    const trimmed = line.trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('*')) return;

    // Rule 1: useNavigate import from react-router-dom
    if (
      /from\s+['"]react-router-dom['"]/.test(line) &&
      /\buseNavigate\b/.test(line) &&
      !/useLocalizedNavigate/.test(line)
    ) {
      violations.push({
        file: rel,
        line: lineNo,
        rule: 'no-raw-useNavigate',
        msg: 'Use { useLocalizedNavigate } from "@/hooks/useLocalizedNavigate" instead of useNavigate.',
        code: trimmed,
      });
    }

    // Rule 2: Raw <Link to="/abs"> only flagged if Link came from react-router-dom.
    if (linkIsLocalized) return;
    const linkMatch = line.match(/<Link(?=[\s>])[^>]*\sto=(?:"([^"]+)"|\{['"]([^'"]+)['"]\})/);
    if (linkMatch) {
      const target = linkMatch[1] || linkMatch[2];
      if (
        target &&
        target.startsWith('/') &&
        target !== '/' &&
        !target.startsWith('//') &&
        !/^\/(fr|en|es|de|it|pt|nl|pl|ar|zh|ja|ru|tr)\b/i.test(target) &&
        !/^\/(auth|api)\b/.test(target)
      ) {
        violations.push({
          file: rel,
          line: lineNo,
          rule: 'link-missing-locale',
          msg: `<Link to="${target}"> bypasses locale routing — use { LocalizedLink as Link } from "@/components/i18n".`,
          code: trimmed,
        });
      }
    }
  });
}

walk(SRC);

if (violations.length === 0) {
  console.log('✓ i18n routing lint: 0 violations.');
  process.exit(0);
}

console.error(`\n✗ i18n routing lint: ${violations.length} violation(s) found:\n`);
const grouped = {};
for (const v of violations) {
  grouped[v.rule] ||= [];
  grouped[v.rule].push(v);
}
for (const [rule, items] of Object.entries(grouped)) {
  console.error(`[${rule}] ${items.length} violation(s)`);
  for (const v of items.slice(0, 30)) {
    console.error(`  ${v.file}:${v.line}`);
    console.error(`    ${v.code}`);
    console.error(`    → ${v.msg}`);
  }
  if (items.length > 30) console.error(`  …and ${items.length - 30} more.`);
  console.error('');
}
process.exit(1);
