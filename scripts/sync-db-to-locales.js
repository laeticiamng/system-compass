#!/usr/bin/env node

/**
 * Script pour synchroniser les traductions de la DB vers les fichiers locaux
 * Récupère les traductions de Supabase et les merge avec les fichiers JSON existants
 * 
 * Usage:
 *   node scripts/sync-db-to-locales.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOCALES_DIR = path.resolve(__dirname, '..', 'src', 'locales');

// Languages to sync
const LANGUAGES = ['en', 'fr', 'de', 'es', 'it', 'nl', 'pt', 'zh', 'hi', 'ar', 'bn', 'ru', 'ur'];

const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
};

/**
 * Deep merge two objects
 */
function deepMerge(target, source) {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(result[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}

/**
 * Load existing locale file
 */
function loadLocaleFile(lang) {
  const filePath = path.join(LOCALES_DIR, `${lang}.json`);
  if (!fs.existsSync(filePath)) {
    return {};
  }
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (e) {
    console.error(`${colors.red}Error reading ${lang}.json:${colors.reset}`, e.message);
    return {};
  }
}

/**
 * Save locale file
 */
function saveLocaleFile(lang, data) {
  const filePath = path.join(LOCALES_DIR, `${lang}.json`);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

/**
 * Count keys in object
 */
function countKeys(obj, prefix = '') {
  let count = 0;
  for (const key of Object.keys(obj)) {
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      count += countKeys(obj[key], `${prefix}${key}.`);
    } else {
      count++;
    }
  }
  return count;
}

async function main() {
  console.log(`\n${colors.cyan}🔄 Syncing translations from DB to local files...${colors.reset}\n`);

  // Check for Supabase credentials
  const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error(`${colors.red}Missing SUPABASE_URL or SUPABASE_KEY environment variables${colors.reset}`);
    console.log('Set them in your .env file or as environment variables');
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  // Fetch all translations from DB
  console.log('Fetching translations from database...');
  const { data, error } = await supabase
    .from('ui_translations')
    .select('language, namespace, translations')
    .in('language', LANGUAGES);

  if (error) {
    console.error(`${colors.red}Error fetching translations:${colors.reset}`, error.message);
    process.exit(1);
  }

  if (!data || data.length === 0) {
    console.log(`${colors.yellow}No translations found in database${colors.reset}`);
    process.exit(0);
  }

  console.log(`Found ${data.length} translation records\n`);

  // Group by language
  const byLanguage = {};
  for (const record of data) {
    if (!byLanguage[record.language]) {
      byLanguage[record.language] = {};
    }
    if (record.namespace === 'translation') {
      byLanguage[record.language] = deepMerge(byLanguage[record.language], record.translations || {});
    }
  }

  // Sync each language
  let totalUpdated = 0;
  for (const lang of LANGUAGES) {
    const dbTranslations = byLanguage[lang] || {};
    const localTranslations = loadLocaleFile(lang);
    
    const dbKeyCount = countKeys(dbTranslations);
    const localKeyCount = countKeys(localTranslations);
    
    // Merge: DB takes precedence, but keep local keys not in DB
    const merged = deepMerge(localTranslations, dbTranslations);
    const mergedKeyCount = countKeys(merged);
    
    const added = mergedKeyCount - localKeyCount;
    
    if (added > 0 || dbKeyCount > localKeyCount) {
      saveLocaleFile(lang, merged);
      console.log(`${colors.green}✓${colors.reset} ${lang.toUpperCase()}: ${localKeyCount} → ${mergedKeyCount} keys (+${added})`);
      totalUpdated++;
    } else {
      console.log(`${colors.yellow}○${colors.reset} ${lang.toUpperCase()}: ${localKeyCount} keys (no changes)`);
    }
  }

  console.log(`\n${colors.cyan}Done!${colors.reset} Updated ${totalUpdated} locale files.\n`);
}

main().catch(console.error);
