import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * SQLite Database Backup Script
 * Copies the database file to a timestamped backup folder
 */

const DB_PATH = path.join(__dirname, '..', 'prisma', 'dev.db');
const BACKUP_DIR = path.join(__dirname, '..', 'backups');
const MAX_BACKUPS = 30; // Keep last 30 backups

function createBackup() {
  try {
    // Create backups directory if it doesn't exist
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
      console.log('✅ Created backups directory');
    }

    // Check if database file exists
    if (!fs.existsSync(DB_PATH)) {
      console.error('❌ Database file not found:', DB_PATH);
      process.exit(1);
    }

    // Generate backup filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const backupFileName = `backup-${timestamp}.db`;
    const backupPath = path.join(BACKUP_DIR, backupFileName);

    // Copy database file
    fs.copyFileSync(DB_PATH, backupPath);
    
    const fileSize = (fs.statSync(backupPath).size / 1024).toFixed(2);
    console.log(`✅ Backup created successfully: ${backupFileName}`);
    console.log(`📦 Size: ${fileSize} KB`);
    console.log(`📁 Location: ${backupPath}`);

    // Clean up old backups
    cleanOldBackups();
    
    return backupPath;
  } catch (error) {
    console.error('❌ Backup failed:', error.message);
    process.exit(1);
  }
}

function cleanOldBackups() {
  try {
    const backupFiles = fs.readdirSync(BACKUP_DIR)
      .filter(file => file.startsWith('backup-') && file.endsWith('.db'))
      .map(file => ({
        name: file,
        path: path.join(BACKUP_DIR, file),
        time: fs.statSync(path.join(BACKUP_DIR, file)).mtime.getTime()
      }))
      .sort((a, b) => b.time - a.time); // Sort by newest first

    // Keep only the most recent MAX_BACKUPS
    if (backupFiles.length > MAX_BACKUPS) {
      const filesToDelete = backupFiles.slice(MAX_BACKUPS);
      
      filesToDelete.forEach(file => {
        fs.unlinkSync(file.path);
        console.log(`🗑️  Deleted old backup: ${file.name}`);
      });
      
      console.log(`🧹 Cleaned up ${filesToDelete.length} old backup(s)`);
    }

    console.log(`📊 Total backups: ${Math.min(backupFiles.length, MAX_BACKUPS)}`);
  } catch (error) {
    console.error('⚠️  Warning: Failed to clean old backups:', error.message);
  }
}

function listBackups() {
  try {
    if (!fs.existsSync(BACKUP_DIR)) {
      console.log('No backups directory found');
      return;
    }

    const backupFiles = fs.readdirSync(BACKUP_DIR)
      .filter(file => file.startsWith('backup-') && file.endsWith('.db'))
      .map(file => {
        const filePath = path.join(BACKUP_DIR, file);
        const stats = fs.statSync(filePath);
        return {
          name: file,
          size: (stats.size / 1024).toFixed(2) + ' KB',
          date: stats.mtime.toLocaleString()
        };
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    if (backupFiles.length === 0) {
      console.log('No backups found');
      return;
    }

    console.log('\n📋 Available Backups:\n');
    backupFiles.forEach((file, index) => {
      console.log(`${index + 1}. ${file.name}`);
      console.log(`   📅 ${file.date}`);
      console.log(`   📦 ${file.size}\n`);
    });
  } catch (error) {
    console.error('❌ Failed to list backups:', error.message);
  }
}

function restoreBackup(backupFileName) {
  try {
    const backupPath = path.join(BACKUP_DIR, backupFileName);

    if (!fs.existsSync(backupPath)) {
      console.error('❌ Backup file not found:', backupFileName);
      process.exit(1);
    }

    // Create a backup of current database before restoring
    const currentBackupName = `backup-before-restore-${new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)}.db`;
    const currentBackupPath = path.join(BACKUP_DIR, currentBackupName);
    
    if (fs.existsSync(DB_PATH)) {
      fs.copyFileSync(DB_PATH, currentBackupPath);
      console.log(`✅ Current database backed up as: ${currentBackupName}`);
    }

    // Restore the backup
    fs.copyFileSync(backupPath, DB_PATH);
    console.log(`✅ Database restored from: ${backupFileName}`);
    console.log('🔄 Please restart your application');

  } catch (error) {
    console.error('❌ Restore failed:', error.message);
    process.exit(1);
  }
}

// CLI interface
const command = process.argv[2];

switch (command) {
  case 'create':
  case 'backup':
    createBackup();
    break;
  
  case 'list':
    listBackups();
    break;
  
  case 'restore':
    const backupFile = process.argv[3];
    if (!backupFile) {
      console.error('❌ Please specify backup file name');
      console.log('Usage: node backup.js restore <backup-filename>');
      process.exit(1);
    }
    restoreBackup(backupFile);
    break;
  
  default:
    console.log('SQLite Database Backup Tool\n');
    console.log('Usage:');
    console.log('  node backup.js create      - Create a new backup');
    console.log('  node backup.js list        - List all backups');
    console.log('  node backup.js restore <filename> - Restore from backup');
    console.log('\nExamples:');
    console.log('  node backup.js create');
    console.log('  node backup.js restore backup-2025-01-15T10-30-00.db');
}
