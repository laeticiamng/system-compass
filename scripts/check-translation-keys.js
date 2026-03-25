#!/usr/bin/env node

/**
 * Translation Key Verification Script
 * 
 * This script scans source files for translation key usage (t() calls)
 * and verifies that all used keys exist in the translation files.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuration
const SRC_DIR = path.join(__dirname, '..', 'src');
const LOCALES_DIR = path.join(SRC_DIR, 'locales');
const REFERENCE_LANGS = ['en', 'fr'];

// Patterns to extract translation keys
const T_FUNCTION_PATTERNS = [
  /t\(\s*['"`]([^'"`]+)['"`]\s*(?:,\s*['"`][^'"`]*['"`])?\s*\)/g,
  /t\(\s*`([^`]+)`\s*(?:,\s*['"`][^'"`]*['"`])?\s*\)/g,
];

// Dynamic key patterns to exclude (interpolated keys)
const DYNAMIC_KEY_PATTERNS = [
  /\$\{/,
  /^\s*$/,
];

// Known dynamic key prefixes (these are built dynamically and should be skipped)
const DYNAMIC_KEY_PREFIXES = [
  'countries.',
  'universalErrors.errors.',
  'systemicMistakes.mistakes.',
  'pyramids.',
  'pyramidTypes.',
  'exitKeysData.',
  'professions.',
  'nationalityAdvantages.',
];

/**
 * Recursively get all TypeScript/TypeScript React files
 */
function getSourceFiles(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      // Skip node_modules and other non-source directories
      if (!['node_modules', 'dist', '.git', 'locales'].includes(entry.name)) {
        getSourceFiles(fullPath, files);
      }
    } else if (entry.isFile() && /\.(tsx?|jsx?)$/.test(entry.name)) {
      files.push(fullPath);
    }
  }
  
  return files;
}

/**
 * Extract translation keys from a file
 */
function extractKeysFromFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const keys = new Set();
  
  for (const pattern of T_FUNCTION_PATTERNS) {
    // Reset lastIndex for global patterns
    pattern.lastIndex = 0;
    
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const key = match[1];
      
      // Skip dynamic keys
      const isDynamic = DYNAMIC_KEY_PATTERNS.some(p => p.test(key));
      if (isDynamic) continue;
      
      // Skip known dynamic prefixes
      const hasDynamicPrefix = DYNAMIC_KEY_PREFIXES.some(prefix => key.startsWith(prefix));
      if (hasDynamicPrefix) continue;
      
      keys.add(key);
    }
  }
  
  return { filePath, keys };
}

/**
 * Get nested value from object using dot notation
 */
function getNestedValue(obj, keyPath) {
  const parts = keyPath.split('.');
  let current = obj;
  
  for (const part of parts) {
    if (current === undefined || current === null) {
      return undefined;
    }
    current = current[part];
  }
  
  return current;
}

/**
 * Load translations for a language
 */
function loadTranslations(lang) {
  const filePath = path.join(LOCALES_DIR, `${lang}.json`);
  
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Translation file not found: ${filePath}`);
    return null;
  }
  
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (error) {
    console.error(`❌ Error parsing ${filePath}: ${error.message}`);
    return null;
  }
}

/**
 * Main verification function
 */
function verifyTranslationKeys() {
  console.log('🔍 Translation Key Verification\n');
  console.log('='.repeat(60));
  
  // Load translations
  const translations = {};
  for (const lang of REFERENCE_LANGS) {
    translations[lang] = loadTranslations(lang);
    if (!translations[lang]) {
      process.exit(1);
    }
  }
  
  // Get all source files
  const sourceFiles = getSourceFiles(SRC_DIR);
  console.log(`\n📁 Scanning ${sourceFiles.length} source files...\n`);
  
  // Extract all keys from source files
  const allKeys = new Map(); // key -> Set of file paths
  
  for (const file of sourceFiles) {
    const { keys } = extractKeysFromFile(file);
    const relativePath = path.relative(SRC_DIR, file);
    
    for (const key of keys) {
      if (!allKeys.has(key)) {
        allKeys.set(key, new Set());
      }
      allKeys.get(key).add(relativePath);
    }
  }
  
  console.log(`🔑 Found ${allKeys.size} unique translation keys\n`);
  
  // Check for missing keys in each language
  const missingKeys = {};
  
  for (const lang of REFERENCE_LANGS) {
    missingKeys[lang] = [];
    
    for (const [key, files] of allKeys) {
      const value = getNestedValue(translations[lang], key);
      
      if (value === undefined) {
        missingKeys[lang].push({ key, files: Array.from(files) });
      }
    }
  }
  
  // Report results
  let hasErrors = false;
  
  for (const lang of REFERENCE_LANGS) {
    const missing = missingKeys[lang];
    
    if (missing.length > 0) {
      hasErrors = true;
      console.log(`\n❌ Missing keys in ${lang}.json (${missing.length}):\n`);
      
      for (const { key, files } of missing.slice(0, 50)) { // Limit output
        console.log(`  • ${key}`);
        console.log(`    Used in: ${files.slice(0, 3).join(', ')}${files.length > 3 ? '...' : ''}`);
      }
      
      if (missing.length > 50) {
        console.log(`\n  ... and ${missing.length - 50} more missing keys`);
      }
    } else {
      console.log(`\n✅ All keys exist in ${lang}.json`);
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Summary:\n');
  
  for (const lang of REFERENCE_LANGS) {
    const missing = missingKeys[lang].length;
    const total = allKeys.size;
    const coverage = ((total - missing) / total * 100).toFixed(1);
    
    console.log(`  ${lang}.json: ${total - missing}/${total} keys (${coverage}% coverage)`);
  }
  
  if (hasErrors) {
    console.log('\n⚠️  Some translation keys are missing. Please add them to the locale files.\n');
    process.exit(1);
  } else {
    console.log('\n✅ All translation keys are properly defined!\n');
    process.exit(0);
  }
}

// Run the verification
verifyTranslationKeys();
