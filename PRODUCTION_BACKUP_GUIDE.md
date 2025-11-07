# 🔄 Production Backup Guide for Railway Deployment

## Overview

Since Railway uses ephemeral file storage, the local backup script won't work in production. Instead, use these API endpoints to backup your production database.

---

## 📊 Monitor Database Health

### Check Database Statistics

**Endpoint:** `GET /admin/db-stats`

**Authentication:** Requires valid JWT token

**Example Request:**
```bash
# Using curl
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  https://your-railway-url.up.railway.app/admin/db-stats

# Using PowerShell
$headers = @{ Authorization = "Bearer YOUR_JWT_TOKEN" }
Invoke-RestMethod -Uri "https://your-railway-url.up.railway.app/admin/db-stats" -Headers $headers
```

**Response:**
```json
{
  "timestamp": "2025-01-07T10:30:00.000Z",
  "database": {
    "size": 45056,
    "sizeFormatted": "44.00 KB",
    "lastModified": "2025-01-07T10:00:00.000Z"
  },
  "records": {
    "fighters": 50,
    "coaches": 5,
    "payments": 200,
    "attendance": 1500,
    "admins": 1,
    "total": 1756
  },
  "environment": "production"
}
```

---

## 💾 Backup Methods

### Method 1: Export as JSON (Recommended)

**Endpoint:** `GET /admin/export-data`

**Best for:** Regular backups, human-readable format, easy to version control

**Example:**
```bash
# Download JSON backup
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  https://your-railway-url.up.railway.app/admin/export-data \
  -o "backup-$(date +%Y-%m-%d).json"

# PowerShell
$headers = @{ Authorization = "Bearer YOUR_JWT_TOKEN" }
$date = Get-Date -Format "yyyy-MM-dd"
Invoke-RestMethod -Uri "https://your-railway-url.up.railway.app/admin/export-data" -Headers $headers -OutFile "backup-$date.json"
```

**Backup includes:**
- All fighters (with coach, payments, attendance relationships)
- All coaches (with fighters)
- All payments
- All attendance records
- Export timestamp and statistics

---

### Method 2: Download SQLite Database

**Endpoint:** `GET /admin/download-db`

**Best for:** Complete database backup, can open in DB Browser

**Example:**
```bash
# Download database file
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  https://your-railway-url.up.railway.app/admin/download-db \
  -o "database-$(date +%Y-%m-%d).db"

# PowerShell
$headers = @{ Authorization = "Bearer YOUR_JWT_TOKEN" }
$date = Get-Date -Format "yyyy-MM-dd"
Invoke-WebRequest -Uri "https://your-railway-url.up.railway.app/admin/download-db" -Headers $headers -OutFile "database-$date.db"
```

**You can open this file with:**
- [DB Browser for SQLite](https://sqlitebrowser.org/)
- `npx prisma studio` (point to the downloaded file)
- Any SQLite client

---

## 🤖 Automated Backup Script (Local)

Save this as `backup-production.ps1` (Windows) or `backup-production.sh` (Mac/Linux):

### PowerShell Script (Windows)

```powershell
# backup-production.ps1
# Automated production backup script

# Configuration
$API_URL = "https://your-railway-url.up.railway.app"
$BACKUP_DIR = "G:\Backups\Silverback"
$JWT_TOKEN = "YOUR_JWT_TOKEN_HERE"

# Create backup directory if it doesn't exist
if (!(Test-Path $BACKUP_DIR)) {
    New-Item -ItemType Directory -Path $BACKUP_DIR
}

# Get current date
$DATE = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"

# Headers for authentication
$headers = @{ Authorization = "Bearer $JWT_TOKEN" }

Write-Host "🔄 Starting backup at $(Get-Date)" -ForegroundColor Cyan

# Backup 1: JSON Export
Write-Host "📦 Downloading JSON backup..." -ForegroundColor Yellow
try {
    $jsonFile = "$BACKUP_DIR\backup-$DATE.json"
    Invoke-RestMethod -Uri "$API_URL/admin/export-data" -Headers $headers -OutFile $jsonFile
    Write-Host "✅ JSON backup saved: $jsonFile" -ForegroundColor Green
} catch {
    Write-Host "❌ JSON backup failed: $_" -ForegroundColor Red
}

# Backup 2: Database File
Write-Host "💾 Downloading database file..." -ForegroundColor Yellow
try {
    $dbFile = "$BACKUP_DIR\database-$DATE.db"
    Invoke-WebRequest -Uri "$API_URL/admin/download-db" -Headers $headers -OutFile $dbFile
    Write-Host "✅ Database backup saved: $dbFile" -ForegroundColor Green
} catch {
    Write-Host "❌ Database backup failed: $_" -ForegroundColor Red
}

# Get database stats
Write-Host "📊 Database statistics:" -ForegroundColor Yellow
try {
    $stats = Invoke-RestMethod -Uri "$API_URL/admin/db-stats" -Headers $headers
    Write-Host "   Fighters: $($stats.records.fighters)" -ForegroundColor White
    Write-Host "   Coaches: $($stats.records.coaches)" -ForegroundColor White
    Write-Host "   Payments: $($stats.records.payments)" -ForegroundColor White
    Write-Host "   Attendance: $($stats.records.attendance)" -ForegroundColor White
    Write-Host "   Total Records: $($stats.records.total)" -ForegroundColor White
    Write-Host "   Database Size: $($stats.database.sizeFormatted)" -ForegroundColor White
} catch {
    Write-Host "❌ Failed to get stats: $_" -ForegroundColor Red
}

Write-Host "`n✅ Backup complete!" -ForegroundColor Green
```

### Bash Script (Mac/Linux)

```bash
#!/bin/bash
# backup-production.sh
# Automated production backup script

# Configuration
API_URL="https://your-railway-url.up.railway.app"
BACKUP_DIR="$HOME/Backups/Silverback"
JWT_TOKEN="YOUR_JWT_TOKEN_HERE"

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Get current date
DATE=$(date +%Y-%m-%d_%H-%M-%S)

echo "🔄 Starting backup at $(date)"

# Backup 1: JSON Export
echo "📦 Downloading JSON backup..."
curl -H "Authorization: Bearer $JWT_TOKEN" \
  "$API_URL/admin/export-data" \
  -o "$BACKUP_DIR/backup-$DATE.json" && \
  echo "✅ JSON backup saved" || \
  echo "❌ JSON backup failed"

# Backup 2: Database File
echo "💾 Downloading database file..."
curl -H "Authorization: Bearer $JWT_TOKEN" \
  "$API_URL/admin/download-db" \
  -o "$BACKUP_DIR/database-$DATE.db" && \
  echo "✅ Database backup saved" || \
  echo "❌ Database backup failed"

# Get database stats
echo "📊 Database statistics:"
curl -s -H "Authorization: Bearer $JWT_TOKEN" \
  "$API_URL/admin/db-stats" | jq .

echo "✅ Backup complete!"
```

---

## ⏰ Scheduling Automated Backups

### Windows Task Scheduler

1. Open **Task Scheduler**
2. Create Task:
   - Name: "Silverback Production Backup"
   - Trigger: Daily at 2:00 AM
   - Action: `powershell.exe -File "G:\Scripts\backup-production.ps1"`

### Mac/Linux Cron

```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * /path/to/backup-production.sh
```

---

## 🔍 Monitoring System Health

### Health Check Endpoint

**Endpoint:** `GET /admin/health`

**Authentication:** Required

**Example:**
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  https://your-railway-url.up.railway.app/admin/health
```

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2025-01-07T10:30:00.000Z",
  "uptime": {
    "seconds": 86400,
    "formatted": "24h 0m"
  },
  "memory": {
    "used": "45.23 MB",
    "total": "128.00 MB",
    "percentage": "35.3%"
  },
  "database": "connected",
  "environment": "production",
  "nodeVersion": "v20.11.0"
}
```

### Set Up Uptime Monitoring

**Option 1: UptimeRobot (Free)**
1. Sign up at https://uptimerobot.com
2. Add HTTP(s) monitor
3. URL: `https://your-railway-url.up.railway.app/admin/health`
4. Custom HTTP headers: `Authorization: Bearer YOUR_JWT_TOKEN`
5. Interval: 5 minutes
6. Get email alerts if server is down

**Option 2: Better Uptime**
Similar setup at https://betteruptime.com

---

## 📝 Best Practices

### Daily Tasks
- ✅ Check `/admin/health` endpoint (quick health check)

### Weekly Tasks
- ✅ Download JSON backup via `/admin/export-data`
- ✅ Check `/admin/db-stats` for database growth
- ✅ Store backups in safe location (external drive, cloud storage)

### Monthly Tasks
- ✅ Download full database via `/admin/download-db`
- ✅ Test restoring from backup
- ✅ Review database size and cleanup if needed

---

## 🔒 Security Notes

1. **Never commit JWT tokens to Git**
   - Store in environment variables or secure password manager
   
2. **Rotate JWT tokens regularly**
   - Change password monthly
   - Get new JWT token
   
3. **Secure backup files**
   - Encrypt backups if storing in cloud
   - Use strong passwords for encrypted archives
   
4. **Limit access**
   - Only admin accounts can access backup endpoints
   - Use strong admin passwords

---

## 🆘 Emergency Recovery

If you lose access to Railway and need to restore:

1. **Deploy new Railway instance**
2. **Push Silverback code to Railway**
3. **Download latest JSON backup**
4. **Create restore endpoint** (temporary):

```javascript
// In backend/routes/admin.js
router.post('/restore-data', async (req, res) => {
  const { data } = req.body;
  
  // Delete existing data
  await prisma.attendance.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.fighter.deleteMany();
  await prisma.coach.deleteMany();
  
  // Restore coaches first
  for (const coach of data.coaches) {
    await prisma.coach.create({ data: coach });
  }
  
  // Then fighters, payments, attendance...
  // (Full implementation would be more complex)
});
```

---

## 📞 Quick Reference

| Endpoint | Purpose | Auth Required |
|----------|---------|---------------|
| `GET /admin/health` | System health check | Yes |
| `GET /admin/db-stats` | Database statistics | Yes |
| `GET /admin/export-data` | JSON backup | Yes |
| `GET /admin/download-db` | SQLite file | Yes |

**All admin endpoints require JWT authentication via Authorization header.**

---

## Next Steps

1. ✅ Create admin account via `/setup/create-admin`
2. ✅ Login and get JWT token
3. ✅ Test all backup endpoints
4. ✅ Set up automated backup script
5. ✅ Schedule weekly/monthly backups
6. ✅ Configure uptime monitoring
