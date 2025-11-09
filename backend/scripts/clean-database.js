import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanDatabase() {
  try {
    console.log('🧹 Starting database cleanup...\n');

    // Delete in order respecting foreign key constraints
    
    console.log('Deleting attendance records...');
    const attendanceCount = await prisma.attendance.deleteMany();
    console.log(`✅ Deleted ${attendanceCount.count} attendance records`);

    console.log('Deleting payment records...');
    const paymentCount = await prisma.payment.deleteMany();
    console.log(`✅ Deleted ${paymentCount.count} payment records`);

    console.log('Deleting fighters...');
    const fighterCount = await prisma.fighter.deleteMany();
    console.log(`✅ Deleted ${fighterCount.count} fighters`);

    console.log('Deleting coach schedules...');
    const scheduleCount = await prisma.coachSchedule.deleteMany();
    console.log(`✅ Deleted ${scheduleCount.count} coach schedules`);

    console.log('Deleting coaches...');
    const coachCount = await prisma.coach.deleteMany();
    console.log(`✅ Deleted ${coachCount.count} coaches`);

    // Admin user is preserved - not deleted

    console.log('\n✨ Database cleanup complete!');
    console.log('👤 Admin user preserved');
    
  } catch (error) {
    console.error('❌ Error cleaning database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

cleanDatabase()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
