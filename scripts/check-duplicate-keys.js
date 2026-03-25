#!/usr/bin/env node
/**
 * Script to detect duplicate keys in JSON translation files
 * Run: node scripts/check-duplicate-keys.js
 * 
 * This script parses JSON files manually to detect duplicate keys
 * that would otherwise be silently overwritten by JSON.parse()
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOCALES_DIR = path.join(__dirname, '../src/locales');

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function findDuplicateKeys(jsonString, filename) {
  const duplicates = [];
  const keyPaths = new Map(); // Map of key path -> line numbers
  
  // Track the current path in the JSON structure
  const pathStack = [];
  let lineNumber = 0;
  
  // Split by lines and track line numbers
  const lines = jsonString.split('\n');
  
  // Regex to match JSON keys (handles both quoted formats)
  const keyRegex = /^\s*"([^"]+)"\s*:/;
  
  // Track brace depth to understand nesting
  let braceDepth = 0;
  const depthToKey = new Map(); // depth -> key at that depth
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    lineNumber = i + 1;
    
    // Count opening and closing braces
    const openBraces = (line.match(/{/g) || []).length;
    const closeBraces = (line.match(/}/g) || []).length;
    
    // Check for key definition
    const match = line.match(keyRegex);
    if (match) {
      const key = match[1];
      
      // Build the full path
      const currentPath = [];
      for (let d = 1; d < braceDepth; d++) {
        if (depthToKey.has(d)) {
          currentPath.push(depthToKey.get(d));
        }
      }
      currentPath.push(key);
      const fullPath = currentPath.join('.');
      
      // Check if this key at this depth already exists
      const parentPath = currentPath.slice(0, -1).join('.');
      const siblingKey = `${parentPath}::${key}`;
      
      if (keyPaths.has(siblingKey)) {
        duplicates.push({
          key: key,
          path: fullPath,
          firstLine: keyPaths.get(siblingKey),
          secondLine: lineNumber
        });
      } else {
        keyPaths.set(siblingKey, lineNumber);
      }
      
      // Update depth tracking if this line opens an object
      if (line.includes('{')) {
        depthToKey.set(braceDepth, key);
      }
    }
    
    // Update brace depth after processing the line
    braceDepth += openBraces - closeBraces;
    
    // Clean up keys when exiting a scope
    if (closeBraces > 0) {
      for (let d = braceDepth + 1; d <= braceDepth + closeBraces; d++) {
        depthToKey.delete(d);
      }
    }
  }
  
  return duplicates;
}

function checkFile(filePath) {
  const filename = path.basename(filePath);
  console.log(`\n${colors.blue}Checking ${filename}...${colors.reset}`);
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // First, try to parse as valid JSON
    try {
      JSON.parse(content);
    } catch (parseError) {
      console.log(`  ${colors.red}✗ Invalid JSON: ${parseError.message}${colors.reset}`);
      return { file: filename, valid: false, duplicates: [], error: parseError.message };
    }
    
    // Then check for duplicates
    const duplicates = findDuplicateKeys(content, filename);
    
    if (duplicates.length === 0) {
      console.log(`  ${colors.green}✓ No duplicate keys found${colors.reset}`);
      return { file: filename, valid: true, duplicates: [] };
    } else {
      console.log(`  ${colors.red}✗ Found ${duplicates.length} duplicate key(s):${colors.reset}`);
      duplicates.forEach(dup => {
        console.log(`    ${colors.yellow}- "${dup.key}" at path "${dup.path}"${colors.reset}`);
        console.log(`      First occurrence: line ${dup.firstLine}`);
        console.log(`      Duplicate: line ${dup.secondLine}`);
      });
      return { file: filename, valid: true, duplicates };
    }
  } catch (error) {
    console.log(`  ${colors.red}✗ Error reading file: ${error.message}${colors.reset}`);
    return { file: filename, valid: false, duplicates: [], error: error.message };
  }
}

function main() {
  console.log(`${colors.blue}═══════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}  JSON Duplicate Key Checker for Translation Files${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════════════════════════${colors.reset}`);
  
  // Get all JSON files in locales directory
  const files = fs.readdirSync(LOCALES_DIR)
    .filter(f => f.endsWith('.json'))
    .map(f => path.join(LOCALES_DIR, f));
  
  if (files.length === 0) {
    console.log(`${colors.yellow}No JSON files found in ${LOCALES_DIR}${colors.reset}`);
    process.exit(0);
  }
  
  console.log(`Found ${files.length} translation file(s)`);
  
  const results = files.map(checkFile);
  
  // Summary
  console.log(`\n${colors.blue}═══════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}  Summary${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════════════════════════${colors.reset}`);
  
  const withDuplicates = results.filter(r => r.duplicates.length > 0);
  const withErrors = results.filter(r => !r.valid);
  
  if (withErrors.length > 0) {
    console.log(`\n${colors.red}Files with errors: ${withErrors.length}${colors.reset}`);
    withErrors.forEach(r => console.log(`  - ${r.file}: ${r.error}`));
  }
  
  if (withDuplicates.length > 0) {
    console.log(`\n${colors.yellow}Files with duplicate keys: ${withDuplicates.length}${colors.reset}`);
    withDuplicates.forEach(r => {
      console.log(`  - ${r.file}: ${r.duplicates.length} duplicate(s)`);
    });
  }
  
  if (withErrors.length === 0 && withDuplicates.length === 0) {
    console.log(`\n${colors.green}✓ All ${files.length} files are valid with no duplicate keys!${colors.reset}`);
    process.exit(0);
  } else {
    const totalIssues = withErrors.length + withDuplicates.length;
    console.log(`\n${colors.red}✗ Found issues in ${totalIssues} file(s)${colors.reset}`);
    process.exit(1);
  }
}

main();
