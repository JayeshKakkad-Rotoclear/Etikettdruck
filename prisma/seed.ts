import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/lib/auth.js';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Check if admin user already exists
  const existingAdmin = await prisma.user.findFirst({
    where: { role: 'ADMIN' }
  });

  if (existingAdmin) {
    console.log('✅ Admin user already exists:', existingAdmin.username);
    return;
  }

  // Create initial admin user
  const adminPassword = 'admin123'; // Change this to a secure password
  const hashedPassword = await hashPassword(adminPassword);

  const adminUser = await prisma.user.create({
    data: {
      username: 'admin',
      email: 'admin@rotoclear.com',
      passwordHash: hashedPassword,
      firstName: 'System',
      lastName: 'Administrator',
      role: 'ADMIN',
      status: 'ACTIVE'
    }
  });

  console.log('✅ Created admin user:', {
    id: adminUser.id,
    username: adminUser.username,
    email: adminUser.email,
    role: adminUser.role
  });

  console.log('🔑 Login credentials:');
  console.log('   Username: admin');
  console.log('   Password: admin123');
  console.log('   ⚠️  CHANGE THIS PASSWORD IMMEDIATELY AFTER FIRST LOGIN!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
