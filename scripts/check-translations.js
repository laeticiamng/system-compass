/**
 * i18n Completeness Checker
 * Vérifie que toutes les clés de traduction existent dans toutes les langues
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOCALES_DIR = path.join(__dirname, '../src/locales');
const REFERENCE_LANG = 'en';

function getAllKeys(obj, prefix = '') {
  let keys = [];
  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      keys = keys.concat(getAllKeys(obj[key], fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

function loadTranslations(lang) {
  const filePath = path.join(LOCALES_DIR, `${lang}.json`);
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Missing translation file: ${lang}.json`);
    return null;
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function checkTranslations() {
  console.log('🌍 Checking translation completeness...\n');
  
  const files = fs.readdirSync(LOCALES_DIR).filter(f => f.endsWith('.json'));
  const languages = files.map(f => f.replace('.json', ''));
  
  console.log(`Found languages: ${languages.join(', ')}\n`);
  
  const reference = loadTranslations(REFERENCE_LANG);
  if (!reference) {
    process.exit(1);
  }
  
  const referenceKeys = getAllKeys(reference);
  console.log(`Reference (${REFERENCE_LANG}): ${referenceKeys.length} keys\n`);
  
  let hasErrors = false;
  const report = {};
  
  for (const lang of languages) {
    if (lang === REFERENCE_LANG) continue;
    
    const translations = loadTranslations(lang);
    if (!translations) {
      hasErrors = true;
      continue;
    }
    
    const langKeys = getAllKeys(translations);
    const missingKeys = referenceKeys.filter(k => !langKeys.includes(k));
    const extraKeys = langKeys.filter(k => !referenceKeys.includes(k));
    
    report[lang] = {
      total: langKeys.length,
      missing: missingKeys,
      extra: extraKeys,
      coverage: ((langKeys.length / referenceKeys.length) * 100).toFixed(1)
    };
    
    if (missingKeys.length > 0) {
      hasErrors = true;
      console.log(`❌ ${lang.toUpperCase()}: ${missingKeys.length} missing keys`);
      missingKeys.slice(0, 5).forEach(k => console.log(`   - ${k}`));
      if (missingKeys.length > 5) {
        console.log(`   ... and ${missingKeys.length - 5} more`);
      }
    } else {
      console.log(`✅ ${lang.toUpperCase()}: Complete (${report[lang].coverage}% coverage)`);
    }
    
    if (extraKeys.length > 0) {
      console.log(`   ⚠️  ${extraKeys.length} extra keys (not in reference)`);
    }
    
    console.log('');
  }
  
  console.log('\n📊 Summary:');
  console.log('─'.repeat(40));
  for (const [lang, data] of Object.entries(report)) {
    const status = data.missing.length === 0 ? '✅' : '❌';
    console.log(`${status} ${lang.toUpperCase().padEnd(4)} | ${data.coverage}% | ${data.missing.length} missing`);
  }
  
  if (hasErrors) {
    console.log('\n❌ Translation check failed. Please add missing translations before deploying.');
    process.exit(1);
  } else {
    console.log('\n✅ All translations are complete!');
    process.exit(0);
  }
}

checkTranslations();
