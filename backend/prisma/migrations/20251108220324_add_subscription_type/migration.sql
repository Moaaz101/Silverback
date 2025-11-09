-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Fighter" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "coachId" INTEGER,
    "subscriptionStartDate" DATETIME NOT NULL,
    "subscriptionDurationMonths" INTEGER NOT NULL,
    "subscriptionType" TEXT NOT NULL DEFAULT 'group',
    "totalSessionCount" INTEGER NOT NULL,
    "sessionsLeft" INTEGER NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Fighter_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "Coach" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Fighter" ("coachId", "createdAt", "id", "name", "notes", "phone", "sessionsLeft", "subscriptionDurationMonths", "subscriptionStartDate", "totalSessionCount") SELECT "coachId", "createdAt", "id", "name", "notes", "phone", "sessionsLeft", "subscriptionDurationMonths", "subscriptionStartDate", "totalSessionCount" FROM "Fighter";
DROP TABLE "Fighter";
ALTER TABLE "new_Fighter" RENAME TO "Fighter";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
