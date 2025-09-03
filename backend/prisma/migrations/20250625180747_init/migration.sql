-- CreateTable
CREATE TABLE "Coach" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "CoachSchedule" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "coachId" INTEGER NOT NULL,
    "weekday" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    CONSTRAINT "CoachSchedule_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "Coach" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Fighter" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "coachId" INTEGER NOT NULL,
    "subscriptionStartDate" DATETIME NOT NULL,
    "subscriptionDurationMonths" INTEGER NOT NULL,
    "totalSessionCount" INTEGER NOT NULL,
    "sessionsLeft" INTEGER NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Fighter_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "Coach" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Attendance" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fighterId" INTEGER NOT NULL,
    "coachName" TEXT NOT NULL,
    "sessionType" TEXT NOT NULL,
    CONSTRAINT "Attendance_fighterId_fkey" FOREIGN KEY ("fighterId") REFERENCES "Fighter" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fighterId" INTEGER NOT NULL,
    "amount" REAL NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "method" TEXT NOT NULL,
    CONSTRAINT "Payment_fighterId_fkey" FOREIGN KEY ("fighterId") REFERENCES "Fighter" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
