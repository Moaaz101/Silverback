/*
  Warnings:

  - Added the required column `createdBy` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paymentType` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sessionsAdded` to the `Payment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Fighter" ADD COLUMN "phone" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Payment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fighterId" INTEGER NOT NULL,
    "amount" REAL NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "method" TEXT NOT NULL,
    "paymentType" TEXT NOT NULL,
    "sessionsAdded" INTEGER NOT NULL,
    "notes" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "receiptNumber" TEXT,
    CONSTRAINT "Payment_fighterId_fkey" FOREIGN KEY ("fighterId") REFERENCES "Fighter" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Payment" ("amount", "date", "fighterId", "id", "method") SELECT "amount", "date", "fighterId", "id", "method" FROM "Payment";
DROP TABLE "Payment";
ALTER TABLE "new_Payment" RENAME TO "Payment";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
