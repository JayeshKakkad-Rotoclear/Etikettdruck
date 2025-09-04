# Part 6: Development Standards & Guidelines

---

## 22. Code Standards & Style Guide

### 22.1 TypeScript/JavaScript Standards

#### Current Development Status
The Etikettdrucker system has reached v1.0.0-beta with enhanced dashboard analytics, improved form validation, and comprehensive quality control workflows. All development follows strict TypeScript standards with comprehensive testing and validation.

#### Coding Conventions
```typescript
// File naming conventions
// - Components: PascalCase (e.g., UserProfile.svelte)
// - Utilities: camelCase (e.g., formatDate.ts)
// - Constants: UPPER_SNAKE_CASE (e.g., MAX_FILE_SIZE)
// - Types/Interfaces: PascalCase (e.g., UserRole.ts)

// Import organization
import type { ComponentType } from 'svelte';
import type { PageData } from './$types';

// External libraries
import { writable } from 'svelte/store';
import { goto } from '$app/navigation';

// Internal utilities
import { formatDate, validateEmail } from '$lib/utils';
import { Logger } from '$lib/logging';

// Type definitions
import type { User, PrintJob } from '$lib/types';

// Component interfaces
interface ComponentProps {
  title: string;
  subtitle?: string;
  variant: 'primary' | 'secondary' | 'danger';
  onClick?: () => void;
}

// Function declarations with explicit return types
async function fetchUserData(userId: number): Promise<User | null> {
  try {
    const response = await fetch(`/api/users/${userId}`);
    
    if (!response.ok) {
      Logger.error(`Failed to fetch user ${userId}`, {
        status: response.status,
        statusText: response.statusText
      });
      return null;
    }
    
    return await response.json();
  } catch (error) {
    Logger.error('Error fetching user data', error);
    return null;
  }
}

// Class definitions with proper encapsulation
export class PrintJobManager {
  private readonly maxRetries = 3;
  private jobs: Map<string, PrintJob> = new Map();
  
  constructor(private logger: typeof Logger) {}
  
  async submitJob(job: Omit<PrintJob, 'id' | 'createdAt'>): Promise<string> {
    const jobId = crypto.randomUUID();
    const printJob: PrintJob = {
      ...job,
      id: jobId,
      createdAt: new Date(),
      status: 'pending'
    };
    
    this.jobs.set(jobId, printJob);
    this.logger.info('Print job submitted', { jobId, userId: job.userId });
    
    return jobId;
  }
  
  getJob(jobId: string): PrintJob | undefined {
    return this.jobs.get(jobId);
  }
}
```

#### ESLint Configuration
```json
// .eslintrc.json
{
  "root": true,
  "extends": [
    "eslint:recommended",
    "@typescript-eslint/recommended",
    "prettier"
  ],
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint", "svelte3"],
  "ignorePatterns": ["*.cjs"],
  "overrides": [
    {
      "files": ["*.svelte"],
      "processor": "svelte3/svelte3"
    }
  ],
  "settings": {
    "svelte3/typescript": true
  },
  "parserOptions": {
    "sourceType": "module",
    "ecmaVersion": 2020
  },
  "env": {
    "browser": true,
    "es6": true,
    "node": true
  },
  "rules": {
    // Code quality
    "no-console": "warn",
    "no-debugger": "error",
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    
    // TypeScript specific
    "@typescript-eslint/explicit-function-return-type": "warn",
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/prefer-nullish-coalescing": "error",
    "@typescript-eslint/prefer-optional-chain": "error",
    
    // Best practices
    "prefer-const": "error",
    "no-var": "error",
    "object-shorthand": "error",
    "prefer-template": "error",
    
    // Security
    "no-eval": "error",
    "no-implied-eval": "error",
    "no-new-func": "error"
  }
}
```

#### Prettier Configuration
```json
// .prettierrc
{
  "useTabs": false,
  "tabWidth": 2,
  "singleQuote": true,
  "trailingComma": "es5",
  "printWidth": 80,
  "semi": true,
  "svelteSortOrder": "options-scripts-markup-styles",
  "svelteStrictMode": false,
  "svelteIndentScriptAndStyle": true,
  "plugins": ["prettier-plugin-svelte"],
  "overrides": [
    {
      "files": "*.svelte",
      "options": {
        "parser": "svelte"
      }
    }
  ]
}
```

### 22.2 Svelte Component Standards

#### Component Structure
```svelte
<!-- ComponentName.svelte -->
<script lang="ts">
  // 1. Import statements (external first, then internal)
  import { createEventDispatcher, onMount } from 'svelte';
  import type { ComponentEvents } from 'svelte';
  
  import { fade, slide } from 'svelte/transition';
  import { formatDate } from '$lib/utils';
  import Icon from '$lib/components/Icon.svelte';
  
  // 2. Type definitions
  interface ComponentData {
    id: string;
    title: string;
    description?: string;
  }
  
  type ComponentVariant = 'primary' | 'secondary' | 'danger';
  
  // 3. Props with types and defaults
  export let title: string;
  export let subtitle: string = '';
  export let variant: ComponentVariant = 'primary';
  export let data: ComponentData[] = [];
  export let disabled: boolean = false;
  
  // 4. Event dispatcher
  const dispatch = createEventDispatcher<{
    select: { id: string; data: ComponentData };
    delete: { id: string };
  }>();
  
  // 5. Reactive statements
  $: hasData = data.length > 0;
  $: cssClass = `component component--${variant}`;
  
  // 6. Functions
  function handleSelect(item: ComponentData): void {
    if (disabled) return;
    
    dispatch('select', {
      id: item.id,
      data: item
    });
  }
  
  function handleDelete(id: string): void {
    if (disabled) return;
    
    dispatch('delete', { id });
  }
  
  // 7. Lifecycle
  onMount(() => {
    console.log('Component mounted with', data.length, 'items');
  });
</script>

<!-- 8. HTML markup with proper semantics -->
<div class={cssClass} role="region" aria-label={title}>
  <!-- Header -->
  <header class="component__header">
    <h2 class="component__title">{title}</h2>
    {#if subtitle}
      <p class="component__subtitle">{subtitle}</p>
    {/if}
  </header>
  
  <!-- Content -->
  <main class="component__content">
    {#if hasData}
      <ul class="component__list" role="list">
        {#each data as item (item.id)}
          <li 
            class="component__item"
            transition:slide={{ duration: 200 }}
          >
            <div class="item__content">
              <h3 class="item__title">{item.title}</h3>
              {#if item.description}
                <p class="item__description">{item.description}</p>
              {/if}
            </div>
            
            <div class="item__actions">
              <button
                type="button"
                class="btn btn--primary"
                on:click={() => handleSelect(item)}
                {disabled}
              >
                <Icon name="eye" size={16} />
                Select
              </button>
              
              <button
                type="button"
                class="btn btn--danger"
                on:click={() => handleDelete(item.id)}
                {disabled}
              >
                <Icon name="trash" size={16} />
                Delete
              </button>
            </div>
          </li>
        {/each}
      </ul>
    {:else}
      <div class="component__empty" transition:fade>
        <Icon name="inbox" size={48} />
        <p>No items available</p>
      </div>
    {/if}
  </main>
</div>

<!-- 9. Styles (scoped to component) -->
<style>
  .component {
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-surface);
    overflow: hidden;
  }
  
  .component--primary {
    border-color: var(--color-primary);
  }
  
  .component--secondary {
    border-color: var(--color-secondary);
  }
  
  .component--danger {
    border-color: var(--color-danger);
  }
  
  .component__header {
    padding: var(--spacing-md);
    border-bottom: 1px solid var(--color-border);
    background: var(--color-surface-variant);
  }
  
  .component__title {
    margin: 0;
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
  }
  
  .component__subtitle {
    margin: var(--spacing-xs) 0 0;
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
  }
  
  .component__content {
    padding: var(--spacing-md);
  }
  
  .component__list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
  }
  
  .component__item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--spacing-sm);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    background: var(--color-surface);
  }
  
  .item__content {
    flex: 1;
  }
  
  .item__title {
    margin: 0;
    font-size: var(--font-size-md);
    font-weight: var(--font-weight-medium);
    color: var(--color-text-primary);
  }
  
  .item__description {
    margin: var(--spacing-xs) 0 0;
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
  }
  
  .item__actions {
    display: flex;
    gap: var(--spacing-xs);
  }
  
  .component__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-md);
    padding: var(--spacing-xl);
    text-align: center;
    color: var(--color-text-secondary);
  }
  
  /* Responsive design */
  @media (max-width: 768px) {
    .component__item {
      flex-direction: column;
      align-items: stretch;
    }
    
    .item__actions {
      margin-top: var(--spacing-sm);
      justify-content: flex-end;
    }
  }
</style>
```

### 22.3 Database Standards

#### Prisma Schema Conventions
```prisma
// schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Model naming: PascalCase, singular
model User {
  // Primary key first
  id       Int      @id @default(autoincrement())
  
  // Required fields
  username String   @unique @db.VarChar(50)
  email    String   @unique @db.VarChar(255)
  
  // Optional fields with proper defaults
  firstName String?  @db.VarChar(100)
  lastName  String?  @db.VarChar(100)
  active    Boolean  @default(true)
  
  // Enum fields
  role      UserRole @default(USER)
  
  // Timestamps (created/updated pattern)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Foreign key relationships
  companyId Int?
  company   Company? @relation(fields: [companyId], references: [id], onDelete: SetNull)
  
  // One-to-many relationships
  printJobs PrintJob[]
  sessions  Session[]
  
  // Indexes for performance
  @@index([email])
  @@index([username])
  @@index([companyId])
  
  // Table name in database (snake_case)
  @@map("users")
}

model Company {
  id   Int    @id @default(autoincrement())
  name String @unique @db.VarChar(255)
  code String @unique @db.VarChar(10)
  
  // Configuration as JSON
  settings Json   @default("{}")
  
  active    Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Relationships
  users User[]
  
  @@map("companies")
}

model PrintJob {
  id        String          @id @default(cuid())
  
  // Foreign keys with proper constraints
  userId    Int
  user      User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Job details
  type      PrintJobType
  status    PrintJobStatus  @default(PENDING)
  priority  Int             @default(5) @db.SmallInt
  
  // ZPL code storage
  zplCode   String          @db.Text
  
  // Metadata as JSON for flexibility
  metadata  Json            @default("{}")
  
  // Error handling
  error     String?         @db.Text
  attempts  Int             @default(0) @db.SmallInt
  
  // Timestamps
  createdAt DateTime        @default(now())
  updatedAt DateTime        @updatedAt
  startedAt DateTime?
  finishedAt DateTime?
  
  // Indexes for common queries
  @@index([userId])
  @@index([status])
  @@index([type])
  @@index([createdAt])
  
  @@map("print_jobs")
}

// Enums with clear values
enum UserRole {
  ADMIN
  MANAGER
  USER
  READONLY
  
  @@map("user_role")
}

enum PrintJobType {
  C2_PRUEFER_A
  C2_PRUEFER_B
  CPRO_PRUEFER_A
  CPRO_PRUEFER_B
  CBASIC_PRUEFER_A
  CBASIC_PRUEFER_B
  KK_PRUEFER_A
  KK_PRUEFER_B
  
  @@map("print_job_type")
}

enum PrintJobStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
  CANCELLED
  
  @@map("print_job_status")
}
```

#### Database Migration Guidelines
```typescript
// Example migration script structure
// migrations/20240101000000_add_user_preferences/migration.sql

-- Create user_preferences table
CREATE TABLE user_preferences (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    preferences JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_user_preferences_user_id 
        FOREIGN KEY (user_id) 
        REFERENCES users(id) 
        ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX idx_user_preferences_preferences ON user_preferences USING GIN(preferences);

-- Add update trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_preferences_updated_at 
    BEFORE UPDATE ON user_preferences 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Migration validation
DO $$
BEGIN
    -- Verify table exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_preferences') THEN
        RAISE EXCEPTION 'Migration failed: user_preferences table not created';
    END IF;
    
    -- Verify foreign key constraint
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_user_preferences_user_id'
    ) THEN
        RAISE EXCEPTION 'Migration failed: foreign key constraint not created';
    END IF;
END
$$;
```

---

## 23. Testing Standards

### 23.1 Unit Testing Guidelines

#### Vitest Configuration
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
  plugins: [sveltekit()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['src/tests/setup.ts'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/tests/',
        '**/*.d.ts',
        'build/',
        '.svelte-kit/'
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    }
  }
});
```

#### Test Structure Example
```typescript
// src/tests/lib/utils/formatters.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  formatDate, 
  formatFileSize, 
  validateEmail, 
  sanitizeInput 
} from '$lib/utils/formatters';

describe('formatters utilities', () => {
  describe('formatDate', () => {
    beforeEach(() => {
      // Reset any mocks or set up common test data
      vi.clearAllMocks();
    });

    it('should format date in German locale by default', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      const result = formatDate(date);
      expect(result).toBe('15.01.2024');
    });

    it('should handle invalid dates gracefully', () => {
      const invalidDate = new Date('invalid');
      const result = formatDate(invalidDate);
      expect(result).toBe('Ungültiges Datum');
    });

    it('should format with custom format string', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      const result = formatDate(date, 'DD.MM.YYYY HH:mm');
      expect(result).toBe('15.01.2024 10:30');
    });
  });

  describe('formatFileSize', () => {
    it.each([
      [0, '0 B'],
      [1024, '1 KB'],
      [1048576, '1 MB'],
      [1073741824, '1 GB'],
      [1536, '1.5 KB'],
      [2621440, '2.5 MB']
    ])('should format %i bytes as %s', (bytes, expected) => {
      expect(formatFileSize(bytes)).toBe(expected);
    });

    it('should handle negative values', () => {
      expect(formatFileSize(-1024)).toBe('0 B');
    });
  });

  describe('validateEmail', () => {
    it('should validate correct email addresses', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'test+tag@example.org'
      ];

      validEmails.forEach(email => {
        expect(validateEmail(email)).toBe(true);
      });
    });

    it('should reject invalid email addresses', () => {
      const invalidEmails = [
        'invalid',
        '@example.com',
        'test@',
        'test..test@example.com',
        ''
      ];

      invalidEmails.forEach(email => {
        expect(validateEmail(email)).toBe(false);
      });
    });
  });

  describe('sanitizeInput', () => {
    it('should remove HTML tags', () => {
      const input = '<script>alert("xss")</script>Hello World';
      const result = sanitizeInput(input);
      expect(result).toBe('Hello World');
    });

    it('should preserve safe characters', () => {
      const input = 'Hello World! How are you? 123-456';
      const result = sanitizeInput(input);
      expect(result).toBe(input);
    });

    it('should handle empty strings', () => {
      expect(sanitizeInput('')).toBe('');
      expect(sanitizeInput(null as any)).toBe('');
      expect(sanitizeInput(undefined as any)).toBe('');
    });
  });
});
```

#### Component Testing Example
```typescript
// src/tests/lib/components/Icon.test.ts
import { render, screen } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import Icon from '$lib/components/Icon.svelte';

describe('Icon Component', () => {
  it('should render with default props', () => {
    render(Icon, { name: 'user' });
    
    const svg = screen.getByRole('img');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('width', '24');
    expect(svg).toHaveAttribute('height', '24');
  });

  it('should apply custom size', () => {
    render(Icon, { name: 'user', size: 32 });
    
    const svg = screen.getByRole('img');
    expect(svg).toHaveAttribute('width', '32');
    expect(svg).toHaveAttribute('height', '32');
  });

  it('should apply custom color', () => {
    render(Icon, { name: 'user', color: '#ff0000' });
    
    const svg = screen.getByRole('img');
    expect(svg).toHaveStyle({ color: '#ff0000' });
  });

  it('should apply custom className', () => {
    render(Icon, { name: 'user', className: 'custom-icon' });
    
    const svg = screen.getByRole('img');
    expect(svg).toHaveClass('custom-icon');
  });

  it('should throw error for unknown icon', () => {
    expect(() => {
      render(Icon, { name: 'unknown-icon' as any });
    }).toThrow('Unknown icon: unknown-icon');
  });
});
```

### 23.2 Integration Testing

#### API Route Testing
```typescript
// src/tests/routes/api/users.test.ts
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { GET, POST, PUT, DELETE } from '$routes/api/users/+server.ts';
import { PrismaClient } from '@prisma/client';

// Mock Prisma client
const mockPrisma = {
  user: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn()
  }
};

vi.mock('$lib/prisma', () => ({
  prisma: mockPrisma
}));

describe('/api/users', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/users', () => {
    it('should return all users for admin', async () => {
      const mockUsers = [
        { id: 1, username: 'admin', role: 'ADMIN' },
        { id: 2, username: 'user', role: 'USER' }
      ];

      mockPrisma.user.findMany.mockResolvedValue(mockUsers);

      const request = new Request('http://localhost/api/users');
      const event = {
        request,
        locals: { user: { role: 'ADMIN' } }
      } as any;

      const response = await GET(event);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.users).toEqual(mockUsers);
      expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          active: true,
          createdAt: true
        }
      });
    });

    it('should return 403 for non-admin users', async () => {
      const request = new Request('http://localhost/api/users');
      const event = {
        request,
        locals: { user: { role: 'USER' } }
      } as any;

      const response = await GET(event);

      expect(response.status).toBe(403);
    });
  });

  describe('POST /api/users', () => {
    it('should create new user with valid data', async () => {
      const newUser = {
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'SecurePass123!',
        role: 'USER'
      };

      const createdUser = {
        id: 3,
        ...newUser,
        createdAt: new Date()
      };

      mockPrisma.user.create.mockResolvedValue(createdUser);

      const request = new Request('http://localhost/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });

      const event = {
        request,
        locals: { user: { role: 'ADMIN' } }
      } as any;

      const response = await POST(event);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.user.username).toBe(newUser.username);
      expect(mockPrisma.user.create).toHaveBeenCalled();
    });

    it('should validate required fields', async () => {
      const invalidUser = {
        email: 'test@example.com'
        // missing username and password
      };

      const request = new Request('http://localhost/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidUser)
      });

      const event = {
        request,
        locals: { user: { role: 'ADMIN' } }
      } as any;

      const response = await POST(event);

      expect(response.status).toBe(400);
    });
  });
});
```

### 23.3 End-to-End Testing

#### Playwright Configuration
```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  
  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] }
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] }
    }
  ],

  webServer: {
    command: 'npm run build && npm run preview',
    port: 4173
  }
});
```

#### E2E Test Example
```typescript
// tests/e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should login with valid credentials', async ({ page }) => {
    // Navigate to login page
    await page.click('text=Anmelden');
    await expect(page).toHaveURL('/login');

    // Fill login form
    await page.fill('[name="username"]', 'admin');
    await page.fill('[name="password"]', 'admin123');
    await page.click('button[type="submit"]');

    // Verify successful login
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('text=Willkommen')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.click('text=Anmelden');
    
    await page.fill('[name="username"]', 'invalid');
    await page.fill('[name="password"]', 'wrong');
    await page.click('button[type="submit"]');

    await expect(page.locator('.alert--danger')).toBeVisible();
    await expect(page.locator('text=Ungültige Anmeldedaten')).toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('[name="username"]', 'admin');
    await page.fill('[name="password"]', 'admin123');
    await page.click('button[type="submit"]');

    // Logout
    await page.click('[data-testid="user-menu"]');
    await page.click('text=Abmelden');

    // Verify logout
    await expect(page).toHaveURL('/login');
    await expect(page.locator('text=Anmelden')).toBeVisible();
  });
});

test.describe('Print Job Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    await page.fill('[name="username"]', 'admin');
    await page.fill('[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
  });

  test('should create C2 Prüfer A label', async ({ page }) => {
    await page.goto('/c2/pruefer-a');

    // Fill form
    await page.fill('[name="pruefer"]', 'Test Prüfer');
    await page.fill('[name="datum"]', '2024-01-15');
    await page.fill('[name="seriennummer"]', 'C2-12345');

    // Preview label
    await page.click('text=Vorschau');
    await expect(page.locator('.label-preview')).toBeVisible();

    // Print label
    await page.click('text=Drucken');
    await expect(page.locator('.alert--success')).toBeVisible();
    await expect(page.locator('text=Label erfolgreich gedruckt')).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    await page.goto('/c2/pruefer-a');

    // Try to submit without filling required fields
    await page.click('text=Drucken');

    // Check for validation errors
    await expect(page.locator('.field-error')).toHaveCount(3);
    await expect(page.locator('text=Dieses Feld ist erforderlich')).toBeVisible();
  });
});

test.describe('User Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    await page.fill('[name="username"]', 'admin');
    await page.fill('[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    await page.goto('/admin/users');
  });

  test('should display user list', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Benutzerverwaltung');
    await expect(page.locator('.user-table')).toBeVisible();
    await expect(page.locator('.user-row')).toHaveCount.atLeast(1);
  });

  test('should create new user', async ({ page }) => {
    await page.click('text=Neuer Benutzer');
    
    await page.fill('[name="username"]', 'testuser');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'TestPass123!');
    await page.selectOption('[name="role"]', 'USER');
    
    await page.click('button[type="submit"]');
    
    await expect(page.locator('.alert--success')).toBeVisible();
    await expect(page.locator('text=Benutzer erfolgreich erstellt')).toBeVisible();
  });
});
```

---

## 24. Performance Guidelines

### 24.1 Frontend Performance

#### Bundle Optimization
```typescript
// vite.config.ts - Production optimizations
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor libraries
          svelte: ['svelte'],
          sveltekit: ['@sveltejs/kit'],
          
          // UI components
          components: [
            'src/lib/components/Icon.svelte',
            'src/lib/components/Header.svelte',
            'src/lib/components/Footer.svelte'
          ],
          
          // Utilities
          utils: ['src/lib/utils'],
          
          // Database
          database: ['@prisma/client']
        }
      }
    },
    
    // Minification settings
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info']
      },
      mangle: true
    },
    
    // Asset optimization
    assetsInlineLimit: 4096, // 4KB
    chunkSizeWarningLimit: 500 // 500KB
  }
});
```

#### Component Performance
```svelte
<!-- Optimized component example -->
<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  import { writable } from 'svelte/store';
  
  // Performance optimizations
  export let data: any[] = [];
  export let pageSize: number = 50;
  export let virtualScroll: boolean = false;
  
  // Virtual scrolling for large lists
  let visibleItems = writable([]);
  let scrollContainer: HTMLElement;
  
  $: if (virtualScroll && data.length > pageSize) {
    // Implement virtual scrolling
    setupVirtualScroll();
  } else {
    visibleItems.set(data.slice(0, pageSize));
  }
  
  function setupVirtualScroll() {
    // Virtual scrolling implementation
    const itemHeight = 60;
    const containerHeight = 400;
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    
    let startIndex = 0;
    
    function updateVisibleItems() {
      const start = Math.floor(scrollContainer.scrollTop / itemHeight);
      const end = Math.min(start + visibleCount, data.length);
      
      visibleItems.set(data.slice(start, end).map((item, index) => ({
        ...item,
        _virtualIndex: start + index
      })));
      
      startIndex = start;
    }
    
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', updateVisibleItems);
      updateVisibleItems();
    }
  }
  
  // Lazy loading images
  function lazyLoadImage(node: HTMLElement) {
    const img = node as HTMLImageElement;
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          img.src = img.dataset.src!;
          observer.unobserve(img);
        }
      });
    });
    
    observer.observe(img);
    
    return {
      destroy() {
        observer.unobserve(img);
      }
    };
  }
  
  // Debounced search
  let searchTerm = '';
  let searchTimeout: number;
  
  function debounceSearch(value: string) {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      // Perform search
      performSearch(value);
    }, 300);
  }
  
  $: debounceSearch(searchTerm);
</script>

<!-- Optimized template -->
{#if virtualScroll}
  <div 
    class="virtual-scroll-container"
    bind:this={scrollContainer}
    style="height: 400px; overflow-y: auto;"
  >
    <div style="height: {data.length * 60}px; position: relative;">
      {#each $visibleItems as item (item.id)}
        <div 
          class="virtual-item"
          style="position: absolute; top: {item._virtualIndex * 60}px; height: 60px;"
        >
          <!-- Item content -->
        </div>
      {/each}
    </div>
  </div>
{:else}
  {#each $visibleItems as item (item.id)}
    <div class="item">
      {#if item.image}
        <img 
          data-src={item.image} 
          use:lazyLoadImage 
          alt={item.title}
        />
      {/if}
      <!-- Item content -->
    </div>
  {/each}
{/if}
```

### 24.2 Backend Performance

#### Database Query Optimization
```typescript
// src/lib/services/UserService.ts
import { PrismaClient } from '@prisma/client';
import { Logger } from '$lib/logging';

export class UserService {
  constructor(private prisma: PrismaClient) {}
  
  // Optimized user queries with proper indexing
  async getUsersWithPagination(
    page: number = 1, 
    limit: number = 50,
    filters?: {
      role?: string;
      active?: boolean;
      search?: string;
    }
  ) {
    const offset = (page - 1) * limit;
    
    const where = {
      ...(filters?.role && { role: filters.role }),
      ...(filters?.active !== undefined && { active: filters.active }),
      ...(filters?.search && {
        OR: [
          { username: { contains: filters.search, mode: 'insensitive' } },
          { email: { contains: filters.search, mode: 'insensitive' } },
          { firstName: { contains: filters.search, mode: 'insensitive' } },
          { lastName: { contains: filters.search, mode: 'insensitive' } }
        ]
      })
    };
    
    // Use Promise.all for parallel execution
    const [users, totalCount] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          username: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          active: true,
          createdAt: true,
          // Exclude sensitive data
          // password: false (already excluded by select)
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset
      }),
      this.prisma.user.count({ where })
    ]);
    
    return {
      users,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasNext: offset + limit < totalCount,
        hasPrevious: page > 1
      }
    };
  }
  
  // Bulk operations for better performance
  async updateMultipleUsers(
    userIds: number[], 
    updates: Partial<User>
  ): Promise<void> {
    await this.prisma.user.updateMany({
      where: { id: { in: userIds } },
      data: updates
    });
    
    Logger.info('Bulk user update completed', {
      userIds,
      updates,
      count: userIds.length
    });
  }
  
  // Efficient relationship loading
  async getUserWithRelations(userId: number) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        printJobs: {
          select: {
            id: true,
            type: true,
            status: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' },
          take: 10 // Only latest 10 jobs
        }
      }
    });
  }
}
```

#### Caching Strategy
```typescript
// src/lib/cache/CacheManager.ts
interface CacheItem<T> {
  value: T;
  expiry: number;
}

export class CacheManager {
  private cache = new Map<string, CacheItem<any>>();
  private readonly defaultTTL = 5 * 60 * 1000; // 5 minutes
  
  set<T>(key: string, value: T, ttl: number = this.defaultTTL): void {
    const expiry = Date.now() + ttl;
    this.cache.set(key, { value, expiry });
  }
  
  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }
  
  delete(key: string): boolean {
    return this.cache.delete(key);
  }
  
  clear(): void {
    this.cache.clear();
  }
  
  // Cache with function wrapper
  async cached<T>(
    key: string, 
    fn: () => Promise<T>, 
    ttl?: number
  ): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }
    
    const result = await fn();
    this.set(key, result, ttl);
    return result;
  }
  
  // Cleanup expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key);
      }
    }
  }
}

// Usage in services
export const cache = new CacheManager();

// Cached user service
export class CachedUserService extends UserService {
  async getUserById(id: number) {
    return cache.cached(
      `user:${id}`,
      () => super.getUserById(id),
      10 * 60 * 1000 // 10 minutes
    );
  }
  
  async invalidateUserCache(id: number): Promise<void> {
    cache.delete(`user:${id}`);
  }
}
```

## 25. Dashboard & Analytics Development Standards

### 25.1 Interactive Dashboard Components

#### Chart.js Integration Pattern
```typescript
// Dashboard component with Chart.js integration
<script lang="ts">
  import { onMount } from 'svelte';
  import Chart from 'chart.js/auto';
  
  export let data: MonthlyProductionData[];
  export let title: string = 'Monthly Production';
  
  let chartCanvas: HTMLCanvasElement;
  let chartInstance: Chart;
  
  // Setup chart with hover tooltips
  function setupChart() {
    if (!chartCanvas) return;
    
    chartInstance = new Chart(chartCanvas, {
      type: 'bar',
      data: {
        labels: data.map(d => d.month),
        datasets: [{
          label: 'Production Count',
          data: data.map(d => d.count),
          backgroundColor: '#3b82f6',
          borderColor: '#2563eb',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            enabled: true,
            mode: 'index',
            intersect: false,
            callbacks: {
              title: (context) => `${context[0].label} Production`,
              label: (context) => `Count: ${context.parsed.y}`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1
            }
          }
        }
      }
    });
  }
  
  onMount(() => {
    setupChart();
    return () => chartInstance?.destroy();
  });
  
  // Reactive updates
  $: if (chartInstance && data) {
    chartInstance.data.labels = data.map(d => d.month);
    chartInstance.data.datasets[0].data = data.map(d => d.count);
    chartInstance.update();
  }
</script>

<div class="chart-container">
  <h3>{title}</h3>
  <canvas bind:this={chartCanvas}></canvas>
</div>

<style>
  .chart-container {
    position: relative;
    height: 400px;
    width: 100%;
  }
  
  canvas {
    max-height: 100%;
    max-width: 100%;
  }
</style>
```

### 25.2 Form Validation & Change Detection

#### Enhanced Change Detection Pattern
```typescript
// Prüfer B form change detection
function detectChanges(prueферA: FormData, prueферB: FormData): ChangeDetection {
  const changes: FieldChange[] = [];
  
  // Compare all form fields
  Object.keys(prueферA).forEach(key => {
    const valueA = prueферA[key];
    const valueB = prueферB[key];
    
    if (valueA !== valueB) {
      changes.push({
        field: key,
        prueферA: valueA,
        prueферB: valueB,
        type: 'modified'
      });
    }
  });
  
  return {
    hasChanges: changes.length > 0,
    changes,
    summary: generateChangeSummary(changes)
  };
}

// Usage in Svelte component
$: changeDetection = detectChanges(prueферAData, prueферBData);
$: hasSignificantChanges = changeDetection.hasChanges;
```

### 25.3 Analytics API Patterns

#### Dashboard Statistics API
```typescript
// Monthly production statistics endpoint
export async function GET({ url }: RequestEvent): Promise<Response> {
  try {
    const year = parseInt(url.searchParams.get('year') || String(new Date().getFullYear()));
    
    const stats = await prisma.$queryRaw`
      SELECT 
        EXTRACT(MONTH FROM created_at) as month,
        product_type,
        COUNT(*) as production_count,
        AVG(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) as completion_rate
      FROM testing_records 
      WHERE EXTRACT(YEAR FROM created_at) = ${year}
      GROUP BY EXTRACT(MONTH FROM created_at), product_type
      ORDER BY month;
    `;
    
    return Response.json({
      success: true,
      data: formatProductionStats(stats),
      meta: {
        year,
        totalRecords: stats.length
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return Response.json({
      success: false,
      error: 'Failed to fetch production statistics'
    }, { status: 500 });
  }
}
```

---