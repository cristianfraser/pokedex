#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get the root directory of the git repo
const rootDir = path.resolve(__dirname, '..');
const versionFile = path.join(rootDir, 'frontend', 'version.json');

// Check if any frontend files are staged
try {
  const stagedFiles = execSync('git diff --cached --name-only', { encoding: 'utf-8' })
    .trim()
    .split('\n')
    .filter(Boolean);

  const hasFrontendChanges = stagedFiles.some(file => 
    file.startsWith('frontend/') && !file.startsWith('frontend/version.json')
  );

  if (hasFrontendChanges) {
    // Read current version
    const versionData = JSON.parse(fs.readFileSync(versionFile, 'utf-8'));
    
    // Increment version
    versionData.version += 1;
    
    // Write updated version
    fs.writeFileSync(versionFile, JSON.stringify(versionData, null, 2) + '\n');
    
    // Stage the version file
    execSync(`git add ${versionFile}`, { cwd: rootDir });
    
    console.log(`Frontend version incremented to ${versionData.version}`);
  }
} catch (error) {
  // If there's an error, don't fail the commit
  console.error('Error incrementing frontend version:', error.message);
  process.exit(0);
}

