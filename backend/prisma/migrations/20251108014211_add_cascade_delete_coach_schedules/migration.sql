-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CoachSchedule" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "coachId" INTEGER NOT NULL,
    "weekday" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    CONSTRAINT "CoachSchedule_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "Coach" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_CoachSchedule" ("coachId", "id", "time", "weekday") SELECT "coachId", "id", "time", "weekday" FROM "CoachSchedule";
DROP TABLE "CoachSchedule";
ALTER TABLE "new_CoachSchedule" RENAME TO "CoachSchedule";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
