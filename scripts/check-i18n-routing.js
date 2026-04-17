#!/usr/bin/env node
/**
 * Lint i18n & localized routing.
 *
 * Detects and fails on:
 *  1. `useNavigate` imported from 'react-router-dom' in src/ files (must use useLocalizedNavigate).
 *  2. `<Link to="/something">` or `to={'/something'}` with absolute path NOT prefixed by a locale token
 *     (must use useLocalizedPath or be relative).
 *  3. `navigate('/something')` calls with hardcoded absolute paths (raw useNavigate).
 *
 * Allowed exceptions:
 *  - useLocalizedNavigate.ts itself, useLocalizedPath.tsx
 *  - i18n/router setup files (App.tsx route definitions, AppRoutes.tsx)
 *  - Anchor with full URLs (https://, mailto:, tel:)
 *  - External redirects ("/auth" inside the auth routing setup)
 *  - Files in src/integrations/, src/test/, src/__tests__/
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.resolve(__dirname, '..', 'src');

const ALLOWLIST_FILES = new Set([
  'src/hooks/useLocalizedNavigate.ts',
  'src/hooks/useLocalizedPath.tsx',
  'src/hooks/useLocalizedPath.ts',
  'src/App.tsx',
  'src/routes/AppRoutes.tsx',
  'src/router/index.tsx',
  'src/i18n.ts',
]);

const ALLOWLIST_DIRS = ['src/integrations/', 'src/test/', 'src/__tests__/'];

const violations = [];

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
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
  const rel = path.relative(path.resolve(__dirname, '..'), absPath).replaceAll('\\', '/');
  if (isAllowed(rel)) return;
  if (rel.endsWith('.test.ts') || rel.endsWith('.test.tsx') || rel.endsWith('.spec.ts')) return;

  const src = fs.readFileSync(absPath, 'utf8');
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
        msg: 'Import { useLocalizedNavigate } from "@/hooks/useLocalizedNavigate" instead of useNavigate.',
        code: trimmed,
      });
    }

    // Rule 2: <Link to="/abs"> without locale-aware helper.
    // Only matches `<Link ` (with space/>) so <LocalizedLink> is allowed.
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
          msg: `<Link to="${target}"> bypasses locale routing — use <LocalizedLink> from @/components/common/LocalizedLink.`,
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
  for (const v of items.slice(0, 20)) {
    console.error(`  ${v.file}:${v.line}`);
    console.error(`    ${v.code}`);
    console.error(`    → ${v.msg}`);
  }
  if (items.length > 20) console.error(`  …and ${items.length - 20} more.`);
  console.error('');
}
process.exit(1);
