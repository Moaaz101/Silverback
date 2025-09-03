/*
  Warnings:

  - Added the required column `coachId` to the `Attendance` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Attendance" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fighterId" INTEGER NOT NULL,
    "coachId" INTEGER NOT NULL,
    "coachName" TEXT NOT NULL,
    "sessionType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'present',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    CONSTRAINT "Attendance_fighterId_fkey" FOREIGN KEY ("fighterId") REFERENCES "Fighter" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Attendance_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "Coach" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Attendance" ("coachName", "date", "fighterId", "id", "sessionType") SELECT "coachName", "date", "fighterId", "id", "sessionType" FROM "Attendance";
DROP TABLE "Attendance";
ALTER TABLE "new_Attendance" RENAME TO "Attendance";
CREATE TABLE "new_Fighter" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "coachId" INTEGER,
    "subscriptionStartDate" DATETIME NOT NULL,
    "subscriptionDurationMonths" INTEGER NOT NULL,
    "totalSessionCount" INTEGER NOT NULL,
    "sessionsLeft" INTEGER NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Fighter_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "Coach" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Fighter" ("coachId", "createdAt", "id", "name", "notes", "sessionsLeft", "subscriptionDurationMonths", "subscriptionStartDate", "totalSessionCount") SELECT "coachId", "createdAt", "id", "name", "notes", "sessionsLeft", "subscriptionDurationMonths", "subscriptionStartDate", "totalSessionCount" FROM "Fighter";
DROP TABLE "Fighter";
ALTER TABLE "new_Fighter" RENAME TO "Fighter";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
