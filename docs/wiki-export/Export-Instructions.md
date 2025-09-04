# Wiki Export Instructions

## Overview

This guide provides step-by-step instructions for exporting the Etikettdrucker documentation to various wiki platforms and documentation hosting services.

## Pre-Export Checklist

- [ ] All documentation files are up-to-date
- [ ] Links have been validated (run `npm run docs:validate`)
- [ ] Spell check completed (run `npm run docs:spellcheck`)
- [ ] TODOs have been resolved or documented
- [ ] Images and diagrams are properly referenced
- [ ] Version numbers are current

## Export Options

### Option 1: GitHub Wiki (Recommended)

#### Automatic Setup
```bash
# Run the automated setup script
./scripts/setup-wiki.sh
```

#### Manual Setup
1. **Enable Wiki** in your GitHub repository settings
2. **Clone the wiki repository:**
   ```bash
   git clone https://github.com/JayeshKakkad-Rotoclear/Etikettdruck.wiki.git
   ```
3. **Copy documentation files:**
   ```bash
   cp docs/wiki-export/*.md Etikettdruck.wiki/
   ```
4. **Commit and push:**
   ```bash
   cd Etikettdruck.wiki
   git add .
   git commit -m "docs: initial documentation import"
   git push
   ```

### Option 2: GitLab Wiki

1. **Navigate to your GitLab project**
2. **Go to Wiki section**
3. **Create new pages** for each documentation file
4. **Copy content** from `docs/wiki-export/` files
5. **Update internal links** to use GitLab wiki syntax

### Option 3: Confluence

1. **Export to Confluence format:**
   ```bash
   npm run docs:export-confluence
   ```
2. **Import pages** using Confluence's import tool
3. **Adjust formatting** as needed for Confluence
4. **Update permissions** according to your organization's needs

### Option 4: Notion

1. **Convert to Notion format:**
   ```bash
   npm run docs:export-notion
   ```
2. **Import to Notion workspace**
3. **Organize page hierarchy**
4. **Share with appropriate team members**

### Option 5: Custom Documentation Site

#### Using MkDocs (Material Theme)
```bash
# Install dependencies
pip install -r docs/requirements.txt

# Build static site
mkdocs build

# Deploy to GitHub Pages
mkdocs gh-deploy
```

#### Using Docusaurus
```bash
# Create new Docusaurus site
npx create-docusaurus@latest docs-site classic

# Copy documentation files
cp docs/wiki-export/*.md docs-site/docs/

# Build and deploy
cd docs-site
npm run build
npm run deploy
```

## Format Customization

### Wiki Link Format Conversion

The export includes a script to convert internal links between formats:

```bash
# Convert to GitHub Wiki format
node scripts/convert-links.js --format github-wiki

# Convert to GitLab Wiki format  
node scripts/convert-links.js --format gitlab-wiki

# Convert to Confluence format
node scripts/convert-links.js --format confluence
```

### Image and Asset Handling

1. **GitHub Wiki**: Images should be uploaded to wiki repository
2. **GitLab Wiki**: Use GitLab's built-in image upload
3. **Confluence**: Images uploaded via Confluence interface
4. **Static Sites**: Images in `static/` directory

### Code Block Optimization

Different platforms support different syntax highlighting:

```markdown
<!-- GitHub/GitLab -->
```typescript
function example() {
  return "highlighted";
}
```

<!-- Confluence -->
{code:language=typescript}
function example() {
  return "highlighted";
}
{code}
```

## Platform-Specific Features

### GitHub Wiki Features
- [x] Markdown support
- [x] Mermaid diagrams
- [x] Code syntax highlighting
- [x] Internal linking
- [x] Search functionality
- [x] Version history
- [ ] Custom themes
- [ ] Advanced plugins

### GitLab Wiki Features
- [x] Markdown support
- [x] PlantUML diagrams
- [x] Code syntax highlighting  
- [x] Internal linking
- [x] Search functionality
- [x] Version history
- [x] Custom themes
- [ ] Advanced plugins

### Confluence Features
- [x] Rich text editing
- [x] Advanced diagrams
- [x] Commenting system
- [x] Advanced permissions
- [x] Templates
- [x] Macros and plugins
- [ ] Markdown import (limited)
- [ ] Version control integration

## Post-Export Validation

### Link Validation
```bash
# Check all internal links work
npm run docs:validate-links

# Check external links
npm run docs:validate-external
```

### Content Verification
- [ ] All pages accessible
- [ ] Images display correctly
- [ ] Code blocks formatted properly
- [ ] Internal links functional
- [ ] Search works effectively
- [ ] Mobile responsiveness

### User Acceptance Testing
- [ ] End users can find information quickly
- [ ] Navigation is intuitive
- [ ] Content is accurate and up-to-date
- [ ] Examples work as documented

## Mobile Optimization

### Responsive Design Checklist
- [ ] Tables are scrollable on mobile
- [ ] Images scale appropriately
- [ ] Navigation works on touch devices
- [ ] Code blocks don't overflow
- [ ] Search is mobile-friendly

## Access Control

### Permission Setup

**GitHub Wiki:**
- Repository collaborators have wiki edit access
- Public repositories have public wikis
- Private repositories have private wikis

**GitLab Wiki:**
- Configurable per-project permissions
- Can be separate from repository access

**Confluence:**
- Granular space and page permissions
- Group-based access control

## Analytics and Monitoring

### Usage Tracking
```javascript
// Add to wiki pages for analytics
gtag('event', 'page_view', {
  page_title: 'Documentation Page',
  page_location: window.location.href
});
```

### Feedback Collection
- Add feedback forms to important pages
- Monitor search queries for content gaps
- Track most/least visited pages
- Collect user satisfaction metrics

## Maintenance Plan

### Regular Updates
- [ ] Weekly: Check for broken links
- [ ] Monthly: Update screenshots and examples
- [ ] Quarterly: Review and update architecture docs
- [ ] Annually: Complete documentation audit

### Automation
```yaml
# GitHub Actions for wiki sync
name: Sync Wiki
on:
  push:
    paths: ['docs/**']
jobs:
  sync-wiki:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Update Wiki
        run: ./scripts/sync-wiki.sh
```

## Support and Troubleshooting

### Common Issues

**Issue**: Links not working after export
**Solution**: Run link conversion script for target platform

**Issue**: Images not displaying
**Solution**: Check image paths and upload to wiki platform

**Issue**: Code formatting broken
**Solution**: Verify platform-specific syntax highlighting

**Issue**: Search not working
**Solution**: Check platform search indexing settings

### Getting Help
- Create issue in main repository for export problems
- Check platform-specific documentation
- Contact development team for custom requirements

## Export Checklist

### Pre-Export
- [ ] Documentation is complete and current
- [ ] All links validated
- [ ] Images optimized and accessible
- [ ] Platform requirements understood

### During Export
- [ ] Follow platform-specific instructions
- [ ] Test import process with sample pages
- [ ] Verify formatting after import
- [ ] Set up proper navigation

### Post-Export
- [ ] Complete validation testing
- [ ] Configure access permissions
- [ ] Set up maintenance procedures
- [ ] Train users on new platform

---

**Last Updated**: September 4, 2025  
**Export Version**: 1.0.0-beta  
**Supported Platforms**: GitHub Wiki, GitLab Wiki, Confluence, Notion, Custom Sites
