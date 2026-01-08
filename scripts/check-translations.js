/**
 * i18n Completeness Checker
 * Vérifie que toutes les clés de traduction existent dans toutes les langues
 * Inclut la vérification des traductions de pays
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOCALES_DIR = path.join(__dirname, '../src/locales');
const COUNTRIES_DATA_FILE = path.join(__dirname, '../src/lib/countries-data.ts');
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

function extractCountryIdsFromData() {
  const content = fs.readFileSync(COUNTRIES_DATA_FILE, 'utf-8');
  const countryIdRegex = /id:\s*['"]([a-z-]+)['"]/g;
  const ids = [];
  let match;
  while ((match = countryIdRegex.exec(content)) !== null) {
    ids.push(match[1]);
  }
  return [...new Set(ids)];
}

function checkCountryTranslations(translations, countryIds, lang) {
  const missingCountries = [];
  const countriesSection = translations.countries || {};
  
  for (const countryId of countryIds) {
    if (!countriesSection[countryId]) {
      missingCountries.push(countryId);
    } else {
      // Check for essential keys
      const country = countriesSection[countryId];
      const essentialKeys = ['name', 'region', 'ruleOfGold'];
      for (const key of essentialKeys) {
        if (!country[key]) {
          missingCountries.push(`${countryId}.${key}`);
        }
      }
    }
  }
  
  return missingCountries;
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
  
  // Extract country IDs from countries-data.ts
  let countryIds = [];
  try {
    countryIds = extractCountryIdsFromData();
    console.log(`📊 Found ${countryIds.length} countries in countries-data.ts\n`);
  } catch (e) {
    console.warn('⚠️  Could not parse countries-data.ts:', e.message);
  }
  
  let hasErrors = false;
  const report = {};
  
  console.log('━'.repeat(50));
  console.log('📝 GENERAL TRANSLATION CHECK');
  console.log('━'.repeat(50));
  
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
  
  // Check country translations
  if (countryIds.length > 0) {
    console.log('━'.repeat(50));
    console.log('🗺️  COUNTRY TRANSLATION CHECK');
    console.log('━'.repeat(50));
    
    for (const lang of languages) {
      const translations = loadTranslations(lang);
      if (!translations) continue;
      
      const missingCountries = checkCountryTranslations(translations, countryIds, lang);
      
      if (missingCountries.length > 0) {
        hasErrors = true;
        console.log(`❌ ${lang.toUpperCase()}: ${missingCountries.length} missing country translations`);
        missingCountries.slice(0, 10).forEach(c => console.log(`   - ${c}`));
        if (missingCountries.length > 10) {
          console.log(`   ... and ${missingCountries.length - 10} more`);
        }
      } else {
        console.log(`✅ ${lang.toUpperCase()}: All ${countryIds.length} countries have translations`);
      }
      console.log('');
    }
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
