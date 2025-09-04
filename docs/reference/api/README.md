**Etikettdrucker API Reference v0.0.1**

***

# API Reference

Welcome to the **Etikettdrucker API Reference** documentation. This section provides comprehensive documentation for all TypeScript modules, functions, classes, and interfaces in the Etikettdrucker codebase.

## Overview

The Etikettdrucker API is built with **SvelteKit** and **TypeScript**, providing a robust foundation for quality control and labeling operations. This reference documentation is automatically generated from the source code using TypeDoc.

## Core Modules

### Authentication & Security
- **[auth.ts](./api/modules/auth.md)** - Authentication utilities and user management
- **[security.ts](./api/modules/security.md)** - Security middleware and utilities  
- **[security-middleware.ts](./api/modules/security_middleware.md)** - Request security middleware
- **[csrf.ts](./api/modules/csrf.md)** - CSRF protection utilities

### Validation & Utilities
- **[input-validator.ts](./api/modules/input_validator.md)** - Input validation utilities
- **[roleUtils.ts](./api/modules/roleUtils.md)** - Role-based access control utilities
- **[printer.ts](./api/modules/printer.md)** - Printer management utilities
- **[version.ts](./api/modules/version.md)** - Version management utilities

## Quick Navigation

| Category | Description | Modules |
|----------|-------------|---------|
| **Authentication** | User auth, sessions, JWT | `auth`, `security` |
| **Security** | CSRF, middleware, validation | `security-middleware`, `csrf` |
| **Validation** | Input validation, sanitization | `input-validator` |
| **Utilities** | Helper functions, role management | `roleUtils`, `printer`, `version` |

## Getting Started

To use the API reference:

1. **Browse by Module**: Click on any module link above to see detailed documentation
2. **Search Functions**: Use your browser's search to find specific functions or classes
3. **View Source**: Click source links to see the actual implementation
4. **Cross-References**: Follow links between related functions and types

## Documentation Conventions

### Function Documentation
- **Purpose**: What the function does
- **Parameters**: Input parameters with types and descriptions
- **Returns**: Return value type and description
- **Examples**: Code examples where applicable
- **Throws**: Exceptions that may be thrown

### Type Documentation
- **Properties**: All properties with types and descriptions
- **Methods**: Available methods with signatures
- **Inheritance**: Base classes and implemented interfaces
- **Usage**: How to use the type in practice

## API Design Principles

The Etikettdrucker API follows these key principles:

### Type Safety
All functions and classes are fully typed with TypeScript, providing compile-time safety and excellent IDE support.

### Security First
Security utilities are built into the core, with comprehensive validation, sanitization, and access control.

### Modular Architecture
Code is organized into focused modules, each handling a specific aspect of the system.

### Documentation-Driven
All public APIs are documented with JSDoc comments for automatic reference generation.

## Related Documentation

- **[API Guide](_media/README.md)** - High-level API usage guide
- **[Getting Started](_media/getting-started.md)** - Setup and first steps
- **[Architecture](_media/README-1.md)** - System architecture overview
- **[Security Guide](../operations/security.md)** - Security implementation details

## Contributing

When contributing to the API:

1. **Add JSDoc Comments**: All public functions must have JSDoc documentation
2. **Include Examples**: Provide usage examples for complex functions
3. **Type Everything**: Use TypeScript types for all parameters and returns
4. **Update Tests**: Add or update tests for new or changed functionality

See [Contributing Guide](../development/contributing.md) for detailed guidelines.

---

**📝 Note**: This API reference is automatically generated from source code. To update documentation, edit the JSDoc comments in the source files and regenerate using `npm run docs:api`.

**🔗 Source Code**: All source links point to the current version on GitHub for easy reference.
