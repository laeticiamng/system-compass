/**
 * Sync Country Positive Points Translations
 * Extracts positivePoints from countries-data.ts and adds them to locale files
 * 
 * Usage: node scripts/sync-positive-points.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOCALES_DIR = path.join(__dirname, '../src/locales');
const COUNTRIES_DATA_FILE = path.join(__dirname, '../src/lib/countries-data.ts');

// Translations for category titles
const CATEGORY_TRANSLATIONS = {
  en: { lifestyle: 'Lifestyle', economy: 'Economy', culture: 'Culture', infrastructure: 'Infrastructure', opportunities: 'Opportunities', nature: 'Nature & Climate' },
  fr: { lifestyle: 'Qualité de Vie', economy: 'Économie', culture: 'Culture', infrastructure: 'Infrastructure', opportunities: 'Opportunités', nature: 'Nature & Climat' },
  de: { lifestyle: 'Lebensstil', economy: 'Wirtschaft', culture: 'Kultur', infrastructure: 'Infrastruktur', opportunities: 'Möglichkeiten', nature: 'Natur & Klima' },
  es: { lifestyle: 'Estilo de Vida', economy: 'Economía', culture: 'Cultura', infrastructure: 'Infraestructura', opportunities: 'Oportunidades', nature: 'Naturaleza y Clima' },
  it: { lifestyle: 'Stile di Vita', economy: 'Economia', culture: 'Cultura', infrastructure: 'Infrastruttura', opportunities: 'Opportunità', nature: 'Natura e Clima' },
  nl: { lifestyle: 'Levensstijl', economy: 'Economie', culture: 'Cultuur', infrastructure: 'Infrastructuur', opportunities: 'Kansen', nature: 'Natuur & Klimaat' },
  pt: { lifestyle: 'Estilo de Vida', economy: 'Economia', culture: 'Cultura', infrastructure: 'Infraestrutura', opportunities: 'Oportunidades', nature: 'Natureza e Clima' },
};

function extractPositivePointsFromData() {
  const content = fs.readFileSync(COUNTRIES_DATA_FILE, 'utf-8');
  
  // Match country blocks with their positivePoints
  const countryRegex = /\{\s*id:\s*['"]([a-z-]+)['"]/g;
  const positivePointsRegex = /positivePoints:\s*\{([^}]+(?:\{[^}]*\}[^}]*)*)\}/g;
  
  const countries = {};
  let match;
  
  // Find all country IDs and their positions
  const countryPositions = [];
  while ((match = countryRegex.exec(content)) !== null) {
    countryPositions.push({ id: match[1], position: match.index });
  }
  
  // For each country, find the positivePoints that follows it
  for (let i = 0; i < countryPositions.length; i++) {
    const country = countryPositions[i];
    const nextCountryPos = countryPositions[i + 1]?.position || content.length;
    const countryBlock = content.slice(country.position, nextCountryPos);
    
    // Extract positivePoints from this country block
    const ppMatch = countryBlock.match(/positivePoints:\s*\{([\s\S]*?)\n\s*\}/);
    if (ppMatch) {
      try {
        // Parse the positivePoints object
        const ppContent = ppMatch[1];
        const categories = ['lifestyle', 'economy', 'culture', 'infrastructure', 'opportunities', 'nature'];
        const positivePoints = {};
        
        for (const cat of categories) {
          const catMatch = ppContent.match(new RegExp(`${cat}:\\s*\\[([^\\]]+)\\]`));
          if (catMatch) {
            // Extract array items
            const items = catMatch[1].match(/'([^']+)'|"([^"]+)"/g);
            if (items) {
              positivePoints[cat] = items.map(item => item.slice(1, -1));
            }
          }
        }
        
        if (Object.keys(positivePoints).length > 0) {
          countries[country.id] = positivePoints;
        }
      } catch (e) {
        console.warn(`Could not parse positivePoints for ${country.id}:`, e.message);
      }
    }
  }
  
  return countries;
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

function main() {
  console.log('🌍 Syncing Country Positive Points\n');
  console.log('═'.repeat(50));
  
  // Extract positivePoints from countries-data.ts
  const countryPositivePoints = extractPositivePointsFromData();
  const countryCount = Object.keys(countryPositivePoints).length;
  
  console.log(`Found ${countryCount} countries with positivePoints in data\n`);
  
  // List countries found
  console.log('Countries:', Object.keys(countryPositivePoints).join(', '));
  console.log('');
  
  // Process each locale
  const files = fs.readdirSync(LOCALES_DIR).filter(f => f.endsWith('.json'));
  
  for (const file of files) {
    const lang = file.replace('.json', '');
    console.log(`\n📝 Processing ${lang.toUpperCase()}`);
    
    const translations = loadTranslations(lang);
    if (!translations) continue;
    
    if (!translations.countries) {
      translations.countries = {};
    }
    
    let added = 0;
    let updated = 0;
    
    for (const [countryId, positivePoints] of Object.entries(countryPositivePoints)) {
      if (!translations.countries[countryId]) {
        // Country doesn't exist in translations yet, skip
        continue;
      }
      
      // Check if positivePoints exists for this country
      if (!translations.countries[countryId].positivePoints) {
        // For English, use the data directly
        if (lang === 'en') {
          translations.countries[countryId].positivePoints = positivePoints;
          added++;
        } else {
          // For other languages, add English as placeholder (marked for translation)
          translations.countries[countryId].positivePoints = positivePoints;
          added++;
        }
      }
    }
    
    // Save if changes were made
    if (added > 0 || updated > 0) {
      saveTranslations(lang, translations);
      console.log(`   ✅ Added ${added} positivePoints sections`);
    } else {
      console.log(`   ℹ️  No changes needed`);
    }
  }
  
  console.log('\n' + '═'.repeat(50));
  console.log('✅ Sync complete!');
  console.log('\n💡 Note: Non-English languages have English placeholders.');
  console.log('   Run generate-missing-translations.js to translate them.\n');
}

main();
