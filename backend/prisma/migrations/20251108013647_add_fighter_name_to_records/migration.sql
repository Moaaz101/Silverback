/*
  Warnings:

  - Added the required column `fighterName` to the `Attendance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fighterName` to the `Payment` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;

-- Attendance table
CREATE TABLE "new_Attendance" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fighterId" INTEGER,
    "fighterName" TEXT NOT NULL,
    "coachId" INTEGER,
    "coachName" TEXT NOT NULL,
    "sessionType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'present',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    CONSTRAINT "Attendance_fighterId_fkey" FOREIGN KEY ("fighterId") REFERENCES "Fighter" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Attendance_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "Coach" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Populate fighterName from Fighter table for existing records
INSERT INTO "new_Attendance" ("id", "date", "fighterId", "fighterName", "coachId", "coachName", "sessionType", "status", "notes", "createdAt", "createdBy")
SELECT 
    a."id", 
    a."date", 
    a."fighterId", 
    COALESCE(f."name", 'Unknown Fighter') as "fighterName",
    a."coachId", 
    a."coachName", 
    a."sessionType", 
    a."status", 
    a."notes", 
    a."createdAt", 
    a."createdBy"
FROM "Attendance" a
LEFT JOIN "Fighter" f ON a."fighterId" = f."id";

DROP TABLE "Attendance";
ALTER TABLE "new_Attendance" RENAME TO "Attendance";

-- Payment table
CREATE TABLE "new_Payment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fighterId" INTEGER,
    "fighterName" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "method" TEXT NOT NULL,
    "paymentType" TEXT NOT NULL,
    "sessionsAdded" INTEGER NOT NULL,
    "notes" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "receiptNumber" TEXT,
    CONSTRAINT "Payment_fighterId_fkey" FOREIGN KEY ("fighterId") REFERENCES "Fighter" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Populate fighterName from Fighter table for existing records
INSERT INTO "new_Payment" ("id", "fighterId", "fighterName", "amount", "date", "method", "paymentType", "sessionsAdded", "notes", "createdBy", "createdAt", "receiptNumber")
SELECT 
    p."id",
    p."fighterId",
    COALESCE(f."name", 'Unknown Fighter') as "fighterName",
    p."amount",
    p."date",
    p."method",
    p."paymentType",
    p."sessionsAdded",
    p."notes",
    p."createdBy",
    p."createdAt",
    p."receiptNumber"
FROM "Payment" p
LEFT JOIN "Fighter" f ON p."fighterId" = f."id";

DROP TABLE "Payment";
ALTER TABLE "new_Payment" RENAME TO "Payment";

PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
