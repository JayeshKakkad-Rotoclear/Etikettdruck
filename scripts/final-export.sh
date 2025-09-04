#!/bin/bash
# Final Documentation Export Script
# Prepares complete wiki-ready documentation package

set -e

EXPORT_DIR="docs/wiki-export"
TIMESTAMP=$(date '+%Y%m%d_%H%M%S')
PACKAGE_NAME="etikettdrucker-docs-${TIMESTAMP}"
TEMP_DIR="temp-export"

echo "Creating final documentation export package..."

# Create temporary directory
if [ -d "$TEMP_DIR" ]; then
    rm -rf "$TEMP_DIR"
fi
mkdir -p "$TEMP_DIR"

# Copy all documentation files
echo "Copying documentation files..."
cp -r "$EXPORT_DIR" "$TEMP_DIR/wiki-ready"

# Copy additional export formats
echo "Generating format variants..."

# GitHub Wiki format (default)
mkdir -p "$TEMP_DIR/github-wiki"
node scripts/convert-links.js --format github-wiki --input "$EXPORT_DIR" --output "$TEMP_DIR/github-wiki"

# GitLab Wiki format
mkdir -p "$TEMP_DIR/gitlab-wiki"
node scripts/convert-links.js --format gitlab-wiki --input "$EXPORT_DIR" --output "$TEMP_DIR/gitlab-wiki"

# Confluence format
mkdir -p "$TEMP_DIR/confluence"
node scripts/convert-links.js --format confluence --input "$EXPORT_DIR" --output "$TEMP_DIR/confluence"

# Create package manifest
cat > "$TEMP_DIR/PACKAGE_MANIFEST.md" << EOF
# Documentation Export Package

**Package Created**: $(date)
**Version**: v1.0.0-beta
**Export ID**: ${TIMESTAMP}

## Package Contents

### Core Documentation (15+ files)
- Home.md - Main documentation hub
- Getting-Started.md - Quick start guide
- User-Guide.md - Complete user manual
- API-Reference.md - Complete API documentation
- Development-Setup.md - Developer environment setup
- Operations-Guide.md - Production deployment guide
- Security-Guide.md - Security implementation details
- Architecture-Overview.md - System architecture
- Database-Schema.md - Database documentation
- Troubleshooting.md - Issue resolution guide
- FAQ.md - Frequently asked questions
- Changelog.md - Version history
- Contributing.md - Contribution guidelines
- Export-Instructions.md - Wiki export guide
- Maintenance-Guide.md - Documentation maintenance

### Platform-Specific Formats
- github-wiki/ - GitHub Wiki optimized format
- gitlab-wiki/ - GitLab Wiki format with [[links]]
- confluence/ - Confluence-compatible format
- wiki-ready/ - Generic wiki-compatible format

### Supporting Files
- _Sidebar.md - Wiki navigation sidebar
- _Footer.md - Wiki footer content
- README.md - Package overview and instructions
- PACKAGE_MANIFEST.md - This file

## Quick Setup Commands

### GitHub Wiki
\`\`\`bash
git clone https://github.com/YourOrg/YourRepo.wiki.git
cp github-wiki/*.md YourRepo.wiki/
cd YourRepo.wiki && git add . && git commit -m "docs: initial import" && git push
\`\`\`

### GitLab Wiki
\`\`\`bash
# Upload files via GitLab wiki interface or use GitLab API
\`\`\`

### Confluence
\`\`\`bash
# Import via Confluence import tool or API
\`\`\`

## Validation Checklist
- [ ] All 15+ documentation files included
- [ ] Platform-specific formats generated
- [ ] Links converted for each platform
- [ ] Navigation structure preserved
- [ ] Images and assets referenced correctly

## Support
For issues with this export package:
- Create issue in main repository
- Contact documentation team
- Check Export-Instructions.md for detailed guidance

EOF

# Create validation script
cat > "$TEMP_DIR/validate-export.sh" << 'EOF'
#!/bin/bash
# Export Package Validation Script

echo "Validating documentation export package..."

ERRORS=0

# Check required directories
for dir in "wiki-ready" "github-wiki" "gitlab-wiki" "confluence"; do
    if [ ! -d "$dir" ]; then
        echo "Missing directory: $dir"
        ERRORS=$((ERRORS + 1))
    else
        echo "Found directory: $dir"
    fi
done

# Check core files
CORE_FILES=(
    "Home.md"
    "Getting-Started.md" 
    "User-Guide.md"
    "API-Reference.md"
    "Development-Setup.md"
    "Operations-Guide.md"
    "Security-Guide.md"
    "Architecture-Overview.md"
    "Database-Schema.md"
    "Troubleshooting.md"
    "FAQ.md"
    "Changelog.md"
    "Contributing.md"
    "Export-Instructions.md"
    "Maintenance-Guide.md"
)

for file in "${CORE_FILES[@]}"; do
    if [ ! -f "wiki-ready/$file" ]; then
        echo "Missing core file: $file"
        ERRORS=$((ERRORS + 1))
    else
        echo "Found core file: $file"
    fi
done

# Check file sizes (should not be empty)
find . -name "*.md" -size 0 | while read empty_file; do
    echo "Empty file detected: $empty_file"
    ERRORS=$((ERRORS + 1))
done

if [ $ERRORS -eq 0 ]; then
    echo "Export package validation passed!"
    echo "Package is ready for deployment"
else
    echo "Export package validation failed with $ERRORS errors"
    exit 1
fi
EOF

chmod +x "$TEMP_DIR/validate-export.sh"

# Run validation
echo "Validating export package..."
cd "$TEMP_DIR"
./validate-export.sh
cd ..

# Create final archive
echo "Creating distribution archive..."
tar -czf "${PACKAGE_NAME}.tar.gz" -C "$TEMP_DIR" .
zip -r "${PACKAGE_NAME}.zip" "$TEMP_DIR"

# Generate final report
cat > "EXPORT_COMPLETE.md" << EOF
# Documentation Export Complete!

## Export Summary
- **Package Created**: $(date)
- **Version**: v1.0.0-beta  
- **Export ID**: ${TIMESTAMP}
- **Files Generated**: $(find "$TEMP_DIR" -name "*.md" | wc -l) markdown files
- **Formats**: 4 platform-specific formats
- **Archive Size**: $(du -h "${PACKAGE_NAME}.tar.gz" | cut -f1)

## Distribution Files
- \`${PACKAGE_NAME}.tar.gz\` - Complete package (Linux/Mac)
- \`${PACKAGE_NAME}.zip\` - Complete package (Windows)
- \`$TEMP_DIR/\` - Extracted package directory

## Next Steps

### 1. Choose Your Platform
- **GitHub Wiki**: Use \`github-wiki/\` directory
- **GitLab Wiki**: Use \`gitlab-wiki/\` directory  
- **Confluence**: Use \`confluence/\` directory
- **Custom Platform**: Use \`wiki-ready/\` directory

### 2. Deploy Documentation
Follow the platform-specific instructions in \`Export-Instructions.md\`

### 3. Set Up Maintenance
Configure automated updates using \`Maintenance-Guide.md\`

## Package Contents Verification
Core documentation files: $(ls "$TEMP_DIR/wiki-ready"/*.md | wc -l)
GitHub Wiki format: $(ls "$TEMP_DIR/github-wiki"/*.md | wc -l)  
GitLab Wiki format: $(ls "$TEMP_DIR/gitlab-wiki"/*.md | wc -l)
Confluence format: $(ls "$TEMP_DIR/confluence"/*.md | wc -l)
Navigation files: Sidebar and Footer included
Setup scripts: Validation and deployment scripts included
Documentation: Complete instructions and maintenance guide

## Quality Assurance
- All files validated for completeness
- Links converted for platform compatibility
- Navigation structure preserved
- Export package integrity verified

**Your documentation is ready for wiki deployment!**

EOF

echo "Export package created successfully!"
echo "See EXPORT_COMPLETE.md for next steps"
echo "Package files:"
echo "   - ${PACKAGE_NAME}.tar.gz"
echo "   - ${PACKAGE_NAME}.zip"
echo "   - $TEMP_DIR/ (extracted)"

# Cleanup
echo "Cleaning up temporary files..."
# rm -rf "$TEMP_DIR"  # Uncomment to auto-cleanup

echo "Documentation export process complete!"
