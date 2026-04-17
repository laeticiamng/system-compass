#!/usr/bin/env node
/**
 * Codemod: convert raw <Link> imports from react-router-dom into <LocalizedLink>
 * for files that use absolute paths (/dashboard, /countries, ...).
 *
 * Strategy (safe):
 *   1. Find files that import { Link } from 'react-router-dom' AND have at least
 *      one <Link to="/abs">.
 *   2. Replace the named import: drop `Link`, add separate import of LocalizedLink.
 *   3. Rename JSX `<Link` / `</Link>` to `<LocalizedLink` / `</LocalizedLink>`.
 *
 * Skip:
 *   - Files in src/integrations/, src/test/, allowlist.
 *   - Files where Link is only used with relative paths.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const DRY = process.argv.includes('--dry');

const ALLOWLIST = new Set([
  'src/components/common/LocalizedLink.tsx',
  'src/hooks/useLocalizedNavigate.ts',
  'src/hooks/useLocalizedPath.tsx',
  'src/App.tsx',
]);

let touched = 0;
const changes = [];

function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === 'node_modules' || e.name.startsWith('.')) continue;
      walk(full);
    } else if (/\.(tsx?|jsx?)$/.test(e.name)) {
      transform(full);
    }
  }
}

function transform(absPath) {
  const rel = path.relative(ROOT, absPath).replaceAll('\\', '/');
  if (ALLOWLIST.has(rel)) return;
  if (rel.startsWith('src/integrations/') || rel.startsWith('src/test/')) return;

  let src = fs.readFileSync(absPath, 'utf8');

  // Bail if no react-router Link import
  if (!/import\s+\{[^}]*\bLink\b[^}]*\}\s+from\s+['"]react-router-dom['"]/.test(src)) return;

  // Bail if no absolute-path Link (any /path that is not /fr|/en|/auth|/api...)
  const absLinkRegex =
    /<Link\b[^>]*\sto=(?:"\/(?!fr\b|en\b|es\b|de\b|it\b|pt\b|nl\b|pl\b|ar\b|zh\b|ja\b|ru\b|tr\b|auth\b|api\b|\/)[^"]+"|\{['"]\/(?!fr\b|en\b|es\b|de\b|it\b|pt\b|nl\b|pl\b|ar\b|zh\b|ja\b|ru\b|tr\b|auth\b|api\b|\/)[^'"]+['"]\})/;
  if (!absLinkRegex.test(src)) return;

  const before = src;

  // 1. Rewrite import: remove Link from react-router-dom named import.
  src = src.replace(
    /import\s+\{([^}]+)\}\s+from\s+['"]react-router-dom['"]/g,
    (full, names) => {
      const list = names
        .split(',')
        .map((n) => n.trim())
        .filter(Boolean);
      const filtered = list.filter((n) => n.replace(/\s+as\s+\w+/, '') !== 'Link');
      if (filtered.length === list.length) return full; // no Link in this import
      if (filtered.length === 0) return ''; // drop the whole import line
      return `import { ${filtered.join(', ')} } from 'react-router-dom'`;
    }
  );

  // Clean orphan blank import line
  src = src.replace(/^\s*\n/gm, (m, off) => (off === 0 ? m : m));

  // 2. Add LocalizedLink import (after first import block)
  if (!/from\s+['"]@\/components\/common\/LocalizedLink['"]/.test(src)) {
    const lastImportIdx = (() => {
      const re = /^import .+ from .+;?\s*$/gm;
      let m,
        last = 0;
      while ((m = re.exec(src))) last = m.index + m[0].length;
      return last;
    })();
    src =
      src.slice(0, lastImportIdx) +
      `\nimport { LocalizedLink } from '@/components/common/LocalizedLink';` +
      src.slice(lastImportIdx);
  }

  // 3. JSX rename — only the <Link / </Link> tag form (not "Link" inside identifiers).
  src = src.replace(/<Link(\s|>|\/)/g, '<LocalizedLink$1');
  src = src.replace(/<\/Link>/g, '</LocalizedLink>');

  if (src !== before) {
    touched++;
    changes.push(rel);
    if (!DRY) fs.writeFileSync(absPath, src);
  }
}

walk(SRC);

console.log(`${DRY ? '[dry-run] Would migrate' : 'Migrated'} ${touched} file(s):`);
for (const c of changes) console.log(`  ${c}`);
