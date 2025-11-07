import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    // Check if admin already exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { username: 'Silverback' }
    });

    if (existingAdmin) {
      console.log(' Admin already exists');
      return;
    }

    // Create admin
    const hashedPassword = await bcrypt.hash('password', 10);
    await prisma.admin.create({
      data: {
        username: 'Silverback',
        password: hashedPassword
      }
    });

    console.log(' Admin created successfully');
  } catch (error) {
    console.error(' Error creating admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();