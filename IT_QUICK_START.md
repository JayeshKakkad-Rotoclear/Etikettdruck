# IT Deployment Instructions - Quick Start

## **Package Contents**
This folder contains the complete production-ready application:
- All source code and built files
- Database schema and configuration
- Startup scripts for Windows/Linux
- Docker deployment option
- Complete documentation

## **Quick Setup (5 minutes)**

### 1. **Copy to VM**
Transfer this entire folder to your VM

### 2. **Database Setup**
```bash
# Install PostgreSQL (if not installed)
# Create database: etikettendruck_prod
```

### 3. **Configure Environment**
```bash
# Copy template: cp .env.production .env
# Edit .env file:
# - DATABASE_URL="postgresql://user:pass@localhost:5432/etikettendruck_prod"
# - JWT_SECRET="your-secure-random-string"
# - ORIGIN="http://YOUR_VM_IP:3000"
```

### 4. **Deploy Application**
```bash
# Install dependencies
npm install --production

# Setup database
npm run db:deploy

# Start application
npm run start:prod
```

### 5. **Access & Setup**
- Visit: `http://YOUR_VM_IP:3000/setup`
- Create admin account
- Admin creates user accounts for company

## **Access URL**
After deployment: `http://YOUR_VM_IP_ADDRESS:3000`

## **Detailed Instructions**
See `DEPLOYMENT.md` for complete step-by-step guide including:
- Docker deployment
- Systemd service setup
- Nginx reverse proxy
- Security considerations
- Troubleshooting

