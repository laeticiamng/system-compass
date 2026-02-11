#!/usr/bin/env node

/**
 * Audit Script: Count Edge Functions
 * Counts all deployed edge functions
 */

const fs = require('fs');
const path = require('path');

const FUNCTIONS_DIR = path.join(__dirname, '../../supabase/functions');

function countEdgeFunctions() {
  console.log('⚡ System Compass - Edge Functions Counter');
  console.log('============================================\n');

  if (!fs.existsSync(FUNCTIONS_DIR)) {
    console.error('❌ Functions directory not found:', FUNCTIONS_DIR);
    process.exit(1);
  }

  const entries = fs.readdirSync(FUNCTIONS_DIR, { withFileTypes: true });
  
  const functions = entries
    .filter(entry => entry.isDirectory())
    .filter(entry => !entry.name.startsWith('_')) // Exclude _shared, etc.
    .map(entry => entry.name);

  const sharedFolders = entries
    .filter(entry => entry.isDirectory())
    .filter(entry => entry.name.startsWith('_'))
    .map(entry => entry.name);

  // Categorize functions
  const categories = {
    ai: functions.filter(f => f.includes('ai-') || f.includes('generate-') || f.includes('-intel')),
    batch: functions.filter(f => f.includes('batch-')),
    translation: functions.filter(f => f.includes('translat') || f.includes('i18n')),
    stripe: functions.filter(f => f.includes('checkout') || f.includes('subscription') || f.includes('customer')),
    traceos: functions.filter(f => f.includes('traceos-')),
    media: functions.filter(f => f.includes('music') || f.includes('elevenlabs') || f.includes('tts')),
    search: functions.filter(f => f.includes('perplexity') || f.includes('firecrawl') || f.includes('search')),
    admin: functions.filter(f => f.includes('seed') || f.includes('complete-')),
    notification: functions.filter(f => f.includes('reminder') || f.includes('alert') || f.includes('slack')),
  };

  console.log('Edge Functions par catégorie:');
  console.log('─────────────────────────────');
  
  Object.entries(categories).forEach(([name, funcs]) => {
    if (funcs.length > 0) {
      console.log(`\n  📁 ${name.toUpperCase()} (${funcs.length})`);
      funcs.forEach(f => console.log(`     └─ ${f}`));
    }
  });

  // Others (not categorized)
  const categorized = Object.values(categories).flat();
  const others = functions.filter(f => !categorized.includes(f));
  
  if (others.length > 0) {
    console.log(`\n  📁 AUTRES (${others.length})`);
    others.forEach(f => console.log(`     └─ ${f}`));
  }

  console.log('\n─────────────────────────────');
  console.log(`  TOTAL: ${functions.length} edge functions`);
  
  if (sharedFolders.length > 0) {
    console.log(`  Shared: ${sharedFolders.join(', ')}`);
  }

  console.log('');
  console.log(`✅ ${functions.length} edge functions déployées`);

  return functions.length;
}

const count = countEdgeFunctions();
process.exit(count > 0 ? 0 : 1);
