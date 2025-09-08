# Admin Setup Guide

Complete guide for initial system setup and admin account creation.

## Initial System Setup

### Prerequisites
- PostgreSQL 14+ database running
- Node.js 20.x installed
- System deployed per [Deployment Guide](../operations/deployment.md)

### Database Initialization
```bash
# 1. Apply database schema
npx prisma db push

# 2. Seed initial data
npm run db:seed
```

## Admin Account Creation

### Option 1: Quick Setup (Recommended for First Time)
```bash
npm run create-admin:simple
```

**Creates default admin with:**

- **Username**: `admin`
- **Password**: `AdminP@ssw0rd2024!`
- **Forces password change on first login**
- Perfect for initial setup

### Option 2: Interactive Setup (Custom Credentials)
```bash
npm run create-admin
```

**Interactive wizard that prompts for:**

- Custom username
- Email address
- Secure password (with strength validation)
- First and last name

### Option 3: Direct Script Execution
```bash
# Default admin account
node scripts/create-admin-direct.js

# Interactive wizard  
node scripts/create-admin.js
```

## Security Requirements

### Password Policy (Automatically Enforced)
All passwords must meet these requirements:

- **Minimum 12 characters**
- **At least one uppercase letter (A-Z)**
- **At least one lowercase letter (a-z)**
- **At least one number (0-9)**
- **At least one special character (!@#$%^&*)**
- **Cannot contain the username**
- **Cannot be a common/weak password**

### Username Requirements
- **3-50 characters long**
- **Letters, numbers, underscore, and hyphen only**
- **Must be unique system-wide**

### Email Requirements
- **Valid email format**
- **Must be unique system-wide**
- **Used for password recovery (when implemented)**

## First Login Process

### 1. Access the System
Navigate to your system URL:

- **Development**: `http://localhost:5173/login`
- **Production**: `https://your-domain.com/login`

### 2. Login with Admin Credentials
Use the credentials from the admin creation process.

### 3. Required Password Change
If you used the quick setup option, you'll be prompted to change the default password on first login.

### 4. Complete Profile Setup
Update your profile information:

- First and last name
- Contact information
- Preferred settings

## User Management

### Creating Additional Users

#### From Admin Panel
1. Navigate to **Admin** → **User Management**
2. Click **Create New User**
3. Fill in required information:
   - Username (unique)
   - Email address (unique)
   - First and last name
   - Initial role assignment
4. System generates temporary password
5. Provide credentials to new user

#### From Command Line
```bash
# Interactive user creation
npm run create-user

# Or direct script
node scripts/create-user.js
```

### User Role Assignment

#### Available Roles (from `ROLES.md`)
1. **VIEWER** (Level 0) - Read-only access
2. **PRUEFER_B** (Level 1) - Inspector B workflows
3. **PRUEFER_A** (Level 2) - Inspector A workflows  
4. **PRUEFER_AB** (Level 3) - Both inspector workflows
5. **MANAGEMENT** (Level 4) - Dashboard and reporting
6. **ADMIN** (Level 5) - Full system access

#### Role Assignment Process
1. Access **Admin** → **User Management**
2. Select user to modify
3. Choose appropriate role from dropdown
4. Save changes
5. User must logout/login for changes to take effect

### Password Management

#### Forcing Password Changes
```bash
# Force password change for specific user
node scripts/force-password-change.js --username <username>
```

#### Password Reset
```bash
# Reset user password (generates temporary password)
node scripts/reset-password.js --username <username>
```

## System Configuration

### Environment Variables
Key configuration settings in `.env`:

```properties
# Database
DATABASE_URL="postgresql://username:password@host:port/database"

# Security
JWT_SECRET="secure-256-bit-random-string"
SESSION_DURATION="7d"
COOKIE_SECURE=true  # true for production HTTPS

# Application
NODE_ENV=production
PORT=3000
```

### Security Configuration

#### JWT Settings
- **Secret**: Use cryptographically secure random string (256-bit minimum)
- **Duration**: Default 7 days, adjust based on security requirements
- **Rotation**: > TODO: Document JWT secret rotation procedures

#### Session Management
- **Duration**: Configurable via SESSION_DURATION
- **Storage**: Database-backed with automatic cleanup
- **Security**: IP validation and concurrent session handling

#### Rate Limiting
From `src/lib/security.ts`:
> TODO: Extract and document actual rate limit values

### Audit Logging
All administrative actions are logged with:

- Timestamp
- User performing action
- Action type
- IP address
- Result (success/failure)

#### Viewing Audit Logs
> TODO: Document audit log viewing procedures
> TODO: Add audit log retention policies

## Backup & Recovery

### Database Backup
```bash
# Create full database backup
pg_dump $DATABASE_URL > admin_backup_$(date +%Y%m%d).sql
```

### Configuration Backup
```bash
# Backup environment configuration
cp .env config_backup_$(date +%Y%m%d).env
```

### Admin Account Recovery
If you lose admin access:

1. **Direct Database Access**:
```sql
-- Reset admin password hash (use bcrypt hash)
UPDATE user_management.users 
SET password_hash = '$2b$12$hash...' 
WHERE role = 'ADMIN';
```

2. **Script-based Recovery**:
```bash
# Emergency admin creation
node scripts/emergency-admin.js
```

## Monitoring & Maintenance

### Health Checks
```bash
# Check system status
curl http://localhost:3000/api/auth/me

# Check database connectivity
npx prisma db pull
```

### User Activity Monitoring
> TODO: Document user activity monitoring procedures
> TODO: Add suspicious activity detection

### Regular Maintenance
- **Weekly**: Review user accounts and permissions
- **Monthly**: Audit log review and cleanup
- **Quarterly**: Security settings review
- **Annually**: Password policy updates

## Troubleshooting

### Common Issues

#### "Admin already exists" Error
```bash
# Check existing admin accounts
npx prisma studio
# Navigate to users table and check role='ADMIN'
```

#### Database Connection Issues
```bash
# Test database connection
npx prisma db pull

# Verify DATABASE_URL format
echo $DATABASE_URL
```

#### Permission Errors
- Verify user has correct role assigned
- Check that user has logged out/in after role change
- Review role permissions matrix in [User Roles Guide](./user-roles.md)

### Emergency Procedures

#### System Lockout Recovery
If all admin accounts are inaccessible:

1. Access server with administrative privileges
2. Run emergency admin creation script
3. Use database direct access if necessary
4. Review security logs for breach indicators

#### Security Breach Response
1. Immediately disable affected accounts
2. Review audit logs for unauthorized access
3. Force password changes for all users
4. Update JWT secrets
5. Review and update security configurations

---
*For technical issues, see [Troubleshooting Runbook](../operations/runbooks/troubleshooting.md)*
