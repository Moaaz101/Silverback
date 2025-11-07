import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';  
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    console.log('🔍 Checking for existing admin...');
    
    // Check if admin already exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { username: 'Silverback' }
    });

    if (existingAdmin) {
      console.log('✅ Admin already exists');
      console.log(`   Username: ${existingAdmin.username}`);
      await prisma.$disconnect();
      return;
    }

    console.log('👤 Creating admin account...');
    
    // Create admin with default password
    const hashedPassword = await bcrypt.hash('Alcestis@push', 10);
    const admin = await prisma.admin.create({
      data: {
        username: 'Silverback',
        password: hashedPassword
      }
    });

    console.log('✅ Admin created successfully!');
    console.log(`   Username: ${admin.username}`);
    console.log(`   Password: Alcestis@push`);
    console.log('');
    console.log('⚠️  IMPORTANT: Change the password after first login!');
    
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();