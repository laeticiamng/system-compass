#!/usr/bin/env node

/**
 * Audit Script: Count Languages
 * Counts all supported languages and their coverage
 */

const fs = require('fs');
const path = require('path');

const LOCALES_DIR = path.join(__dirname, '../../src/locales');
const REFERENCE_LANG = 'fr';

function countKeys(obj, prefix = '') {
  let count = 0;
  for (const key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      count += countKeys(obj[key], `${prefix}${key}.`);
    } else {
      count++;
    }
  }
  return count;
}

function countLanguages() {
  console.log('🌍 System Compass - Language Counter');
  console.log('======================================\n');

  if (!fs.existsSync(LOCALES_DIR)) {
    console.error('❌ Locales directory not found:', LOCALES_DIR);
    process.exit(1);
  }

  const entries = fs.readdirSync(LOCALES_DIR, { withFileTypes: true });
  const languages = entries
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name);

  console.log(`Langues supportées: ${languages.length}`);
  console.log('───────────────────────────────\n');

  // Get reference keys count
  const refPath = path.join(LOCALES_DIR, REFERENCE_LANG, 'translation.json');
  let refKeys = 0;
  
  if (fs.existsSync(refPath)) {
    const refContent = JSON.parse(fs.readFileSync(refPath, 'utf-8'));
    refKeys = countKeys(refContent);
  }

  console.log(`Référence (${REFERENCE_LANG}): ${refKeys} clés\n`);

  // Analyze each language
  const stats = [];
  
  languages.forEach(lang => {
    const translationPath = path.join(LOCALES_DIR, lang, 'translation.json');
    
    if (fs.existsSync(translationPath)) {
      try {
        const content = JSON.parse(fs.readFileSync(translationPath, 'utf-8'));
        const keys = countKeys(content);
        const coverage = refKeys > 0 ? Math.round((keys / refKeys) * 100) : 0;
        
        stats.push({ lang, keys, coverage });
      } catch (e) {
        stats.push({ lang, keys: 0, coverage: 0, error: e.message });
      }
    } else {
      stats.push({ lang, keys: 0, coverage: 0, missing: true });
    }
  });

  // Sort by coverage
  stats.sort((a, b) => b.coverage - a.coverage);

  // Display
  console.log('Couverture par langue:');
  console.log('───────────────────────────────');
  
  stats.forEach(({ lang, keys, coverage, error, missing }) => {
    const bar = '█'.repeat(Math.floor(coverage / 5));
    const empty = '░'.repeat(20 - Math.floor(coverage / 5));
    const status = error ? '❌' : missing ? '⚠️' : coverage >= 90 ? '✅' : coverage >= 70 ? '🟡' : '🔴';
    
    console.log(`  ${status} ${lang.padEnd(5)} ${String(coverage).padStart(3)}% ${bar}${empty} (${keys} clés)`);
  });

  console.log('───────────────────────────────');
  
  const avgCoverage = Math.round(stats.reduce((sum, s) => sum + s.coverage, 0) / stats.length);
  console.log(`  Moyenne: ${avgCoverage}%`);
  
  console.log('');
  console.log(`✅ ${languages.length} langues supportées`);

  return languages.length;
}

const count = countLanguages();
process.exit(count > 0 ? 0 : 1);
