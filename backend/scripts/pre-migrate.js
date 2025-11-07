#!/usr/bin/env node
/**
 * Pre-migration script
 * Ensures the /data volume directory exists and has proper permissions
 * Runs before Prisma migrations on Railway
 */

import fs from 'fs';
import path from 'path';

const VOLUME_PATH = '/data';

console.log('🔍 Checking volume directory...');

try {
  // Check if running in production (Railway has /data volume)
  if (fs.existsSync(VOLUME_PATH)) {
    console.log(`✅ Volume directory exists: ${VOLUME_PATH}`);
    
    // Ensure directory is writable
    try {
      const testFile = path.join(VOLUME_PATH, '.write-test');
      fs.writeFileSync(testFile, 'test');
      fs.unlinkSync(testFile);
      console.log('✅ Volume is writable');
    } catch (error) {
      console.error('❌ Volume is not writable:', error.message);
      process.exit(1);
    }
  } else {
    console.log('ℹ️  Running locally (no /data volume) - database will use local path');
  }
  
  console.log('✅ Pre-migration checks passed\n');
} catch (error) {
  console.error('❌ Pre-migration check failed:', error);
  process.exit(1);
}
