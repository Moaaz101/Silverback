# 🔧 Quick Reference - Database Backups

## Daily Commands

### Create Backup (Manual)
```bash
cd backend
npm run backup
```
**When to use:** Before major changes, updates, or data imports

---

### List Backups
```bash
npm run backup:list
```
**Shows:** All backups with timestamps and sizes

---

### Restore Backup
```bash
npm run backup:restore backup-2025-11-03T04-05-59.db
```
**⚠️ Warning:** Server must be stopped first!

---

## Automated Backup Setup (5 Minutes)

### Windows Task Scheduler
1. Open Task Scheduler (`Win + R` → `taskschd.msc`)
2. Create Basic Task → Name it "Silverback Gym Backup"
3. Trigger: Daily at 3:00 AM
4. Action: Start program → Browse to:
   ```
   G:\Projects\Silverback\backend\scripts\backup.bat
   ```
5. Finish → Uncheck "AC power only" → Done!

✅ **Your database will backup automatically every night**

---

## Emergency Recovery

### If Database is Lost or Corrupted:

1. **Stop server** (Ctrl+C)

2. **List backups:**
   ```bash
   npm run backup:list
   ```

3. **Restore latest:**
   ```bash
   npm run backup:restore backup-YYYY-MM-DDTHH-MM-SS.db
   ```

4. **Restart server:**
   ```bash
   npm run dev
   ```

5. **Verify data** in frontend

---

## Backup Status

✅ **Healthy System:**
- New backup created daily
- At least 7 backups available
- Backup files > 0 KB

❌ **Warning Signs:**
- No backup in 2+ days
- All backups are 0 KB
- Backup folder empty

---

## Storage Info

- **Location:** `backend/backups/`
- **Retention:** Last 30 backups (automatic cleanup)
- **Size:** ~44 KB per backup (your current database)
- **Total Storage:** ~1-2 MB for 30 backups

---

## Monthly Test (5 Minutes)

Test your backups work:

```bash
# 1. Create test backup
npm run backup

# 2. Note the filename
npm run backup:list

# 3. Restore it
npm run backup:restore backup-YYYY-MM-DDTHH-MM-SS.db

# 4. Start server and verify data
npm run dev
```

If data appears correctly → ✅ Backups are working!

---

## See Full Guide
For detailed instructions: `BACKUP_GUIDE.md`
