#!/bin/bash
# Wiki Setup Automation Script
# Sets up GitHub Wiki from documentation export

set -e

# Configuration
REPO_NAME="Etikettdruck"
REPO_OWNER="JayeshKakkad-Rotoclear"
WIKI_URL="https://github.com/${REPO_OWNER}/${REPO_NAME}.wiki.git"
DOCS_SOURCE="docs/wiki-export"
TEMP_DIR="temp-wiki-setup"

echo "Setting up GitHub Wiki for ${REPO_OWNER}/${REPO_NAME}"

# Check prerequisites
if ! command -v git &> /dev/null; then
    echo "Git is required but not installed"
    exit 1
fi

if [ ! -d "$DOCS_SOURCE" ]; then
    echo "Documentation export directory not found: $DOCS_SOURCE"
    exit 1
fi

# Clone wiki repository
echo "Cloning wiki repository..."
if [ -d "$TEMP_DIR" ]; then
    rm -rf "$TEMP_DIR"
fi

git clone "$WIKI_URL" "$TEMP_DIR" || {
    echo "Failed to clone wiki. Make sure wiki is enabled in repository settings."
    exit 1
}

cd "$TEMP_DIR"

# Copy documentation files
echo "Copying documentation files..."
cp ../$DOCS_SOURCE/*.md .

# Remove README.md to avoid conflicts
if [ -f "README.md" ]; then
    rm README.md
fi

# Rename Home.md if it doesn't exist
if [ -f "Home.md" ] && [ ! -f "Home.md" ]; then
    mv docs-home.md Home.md
fi

# Add all files
git add .

# Check if there are changes to commit
if git diff --staged --quiet; then
    echo "No changes to commit - wiki is already up to date"
else
    # Commit changes
    echo "Committing changes..."
    git config user.name "Documentation Bot"
    git config user.email "docs@rotoclear.com"
    git commit -m "docs: update wiki from documentation export ($(date '+%Y-%m-%d %H:%M'))"
    
    # Push to wiki
    echo "Pushing to wiki..."
    git push origin master

    echo "Wiki setup complete!"
    echo "View your wiki at: https://github.com/${REPO_OWNER}/${REPO_NAME}/wiki"
fi

# Cleanup
cd ..
rm -rf "$TEMP_DIR"

echo "Wiki setup completed successfully!"
