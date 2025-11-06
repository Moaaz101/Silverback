@echo off
REM Silverback Gym Database Backup Script for Windows
REM This script runs the Node.js backup utility

cd /d "%~dp0.."
call npm run backup

REM Optional: Add logging
echo Backup completed at %date% %time% >> backups\backup.log
