# Etikettdrucker - Quality Control & Label Printing System

![Version](https://img.shields.io/badge/version-0.0.1-blue.svg)
![SvelteKit](https://img.shields.io/badge/SvelteKit-FF3E00?logo=svelte&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?logo=Prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?logo=postgresql&logoColor=white)

A comprehensive quality control and label printing management system built for **Rotoclear GmbH** to streamline production testing, data collection, and label generation for various product lines.

## System Overview

The Etikettdrucker system is designed to manage quality control processes for multiple product families through a dual-inspector workflow, comprehensive data tracking, and automated label generation. The system supports various Rotoclear products including Steuerrechner (Control Units) and Kamerakopf (Camera Heads).

### Core Features

- **Multi-Product Quality Control** - Standardized testing protocols for C Pro, C2, C Basic, and Kamerakopf product lines
- **Dual-Inspector Workflow** - Sequential testing by Prüfer A and Prüfer B with comprehensive validation
- **Comprehensive Dashboard** - Real-time statistics, production metrics, and performance analytics
- **Label Generation** - Automated QR code generation and printing for tested products
- **Database Management** - Complete data viewing, searching, and management capabilities
- **Packaging Support** - Outer carton labeling with dual-mode (scan/manual) product selection
- **Accessory Management** - Zubehör (accessory) label creation and tracking

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

### Database Design
```
Schemas:
├── cpro_steuerrechner     (C Pro Control Units)
├── c2_steuerrechner       (C2 Control Units) 
├── cbasic_steuerrechner   (C Basic Control Units)
├── kk_kamerakopf          (Camera Heads)
├── zubehoer_etikett       (Accessory Labels)
├── outer_karton           (Outer Carton Labels)
└── outer_karton_entry     (Carton Contents)
```

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

# Run database migrations
npx prisma db push
```

4. **Start development server:**
```bash
npm run dev
```

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
│   └── schema.prisma              # Database schema definitions
├── src/
│   ├── lib/
│   │   ├── components/            # Reusable Svelte components
│   │   │   ├── header.svelte      # Navigation header
│   │   │   ├── footer.svelte      # Application footer
│   │   │   ├── booleanRadio.svelte # Boolean selection component
│   │   │   └── selectRadio.svelte  # Multiple choice component
│   │   ├── index.ts              # Library exports
│   │   └── version.ts            # Version management
│   ├── routes/
│   │   ├── api/                  # API endpoints
│   │   │   ├── cpro/             # C Pro API routes
│   │   │   ├── c2/               # C2 API routes  
│   │   │   ├── cbasic/           # C Basic API routes
│   │   │   ├── kk/               # Kamerakopf API routes
│   │   │   ├── zubehoer/         # Accessory API routes
│   │   │   ├── outerkarton/      # Outer carton API routes
│   │   │   └── dashboard-stats/  # Dashboard statistics API
│   │   ├── cpro/                 # C Pro testing forms
│   │   │   ├── pruefer-a/        # Inspector A form
│   │   │   ├── pruefer-b/        # Inspector B form
│   │   │   └── qr-preview/       # QR code preview
│   │   ├── c2/                   # C2 testing forms
│   │   ├── cbasic/               # C Basic testing forms
│   │   ├── kk/                   # Kamerakopf testing forms
│   │   ├── dashboard/            # Database management views
│   │   ├── zubehoer/             # Accessory label creation
│   │   ├── outer-karton/         # Outer carton labeling
│   │   ├── +layout.svelte        # Main application layout
│   │   └── +page.svelte          # Dashboard home page
│   ├── app.html                  # HTML template
│   └── app.d.ts                  # TypeScript definitions
├── static/                       # Static assets
├── package.json                  # Dependencies and scripts
├── vite.config.ts               # Vite configuration
├── svelte.config.js             # SvelteKit configuration
├── tsconfig.json                # TypeScript configuration
└── README.md                    # This file
```

## Configuration

### Environment Variables
```bash
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/etikettdrucker

# Optional: Custom configurations
VITE_APP_TITLE="Etikettdrucker"
VITE_API_BASE_URL="http://localhost:5173"
```

### Database Schemas
The application uses multiple PostgreSQL schemas for data organization:
- `cpro_steuerrechner` - C Pro control unit data
- `c2_steuerrechner` - C2 control unit data  
- `cbasic_steuerrechner` - C Basic control unit data
- `kk_kamerakopf` - Camera head data
- `zubehoer_etikett` - Accessory label data
- `outer_karton` - Outer carton data
- `outer_karton_entry` - Carton content tracking

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run check        # Run TypeScript checking
npm run check:watch  # Watch mode TypeScript checking
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

### Data Protection
- **Input Validation** - All user inputs are validated and sanitized
- **SQL Injection Prevention** - Prisma ORM provides built-in protection
- **Type Safety** - TypeScript ensures compile-time type checking
- **Access Control** - Role-based access to sensitive operations

### Audit Trail
- **Complete Logging** - All database operations are tracked
- **User Attribution** - Inspector identification for all test results
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

### v0.0.1 (Current)
- Initial release with complete quality control workflow
- Dashboard with comprehensive analytics
- Multi-product testing protocols
- Label generation and printing capabilities
- Database management and search functionality
- Outer carton dual-mode labeling system
- Accessory management and tracking

---

**Built for Rotoclear GmbH Quality Assurance**