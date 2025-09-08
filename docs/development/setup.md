# Development Environment Setup

Complete guide for setting up a development environment for the Etikettdrucker system.

## Prerequisites

### Required Software
- **Node.js**: Version 20.x (specified in `package.json`)
- **PostgreSQL**: Version 14+ recommended  
- **Git**: For version control
- **VSCode**: Recommended editor with extensions

### Recommended VSCode Extensions
- **Svelte for VS Code**: Syntax highlighting and IntelliSense
- **TypeScript and JavaScript**: Enhanced TypeScript support
- **Prisma**: Database schema support
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **GitLens**: Git integration

## Initial Setup

### 1. Repository Setup
```bash
# Clone the repository
git clone <repository-url>
cd etikettendruck

# Install dependencies
npm install
```

### 2. Environment Configuration
```bash
# Copy environment template
cp .env.example .env
```

Configure your `.env` file:
```properties
# Development database
DATABASE_URL="postgresql://postgres:password@localhost:5432/etikettdrucker_dev"

# Security settings for development
JWT_SECRET="development-secret-change-in-production"
SESSION_DURATION="7d"
COOKIE_SECURE=false

# Development flags
NODE_ENV=development
```

### 3. Database Setup
```bash
# Start PostgreSQL (if using Docker)
docker run --name postgres-dev -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres:14

# Create development database
createdb etikettdrucker_dev

# Apply schema and seed data
npm run db:setup
```

### 4. Create Admin Account
```bash
# Create development admin
npm run create-admin:simple
```

This creates an admin with:

- Username: `admin`
- Password: `AdminP@ssw0rd2024!`

## Development Workflow

### Starting Development Server
```bash
# Start development server with hot reload
npm run dev
```

Application available at `http://localhost:5173`

### Available Scripts (from `package.json`)
```bash
# Development
npm run dev              # Start dev server
npm run check            # TypeScript checking
npm run check:watch      # Continuous type checking

# Database
npm run db:setup         # Schema + seed data
npm run db:seed          # Seed data only

# Build
npm run build            # Production build
npm run preview          # Preview production build

# Admin
npm run create-admin     # Interactive admin creation
npm run create-admin:simple # Quick admin creation

# Security
npm run test:security    # Run security tests
```

## Code Quality Tools

### TypeScript Configuration
The project uses strict TypeScript settings (from `tsconfig.json`):

- Strict mode enabled
- No implicit any
- Exact optional property types
- Strict null checks

### Linting and Formatting
```bash
# Type checking
npm run check

# Spell checking (configured in cspell.json)
npx cspell "src/**/*.{ts,js,svelte}"
```

### Security Testing
```bash
# Run security test suite
npm run test:security

# Standalone security tests
npm run test:security:standalone
```

## Development Patterns

### Project Structure
```
src/
├── lib/                    # Shared utilities and components
│   ├── components/         # Reusable Svelte components
│   ├── stores/             # Svelte stores for state management
│   ├── auth.ts             # Authentication utilities
│   ├── security.ts         # Security middleware
│   └── input-validator.ts  # Input validation helpers
├── routes/                 # SvelteKit routes
│   ├── api/                # API endpoints (+server.ts files)
│   ├── (products)/         # Product-specific pages
│   └── admin/              # Administrative pages
├── app.html                # HTML template
└── app.css                 # Global styles
```

### SvelteKit Conventions
- **Page routes**: `+page.svelte` files
- **Layout files**: `+layout.svelte` for shared layouts
- **API routes**: `+server.ts` files for backend endpoints
- **Type safety**: `$types` imports for request/response types

### Authentication Development
```typescript
// Using authentication in components
import { user } from '$lib/stores/auth';
import { hasRole } from '$lib/auth';

// Check if user has required role
$: canAccess = $user && hasRole($user.role, 'ADMIN');
```

### API Development
```typescript
// Example API endpoint structure (from src/routes/api/)
import type { RequestHandler } from './$types';
import { SecurityMiddleware } from '$lib/security-middleware';

export const POST: RequestHandler = async (event) => {
  const { context } = await SecurityMiddleware.secureEndpoint(event, {
    requiredRole: 'ADMIN',
    validateCSRF: true,
    validateInput: true
  });
  
  // Your API logic here
  return json({ success: true, data: result });
};
```

## Database Development

### Prisma Workflow
```bash
# View database schema
npx prisma studio

# Apply schema changes
npx prisma db push

# Generate TypeScript client
npx prisma generate

# Reset database (development only)
npx prisma db push --force-reset
npm run db:seed
```

### Multi-Schema Development
The system uses multiple PostgreSQL schemas:

- `user_management` - User accounts and authentication
- `cpro_steuerrechner` - C-Pro product data
- `c2_steuerrechner` - C2 product data
- `cbasic_steuerrechner` - C-Basic product data
- `kk_kamerakopf` - KK camera head data

### Database Seeding
```typescript
// Example seed data (from prisma/seed.ts)
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Seed development data
  await prisma.user.createMany({
    data: [
      // Development users
    ]
  });
}
```

## Testing

### Security Testing
```bash
# Run security test suite
npm run test:security
```

Current tests (from `tests/security-simple.test.cjs`):

- Authentication endpoints
- Rate limiting
- Input validation
- Session security

### Adding Tests
> TODO: Expand testing framework beyond security tests
> TODO: Add unit tests for components and utilities
> TODO: Add integration tests for API endpoints

## Debugging

### VSCode Debugging
Create `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Launch SvelteKit",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/@sveltejs/kit/src/exports/vite/dev/index.js",
      "args": ["--", "--mode", "development"],
      "console": "integratedTerminal",
      "env": {
        "NODE_ENV": "development"
      }
    }
  ]
}
```

### Common Debug Tasks
```bash
# Debug Prisma queries
DEBUG=prisma:query npm run dev

# Debug authentication
DEBUG=auth npm run dev

# Verbose logging
NODE_ENV=development DEBUG=* npm run dev
```

## Hot Reload & Development Server

### Features
- **Hot Module Replacement**: Instant updates for Svelte components
- **Type Checking**: Real-time TypeScript validation
- **Error Overlay**: In-browser error display
- **API Route Updates**: Automatic server restart for API changes

### Development URLs
- **Main App**: `http://localhost:5173`
- **Prisma Studio**: `http://localhost:5555` (when running `npx prisma studio`)

## Performance Considerations

### Development Optimizations
- Use `npm run check:watch` for continuous type checking
- Keep Prisma Studio running for database inspection
- Use browser dev tools for frontend debugging

### Build Performance
```bash
# Analyze bundle size
npm run build
npx vite-bundle-analyzer dist
```

## Common Development Issues

### Database Connection
```bash
# Test database connection
npx prisma db pull

# Check connection string
echo $DATABASE_URL
```

### Node Modules Issues
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Regenerate Prisma client
npx prisma generate
```

### Port Conflicts
```bash
# Kill process using port 5173
npx kill-port 5173

# Use alternative port
npm run dev -- --port 3001
```

## Next Steps

### Contributing
1. Read [Contributing Guide](./contributing.md)
2. Review [Code Standards](../architecture/06-development-standards.md)
3. Check [API Documentation](../api/README.md) for endpoint development

### Deployment
1. Test with production build: `npm run build && npm run preview`
2. Review [Deployment Guide](../operations/deployment.md)
3. Set up staging environment for testing

---
*For troubleshooting, see [Development Issues](../operations/runbooks/troubleshooting.md)*
