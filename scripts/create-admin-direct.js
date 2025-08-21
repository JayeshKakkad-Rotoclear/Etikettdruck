import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createDefaultAdmin() {
  console.log('Creating Default Admin Account...\n');

  try {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });

    if (existingAdmin) {
      console.log('Admin account already exists!');
      console.log(`   Username: ${existingAdmin.username}`);
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Created: ${existingAdmin.createdAt}\n`);
      console.log('If you need to create another admin, use different credentials.\n');
      return;
    }

    // Strong default password
    const password = 'AdminP@ssw0rd2024!';
    const passwordHash = await bcrypt.hash(password, 14);

    // Create default admin
    const admin = await prisma.user.create({
      data: {
        username: 'admin',
        email: 'admin@etikettdrucker.local',
        passwordHash,
        firstName: 'System',
        lastName: 'Administrator',
        role: 'ADMIN',
        status: 'ACTIVE',
        createdBy: 'system-setup',
        mustChangePassword: true,
        passwordChangedAt: new Date()
      }
    });

    console.log('Default admin account created successfully!\n');
    console.log('Account Details:');
    console.log(`   ID: ${admin.id}`);
    console.log(`   Username: ${admin.username}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Name: ${admin.firstName} ${admin.lastName}`);
    console.log(`   Role: ${admin.role}`);
    console.log(`   Status: ${admin.status}`);
    console.log('');
    console.log('Login Credentials:');
    console.log(`   Username: admin`);
    console.log(`   Password: AdminP@ssw0rd2024!`);
    console.log('');
    console.log('IMPORTANT SECURITY NOTES:');
    console.log('   • You MUST change the password on first login');
    console.log('   • Use a unique, strong password');
    console.log('   • Consider creating additional admin accounts');
    console.log('   • Delete this account after creating personalized admin accounts');
    console.log('');
    console.log('Next Steps:');
    console.log('   1. Start your application: npm run dev');
    console.log('   2. Login with the credentials above');
    console.log('   3. Change the password immediately');
    console.log('   4. Create your personal admin account');
    console.log('   5. Delete this default admin account');
    console.log('');
    console.log('Default admin setup complete!');

  } catch (error) {
    console.error('Error creating default admin:', error.message);

    if (error.code === 'P2002') {
      console.log('\nPossible solutions:');
      console.log('   • Username or email already exists');
      console.log('   • Check for existing admin accounts');
      console.log('   • Use different credentials');
    }
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
createDefaultAdmin().catch(console.error);
