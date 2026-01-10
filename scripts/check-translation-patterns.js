#!/usr/bin/env node

/**
 * Script de vérification des patterns de traduction problématiques
 * Détecte les doubles slashes, espaces mal placés, et autres problèmes courants
 * 
 * Usage:
 *   node scripts/check-translation-patterns.js           # Vérifie tous les fichiers
 *   node scripts/check-translation-patterns.js --fix     # Suggère les corrections
 *   node scripts/check-translation-patterns.js src/pages # Vérifie un dossier spécifique
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Couleurs pour la console
const colors = {
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  dim: '\x1b[2m',
};

// Patterns problématiques à détecter
const PROBLEMATIC_PATTERNS = [
  {
    name: 'slash-before-translation',
    description: 'Slash avant une traduction (risque de double slash)',
    regex: /\/\s*\{t\(/g,
    severity: 'error',
    suggestion: 'Inclure le slash dans la clé de traduction: {t(\'key\', \'/value\')}',
    fix: (match, context) => {
      // Exemple: "/ {t('key', 'value')}" -> "{t('key', '/ value')}"
      return context.replace(/\/\s*(\{t\([^,]+,\s*')([^']+)('\))/, '$1/ $2$3');
    }
  },
  {
    name: 'translation-before-slash',
    description: 'Traduction suivie d\'un slash (risque de double slash)',
    regex: /\{t\([^)]+\)\}\s*\//g,
    severity: 'warning',
    suggestion: 'Vérifier si le slash est déjà inclus dans la traduction',
    // Plus complexe à fixer automatiquement, nécessite vérification manuelle
  },
  {
    name: 'double-space-before-translation',
    description: 'Double espace avant une traduction',
    regex: /\s{2,}\{t\(/g,
    severity: 'warning',
    suggestion: 'Remplacer par un seul espace',
  },
  {
    name: 'double-space-after-translation',
    description: 'Double espace après une traduction',
    regex: /\{t\([^)]+\)\}\s{2,}/g,
    severity: 'warning',
    suggestion: 'Remplacer par un seul espace',
  },
  {
    name: 'colon-space-before-translation',
    description: 'Deux-points avec espace avant traduction (style français)',
    regex: /:\s+\{t\(/g,
    severity: 'info',
    suggestion: 'En français, l\'espace avant les deux-points est dans la traduction',
  },
  {
    name: 'hardcoded-currency-with-translation',
    description: 'Devise hardcodée mélangée avec traduction',
    regex: /[€$£]\s*\/\s*\{t\(/g,
    severity: 'error',
    suggestion: 'Inclure le séparateur dans la traduction: €{t(\'key\', \'/mois\')}',
  },
  {
    name: 'parenthesis-translation-mix',
    description: 'Parenthèse hardcodée avec traduction',
    regex: /\(\s*\{t\([^)]+\)\}\s*\)|^\{t\([^)]+\)\}\s*\)/g,
    severity: 'info',
    suggestion: 'Vérifier si les parenthèses doivent être dans la traduction',
  },
  {
    name: 'empty-fallback',
    description: 'Traduction avec fallback vide',
    regex: /\{t\([^,]+,\s*['"]{2}\s*\)\}/g,
    severity: 'error',
    suggestion: 'Ajouter un texte de fallback significatif',
  },
  {
    name: 'missing-fallback',
    description: 'Traduction sans fallback (potentiellement problématique)',
    regex: /\{t\(['"][^'"]+['"]\)\}/g,
    severity: 'info',
    suggestion: 'Considérer l\'ajout d\'un fallback: t(\'key\', \'fallback\')',
  },
];

// Extensions de fichiers à vérifier
const FILE_EXTENSIONS = ['.tsx', '.jsx', '.ts', '.js'];

// Dossiers à ignorer
const IGNORED_DIRS = ['node_modules', 'dist', 'build', '.git', 'coverage'];

/**
 * Parcourt récursivement un dossier
 */
function walkDir(dir, callback) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      if (!IGNORED_DIRS.includes(file)) {
        walkDir(filePath, callback);
      }
    } else if (FILE_EXTENSIONS.includes(path.extname(file))) {
      callback(filePath);
    }
  }
}

/**
 * Analyse un fichier pour trouver les patterns problématiques
 */
function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const issues = [];
  
  for (const pattern of PROBLEMATIC_PATTERNS) {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const matches = line.matchAll(pattern.regex);
      
      for (const match of matches) {
        // Ignorer les commentaires
        const beforeMatch = line.substring(0, match.index);
        if (beforeMatch.includes('//') || beforeMatch.includes('/*')) {
          continue;
        }
        
        issues.push({
          file: filePath,
          line: i + 1,
          column: match.index + 1,
          pattern: pattern.name,
          description: pattern.description,
          severity: pattern.severity,
          suggestion: pattern.suggestion,
          context: line.trim(),
          match: match[0],
        });
      }
    }
  }
  
  return issues;
}

/**
 * Formate un issue pour l'affichage
 */
function formatIssue(issue) {
  const severityColors = {
    error: colors.red,
    warning: colors.yellow,
    info: colors.cyan,
  };
  
  const severitySymbols = {
    error: '✗',
    warning: '⚠',
    info: 'ℹ',
  };
  
  const color = severityColors[issue.severity] || colors.reset;
  const symbol = severitySymbols[issue.severity] || '•';
  
  return [
    `${color}${symbol}${colors.reset} ${colors.dim}${issue.file}:${issue.line}:${issue.column}${colors.reset}`,
    `  ${issue.description}`,
    `  ${colors.dim}Pattern: ${issue.pattern}${colors.reset}`,
    `  ${colors.dim}Context: ${issue.context.substring(0, 80)}${issue.context.length > 80 ? '...' : ''}${colors.reset}`,
    `  ${colors.green}Suggestion: ${issue.suggestion}${colors.reset}`,
    '',
  ].join('\n');
}

/**
 * Point d'entrée principal
 */
function main() {
  const args = process.argv.slice(2);
  const showFix = args.includes('--fix');
  const targetPath = args.find(arg => !arg.startsWith('--')) || 'src';
  
  console.log(`\n${colors.cyan}🔍 Vérification des patterns de traduction...${colors.reset}\n`);
  
  const rootDir = path.resolve(__dirname, '..', targetPath);
  
  if (!fs.existsSync(rootDir)) {
    console.error(`${colors.red}Erreur: Le dossier ${targetPath} n'existe pas${colors.reset}`);
    process.exit(1);
  }
  
  const allIssues = [];
  let filesChecked = 0;
  
  walkDir(rootDir, (filePath) => {
    filesChecked++;
    const issues = analyzeFile(filePath);
    allIssues.push(...issues);
  });
  
  // Grouper par sévérité
  const errors = allIssues.filter(i => i.severity === 'error');
  const warnings = allIssues.filter(i => i.severity === 'warning');
  const infos = allIssues.filter(i => i.severity === 'info');
  
  // Afficher les résultats
  if (allIssues.length === 0) {
    console.log(`${colors.green}✓ Aucun problème de traduction détecté dans ${filesChecked} fichiers${colors.reset}\n`);
    process.exit(0);
  }
  
  // Afficher d'abord les erreurs, puis les warnings, puis les infos
  if (errors.length > 0) {
    console.log(`${colors.red}═══ ERREURS (${errors.length}) ═══${colors.reset}\n`);
    errors.forEach(issue => console.log(formatIssue(issue)));
  }
  
  if (warnings.length > 0) {
    console.log(`${colors.yellow}═══ AVERTISSEMENTS (${warnings.length}) ═══${colors.reset}\n`);
    warnings.forEach(issue => console.log(formatIssue(issue)));
  }
  
  if (infos.length > 0) {
    console.log(`${colors.cyan}═══ INFORMATIONS (${infos.length}) ═══${colors.reset}\n`);
    infos.forEach(issue => console.log(formatIssue(issue)));
  }
  
  // Résumé
  console.log(`${colors.dim}─────────────────────────────────────────${colors.reset}`);
  console.log(`\n📊 Résumé: ${filesChecked} fichiers analysés`);
  console.log(`   ${colors.red}${errors.length} erreur(s)${colors.reset}`);
  console.log(`   ${colors.yellow}${warnings.length} avertissement(s)${colors.reset}`);
  console.log(`   ${colors.cyan}${infos.length} info(s)${colors.reset}\n`);
  
  if (showFix) {
    console.log(`${colors.yellow}Mode --fix: Les corrections automatiques ne sont pas encore implémentées.${colors.reset}`);
    console.log(`Veuillez corriger manuellement les erreurs ci-dessus.\n`);
  }
  
  // Exit code basé sur les erreurs
  if (errors.length > 0) {
    console.log(`${colors.red}❌ La vérification a échoué avec ${errors.length} erreur(s)${colors.reset}\n`);
    process.exit(1);
  }
  
  console.log(`${colors.green}✓ Vérification terminée (pas d'erreurs bloquantes)${colors.reset}\n`);
  process.exit(0);
}

main();
