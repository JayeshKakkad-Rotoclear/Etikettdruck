Admin Account Creation Guide

## Overview

This guide explains how to create admin accounts with the new security-enhanced authentication system. The system includes strong password validation, audit logging, and comprehensive security measures.

## Quick Start (Recommended)

### Option 1: Create Default Admin (Fastest)
```bash
npm run create-admin:simple
```

**What this does:**
- Creates a default admin account with secure credentials
- Username: `admin`
- Password: `AdminP@ssw0rd2024!`
- **Forces password change on first login**
- Perfect for initial setup

### Option 2: Interactive Admin Creation (Secure)
```bash
npm run create-admin
```

**What this does:**
- Interactive wizard with custom credentials
- Real-time password strength validation
- Secure password input (hidden)
- Validates all security requirements

### Option 3: Direct Script Execution
```bash
node scripts/create-admin-simple.js     # Default admin
node scripts/create-admin.js            # Interactive wizard
```

## Security Requirements

### Password Policy (Automatically Enforced):
- **Minimum 12 characters**
- **At least one uppercase letter**
- **At least one lowercase letter**
- **At least one number**
- **At least one special character**
- **Cannot contain username**
- **Cannot be a common password**

### Username Policy:
- **3-50 characters**
- **Alphanumeric and underscore only**
- **Must be unique**

### Email Policy:
- **Valid email format**
- **Must be unique**

## Step-by-Step Process

### 1. Database Setup (If Not Done)
```bash
# Make sure your database is set up
npm run db:setup
```

### 2. Choose Your Method

#### Method A: Quick Default Admin
```bash
npm run create-admin:simple
```

**Expected Output:**
```
Creating Default Admin Account...

Creating admin with default settings:
    Username: admin
    Email: admin@etikettdrucker.local
    Name: System Administrator
    Role: ADMIN
    Must change password: Yes

Default admin account created successfully!

Login Credentials:
    Username: admin
    Password: AdminP@ssw0rd2024!
```

#### Method B: Interactive Custom Admin
```bash
npm run create-admin
```

**Interactive Prompts:**
1. Username (3-50 chars, alphanumeric + underscore)
2. Email address (valid format)
3. First name (2-50 chars)
4. Last name (2-50 chars)
5. Secure password (with requirements shown)
6. Password confirmation

### 3. Login and Secure Your Account

1. **Start your application:**
    ```bash
    npm run dev
    ```

2. **Navigate to login page:**
    ```
    http://localhost:5173/login
    ```

3. **Login with admin credentials**

4. **Change password immediately** (if using default admin)

5. **Create additional admin accounts** (recommended)

6. **Delete default admin account** (if used)

## Security Features

### Built-in Protection:
- **Password hashing** with bcrypt (14 rounds)
- **Rate limiting** (5 failed attempts = 30min lockout)
- **Audit logging** (all actions tracked)
- **Session management** (secure JWT tokens)
- **Input validation** (prevents injection attacks)
- **Role-based access** control

### Audit Trail:
Every admin creation is logged with:
- Timestamp and IP address
- Creator identification
- Account details (non-sensitive)
- Security risk assessment

## Troubleshooting

### Error: "Admin account already exists"
```bash
# Check existing admin
npm run create-admin    # Will show existing admin info
```

**Solutions:**
1. Use existing admin credentials
2. Create additional admin with different username
3. Use `--force` flag (if implemented)

### Error: "Invalid password format"
**Password must meet ALL requirements:**
- At least 12 characters
- Mix of upper/lowercase letters
- Numbers and special characters
- Not containing username
- Not a common password

### Error: "Database connection failed"
```bash
# Check database setup
npm run db:setup
```

### Error: "Cannot find module"
```bash
# Install dependencies
npm install

# Check Node.js version (requires Node 18+)
node --version
```

## Admin Account Management

### Check Existing Admins:
```bash
# Connect to database and check
npx prisma studio
# Navigate to User table, filter by role: ADMIN
```

### Role Hierarchy:
1. ADMIN (Highest) - Full system access
2. MANAGEMENT - User management, reports
3. PRUEFER_AB - All testing capabilities
4. PRUEFER_A - Advanced testing
5. PRUEFER_B - Basic testing
6. VIEWER (Lowest) - Read-only access

### Admin Capabilities:
- **Create/edit/delete users**
- **Access all system features**
- **View audit logs**
- **Manage system settings**
- **Export data**

## Best Practices

### Security Best Practices:
1. **Use unique passwords** for each admin
2. **Change default passwords** immediately
3. **Create multiple admins** (avoid single point of failure)
4. **Use descriptive usernames** (not 'admin')
5. **Regular password rotation**
6. **Monitor audit logs**

### Production Recommendations:
1. **Delete default admin** after setup
2. **Use personal admin accounts**
3. **Implement 2FA** (future enhancement)
4. **Regular security audits**
5. **Backup admin credentials** securely

## Next Steps

After creating admin account:

1. **Login and explore the interface**
2. **Create additional users** as needed
3. **Configure system settings**
4. **Set up regular backups**
5. **Review security logs**

## Support

If you encounter issues:

1. **Check the troubleshooting section** above
2. **Verify database connectivity**
3. **Check Node.js and npm versions**
4. **Review application logs**
5. **Test with security suite**:
    ```bash
    npm run test:security
    ```

## Success Checklist

- [ ] Database is set up and running
- [ ] Admin account created successfully
- [ ] Able to login with admin credentials
- [ ] Password changed (if using default)
- [ ] Additional admins created (optional)
- [ ] Default admin deleted (if used)
- [ ] Security features tested

Your admin account is now ready!

---

**Security Note:** All admin creation activities are logged for audit purposes. Ensure you're following your organization's security policies.
