# Etikettdrucker Documentation Hub

Welcome to the comprehensive documentation for the Etikettdrucker (Label Printer) quality control and labeling system.

## Quick Navigation

### 🚀 Getting Started
- **[Setup Guide](./getting-started.md)** - Local development environment setup
- **[User Guides](./user-guides/README.md)** - End-user documentation and workflows

### 🏗️ Architecture & Design
- **[Architecture Overview](./architecture/README.md)** - Complete 6-part technical architecture
- **[API Documentation](./api/README.md)** - REST API reference and examples
- **[Data Layer](./data/schema.md)** - Database schemas and data contracts

### 🛠️ Development
- **[Development Setup](./development/setup.md)** - Developer environment configuration
- **[Testing Guide](./development/testing.md)** - Testing strategy and procedures
- **[Contributing](./development/contributing.md)** - Contribution guidelines

### 🚀 Operations
- **[Deployment Guide](./operations/deployment.md)** - Production deployment procedures
- **[Monitoring](./operations/monitoring.md)** - Health checks and observability
- **[Runbooks](./operations/runbooks/README.md)** - Operational procedures

### 📋 Reference
- **[Changelog](./releases/CHANGELOG.md)** - Version history and changes
- **[Glossary](#glossary)** - Technical terms and abbreviations

## Project Overview

**Etikettdrucker** is a comprehensive quality control and labeling solution for Rotoclear's manufacturing operations, currently at **v1.0.0-beta**. The system manages the complete lifecycle of product quality testing, from initial inspection through final labeling.

### Key Features
- Multi-product support (C2, C-Pro, C-Basic, KK)
- Quality control workflows (Prüfer A/B inspections)
- Interactive dashboard analytics
- ZPL label printing and QR code generation
- Role-based access control
- Multi-schema PostgreSQL database

### Technology Stack
- **Frontend**: SvelteKit 2.x with TypeScript
- **Backend**: SvelteKit API routes (Node.js)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT + secure sessions
- **Deployment**: Docker + Node.js

## Glossary

**ADR** - Architectural Decision Record: Documents important architectural decisions and their rationale.

**API** - Application Programming Interface: Standardized interface for system communication.

**CRUD** - Create, Read, Update, Delete: Basic database operations.

**DoD** - Definition of Done: Criteria that must be met for work to be considered complete.

**DoR** - Definition of Ready: Criteria that must be met before work can begin.

**ER Diagram** - Entity Relationship Diagram: Visual representation of database relationships.

**JWT** - JSON Web Token: Stateless authentication token format.

**ORM** - Object-Relational Mapping: Database abstraction layer (Prisma in this project).

**Prüfer A/B** - German for "Inspector A/B": Two-stage quality control inspection process.

**RBAC** - Role-Based Access Control: Permission system based on user roles.

**SLA** - Service Level Agreement: Commitment to service performance standards.

**ZPL** - Zebra Programming Language: Label printer programming language for industrial printers.

## Documentation Standards

This documentation follows these principles:
- **Wiki-ready**: Plain Markdown with relative links for portability
- **Code-derived**: Information extracted from actual source code
- **Maintainable**: Clear structure with explicit TODOs for missing information
- **Practical**: Real examples and working code snippets

## Contributing to Documentation

Documentation improvements are welcome! See [Contributing Guidelines](./development/contributing.md) for details on:
- Documentation standards and style guide
- Review process for documentation changes
- How to generate API documentation from code
- Architecture documentation update procedures

---
*Last Updated: September 4, 2025 | Version: v1.0.0-beta*
