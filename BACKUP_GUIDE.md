# Database Backup Guide - Silverback Gym

## 📋 Overview

Your SQLite database is stored as a single file: `backend/prisma/dev.db`

Backups are automated copies of this file stored in: `backend/backups/`

---

## 🚀 Quick Start

### **Manual Backup (Recommended to test first)**

```bash
cd backend
npm run backup
```

Output:
```
✅ Backup created successfully: backup-2025-01-15T10-30-00.db
📦 Size: 128.45 KB
📁 Location: G:\Projects\Silverback\backend\backups\backup-2025-01-15T10-30-00.db
📊 Total backups: 1
```

---

## 📝 Available Commands

### **1. Create Backup**
```bash
npm run backup
```
Creates a timestamped backup of your database.

### **2. List All Backups**
```bash
npm run backup:list
```
Shows all available backups with dates and sizes.

Example output:
```
📋 Available Backups:

1. backup-2025-01-15T10-30-00.db
   📅 1/15/2025, 10:30:00 AM
   📦 128.45 KB

2. backup-2025-01-14T18-15-30.db
   📅 1/14/2025, 6:15:30 PM
   📦 125.23 KB
```

### **3. Restore from Backup**
```bash
npm run backup:restore backup-2025-01-15T10-30-00.db
```
Restores database from a specific backup file.

**⚠️ Important:** Your current database will be backed up first before restoring!

---

## ⏰ Automated Backups (Windows)

### **Method 1: Windows Task Scheduler (Recommended)**

1. **Open Task Scheduler**
   - Press `Win + R`
   - Type `taskschd.msc` and press Enter

2. **Create Basic Task**
   - Click "Create Basic Task" in the right panel
   - Name: `Silverback Gym Backup`
   - Description: `Daily backup of gym database`
   - Click Next

3. **Set Trigger**
   - Choose "Daily"
   - Start date: Today
   - Start time: `3:00 AM` (when gym is closed)
   - Recur every: `1 day`
   - Click Next

4. **Set Action**
   - Choose "Start a program"
   - Program/script: Browse to `G:\Projects\Silverback\backend\scripts\backup.bat`
   - Click Next

5. **Finish**
   - Check "Open Properties" and click Finish
   - In Properties, go to "Conditions" tab
   - Uncheck "Start the task only if the computer is on AC power"
   - Click OK

**✅ Done!** Your database will backup automatically every day at 3 AM.

---

### **Method 2: Manual Scheduled Backup (PowerShell)**

Create a scheduled task via PowerShell:

```powershell
$action = New-ScheduledTaskAction -Execute "G:\Projects\Silverback\backend\scripts\backup.bat"
$trigger = New-ScheduledTaskTrigger -Daily -At 3am
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries
Register-ScheduledTask -TaskName "Silverback Gym Backup" -Action $action -Trigger $trigger -Settings $settings -Description "Daily database backup"
```

---

## 💾 Backup Storage Strategy

### **Automatic Cleanup**
- Backups are automatically managed
- **Last 30 backups** are kept by default
- Older backups are automatically deleted
- Change this in `scripts/backup.js` (line 11):
  ```javascript
  const MAX_BACKUPS = 30; // Change this number
  ```

### **Storage Recommendations**

**For Small Gym (< 200 fighters):**
- Database size: ~100-500 KB
- 30 backups: ~15 MB total
- Storage needed: Minimal

**For Medium Gym (200-1000 fighters):**
- Database size: ~1-5 MB
- 30 backups: ~150 MB total
- Storage needed: Low

**Safe to keep 30 days** of backups without worry!

---

## 🔄 Backup Workflow Examples

### **Before Important Operations**

Always backup before:
- Major data imports
- System updates
- Configuration changes

```bash
cd backend
npm run backup
# Now do your risky operation...
```

### **After Problems Occur**

If something goes wrong:

1. **List backups to find a good one:**
   ```bash
   npm run backup:list
   ```

2. **Restore from before the problem:**
   ```bash
   npm run backup:restore backup-2025-01-14T18-15-30.db
   ```

3. **Restart your server:**
   ```bash
   npm run dev
   ```

---

## 📤 External Backup (Cloud Storage)

For extra safety, copy backups to cloud storage:

### **Option 1: Google Drive**
1. Install Google Drive Desktop
2. In `backup.bat`, add:
   ```batch
   xcopy backups "C:\Users\YourName\Google Drive\Silverback Backups\" /E /Y
   ```

### **Option 2: Dropbox**
1. Install Dropbox
2. In `backup.bat`, add:
   ```batch
   xcopy backups "C:\Users\YourName\Dropbox\Silverback Backups\" /E /Y
   ```

### **Option 3: OneDrive**
1. OneDrive is built into Windows
2. In `backup.bat`, add:
   ```batch
   xcopy backups "C:\Users\YourName\OneDrive\Silverback Backups\" /E /Y
   ```

---

## 🔍 Backup Verification

### **Test Your Backups Monthly**

It's important to verify backups actually work!

**Test procedure (5 minutes):**

1. **Create a test backup:**
   ```bash
   npm run backup
   ```

2. **List backups and note the filename:**
   ```bash
   npm run backup:list
   ```

3. **Restore from that backup:**
   ```bash
   npm run backup:restore backup-2025-01-15T10-30-00.db
   ```

4. **Start server and check data:**
   ```bash
   npm run dev
   ```
   - Open frontend
   - Verify fighters appear
   - Check a few records

5. **If all looks good:** ✅ Backups are working!

---

## 🚨 Disaster Recovery

### **Complete Data Loss Scenario**

If your database is corrupted or deleted:

1. **Stop the server** (if running)

2. **Find latest backup:**
   ```bash
   cd backend
   npm run backup:list
   ```

3. **Restore from backup:**
   ```bash
   npm run backup:restore backup-YYYY-MM-DDTHH-MM-SS.db
   ```

4. **Verify the restoration:**
   - Check file exists: `backend/prisma/dev.db`
   - Check file size (should be > 0 KB)

5. **Restart server:**
   ```bash
   npm run dev
   ```

6. **Check frontend** - data should be back!

---

## 📊 Monitoring Backups

### **Check Backup Status**

Create a simple script to monitor:

```bash
# List recent backups
npm run backup:list

# Check backup directory size
cd backend/backups
dir
```

### **Backup Success Indicators**

✅ **Healthy backup system:**
- New backup created daily
- Backups have increasing sizes (as data grows)
- At least 7-14 days of backups available

❌ **Problems to watch for:**
- No new backups in 2+ days
- All backup files are 0 KB
- Backup folder doesn't exist

---

## 🛠️ Troubleshooting

### **Problem: Backup fails with "Database file not found"**

**Solution:**
```bash
cd backend
# Verify database exists
dir prisma\dev.db

# If missing, initialize it
npx prisma migrate deploy
```

---

### **Problem: "Permission denied" when creating backup**

**Solution:**
```bash
# Run as Administrator or check folder permissions
# Right-click backend folder → Properties → Security
# Make sure your user has "Full Control"
```

---

### **Problem: Restore doesn't seem to work**

**Solution:**
1. Stop the server completely (Ctrl+C)
2. Run restore command again
3. Restart server
4. Clear browser cache (Ctrl+Shift+Delete)
5. Refresh frontend

---

## 📈 Advanced Options

### **Change Backup Frequency**

Edit Task Scheduler trigger to run:
- **Multiple times per day:** Change to "Daily" → "Repeat task every 4 hours"
- **Weekly only:** Change to "Weekly" → Select days
- **Hourly (busy gyms):** "Daily" → "Repeat task every 1 hour"

### **Backup Before Each Server Start**

Add to `backend/index.js` before server starts:

```javascript
import { execSync } from 'child_process';

// Auto-backup on server start
try {
  console.log('📦 Creating startup backup...');
  execSync('node scripts/backup.js create', { cwd: __dirname });
  console.log('✅ Startup backup complete');
} catch (error) {
  console.warn('⚠️  Backup failed, continuing anyway:', error.message);
}

// Then start your server...
app.listen(PORT, () => {
  console.log('🚀 Server running...');
});
```

---

## 🎯 Best Practices

1. ✅ **Test restores monthly** - Don't wait for disaster!
2. ✅ **Keep backups in multiple locations** - Local + cloud
3. ✅ **Monitor backup success** - Check Task Scheduler history
4. ✅ **Backup before updates** - Always create manual backup first
5. ✅ **Document your process** - So anyone can restore if needed

---

## 📞 Backup Checklist

**Daily (Automated):**
- [ ] Backup runs automatically at 3 AM
- [ ] Old backups cleaned up (keep last 30)

**Weekly (Manual check):**
- [ ] Verify backups are being created
- [ ] Check backup file sizes look normal
- [ ] Confirm enough disk space available

**Monthly (Test):**
- [ ] Perform test restore
- [ ] Verify data integrity after restore
- [ ] Check cloud backup sync (if configured)

---

## 🔗 Related Documentation

- **Recovery procedure:** See "Disaster Recovery" section above
- **Database schema:** `backend/prisma/schema.prisma`
- **Migration history:** `backend/prisma/migrations/`

---

**Last Updated:** January 2025  
**For Questions:** Check Task Scheduler logs or backup.log file
