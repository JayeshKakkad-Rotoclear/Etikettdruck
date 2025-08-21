#!/usr/bin/env node

/**
 * Admin Account Creation Script
 * Creates a secure admin account with proper password validation
 * 
 * Usage:
 *   node scripts/create-admin.js
 *   npm run create-admin
 */

import { PrismaClient } from '@prisma/client';
import { createUser, PasswordValidator } from '../src/lib/auth.js';
import { SecurityAuditLogger } from '../src/lib/security.js';
import readline from 'readline';
import { hideBin } from 'yargs/helpers';
import yargs from 'yargs';

const prisma = new PrismaClient();

// Create readline interface for secure password input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Function to hide password input
function hidePasswordInput(query) {
    return new Promise((resolve) => {
        const stdin = process.stdin;
        const stdout = process.stdout;
        
        stdout.write(query);
        stdin.setRawMode(true);
        stdin.resume();
        stdin.setEncoding('utf8');
        
        let password = '';
        
        stdin.on('data', function(ch) {
            ch = ch + '';
            
            switch(ch) {
                case '\n':
                case '\r':
                case '\u0004': // Ctrl+D
                    stdin.setRawMode(false);
                    stdin.pause();
                    stdout.write('\n');
                    resolve(password);
                    break;
                    
                case '\u0003': // Ctrl+C
                    stdout.write('\n');
                    process.exit();
                    break;
                    
                case '\u007f': // Backspace
                case '\b':
                    if (password.length > 0) {
                        password = password.slice(0, -1);
                        stdout.write('\b \b');
                    }
                    break;
                    
                default:
                    if (ch.charCodeAt(0) >= 32) { // Printable characters
                        password += ch;
                        stdout.write('*');
                    }
                    break;
            }
        });
    });
}

async function promptUser(question) {
    return new Promise((resolve) => {
        rl.question(question, resolve);
    });
}

async function createAdminAccount() {
    console.log('Admin Account Creation Wizard');
    console.log('================================\n');

    try {
        // Check if any admin exists
        const existingAdmin = await prisma.user.findFirst({
            where: { role: 'ADMIN' }
        });

        if (existingAdmin) {
            console.log('Admin account already exists!');
            console.log(`   Username: ${existingAdmin.username}`);
            console.log(`   Email: ${existingAdmin.email}`);
            console.log(`   Created: ${existingAdmin.createdAt}\n`);
            
            const proceed = await promptUser('Do you want to create another admin account? (y/N): ');
            if (proceed.toLowerCase() !== 'y' && proceed.toLowerCase() !== 'yes') {
                console.log('Admin creation cancelled.');
                return;
            }
            console.log('');
        }

        // Collect admin details
        console.log('Enter admin account details:\n');
        
        const username = await promptUser('Username (3-50 characters, alphanumeric + underscore): ');
        if (!/^[a-zA-Z0-9_]{3,50}$/.test(username)) {
            throw new Error('Invalid username format');
        }

        const email = await promptUser('Email address: ');
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            throw new Error('Invalid email format');
        }

        const firstName = await promptUser('First name: ');
        if (firstName.length < 2 || firstName.length > 50) {
            throw new Error('First name must be 2-50 characters');
        }

        const lastName = await promptUser('Last name: ');
        if (lastName.length < 2 || lastName.length > 50) {
            throw new Error('Last name must be 2-50 characters');
        }

        console.log('\nPassword Requirements:');
        console.log('   • At least 12 characters long');
        console.log('   • At least one uppercase letter');
        console.log('   • At least one lowercase letter'); 
        console.log('   • At least one number');
        console.log('   • At least one special character');
        console.log('   • Cannot contain username');
        console.log('   • Cannot be a common password\n');

        let password = '';
        let passwordValid = false;
        let attempts = 0;
        
        while (!passwordValid && attempts < 3) {
            password = await hidePasswordInput('Enter secure password: ');
            const confirmPassword = await hidePasswordInput('Confirm password: ');
            
            if (password !== confirmPassword) {
                console.log('Passwords do not match. Please try again.\n');
                attempts++;
                continue;
            }

            const validation = PasswordValidator.validatePassword(password, username);
            if (validation.isValid) {
                passwordValid = true;
                console.log(`Password accepted! Strength: ${validation.strength}/5\n`);
            } else {
                console.log('Password does not meet requirements:');
                validation.errors.forEach(error => console.log(`   • ${error}`));
                console.log('');
                attempts++;
            }
        }

        if (!passwordValid) {
            throw new Error('Failed to set secure password after 3 attempts');
        }

        // Create the admin account
        console.log('Creating admin account...\n');
        
        const result = await createUser({
            username,
            email,
            password,
            firstName,
            lastName,
            role: 'ADMIN',
            createdBy: 'admin-creation-script',
            mustChangePassword: false
        }, '127.0.0.1', 'admin-creation-script');

        if (result.success && result.user) {
            console.log('Admin account created successfully!\n');
            console.log('Account Details:');
            console.log(`   ID: ${result.user.id}`);
            console.log(`   Username: ${result.user.username}`);
            console.log(`   Email: ${result.user.email}`);
            console.log(`   Name: ${result.user.firstName} ${result.user.lastName}`);
            console.log(`   Role: ${result.user.role}`);
            console.log(`   Status: ${result.user.status}`);
            console.log('');
            console.log('Security Notes:');
            console.log('   • Password is securely hashed with bcrypt');
            console.log('   • Account creation has been logged for audit');
            console.log('   • Admin can create other users via the application');
            console.log('   • Regular password changes are recommended');
            console.log('');
            console.log('Next Steps:');
            console.log('   1. Start your application: npm run dev');
            console.log('   2. Login with the admin credentials');
            console.log('   3. Configure additional users as needed');
            console.log('');
            console.log('Admin account setup complete!');
        } else {
            console.log('Failed to create admin account:');
            if (result.errors) {
                result.errors.forEach(error => console.log(`   • ${error}`));
            }
        }

    } catch (error) {
        console.error('Error creating admin account:', error.message);
        process.exit(1);
    } finally {
        rl.close();
        await prisma.$disconnect();
    }
}

// Command line interface
const argv = yargs(hideBin(process.argv))
    .usage('Usage: $0 [options]')
    .option('username', {
        alias: 'u',
        type: 'string',
        description: 'Admin username'
    })
    .option('email', {
        alias: 'e', 
        type: 'string',
        description: 'Admin email'
    })
    .option('password', {
        alias: 'p',
        type: 'string',
        description: 'Admin password (not recommended for security)'
    })
    .option('first-name', {
        alias: 'f',
        type: 'string',
        description: 'Admin first name'
    })
    .option('last-name', {
        alias: 'l',
        type: 'string',
        description: 'Admin last name'
    })
    .option('force', {
        type: 'boolean',
        description: 'Force creation even if admin exists',
        default: false
    })
    .help()
    .argv;

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
    createAdminAccount().catch(console.error);
}
