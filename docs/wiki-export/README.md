# Wiki Export Package

This directory contains all documentation files formatted and optimized for wiki deployment.

## Export Status

**Export Date:** September 4, 2025  
**Documentation Version:** v1.0.0-beta  
**Total Files:** 15+ documentation files  
**Wiki Format:** GitHub Wiki Compatible  

## Package Contents

### Core Documentation
- `Home.md` - Main documentation hub (wiki home page)
- `Getting-Started.md` - Quick start guide for new users
- `User-Guide.md` - Complete user manual with screenshots
- `Development-Setup.md` - Developer onboarding guide

### Technical References
- `API-Reference.md` - Complete API documentation
- `Database-Schema.md` - Database architecture and schema
- `Architecture-Overview.md` - System architecture documentation
- `Security-Guide.md` - Security implementation details

### Operations & Maintenance
- `Operations-Guide.md` - Production deployment and operations
- `Troubleshooting.md` - Common issues and solutions
- `FAQ.md` - Frequently asked questions
- `Changelog.md` - Version history and updates

### Developer Resources
- `Contributing.md` - Contribution guidelines
- `Code-Style.md` - Coding standards and conventions
- `Testing-Guide.md` - Testing procedures and standards

## Quick Wiki Setup

### Option 1: GitHub Wiki
```bash
# Clone your repository's wiki
git clone https://github.com/JayeshKakkad-Rotoclear/Etikettdruck.wiki.git

# Copy wiki files
cp docs/wiki-export/*.md Etikettdruck.wiki/

# Push to wiki
cd Etikettdruck.wiki
git add .
git commit -m "docs: initial wiki setup from documentation export"
git push
```

### Option 2: Manual Upload
1. Go to your repository's Wiki tab on GitHub
2. Create new pages using the file names (without .md extension)
3. Copy and paste content from each file
4. Set `Home.md` as your wiki's main page

### Option 3: Automated Setup
```bash
# Use the provided setup script
./scripts/setup-wiki.sh
```

## Wiki Navigation Structure

```
Home (Home.md)
├── Getting Started (Getting-Started.md)
├── User Guide (User-Guide.md)
│   ├── Product Operations
│   ├── Dashboard Analytics  
│   └── QR Code Management
├── Developer Guide
│   ├── Development Setup (Development-Setup.md)
│   ├── API Reference (API-Reference.md)
│   ├── Architecture Overview (Architecture-Overview.md)
│   └── Contributing (Contributing.md)
├── Operations
│   ├── Operations Guide (Operations-Guide.md)
│   ├── Security Guide (Security-Guide.md)
│   └── Troubleshooting (Troubleshooting.md)
└── Reference
    ├── Database Schema (Database-Schema.md)
    ├── FAQ (FAQ.md)
    └── Changelog (Changelog.md)
```

## Customization Options

### Sidebar Configuration
For wikis that support custom sidebars, use the provided `_Sidebar.md` file.

### Footer Configuration  
Custom footer available in `_Footer.md` with project links and metadata.

### Home Page Customization
Edit `Home.md` to customize:
- Project description
- Quick links
- Getting started flow
- Recent updates section

## Wiki Features

### Included Features
- [x] Cross-reference links between pages
- [x] Table of contents for long pages
- [x] Code syntax highlighting
- [x] Mermaid diagram support
- [x] Responsive images and screenshots
- [x] Search-friendly content structure
- [x] Mobile-optimized formatting

### Maintenance
- Documentation updates automatically sync via CI/CD
- Wiki pages can be updated by copying from `docs/wiki-export/`
- Version tracking through git commits
- Automated link validation

## Advanced Setup

### Custom Domain (GitHub Pages)
```yaml
# In repository settings, configure:
# Pages > Source: Deploy from branch
# Branch: gh-pages
# Custom domain: docs.yourcompany.com
```

### Search Integration
```javascript
// Add to wiki template for enhanced search
window.addEventListener('load', function() {
    // Custom search functionality
    // See scripts/wiki-search.js
});
```

## Support

- **Documentation Issues:** Create issue in main repository
- **Wiki Problems:** Check troubleshooting guide
- **Feature Requests:** Use GitHub discussions
- **Emergency Support:** Contact development team

## License

Documentation is licensed under the same terms as the main project.
Wiki content is available under Creative Commons Attribution 4.0.
