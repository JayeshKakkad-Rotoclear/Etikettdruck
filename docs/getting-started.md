# Getting Started

Quick setup guide for local development of the Etikettdrucker system.

## Prerequisites

- **Node.js**: Version 20.x (from `package.json`)
- **PostgreSQL**: Version 14+ recommended
- **Git**: For version control
- **Docker** (optional): For containerized development

## Environment Setup

### 1. Clone Repository
```bash
git clone <repository-url>
cd etikettendruck
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Copy the example environment file and configure:

```bash
# Copy from .env example
cp .env.example .env
```

Required environment variables (from `.env`):
```properties
# Database connection
DATABASE_URL="postgresql://username:password@localhost:5432/etikettdrucker"

# JWT configuration
JWT_SECRET="your-secure-random-string-here"
SESSION_DURATION="7d"

# Cookie settings
COOKIE_SECURE=false  # Set to true in production with HTTPS
```

### 4. Database Setup
```bash
# Push database schema and seed initial data
npm run db:setup
```

This command runs:
- `prisma db push` - Creates database schema
- `npm run db:seed` - Seeds initial data from `prisma/seed.ts`

### 5. Create Admin User
```bash
# Create the first admin account
npm run create-admin
```

Follow the interactive prompts to create your admin user.

## Development Server

### Start Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Available Scripts (from `package.json`)
```bash
npm run dev          # Development server with hot reload
npm run build        # Production build
npm run start        # Start production server
npm run preview      # Preview production build locally
npm run check        # TypeScript and Svelte check
npm run check:watch  # Continuous type checking
```

## Database Operations

### Schema Management
```bash
# Push schema changes to database
npx prisma db push

# Generate Prisma client
npx prisma generate

# View database in Prisma Studio
npx prisma studio
```

### Seeding Data
```bash
# Reseed database
npm run db:seed
```

## First Login

1. Start the development server: `npm run dev`
2. Navigate to `http://localhost:5173/login`
3. Use the admin credentials created in step 5
4. You'll be redirected to the dashboard

## Development Workflow

### Code Quality Checks
```bash
# TypeScript checking
npm run check

# Spell checking (configured in cspell.json)
npx cspell "src/**/*.{ts,js,svelte}"
```

### Security Testing
```bash
# Run security tests
npm run test:security
```

## Docker Development (Optional)

### Using Docker Compose
```bash
# Build and start services
docker-compose up --build

# Run in background
docker-compose up -d
```

The application will be available at `http://localhost:4000`

### Environment for Docker
Create `.env` file with appropriate settings:
```properties
DATABASE_URL="postgresql://postgres:password@host.docker.internal:5432/etikettdrucker"
JWT_SECRET="your-secure-secret"
COOKIE_SECURE=false
```

## Troubleshooting

### Common Issues

**Database Connection Errors**
- Verify PostgreSQL is running
- Check DATABASE_URL format and credentials
- Ensure database exists

**Prisma Client Errors**
```bash
# Regenerate Prisma client
npx prisma generate
```

**Port Already in Use**
```bash
# Find and kill process using port 5173
npx kill-port 5173
```

**Missing Environment Variables**
- Verify all required variables are set in `.env`
- Check for typos in variable names

### Getting Help
- Check [Architecture Documentation](./architecture/README.md) for system overview
- Review [API Documentation](./api/README.md) for endpoint details
- See [Development Guide](./development/setup.md) for advanced setup

## Next Steps

1. **Explore the System**: Login and navigate through different product types (C2, C-Pro, C-Basic, KK)
2. **Review Architecture**: Read the [technical architecture documentation](./architecture/README.md)
3. **API Exploration**: Test API endpoints using the [API documentation](./api/README.md)
4. **Development**: See [development guidelines](./development/contributing.md) for contributing

---
*Need help? Check the [troubleshooting runbook](./operations/runbooks/troubleshooting.md) or file an issue.*
