# Changelog

All significant changes to the **Etikettdrucker** project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## \[1.0.0-beta] – 2025-09-04

### Key Features

* **Interactive dashboard analytics**: Monthly production charts with hover tooltips and a polished presentation.
* **Enhanced quality control workflows**: Improved Inspector A/B processes with advanced change detection.
* **QR code generation**: Dynamic QR codes for traceability across all product types.
* **Multi-product support**: End-to-end workflows for C2, C-Pro, C-Basic, and KK.
* **Role-based access control**: Comprehensive RBAC system with six permission levels.

### User Experience Improvements

* **Mobile-optimized design**: Fully optimized UI for mobile and tablet devices.
* **Professional UI/UX**: Clean, modern interface with better navigation and visual hierarchy.
* **Interactive charts**: Chart.js integration with hover tooltips and responsive layout.
* **Improved form validation**: Real-time validation with clear, descriptive error messages.

### Technical Enhancements

* **Multi-schema database**: PostgreSQL with domain-separated schemas.
* **Security hardening**: Improved authentication, rate limiting, and audit logging.
* **API consolidation**: Structured REST API with standardized response formats.
* **Docker support**: Production-grade containerization with multi-stage builds.

### Security Features

* **Hybrid authentication (JWT + session)**: Secure token-based login with server-side session management.
* **Rate limiting**: API protection against abuse and DoS attacks.
* **Security audit logging**: Comprehensive logging of authentication and security events.
* **CSRF protection**: Safeguards for state-changing operations.
* **Input validation**: Server-side validation enforced with TypeScript schemas.

### Bug Fixes

* **Inspector B change detection**: Fixed a critical issue that always displayed “no changes.”
* **Form state management**: Resolved data persistence and validation issues.
* **Dashboard tooltips**: Corrected tooltip positioning and interactivity.
* **Mobile navigation**: Improved menu behavior and responsive handling on mobile devices.

### Data & Analytics

* **Production statistics**: Monthly tracking and reporting.
* **Quality metrics**: First-pass rate, rework rate, and defect tracking.
* **Dashboard visualizations**: Interactive charts for production monitoring.
* **Export functions**: PDF and data export.

### API Improvements

* **Standardized response format**: Consistent API responses across all endpoints.
* **Error handling**: More informative error responses.
* **Authentication endpoints**: Comprehensive auth API with session management.
* **Product-specific APIs**: Dedicated endpoints per product type, including analytics.

### Platform Support

* **Windows Server deployment**: Optimized for Windows infrastructure.
* **Docker deployment**: Containerized deployment via Docker Compose.
* **PostgreSQL 14+**: Database compatibility and performance optimizations.
* **Node.js 20**: Modern JavaScript runtime with improved performance.

---

## \[Earlier Versions]

### Pre-1.0.0 Development

* Initial SvelteKit setup
* Basic authentication system
* Prisma integration
* Multi-schema database design
* Core product workflows
* Security middleware implementation

---

## Version History (At a Glance)

| Version    | Release Date | Core Features                                        |   |
| ---------- | ------------ | ---------------------------------------------------- | - |
| 1.0.0-beta | 2025-09-04   | Dashboard analytics, improved UX, security hardening |   |
| 0.x.x      | 2025-08-xx   | Initial development, core functionality              |   |

## Breaking Changes

### 1.0.0-beta

* **Database schema**: Migration to a multi-schema setup required for existing installations.
* **API response format**: Unified format may require client updates.
* **Authentication**: Strengthened security may require session refresh.
* **Environment variables**: New configuration options required for deployment.

## Migration Guide

### Upgrading to 1.0.0-beta

1. **DB migration**: Run `npm run db:setup` to apply schema changes.
2. **Update environment**: Incorporate new variables from `.env.example`.
3. **Admin account**: Create a new admin account with stricter security requirements.
4. **Dependencies**: Move to Node.js 20.x and PostgreSQL 14+.

## Security Notes

### Security Improvements in 1.0.0-beta

* **Password policy**: Minimum 12 characters with complexity requirements.
* **Session security**: Improved management, including IP validation.
* **Rate limiting**: Protection against brute-force and DoS attacks.
* **Audit logging**: Comprehensive logging of security events.

## Acknowledgements

### Contributors

* Development team: Core system & architecture
* Quality assurance: Testing & validation
* Security review: Assessment & hardening

### Dependencies

* **SvelteKit 2.x**: Full-stack framework
* **Prisma**: Type-safe DB client
* **PostgreSQL**: Robust relational database
* **Chart.js**: Interactive data visualization
* **bcryptjs**: Secure password hashing

---

*For detailed technical changes, see the [Architecture documentation](../architecture/README.md). For deployment instructions, see the [Deployment Guide](../operations/deployment.md).*
