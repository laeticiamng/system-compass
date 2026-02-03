#!/usr/bin/env node

/**
 * Audit Script: Count Routes
 * Counts all defined routes in the application
 */

const fs = require('fs');
const path = require('path');

const ROUTES_FILE = path.join(__dirname, '../../src/routes/index.tsx');

function countRoutes() {
  console.log('📊 Pyramid Compass - Route Counter');
  console.log('===================================\n');

  if (!fs.existsSync(ROUTES_FILE)) {
    console.error('❌ Routes file not found:', ROUTES_FILE);
    process.exit(1);
  }

  const content = fs.readFileSync(ROUTES_FILE, 'utf-8');

  // Count route definitions
  const routePatterns = content.match(/\{ path: ["'][^"']+["']/g) || [];
  const totalRoutes = routePatterns.length;

  // Extract route categories
  const categories = {
    core: (content.match(/export const coreRoutes = \[([\s\S]*?)\];/)?.[1]?.match(/path:/g) || []).length,
    country: (content.match(/export const countryRoutes = \[([\s\S]*?)\];/)?.[1]?.match(/path:/g) || []).length,
    analysis: (content.match(/export const analysisRoutes = \[([\s\S]*?)\];/)?.[1]?.match(/path:/g) || []).length,
    planning: (content.match(/export const planningRoutes = \[([\s\S]*?)\];/)?.[1]?.match(/path:/g) || []).length,
    learning: (content.match(/export const learningRoutes = \[([\s\S]*?)\];/)?.[1]?.match(/path:/g) || []).length,
    user: (content.match(/export const userRoutes = \[([\s\S]*?)\];/)?.[1]?.match(/path:/g) || []).length,
    pro: (content.match(/export const proRoutes = \[([\s\S]*?)\];/)?.[1]?.match(/path:/g) || []).length,
    community: (content.match(/export const communityRoutes = \[([\s\S]*?)\];/)?.[1]?.match(/path:/g) || []).length,
    terrain: (content.match(/export const terrainRoutes = \[([\s\S]*?)\];/)?.[1]?.match(/path:/g) || []).length,
    content: (content.match(/export const contentRoutes = \[([\s\S]*?)\];/)?.[1]?.match(/path:/g) || []).length,
    admin: (content.match(/export const adminRoutes = \[([\s\S]*?)\];/)?.[1]?.match(/path:/g) || []).length,
    redirects: (content.match(/export const redirectRoutes = \[([\s\S]*?)\];/)?.[1]?.match(/path:/g) || []).length,
  };

  console.log('Routes par catégorie:');
  console.log('─────────────────────');
  
  Object.entries(categories).forEach(([name, count]) => {
    const bar = '█'.repeat(count);
    console.log(`  ${name.padEnd(12)} ${String(count).padStart(2)} ${bar}`);
  });

  console.log('─────────────────────');
  console.log(`  TOTAL        ${totalRoutes}`);
  console.log('');

  // List all routes
  console.log('Liste des routes:');
  console.log('─────────────────');
  
  const paths = routePatterns.map(p => p.match(/["']([^"']+)["']/)?.[1]).filter(Boolean);
  paths.forEach(p => console.log(`  ${p}`));

  console.log('');
  console.log(`✅ ${totalRoutes} routes définies`);

  return totalRoutes;
}

const count = countRoutes();
process.exit(count > 0 ? 0 : 1);
