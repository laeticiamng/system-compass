#!/usr/bin/env node

/**
 * Script d'installation des hooks Git
 * 
 * Usage:
 *   node scripts/setup-hooks.js
 *   npm run setup-hooks
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
};

function main() {
  console.log(`\n${colors.cyan}🔧 Installation des hooks Git...${colors.reset}\n`);

  const projectRoot = path.resolve(__dirname, '..');
  const gitHooksDir = path.join(projectRoot, '.git', 'hooks');
  const sourceHooksDir = path.join(__dirname, 'hooks');

  // Vérifier que .git existe
  if (!fs.existsSync(path.join(projectRoot, '.git'))) {
    console.error(`${colors.red}Erreur: Ce n'est pas un dépôt Git (.git non trouvé)${colors.reset}`);
    console.log(`${colors.yellow}Initialisez un dépôt Git avec: git init${colors.reset}\n`);
    process.exit(1);
  }

  // Créer le dossier hooks s'il n'existe pas
  if (!fs.existsSync(gitHooksDir)) {
    fs.mkdirSync(gitHooksDir, { recursive: true });
  }

  // Lister les hooks à installer
  const hooks = ['pre-commit'];
  let installed = 0;
  let skipped = 0;

  for (const hook of hooks) {
    const sourcePath = path.join(sourceHooksDir, hook);
    const destPath = path.join(gitHooksDir, hook);

    if (!fs.existsSync(sourcePath)) {
      console.log(`${colors.yellow}⚠ Hook source non trouvé: ${hook}${colors.reset}`);
      skipped++;
      continue;
    }

    // Vérifier si un hook existe déjà
    if (fs.existsSync(destPath)) {
      const existingContent = fs.readFileSync(destPath, 'utf-8');
      const newContent = fs.readFileSync(sourcePath, 'utf-8');

      if (existingContent === newContent) {
        console.log(`${colors.cyan}ℹ Hook déjà installé: ${hook}${colors.reset}`);
        skipped++;
        continue;
      }

      // Sauvegarder l'ancien hook
      const backupPath = `${destPath}.backup`;
      fs.copyFileSync(destPath, backupPath);
      console.log(`${colors.yellow}⚠ Hook existant sauvegardé: ${hook}.backup${colors.reset}`);
    }

    // Copier le hook
    fs.copyFileSync(sourcePath, destPath);

    // Rendre le hook exécutable (Unix/macOS)
    try {
      fs.chmodSync(destPath, '755');
    } catch (e) {
      // Ignorer sur Windows
    }

    console.log(`${colors.green}✓ Hook installé: ${hook}${colors.reset}`);
    installed++;
  }

  console.log(`\n${colors.cyan}─────────────────────────────────────────${colors.reset}`);
  console.log(`\n📊 Résumé:`);
  console.log(`   ${colors.green}${installed} hook(s) installé(s)${colors.reset}`);
  console.log(`   ${colors.yellow}${skipped} hook(s) ignoré(s)${colors.reset}\n`);

  if (installed > 0) {
    console.log(`${colors.green}✓ Les hooks Git sont maintenant actifs !${colors.reset}`);
    console.log(`\nLes vérifications de traduction s'exécuteront automatiquement avant chaque commit.`);
    console.log(`Pour désactiver temporairement: ${colors.cyan}git commit --no-verify${colors.reset}\n`);
  }
}

main();
