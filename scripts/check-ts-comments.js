#!/usr/bin/env node
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOTS = ['src', 'supabase'];
const ALLOWED_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx']);
const BLOCKED_DIRECTIVES = ['@ts-nocheck'];

function walk(dir, results = []) {
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry === 'dist' || entry.startsWith('.')) continue;
    const fullPath = join(dir, entry);
    const stats = statSync(fullPath);
    if (stats.isDirectory()) {
      walk(fullPath, results);
      continue;
    }

    const extension = fullPath.slice(fullPath.lastIndexOf('.'));
    if (ALLOWED_EXTENSIONS.has(extension)) {
      results.push(fullPath);
    }
  }
  return results;
}

const violations = [];

for (const root of ROOTS) {
  for (const file of walk(root)) {
    const content = readFileSync(file, 'utf8');
    const lines = content.split(/\r?\n/);
    lines.forEach((line, index) => {
      for (const directive of BLOCKED_DIRECTIVES) {
        if (line.includes(directive)) {
          violations.push(`${file}:${index + 1} -> ${directive}`);
        }
      }
    });
  }
}

if (violations.length > 0) {
  console.error('TypeScript directive audit failed:\n' + violations.join('\n'));
  process.exit(1);
}

console.log('No blocked TypeScript directives found.');
