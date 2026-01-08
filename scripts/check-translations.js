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

// Essential country translation keys that must exist for each country
const ESSENTIAL_COUNTRY_KEYS = [
  'name',
  'region', 
  'ruleOfGold',
  'pyramid.top',
  'pyramid.institutions',
  'pyramid.gatekeepers',
  'pyramid.valueCreators',
  'pyramid.base',
  'pyramid.realAsset',
  'playbook.do',
  'playbook.dont',
  'playbook.plan30Days',
  'playbook.plan12Months',
  'playbook.plan5Years',
  'playbook.planB'
];

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
  const issues = [];
  const countriesSection = translations.countries || {};
  
  for (const countryId of countryIds) {
    if (!countriesSection[countryId]) {
      issues.push({ type: 'missing_country', countryId, message: `Missing country: ${countryId}` });
      continue;
    }
    
    const country = countriesSection[countryId];
    
    // Check essential keys
    for (const keyPath of ESSENTIAL_COUNTRY_KEYS) {
      const value = getNestedValue(country, keyPath);
      if (value === undefined || value === null || value === '') {
        issues.push({ 
          type: 'missing_key', 
          countryId, 
          key: keyPath,
          message: `${countryId}.${keyPath}` 
        });
      }
    }
  }
  
  return issues;
}

function checkTranslations() {
  console.log('🌍 i18n Completeness Check\n');
  console.log('═'.repeat(60));
  
  const files = fs.readdirSync(LOCALES_DIR).filter(f => f.endsWith('.json'));
  const languages = files.map(f => f.replace('.json', ''));
  
  console.log(`Languages: ${languages.join(', ')}\n`);
  
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
    console.log(`Countries in data: ${countryIds.length}\n`);
  } catch (e) {
    console.warn('⚠️  Could not parse countries-data.ts:', e.message);
  }
  
  let hasErrors = false;
  const report = {};
  
  // ═══════════════════════════════════════════════════════════
  console.log('─'.repeat(60));
  console.log('📝 GENERAL TRANSLATION CHECK');
  console.log('─'.repeat(60));
  
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
    
    // Filter out country-specific keys from general check (they're checked separately)
    const missingNonCountryKeys = missingKeys.filter(k => !k.startsWith('countries.'));
    
    report[lang] = {
      total: langKeys.length,
      missing: missingNonCountryKeys,
      extra: extraKeys,
      coverage: ((langKeys.length / referenceKeys.length) * 100).toFixed(1)
    };
    
    if (missingNonCountryKeys.length > 0) {
      hasErrors = true;
      console.log(`❌ ${lang.toUpperCase()}: ${missingNonCountryKeys.length} missing keys`);
      missingNonCountryKeys.slice(0, 5).forEach(k => console.log(`   - ${k}`));
      if (missingNonCountryKeys.length > 5) {
        console.log(`   ... and ${missingNonCountryKeys.length - 5} more`);
      }
    } else {
      console.log(`✅ ${lang.toUpperCase()}: Complete`);
    }
  }
  
  // ═══════════════════════════════════════════════════════════
  if (countryIds.length > 0) {
    console.log('\n' + '─'.repeat(60));
    console.log('🗺️  COUNTRY TRANSLATION CHECK');
    console.log('─'.repeat(60));
    
    for (const lang of languages) {
      const translations = loadTranslations(lang);
      if (!translations) continue;
      
      const issues = checkCountryTranslations(translations, countryIds, lang);
      
      const missingCountries = issues.filter(i => i.type === 'missing_country');
      const missingKeys = issues.filter(i => i.type === 'missing_key');
      
      if (missingCountries.length > 0) {
        hasErrors = true;
        console.log(`❌ ${lang.toUpperCase()}: ${missingCountries.length} missing countries`);
        missingCountries.slice(0, 5).forEach(i => console.log(`   - ${i.countryId}`));
        if (missingCountries.length > 5) {
          console.log(`   ... and ${missingCountries.length - 5} more`);
        }
      } else if (missingKeys.length > 0) {
        // Only warn, don't fail CI for incomplete country details
        console.log(`⚠️  ${lang.toUpperCase()}: All countries exist, but ${missingKeys.length} fields incomplete`);
        missingKeys.slice(0, 3).forEach(i => console.log(`   - ${i.message}`));
        if (missingKeys.length > 3) {
          console.log(`   ... and ${missingKeys.length - 3} more`);
        }
      } else {
        console.log(`✅ ${lang.toUpperCase()}: All ${countryIds.length} countries complete`);
      }
    }
  }
  
  // ═══════════════════════════════════════════════════════════
  console.log('\n' + '═'.repeat(60));
  console.log('📊 SUMMARY');
  console.log('═'.repeat(60));
  
  for (const [lang, data] of Object.entries(report)) {
    const status = data.missing.length === 0 ? '✅' : '❌';
    console.log(`${status} ${lang.toUpperCase().padEnd(4)} | ${data.coverage.padStart(6)}% | ${String(data.missing.length).padStart(3)} missing`);
  }
  
  console.log('─'.repeat(60));
  
  if (hasErrors) {
    console.log('\n❌ Translation check FAILED');
    console.log('   Please add missing translations before deploying.\n');
    process.exit(1);
  } else {
    console.log('\n✅ All translations complete!\n');
    process.exit(0);
  }
}

checkTranslations();
