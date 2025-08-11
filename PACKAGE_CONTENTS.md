# Etikettendruck App - Deployment Package Contents

## Overview
This package contains everything needed to deploy the Etikettendruck web application on a VM for company-wide access.

## Production Build Files
- `build/` - Complete production build output
- `.svelte-kit/output/` - SvelteKit production files
- `package.json` - Dependencies and production scripts
- `node_modules/` - All required Node.js packages

## Configuration Files
- `.env.production` - Production environment variables template
- `svelte.config.js` - SvelteKit production configuration
- `vite.config.ts` - Build configuration
- `prisma/schema.prisma` - Database schema

## Startup Scripts
- `start-production.sh` - Linux startup script
- `start-production.bat` - Windows startup script

## Docker Deployment (Optional)
- `Dockerfile` - Container configuration
- Docker deployment instructions in DEPLOYMENT.md

## Documentation
- `DEPLOYMENT.md` - Complete deployment guide for IT team
- `README.md` - Application information
- `PACKAGE_CONTENTS.md` - This file

## Required Actions by IT Team

### 1. Database Setup
```bash
# Install PostgreSQL and create database
createdb etikettendruck_prod

# Set database connection in .env file
DATABASE_URL="postgresql://username:password@localhost:5432/etikettendruck_prod"
```

### 2. Environment Configuration
- Copy `.env.production` to `.env`
- Update database credentials
- Generate secure JWT_SECRET
- Set ORIGIN to VM's IP address

### 3. Application Deployment
Choose one of three deployment methods:

**Option A: Direct Node.js**
```bash
npm install --production
npm run db:deploy
npm run start:prod
```

**Option B: Docker Container**
```bash
docker build -t etikettendruck .
docker run -d -p 3000:3000 etikettendruck
```

**Option C: Systemd Service**
See DEPLOYMENT.md for complete systemd configuration

### 4. Network Access
- Application runs on port 3000
- Configure firewall to allow access on port 3000
- Access via: http://VM_IP_ADDRESS:3000

### 5. Initial Setup
1. Visit http://VM_IP_ADDRESS:3000/setup
2. Create admin account
3. Admin can create user accounts for company members

## Support
For detailed instructions, see DEPLOYMENT.md
For technical questions, contact the development team.
