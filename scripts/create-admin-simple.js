#!/usr/bin/env node

/**
 * Simple Admin Creation Script
 * Quick way to create an admin account with predefined secure settings
 * 
 * Usage: node scripts/create-admin-simple.js
 */

import { PrismaClient } from '@prisma/client';
import { createUser } from '../src/lib/auth.js';

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
            console.log(`   Email: ${existingAdmin.email}\n`);
            console.log('Use the interactive script for additional admin accounts:');
            console.log('   node scripts/create-admin.js\n');
            return;
        }

        // Create default admin with secure credentials
        const defaultAdminData = {
            username: 'admin',
            email: 'admin@etikettdrucker.local',
            password: 'AdminP@ssw0rd2024!', // Strong default password
            firstName: 'System',
            lastName: 'Administrator',
            role: 'ADMIN',
            createdBy: 'system-setup',
            mustChangePassword: true // Force password change on first login
        };

        console.log('Creating admin with default settings:');
        console.log(`   Username: ${defaultAdminData.username}`);
        console.log(`   Email: ${defaultAdminData.email}`);
        console.log(`   Name: ${defaultAdminData.firstName} ${defaultAdminData.lastName}`);
        console.log(`   Role: ${defaultAdminData.role}`);
        console.log(`   Must change password: ${defaultAdminData.mustChangePassword ? 'Yes' : 'No'}\n`);

        const result = await createUser(
            defaultAdminData,
            '127.0.0.1',
            'system-setup-script'
        );

        if (result.success && result.user) {
            console.log('Default admin account created successfully!\n');
            console.log('Login Credentials:');
            console.log(`   Username: ${defaultAdminData.username}`);
            console.log(`   Password: ${defaultAdminData.password}`);
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
        } else {
            console.log('Failed to create default admin account:');
            if (result.errors) {
                result.errors.forEach(error => console.log(`   • ${error}`));
            }
        }

    } catch (error) {
        console.error('Error creating default admin:', error.message);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

// Run the script
createDefaultAdmin().catch(console.error);
