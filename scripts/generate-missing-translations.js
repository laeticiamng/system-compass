/**
 * Generate Missing Translations Script
 * Uses Lovable AI via edge function to translate missing content
 * 
 * Usage: 
 *   node scripts/generate-missing-translations.js [--dry-run] [--lang=de,es]
 * 
 * Options:
 *   --dry-run    Show what would be translated without making changes
 *   --lang=XX    Only process specific languages (comma-separated)
 *   --keys=XX    Only translate specific top-level keys (comma-separated)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOCALES_DIR = path.join(__dirname, '../src/locales');
const REFERENCE_LANG = 'en';

// Parse command line arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const langArg = args.find(a => a.startsWith('--lang='));
const keysArg = args.find(a => a.startsWith('--keys='));
const targetLangs = langArg ? langArg.replace('--lang=', '').split(',') : null;
const targetKeys = keysArg ? keysArg.replace('--keys=', '').split(',') : null;

// Edge function URL (you need to set this)
const EDGE_FUNCTION_URL = process.env.SUPABASE_URL 
  ? `${process.env.SUPABASE_URL}/functions/v1/generate-translations`
  : null;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

function getAllKeys(obj, prefix = '') {
  let keys = [];
  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      keys = keys.concat(getAllKeys(obj[key], fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

function getNestedValue(obj, path) {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

function setNestedValue(obj, path, value) {
  const keys = path.split('.');
  let current = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    if (!current[keys[i]]) current[keys[i]] = {};
    current = current[keys[i]];
  }
  current[keys[keys.length - 1]] = value;
}

function loadTranslations(lang) {
  const filePath = path.join(LOCALES_DIR, `${lang}.json`);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function saveTranslations(lang, translations) {
  const filePath = path.join(LOCALES_DIR, `${lang}.json`);
  fs.writeFileSync(filePath, JSON.stringify(translations, null, 2) + '\n');
}

function findMissingKeys(reference, translations, prefix = '') {
  const missing = {};
  
  for (const key in reference) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    const refValue = reference[key];
    const transValue = translations?.[key];
    
    // Filter by target keys if specified
    if (targetKeys && !prefix && !targetKeys.includes(key)) {
      continue;
    }
    
    if (typeof refValue === 'object' && refValue !== null && !Array.isArray(refValue)) {
      const nestedMissing = findMissingKeys(refValue, transValue || {}, fullKey);
      if (Object.keys(nestedMissing).length > 0) {
        missing[key] = nestedMissing;
      }
    } else if (transValue === undefined) {
      missing[key] = refValue;
    }
  }
  
  return missing;
}

async function translateWithAI(sourceText, sourceLang, targetLang, context) {
  if (!EDGE_FUNCTION_URL || !SUPABASE_ANON_KEY) {
    console.log('⚠️  Edge function URL or key not configured. Skipping AI translation.');
    console.log('   Set SUPABASE_URL and SUPABASE_ANON_KEY environment variables.');
    return null;
  }

  try {
    const response = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        sourceText,
        sourceLang,
        targetLang,
        context,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    const data = await response.json();
    return data.translation;
  } catch (error) {
    console.error(`   Translation error: ${error.message}`);
    return null;
  }
}

function deepMerge(target, source) {
  for (const key in source) {
    if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
      if (!target[key]) target[key] = {};
      deepMerge(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

async function main() {
  console.log('🌍 Missing Translation Generator\n');
  console.log('═'.repeat(60));
  
  if (isDryRun) {
    console.log('🔍 DRY RUN MODE - No files will be modified\n');
  }
  
  const reference = loadTranslations(REFERENCE_LANG);
  if (!reference) {
    console.error(`❌ Could not load reference language: ${REFERENCE_LANG}`);
    process.exit(1);
  }
  
  const files = fs.readdirSync(LOCALES_DIR).filter(f => f.endsWith('.json'));
  const languages = files.map(f => f.replace('.json', '')).filter(l => l !== REFERENCE_LANG);
  
  // Filter languages if specified
  const langsToProcess = targetLangs 
    ? languages.filter(l => targetLangs.includes(l))
    : languages;
  
  console.log(`Reference: ${REFERENCE_LANG}`);
  console.log(`Languages to process: ${langsToProcess.join(', ')}\n`);
  
  for (const lang of langsToProcess) {
    console.log('─'.repeat(60));
    console.log(`📝 Processing ${lang.toUpperCase()}`);
    console.log('─'.repeat(60));
    
    const translations = loadTranslations(lang);
    if (!translations) {
      console.log(`   ⚠️  Could not load ${lang}.json`);
      continue;
    }
    
    const missing = findMissingKeys(reference, translations);
    const missingCount = JSON.stringify(missing).split(':').length - 1;
    
    if (missingCount === 0) {
      console.log(`   ✅ No missing translations`);
      continue;
    }
    
    console.log(`   📊 Found ${missingCount} missing keys`);
    
    if (isDryRun) {
      console.log(`   Would translate:`);
      const topLevelKeys = Object.keys(missing);
      topLevelKeys.slice(0, 5).forEach(k => {
        console.log(`      - ${k}: ${JSON.stringify(missing[k]).slice(0, 50)}...`);
      });
      if (topLevelKeys.length > 5) {
        console.log(`      ... and ${topLevelKeys.length - 5} more sections`);
      }
      continue;
    }
    
    // Translate in chunks to avoid rate limits
    const chunks = [];
    const chunkSize = 20; // Keys per request
    const missingFlat = getAllKeys(missing);
    
    for (let i = 0; i < missingFlat.length; i += chunkSize) {
      const chunkKeys = missingFlat.slice(i, i + chunkSize);
      const chunk = {};
      chunkKeys.forEach(key => {
        setNestedValue(chunk, key, getNestedValue(missing, key));
      });
      chunks.push(chunk);
    }
    
    console.log(`   🔄 Translating in ${chunks.length} batch(es)...`);
    
    let translatedTotal = {};
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      console.log(`      Batch ${i + 1}/${chunks.length}...`);
      
      const translated = await translateWithAI(
        chunk,
        REFERENCE_LANG,
        lang,
        'Web application for country analysis and expatriation planning'
      );
      
      if (translated) {
        translatedTotal = deepMerge(translatedTotal, translated);
        console.log(`      ✅ Batch ${i + 1} complete`);
      } else {
        console.log(`      ⚠️  Batch ${i + 1} failed, using English fallback`);
        translatedTotal = deepMerge(translatedTotal, chunk);
      }
      
      // Rate limit delay
      if (i < chunks.length - 1) {
        await new Promise(r => setTimeout(r, 1000));
      }
    }
    
    // Merge translations
    const updated = deepMerge(translations, translatedTotal);
    saveTranslations(lang, updated);
    console.log(`   ✅ Saved ${lang}.json`);
  }
  
  console.log('\n' + '═'.repeat(60));
  console.log('✅ Translation generation complete!\n');
}

main().catch(console.error);
