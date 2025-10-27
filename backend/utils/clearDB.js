import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function clearDatabase() {
  try {
    console.log("Starting database cleanup...");

    // Delete in order to respect foreign key constraints
    // Delete child records first, then parent records
    
    await prisma.attendance.deleteMany({});
    console.log("✓ Cleared attendance records");

    await prisma.payment.deleteMany({});
    console.log("✓ Cleared payment records");

    await prisma.fighter.deleteMany({});
    console.log("✓ Cleared fighter records");

    await prisma.coachSchedule.deleteMany({});
    console.log("✓ Cleared coach schedule records");

    await prisma.coach.deleteMany({});
    console.log("✓ Cleared coach records");

    console.log("✅ Database cleared successfully!");
  } catch (error) {
    console.error("❌ Error clearing database:", error);
  } finally {
    await prisma.$disconnect();
  }
}

clearDatabase();
