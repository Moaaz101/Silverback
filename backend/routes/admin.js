import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Get database statistics
 * GET /admin/db-stats
 */
router.get('/db-stats', async (req, res) => {
  try {
    const prisma = req.prisma;
    const dbPath = path.join(__dirname, '../prisma/dev.db');
    
    // Get file stats if database file exists
    let dbStats = null;
    if (fs.existsSync(dbPath)) {
      const stats = fs.statSync(dbPath);
      dbStats = {
        size: stats.size,
        sizeFormatted: `${(stats.size / 1024).toFixed(2)} KB`,
        lastModified: stats.mtime,
      };
    }
    
    // Get record counts from all tables
    const [fighters, coaches, payments, attendance, admins] = await Promise.all([
      prisma.fighter.count(),
      prisma.coach.count(),
      prisma.payment.count(),
      prisma.attendance.count(),
      prisma.admin.count(),
    ]);

    res.json({
      timestamp: new Date().toISOString(),
      database: dbStats,
      records: {
        fighters,
        coaches,
        payments,
        attendance,
        admins,
        total: fighters + coaches + payments + attendance + admins,
      },
      environment: process.env.NODE_ENV || 'development',
    });
  } catch (error) {
    console.error('Error getting database stats:', error);
    res.status(500).json({ 
      error: 'Failed to get database stats',
      details: error.message 
    });
  }
});

/**
 * Export all data as JSON backup
 * GET /admin/export-data
 */
router.get('/export-data', async (req, res) => {
  try {
    const prisma = req.prisma;
    
    console.log('📦 Exporting all data...');
    
    // Fetch all data from database
    const [fighters, coaches, payments, attendance] = await Promise.all([
      prisma.fighter.findMany({ 
        include: { 
          coach: true,
          payments: true,
          attendance: true,
        } 
      }),
      prisma.coach.findMany({
        include: {
          fighters: true,
        }
      }),
      prisma.payment.findMany({ 
        include: { 
          fighter: true 
        } 
      }),
      prisma.attendance.findMany({ 
        include: { 
          fighter: true 
        } 
      }),
    ]);

    const backup = {
      exportedAt: new Date().toISOString(),
      version: '1.0',
      statistics: {
        fighters: fighters.length,
        coaches: coaches.length,
        payments: payments.length,
        attendance: attendance.length,
      },
      data: {
        fighters,
        coaches,
        payments,
        attendance,
      }
    };

    const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
    const filename = `silverback-backup-${timestamp}.json`;

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.json(backup);
    
    console.log(`✅ Data exported successfully: ${filename}`);
  } catch (error) {
    console.error('Error exporting data:', error);
    res.status(500).json({ 
      error: 'Failed to export data',
      details: error.message 
    });
  }
});

/**
 * Download database file directly
 * GET /admin/download-db
 */
router.get('/download-db', async (req, res) => {
  try {
    const dbPath = path.join(__dirname, '../prisma/dev.db');
    
    // Check if database file exists
    if (!fs.existsSync(dbPath)) {
      return res.status(404).json({ 
        error: 'Database file not found',
        path: dbPath 
      });
    }

    const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
    const filename = `silverback-db-${timestamp}.db`;

    console.log(`📥 Downloading database: ${filename}`);

    res.download(dbPath, filename, (err) => {
      if (err) {
        console.error('Error downloading database:', err);
        if (!res.headersSent) {
          res.status(500).json({ 
            error: 'Failed to download database',
            details: err.message 
          });
        }
      } else {
        console.log(`✅ Database downloaded successfully: ${filename}`);
      }
    });
  } catch (error) {
    console.error('Error accessing database file:', error);
    res.status(500).json({ 
      error: 'Failed to access database',
      details: error.message 
    });
  }
});

/**
 * Get system health and uptime
 * GET /admin/health
 */
router.get('/health', async (req, res) => {
  try {
    const prisma = req.prisma;
    
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    
    // Get system info
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();
    
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: {
        seconds: Math.floor(uptime),
        formatted: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m`,
      },
      memory: {
        used: `${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
        total: `${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
        percentage: `${((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100).toFixed(1)}%`,
      },
      database: 'connected',
      environment: process.env.NODE_ENV || 'development',
      nodeVersion: process.version,
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
