#!/usr/bin/env node

/**
 * Script de génération du rapport de couverture i18n
 * Génère un fichier JSON pour les badges et un rapport détaillé
 * 
 * Usage:
 *   node scripts/generate-i18n-coverage.js
 *   node scripts/generate-i18n-coverage.js --output=coverage
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REFERENCE_LANG = 'en';
const LOCALES_DIR = path.resolve(__dirname, '..', 'src', 'locales');
const LANGUAGES = ['en', 'fr', 'de', 'es', 'it', 'nl', 'pt'];

const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  dim: '\x1b[2m',
};

/**
 * Extrait toutes les clés d'un objet de traduction
 */
function extractKeys(obj, prefix = '') {
  const keys = [];
  
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      keys.push(...extractKeys(value, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  
  return keys;
}

/**
 * Obtient une valeur imbriquée
 */
function getNestedValue(obj, keyPath) {
  const parts = keyPath.split('.');
  let current = obj;
  
  for (const part of parts) {
    if (current === undefined || current === null || typeof current !== 'object') {
      return undefined;
    }
    current = current[part];
  }
  
  return current;
}

/**
 * Charge un fichier de traduction
 */
function loadTranslation(lang) {
  const filePath = path.join(LOCALES_DIR, `${lang}.json`);
  
  if (!fs.existsSync(filePath)) {
    return null;
  }
  
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (e) {
    return null;
  }
}

/**
 * Détermine la couleur du badge selon le pourcentage
 */
function getBadgeColor(percentage) {
  if (percentage >= 95) return 'brightgreen';
  if (percentage >= 80) return 'green';
  if (percentage >= 60) return 'yellowgreen';
  if (percentage >= 40) return 'yellow';
  if (percentage >= 20) return 'orange';
  return 'red';
}

/**
 * Génère le rapport de couverture
 */
function generateCoverageReport() {
  console.log(`\n${colors.cyan}📊 Génération du rapport de couverture i18n...${colors.reset}\n`);
  
  // Charger la langue de référence
  const referenceTranslations = loadTranslation(REFERENCE_LANG);
  
  if (!referenceTranslations) {
    console.error(`${colors.red}Erreur: Impossible de charger ${REFERENCE_LANG}.json${colors.reset}`);
    process.exit(1);
  }
  
  const referenceKeys = extractKeys(referenceTranslations);
  const totalKeys = referenceKeys.length;
  
  console.log(`${colors.dim}Langue de référence: ${REFERENCE_LANG} (${totalKeys} clés)${colors.reset}\n`);
  
  const languageStats = [];
  let totalPresent = 0;
  let totalMissing = 0;
  
  for (const lang of LANGUAGES) {
    const translations = loadTranslation(lang);
    
    if (!translations) {
      languageStats.push({
        code: lang,
        name: getLanguageName(lang),
        present: 0,
        missing: totalKeys,
        empty: 0,
        percentage: 0,
      });
      totalMissing += totalKeys;
      continue;
    }
    
    let present = 0;
    let missing = 0;
    let empty = 0;
    const missingKeys = [];
    
    for (const key of referenceKeys) {
      const value = getNestedValue(translations, key);
      
      if (value === undefined) {
        missing++;
        missingKeys.push(key);
      } else if (value === '') {
        empty++;
        present++; // Count as present but empty
      } else {
        present++;
      }
    }
    
    const percentage = (present / totalKeys) * 100;
    
    languageStats.push({
      code: lang,
      name: getLanguageName(lang),
      present,
      missing,
      empty,
      percentage: Math.round(percentage * 10) / 10,
      missingKeys: missingKeys.slice(0, 20), // Limiter pour le rapport
    });
    
    totalPresent += present;
    totalMissing += missing;
  }
  
  // Calculer la couverture globale
  const totalPossible = totalKeys * LANGUAGES.length;
  const overallPercentage = (totalPresent / totalPossible) * 100;
  
  const report = {
    generated_at: new Date().toISOString(),
    reference_language: REFERENCE_LANG,
    total_keys: totalKeys,
    languages: languageStats,
    overall: {
      total_translations: totalPossible,
      present: totalPresent,
      missing: totalMissing,
      percentage: Math.round(overallPercentage * 10) / 10,
    },
  };
  
  return report;
}

/**
 * Retourne le nom complet d'une langue
 */
function getLanguageName(code) {
  const names = {
    en: 'English',
    fr: 'Français',
    de: 'Deutsch',
    es: 'Español',
    it: 'Italiano',
    nl: 'Nederlands',
    pt: 'Português',
  };
  return names[code] || code;
}

/**
 * Génère le fichier de badge pour shields.io
 */
function generateBadgeJson(report, outputDir) {
  // Badge global
  const overallBadge = {
    schemaVersion: 1,
    label: 'i18n coverage',
    message: `${report.overall.percentage}%`,
    color: getBadgeColor(report.overall.percentage),
  };
  
  fs.writeFileSync(
    path.join(outputDir, 'i18n-coverage.json'),
    JSON.stringify(overallBadge, null, 2)
  );
  
  // Badges par langue
  for (const lang of report.languages) {
    const langBadge = {
      schemaVersion: 1,
      label: `i18n ${lang.code}`,
      message: `${lang.percentage}%`,
      color: getBadgeColor(lang.percentage),
    };
    
    fs.writeFileSync(
      path.join(outputDir, `i18n-${lang.code}.json`),
      JSON.stringify(langBadge, null, 2)
    );
  }
}

/**
 * Génère un rapport Markdown
 */
function generateMarkdownReport(report) {
  const lines = [
    '# 🌍 Rapport de Couverture i18n',
    '',
    `> Généré le ${new Date(report.generated_at).toLocaleString('fr-FR')}`,
    '',
    '## 📊 Résumé Global',
    '',
    `| Métrique | Valeur |`,
    `|----------|--------|`,
    `| Langue de référence | ${report.reference_language.toUpperCase()} |`,
    `| Clés totales | ${report.total_keys} |`,
    `| Traductions présentes | ${report.overall.present}/${report.overall.total_translations} |`,
    `| **Couverture globale** | **${report.overall.percentage}%** |`,
    '',
    '## 📈 Couverture par Langue',
    '',
    '| Langue | Code | Présentes | Manquantes | Vides | Couverture |',
    '|--------|------|-----------|------------|-------|------------|',
  ];
  
  for (const lang of report.languages) {
    const bar = getProgressBar(lang.percentage);
    lines.push(
      `| ${lang.name} | ${lang.code} | ${lang.present} | ${lang.missing} | ${lang.empty} | ${bar} ${lang.percentage}% |`
    );
  }
  
  // Ajouter les détails des clés manquantes pour chaque langue
  lines.push('', '## 🔍 Clés Manquantes (aperçu)', '');
  
  for (const lang of report.languages) {
    if (lang.missingKeys && lang.missingKeys.length > 0) {
      lines.push(`### ${lang.name} (${lang.code})`, '');
      lines.push('<details>');
      lines.push(`<summary>${lang.missing} clé(s) manquante(s)</summary>`, '');
      lines.push('```');
      lang.missingKeys.forEach(key => lines.push(key));
      if (lang.missing > 20) {
        lines.push(`... et ${lang.missing - 20} autres`);
      }
      lines.push('```', '</details>', '');
    }
  }
  
  lines.push(
    '',
    '## 🏷️ Badges',
    '',
    '### Badge Global',
    '',
    '```markdown',
    '![i18n Coverage](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/YOUR_USER/YOUR_REPO/main/.github/badges/i18n-coverage.json)',
    '```',
    '',
    '### Badges par Langue',
    '',
  );
  
  for (const lang of report.languages) {
    lines.push(
      `- ![${lang.code}](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/YOUR_USER/YOUR_REPO/main/.github/badges/i18n-${lang.code}.json) ${lang.name}`
    );
  }
  
  return lines.join('\n');
}

/**
 * Génère une barre de progression ASCII
 */
function getProgressBar(percentage) {
  const filled = Math.round(percentage / 10);
  const empty = 10 - filled;
  return '█'.repeat(filled) + '░'.repeat(empty);
}

/**
 * Point d'entrée principal
 */
function main() {
  const args = process.argv.slice(2);
  const outputArg = args.find(arg => arg.startsWith('--output='));
  const outputDir = outputArg 
    ? path.resolve(__dirname, '..', outputArg.replace('--output=', ''))
    : path.resolve(__dirname, '..', '.github', 'badges');
  
  // Créer le dossier de sortie
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Générer le rapport
  const report = generateCoverageReport();
  
  // Sauvegarder le rapport JSON complet
  const reportPath = path.join(outputDir, 'i18n-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`${colors.green}✓ Rapport JSON: ${reportPath}${colors.reset}`);
  
  // Générer les fichiers de badge
  generateBadgeJson(report, outputDir);
  console.log(`${colors.green}✓ Badges JSON générés dans ${outputDir}${colors.reset}`);
  
  // Générer le rapport Markdown
  const markdownPath = path.join(outputDir, 'I18N_COVERAGE.md');
  fs.writeFileSync(markdownPath, generateMarkdownReport(report));
  console.log(`${colors.green}✓ Rapport Markdown: ${markdownPath}${colors.reset}`);
  
  // Afficher le résumé
  console.log(`\n${colors.cyan}─────────────────────────────────────────${colors.reset}`);
  console.log(`\n📊 Couverture i18n: ${colors.green}${report.overall.percentage}%${colors.reset}\n`);
  
  for (const lang of report.languages) {
    const bar = getProgressBar(lang.percentage);
    const color = lang.percentage >= 95 ? colors.green : (lang.percentage >= 80 ? colors.yellow : colors.red);
    console.log(`  ${lang.code.toUpperCase()} ${bar} ${color}${lang.percentage}%${colors.reset}`);
  }
  
  console.log('');
  
  // Retourner le code de sortie basé sur la couverture globale
  if (report.overall.percentage < 80) {
    console.log(`${colors.yellow}⚠ Couverture en dessous de 80%${colors.reset}\n`);
  }
  
  process.exit(0);
}

main();
