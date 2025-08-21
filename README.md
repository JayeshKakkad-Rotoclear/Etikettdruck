# Etikettdrucker - Quality Control & Label Printing System

## Major Update: v0.1.0
This release includes a comprehensive refactor, new notification system, mobile-first UI/UX, unified label printing APIs, advanced database/dashboard features, and extensive documentation. See Version History below for details.

![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)
![SvelteKit](https://img.shields.io/badge/SvelteKit-FF3E00?logo=svelte&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?logo=Prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?logo=postgresql&logoColor=white)

A comprehensive quality control and label printing management system built for **Rotoclear GmbH** to streamline production testing, data collection, and label generation for various product lines.

## System Overview

The Etikettdrucker system is designed to manage quality control processes for multiple product families through a dual-inspector workflow, comprehensive data tracking, and automated label generation. The system supports various Rotoclear products including Steuerrechner (Control Units) and Kamerakopf (Camera Heads).

### Core Features

- **Role-Based Access Control (RBAC)** - Comprehensive 6-level user role system with secure authentication
- **User Management** - Complete user administration with profile management and role assignment
- **Professional Notification Center** - Centralized, mobile-friendly notification system with swipe gestures, accessibility, and localStorage persistence
- **SVG Icon System** - Consistent, professional icons across all interfaces
- **Mobile-First Responsive Design** - Optimized layouts, accessibility improvements, and touch gesture support
- **Comprehensive Documentation** - Architecture, security, deployment, and development standards
- **Multi-Product Quality Control** - Standardized testing protocols for C Pro, C2, C Basic, and Kamerakopf product lines
- **Dual-Inspector Workflow** - Sequential testing by Prüfer A and Prüfer B with comprehensive validation
- **Comprehensive Dashboard** - Real-time statistics, production metrics, and performance analytics
- **Label Generation** - Automated QR code generation and printing for tested products
- **Database Management** - Complete data viewing, searching, and management capabilities
- **Packaging Support** - Outer carton labeling with dual-mode (scan/manual) product selection
- **Accessory Management** - Zubehör (accessory) label creation and tracking
- **Secure Authentication** - JWT-based authentication with HTTP-only cookies and session management

## Technical Architecture

### Frontend Stack
- **SvelteKit 2.22.0** - Modern, reactive web framework
- **TypeScript 5.0** - Type-safe development
- **Custom CSS** - Responsive design without external frameworks
- **Vite 7.0** - Fast build tooling and development server

### Backend Stack
- **Prisma 6.13.0** - Type-safe database ORM
- **PostgreSQL** - Multi-schema database architecture
- **Node.js APIs** - RESTful API endpoints for all operations
- **JWT Authentication** - Secure token-based authentication with HTTP-only cookies
- **bcryptjs** - Password hashing and security
- **Role-Based Authorization** - Comprehensive access control system

### Database Design
```
Schemas:
├── cpro_steuerrechner     (C Pro Control Units)
├── c2_steuerrechner       (C2 Control Units) 
├── cbasic_steuerrechner   (C Basic Control Units)
├── kk_kamerakopf          (Camera Heads)
├── zubehoer_etikett       (Accessory Labels)
├── outer_karton           (Outer Carton Labels)
├── outer_karton_entry     (Carton Contents)
└── User                   (User Management & Authentication)
```

## Authentication & Security

### Role-Based Access Control (RBAC)
The system implements a comprehensive 6-level role hierarchy:

1. **VIEWER** - Basic read-only access to authorized content
2. **PRUEFER_B** - Inspector B role with testing capabilities for Prüfer B workflows
3. **PRUEFER_A** - Inspector A role with testing capabilities for Prüfer A workflows  
4. **PRUEFER_AB** - Combined inspector role with access to both A and B workflows
5. **MANAGEMENT** - Management access including dashboard analytics and reporting
6. **ADMIN** - Full system administration including user management and database operations

### Security Features
- **JWT Authentication** - Secure token-based authentication with automatic expiration
- **HTTP-Only Cookies** - Prevents XSS attacks by making tokens inaccessible to client-side scripts
- **Password Hashing** - bcryptjs-based secure password storage
- **Route Protection** - Layout-based guards preventing unauthorized access to protected pages
- **Session Management** - Automatic session validation and renewal
- **Role Validation** - Server-side permission checking for all protected operations

### User Management
- **User Administration** - Complete CRUD operations for user accounts
- **Role Assignment** - Flexible role-based permission assignment
- **Profile Management** - User profile editing and password change functionality
- **Initial Setup** - First-time setup wizard for creating the initial admin user

## New Features in v0.1.0
- Unified and modernized label printing APIs for all product types
- PUT endpoints for reprinting labels with original ZPL formatting
- QR code image generation using qrcode and pngjs
- Dynamic footer positioning and improved table formatting in ZPL output
- Dual workflow for Zubehör (save-only and save-and-print)
- Lieferschein tracking for Zubehör and outer karton
- Database frontend improvements (Lieferschein column, advanced filtering, CSV export)

## Product Lines

### 1. C Pro Steuerrechner (Control Units)
Advanced control units with multiple configurations and hard drive options.

**Quality Control Points:**
- Hardware integrity and completeness
- HDMI, Web, and Zoom functionality
- Menu operation and IP address validation
- Camera input testing
- Hard drive verification (256GB, 1TB, 4TB)
- Automatic testing and factory reset validation

**Supported Configurations:**
- RC (Remote Control)
- DMG (Demo/Marketing)
- DEMO (Demonstration)
- EDU (Educational)

### 2. C2 Steuerrechner
Compact control units with essential functionality.

**Quality Control Points:**
- Hardware completeness and DIN rail clip installation
- HDMI, Web, and Zoom operation
- Menu functionality and camera inputs
- System state data validation
- Automatic testing protocols

### 3. C Basic Steuerrechner
Entry-level control units with basic functionality.

**Quality Control Points:**
- Hardware integrity and DIN rail mounting
- HDMI and Zoom functionality
- Camera input validation
- Language switching capabilities
- English language configuration

### 4. Kamerakopf (Camera Heads)
Precision camera systems with optical components.

**Quality Control Points:**
- Optical glass cleanliness and integrity
- Rotor free rotation and adhesive quality
- Pneumatic connection and pressure testing
- Light module and motor functionality (10x testing each)
- Pressure and position sensor validation
- Focus position and optic switching (dual-optic units)
- Sealing wax application

**Optic Configurations:**
- Single Optic: F1, F2, TFT
- Dual Optic: F1+F2, F1+TFT, F2+TFT

## Quality Control Workflow

### Prüfer A (Inspector A) - Initial Testing
1. **Product Identification** - Serial number, article details, production date
2. **Basic Hardware Checks** - Physical integrity, component presence
3. **Initial Functionality Tests** - Basic operation verification
4. **Documentation** - Test results and any issues noted
5. **Handoff** - Product passed to Prüfer B for final validation

### Prüfer B (Inspector B) - Final Validation
1. **Data Verification** - Load existing test data by serial number
2. **Advanced Testing** - Comprehensive functionality validation
3. **Final Checks** - System integration and performance testing
4. **QR Code Generation** - Automatic test result encoding
5. **Label Printing** - Final product labeling and documentation

## Dashboard & Analytics

### Production Overview
- **Total Production Counts** - All-time and recent (30-day) statistics
- **Monthly Trends** - 12-month production history with visual charts
- **Product Distribution** - Breakdown by product type and configuration
- **Performance Metrics** - Top performing inspectors by product volume

### Statistical Analysis
- **C Pro Hard Drive Distribution** - Storage capacity analysis
- **C2 Configuration Breakdown** - Configuration type distribution  
- **Kamerakopf Optic Analysis** - Optical configuration statistics
- **Inspector Performance** - Productivity tracking and quality metrics

### Real-time Monitoring
- **Live Production Updates** - Current testing activity
- **Quality Trends** - Pass/fail rates and issue tracking
- **Resource Utilization** - Inspector workload and efficiency

## Label Management

### QR Code Generation
- **Test Result Encoding** - Complete test data in QR format
- **SVG Format** - Scalable vector graphics for high-quality printing
- **Batch Processing** - Multiple labels with consistent formatting

### Outer Carton Labeling
**Dual Mode Operation:**
1. **Scan Mode** - QR code scanning for automatic product identification
2. **Manual Mode** - Product selection from available inventory

**Supported Content:**
- All tested products (C Pro, C2, C Basic, Kamerakopf)
- Accessory items and components
- Mixed product cartons with detailed manifests

### Accessory Labels
- **Component Tracking** - Individual accessory identification
- **Category Management** - Organized by product family
- **Quantity Control** - Precise inventory management

## Database Management

### Data Viewing & Search
- **Comprehensive Tables** - All product data with sorting and filtering
- **Advanced Search** - Multi-criteria search across all fields
- **Export Capabilities** - Data export for reporting and analysis
- **Historical Tracking** - Complete audit trail of all changes

### Data Integrity
- **Validation Rules** - Strict data validation for all inputs
- **Referential Integrity** - Consistent relationships across schemas
- **Backup & Recovery** - Automated backup and recovery procedures

## Documentation & Architecture
- Extensive docs in `docs/architecture/` covering system overview, technical, data, security, deployment, and development standards

## Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- Git

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/JayeshKakkad-Rotoclear/Etikettdruck.git
cd etikettendruck
```

2. **Install dependencies:**
```bash
npm install
```

3. **Database setup:**
```bash
# Configure your DATABASE_URL in .env
echo "DATABASE_URL=postgresql://username:password@localhost:5432/etikettdrucker" > .env

# Generate Prisma client
npx prisma generate

# Run database migrations and seed data
npx prisma db push
npm run db:seed
```

4. **Initial setup:**
```bash
# Start the development server
npm run dev

# Navigate to http://localhost:5173/setup to create the first admin user
# This is a one-time setup required before the system can be used
```

5. **Access the application:**
```bash
# The application will be available at http://localhost:5173
# Login with your admin credentials to access the system
```

**Important:** The application requires authentication for all operations. After setup, users must log in to access any functionality. Roles determine what features each user can access.

The application will be available at `http://localhost:5173`

### Production Deployment

1. **Build the application:**
```bash
npm run build
```

2. **Preview production build:**
```bash
npm run preview
```

3. **Deploy using your preferred hosting platform** (Vercel, Netlify, Docker, etc.)

## Project Structure

```
etikettendruck/
├── prisma/
│   ├── schema.prisma              # Database schema definitions
│   ├── migrations/                # Database migration files
│   └── seed.ts                    # Database seeding script
├── src/
│   ├── lib/
│   │   ├── components/            # Reusable Svelte components
│   │   │   ├── header.svelte      # Navigation header
│   │   │   ├── footer.svelte      # Application footer
│   │   │   ├── booleanRadio.svelte # Boolean selection component
│   │   │   ├── selectRadio.svelte  # Multiple choice component
│   │   │   └── RouteGuard.svelte   # Route protection component
│   │   ├── stores/               # Svelte stores
│   │   │   └── auth.ts           # Authentication store
│   │   ├── auth.ts               # Server-side authentication
│   │   ├── client-auth.ts        # Client-side authentication utilities
│   │   ├── roleUtils.ts          # Role validation utilities
│   │   ├── index.ts              # Library exports
│   │   └── version.ts            # Version management
│   ├── routes/
│   │   ├── api/                  # API endpoints
│   │   │   ├── auth/             # Authentication API routes
│   │   │   │   ├── login/        # Login endpoint
│   │   │   │   ├── logout/       # Logout endpoint
│   │   │   │   └── check/        # Auth status check
│   │   │   ├── users/            # User management API
│   │   │   ├── admin/            # Admin-specific API routes
│   │   │   ├── setup/            # System setup API
│   │   │   ├── database/         # Database management API
│   │   │   ├── cpro/             # C Pro API routes
│   │   │   ├── c2/               # C2 API routes  
│   │   │   ├── cbasic/           # C Basic API routes
│   │   │   ├── kk/               # Kamerakopf API routes
│   │   │   ├── zubehoer/         # Accessory API routes
│   │   │   ├── outerkarton/      # Outer carton API routes
│   │   │   └── dashboard-stats/  # Dashboard statistics API
│   │   ├── admin/                # Administration pages
│   │   │   └── users/            # User management interface
│   │   ├── login/                # Login page
│   │   ├── setup/                # Initial system setup
│   │   ├── profile/              # User profile management
│   │   ├── database/             # Database management interface
│   │   ├── debug/                # System debug information
│   │   ├── cpro/                 # C Pro testing forms (role-protected)
│   │   │   ├── pruefer-a/        # Inspector A form
│   │   │   ├── pruefer-b/        # Inspector B form
│   │   │   └── qr-preview/       # QR code preview
│   │   ├── c2/                   # C2 testing forms (role-protected)
│   │   ├── cbasic/               # C Basic testing forms (role-protected)
│   │   ├── kk/                   # Kamerakopf testing forms (role-protected)
│   │   ├── dashboard/            # Analytics dashboards (role-protected)
│   │   │   ├── cpro/             # C Pro dashboard
│   │   │   ├── c2/               # C2 dashboard
│   │   │   └── cbasic/           # C Basic dashboard
│   │   ├── zubehoer/             # Accessory label creation
│   │   ├── outer-karton/         # Outer carton labeling
│   │   ├── +layout.svelte        # Main application layout with auth
│   │   └── +page.svelte          # Dashboard home page
│   │   ├── print-label/          # Reprint label pages for all product types
│   │   ├── qr-preview/           # QR code preview pages
│   │   ├── debug/icons/          # Icon preview and testing
│   │   ├── admin/+layout.svelte  # Admin layout with role protection
│   ├── hooks.server.ts           # SvelteKit server hooks for auth
│   ├── app.html                  # HTML template
│   └── app.d.ts                  # TypeScript definitions with auth types
├── static/                       # Static assets
├── scripts/                      # Development and deployment scripts
├── .vscode/                      # VS Code workspace configuration
├── ROLES.md                      # Role hierarchy documentation
├── package.json                  # Dependencies and scripts
├── vite.config.ts               # Vite configuration
├── svelte.config.js             # SvelteKit configuration
├── tsconfig.json                # TypeScript configuration
└── README.md                    # This file
```

## Configuration

### Environment Variables
```bash
# Database (Required)
DATABASE_URL=postgresql://username:password@localhost:5432/etikettdrucker

# Authentication (Optional - defaults provided)
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# Application (Optional)
VITE_APP_TITLE="Etikettdrucker"
VITE_API_BASE_URL="http://localhost:5173"
```

**Important:** If `JWT_SECRET` is not provided, the system will generate a random secret on startup. For production deployments, always set a secure, persistent JWT secret.

### Database Schemas
The application uses multiple PostgreSQL schemas for data organization:
- `cpro_steuerrechner` - C Pro control unit data
- `c2_steuerrechner` - C2 control unit data  
- `cbasic_steuerrechner` - C Basic control unit data
- `kk_kamerakopf` - Camera head data
- `zubehoer_etikett` - Accessory label data
- `outer_karton` - Outer carton data
- `outer_karton_entry` - Carton content tracking
- `User` - User accounts and authentication data

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run check        # Run TypeScript checking
npm run check:watch  # Watch mode TypeScript checking
npm run db:seed      # Seed database with initial data
npm run db:setup     # Setup database (push schema + seed data)
npx prisma studio    # Open Prisma database browser
npx prisma generate  # Generate Prisma client
npx prisma db push   # Push schema changes to database
```

## Testing Protocols

### Quality Assurance Standards
Each product line follows standardized testing protocols ensuring:
- **Consistency** - Uniform testing procedures across all products
- **Traceability** - Complete audit trail from testing to shipment  
- **Compliance** - Industry standard quality verification
- **Documentation** - Comprehensive test result recording

### Test Data Validation
- **Required Fields** - Mandatory data validation
- **Format Checking** - Serial number and identifier validation
- **Range Validation** - Acceptable value ranges for measurements
- **Cross-Reference** - Component compatibility verification

## Security Considerations

### Authentication & Authorization
- **JWT Authentication** - Secure token-based authentication with HTTP-only cookies
- **Password Security** - bcryptjs hashing with salt for secure password storage
- **Session Management** - Automatic token validation and renewal
- **XSS Protection** - HTTP-only cookies prevent client-side script access to tokens
- **CSRF Protection** - SvelteKit's built-in CSRF protection mechanisms
- **Role-Based Access Control** - 6-level hierarchy with granular permission management

### Data Protection
- **Input Validation** - All user inputs are validated and sanitized
- **SQL Injection Prevention** - Prisma ORM provides built-in protection
- **Type Safety** - TypeScript ensures compile-time type checking
- **Route Protection** - Server-side authentication validation for all protected routes
- **Sensitive Data** - Passwords are never stored in plain text or logged

### Audit Trail
- **Authentication Logging** - All login attempts and session activities tracked
- **User Attribution** - Complete user identification for all operations
- **Role Changes** - Administrator actions and role modifications logged
- **Database Operations** - All CRUD operations tracked with user context
- **Timestamp Tracking** - Precise timing of all operations
- **Change History** - Complete revision history for all records

## Contributing

### Development Guidelines
1. **Code Style** - Follow TypeScript and Svelte best practices
2. **Testing** - Validate all changes thoroughly before submission
3. **Documentation** - Update documentation for any feature changes
4. **Database Changes** - Use Prisma migrations for schema updates

### Pull Request Process
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Support & Contact

### Technical Support
- **Repository Issues** - Use GitHub issues for bug reports and feature requests
- **Documentation** - Check this README and inline code documentation
- **Database Questions** - Refer to Prisma documentation for ORM-related queries

### Business Contact
- **Company** - Rotoclear GmbH
- **System** - Internal quality control and production management

## License

This project is proprietary software developed for Rotoclear GmbH. All rights reserved.

---

## Version History

### v0.1.0 (Current)
- Major refactor, bug fixes, and feature enhancements across the entire project
- Notification center, SVG icon system, mobile-first design, accessibility, and comprehensive documentation
- Unified label printing APIs, PUT endpoints for reprinting, QR code image generation, dynamic ZPL formatting
- Database and dashboard improvements, Lieferschein tracking, and advanced search/filter/export
- All changes tested and validated for production use

### v0.0.1
- **Authentication System** - Complete JWT-based authentication with HTTP-only cookies
- **Role-Based Access Control** - 6-level user hierarchy (VIEWER → PRUEFER_B → PRUEFER_A → PRUEFER_AB → MANAGEMENT → ADMIN)
- **User Management** - Comprehensive user administration with role assignment and profile management
- **Route Protection** - Layout-based guards protecting all sensitive operations
- **Security Features** - Password hashing, session management, and XSS protection
- **Initial Setup Wizard** - First-time admin user creation and system configuration
- **Complete Quality Control Workflow** - Multi-product testing protocols for C Pro, C2, C Basic, and Kamerakopf
- **Dashboard Analytics** - Real-time statistics, production metrics, and performance analytics  
- **Label Generation** - Automated QR code generation and printing capabilities
- **Database Management** - Complete data viewing, searching, and administrative tools
- **Outer Carton Labeling** - Dual-mode (scan/manual) product selection system
- **Accessory Management** - Zubehör label creation and tracking
- **Enhanced UI/UX** - Comprehensive page titles and improved navigation
