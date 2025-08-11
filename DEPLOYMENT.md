# Etikettdrucker Production Deployment Guide

## For IT Team - VM Deployment Instructions

### Prerequisites
- Ubuntu/CentOS/Windows Server VM with:
  - Node.js 18+ installed
  - PostgreSQL 17 installed
  - Git installed (optional)
  - At least 2GB RAM, 10GB storage

### Option 1: Direct Node.js Deployment (Recommended)

#### Step 1: Prepare the VM
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y
```

#### Step 2: Database Setup
```bash
# Switch to postgres user
sudo su - postgres

# Create database and user
psql
CREATE DATABASE etikettdrucker_production;
CREATE USER etikettdrucker WITH ENCRYPTED PASSWORD 'your-secure-password';
GRANT ALL PRIVILEGES ON DATABASE etikettdrucker_production TO etikettdrucker;
\q

# Exit postgres user
exit
```

#### Step 3: Deploy Application
```bash
# Create application directory
sudo mkdir -p /opt/etikettdrucker
sudo chown $USER:$USER /opt/etikettdrucker
cd /opt/etikettdrucker

# Extract the deployment package (provided separately)
# Or clone from repository:
# git clone https://github.com/your-repo/etikettdrucker.git .

# Install dependencies
npm ci --only=production

# Configure environment
cp .env.production .env
nano .env  # Edit with your database credentials and VM IP

# Setup database
npx prisma generate
npx prisma db push
npm run db:seed

# Build application (if source code)
npm run build

# Test the application
npm start
```

#### Step 4: Production Service Setup (SystemD)
```bash
# Create service file
sudo tee /etc/systemd/system/etikettdrucker.service > /dev/null <<EOF
[Unit]
Description=Etikettdrucker Quality Control System
After=network.target postgresql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/etikettdrucker
Environment=NODE_ENV=production
Environment=HOST=0.0.0.0
Environment=PORT=3000
ExecStart=/usr/bin/node build/index.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Enable and start service
sudo systemctl daemon-reload
sudo systemctl enable etikettdrucker
sudo systemctl start etikettdrucker

# Check status
sudo systemctl status etikettdrucker
```

#### Step 5: Firewall Configuration
```bash
# Allow port 3000
sudo ufw allow 3000
sudo ufw enable

# Or if using nginx (recommended):
sudo ufw allow 'Nginx Full'
```

### Option 2: Docker Deployment (Alternative)

#### If Docker is preferred:
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Build and run
docker build -t etikettdrucker .
docker run -d -p 3000:3000 --name etikettdrucker-app etikettdrucker
```

### Option 3: Nginx Reverse Proxy (Production Recommended)

#### Install and configure Nginx:
```bash
sudo apt install nginx -y

# Create Nginx configuration
sudo tee /etc/nginx/sites-available/etikettdrucker > /dev/null <<EOF
server {
    listen 80;
    server_name YOUR_VM_IP_ADDRESS;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/etikettdrucker /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Configuration Checklist

### Required Environment Variables (.env file):
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secure random string for authentication
- `NODE_ENV=production`
- `HOST=0.0.0.0`
- `PORT=3000`

### Security Considerations:
1. **Database Security**: Use strong passwords, limit database access
2. **JWT Secret**: Generate a secure random string (32+ characters)
3. **Firewall**: Only expose necessary ports (80, 443, 3000)
4. **SSL/TLS**: Consider adding HTTPS with Let's Encrypt
5. **Backup**: Schedule regular database backups

### Access Information:
- **Application URL**: `http://YOUR_VM_IP:3000`
- **Admin Access**: Use the seeded admin account or setup page
- **Database**: PostgreSQL on localhost:5432

### Maintenance Commands:
```bash
# Check application status
sudo systemctl status etikettdrucker

# View logs
sudo journalctl -u etikettdrucker -f

# Restart application
sudo systemctl restart etikettdrucker

# Update application
cd /opt/etikettdrucker
git pull  # if using git
npm run build
sudo systemctl restart etikettdrucker
```

### Monitoring:
- Application logs: `/var/log/etikettdrucker/`
- System resources: Use htop, netstat -tulpn
- Database: Monitor PostgreSQL performance

## Company Access

Once deployed, all company members can access the system via:
- **URL**: `http://YOUR_VM_IP_ADDRESS:3000`
- **Mobile Access**: Fully responsive design
- **User Roles**: Admin can create accounts for different roles

### Default Admin Account:
- Username: `admin`
- Password: `admin123` (CHANGE IMMEDIATELY)

## Support

For deployment support, contact the development team with:
- VM specifications
- Error logs from deployment
- Network configuration details
