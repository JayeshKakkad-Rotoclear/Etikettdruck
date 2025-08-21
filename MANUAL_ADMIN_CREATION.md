## Manual Admin Creation Methods

## Quick Admin Creation

You now have a secure admin account! Here are different ways to create additional admin accounts:

### Current Admin Account (Ready to Use)
```
Username: admin
Password: AdminP@ssw0rd2024!
Email: admin@etikettdrucker.local
```

## Method 1: Using Database Console (Direct)

### Step 1: Generate Password Hash
```bash
node scripts/generate-password.js
```

### Step 2: Connect to Database
```bash
npx prisma studio
```

### Step 3: Add User Record
Navigate to the `User` table and create a new record:

```json
{
    "username": "your-username",
    "email": "your-email@domain.com", 
    "passwordHash": "your-generated-hash",
    "firstName": "Your",
    "lastName": "Name",
    "role": "ADMIN",
    "status": "ACTIVE",
    "createdBy": "manual-creation",
    "mustChangePassword": false,
    "passwordChangedAt": "current-timestamp"
}
```

## Method 2: Using Prisma Client (Code)

Create a new script or run in Node.js console:

```javascript
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdmin() {
    const passwordHash = await bcrypt.hash('YourStrongPassword123!', 14);
    
    const admin = await prisma.user.create({
        data: {
            username: 'your-admin',
            email: 'your-admin@domain.com',
            passwordHash,
            firstName: 'Your',
            lastName: 'Name',
            role: 'ADMIN',
            status: 'ACTIVE',
            createdBy: 'manual-script',
            mustChangePassword: false,
            passwordChangedAt: new Date()
        }
    });
    
    console.log('Admin created:', admin);
}

createAdmin().catch(console.error);
```

## Method 3: Via Application Interface (Recommended)

1. Login with existing admin:
     ```
     Username: admin
     Password: AdminP@ssw0rd2024!
     ```

2. Navigate to user management:
     ```
     http://localhost:5173/admin/users
     ```

3. Create new admin user:
     - Fill out the form
     - Select role: "ADMIN"
     - Set secure password
     - Save

## Method 4: SQL Direct (Advanced)

Connect to your PostgreSQL database and run:

```sql
-- Generate password hash first with bcryptjs (14 rounds)
-- Then insert the admin user

INSERT INTO "user_management"."User" (
        username, 
        email, 
        "passwordHash", 
        "firstName", 
        "lastName", 
        role, 
        status, 
        "createdBy",
        "mustChangePassword",
        "passwordChangedAt",
        "createdAt",
        "updatedAt"
) VALUES (
        'your-username',
        'your-email@domain.com', 
        'your-bcrypt-hash-here',
        'Your',
        'Name',
        'ADMIN',
        'ACTIVE',
        'sql-direct',
        false,
        NOW(),
        NOW(),
        NOW()
);
```

## Password Requirements

All admin passwords must meet these security requirements:

- Minimum 12 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (!@#$%^&*)
- Cannot contain the username
- Cannot be a common password

## Security Best Practices

1. Use unique passwords for each admin account
2. Change default password immediately after first login
3. Use personal credentials (not generic admin accounts)
4. Enable audit logging (already implemented)
5. Regular password rotation
6. Limit number of admin accounts to necessary personnel

## Next Steps

1. Login with your admin account
2. Change the default password
3. Create personal admin accounts
4. Delete the default admin account
5. Test the security features

## Success Checklist

- [ ] Admin account created and accessible
- [ ] Password changed from default
- [ ] Can login to application
- [ ] User management interface accessible
- [ ] Security features working
- [ ] Additional admins created (if needed)
- [ ] Default admin account secured/deleted

Your admin account setup is complete!

## Troubleshooting

### Cannot login with admin credentials?
1. Check database connection
2. Verify password hash generation
3. Check user status (should be 'ACTIVE')
4. Review application logs

### Need to reset admin password?
1. Use password generation script
2. Update database directly
3. Or create new admin account

### Forgot admin username?
```bash
# Check via Prisma Studio
npx prisma studio
# Look in User table for role: ADMIN
```
