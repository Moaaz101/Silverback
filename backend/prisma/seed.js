import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...\n');

  // Default admin credentials
  const defaultUsername = 'Silverback';
  const defaultPassword = 'password'; // Change this!

  // Hash the password
  const hashedPassword = await bcrypt.hash(defaultPassword, 10);
  
  // Create or update admin user
  const admin = await prisma.admin.upsert({
    where: { username: defaultUsername },
    update: {
      password: hashedPassword,
    },
    create: {
      username: defaultUsername,
      password: hashedPassword,
    },
  });

  console.log('   Admin user created/updated:');
  console.log('   Username:', admin.username);
  console.log('   Password:', defaultPassword);
  console.log('\n⚠️  IMPORTANT: Change the default password after first login!\n');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });