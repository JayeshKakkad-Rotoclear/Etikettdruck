#!/usr/bin/env python3
"""
Link Validation Script for Documentation
Validates internal links in Markdown files to ensure they point to existing files.
"""
import os
import re
import sys
from pathlib import Path
from urllib.parse import unquote


def validate_links(file_path: str) -> list[str]:
    """Validate internal links in a Markdown file."""
    errors = []
    file_path = Path(file_path)
    
    if not file_path.exists():
        return [f"File does not exist: {file_path}"]
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        return [f"Error reading file {file_path}: {e}"]
    
    # Find all markdown links [text](url)
    link_pattern = r'\[([^\]]*)\]\(([^)]+)\)'
    links = re.findall(link_pattern, content)
    
    base_dir = file_path.parent
    docs_root = file_path.parents[0]  # Assume we're in docs/ directory
    
    for link_text, link_url in links:
        # Skip external links
        if link_url.startswith(('http://', 'https://', 'mailto:', '#')):
            continue
        
        # Skip anchors within the same file
        if link_url.startswith('#'):
            continue
        
        # Handle relative links
        if link_url.startswith('./'):
            # Relative to current directory
            target_path = base_dir / link_url[2:]
        elif link_url.startswith('../'):
            # Relative to parent directory
            target_path = base_dir / link_url
        else:
            # Assume relative to docs root
            target_path = docs_root / link_url
        
        # Handle URL encoding
        target_path = Path(unquote(str(target_path)))
        
        # Resolve the path
        try:
            target_path = target_path.resolve()
        except Exception:
            errors.append(f"Invalid path in {file_path}: {link_url}")
            continue
        
        # Check if target exists
        if not target_path.exists():
            errors.append(f"Broken link in {file_path}: '{link_text}' -> {link_url} (resolved to {target_path})")
    
    return errors


def main():
    """Main function to validate links in provided files."""
    if len(sys.argv) < 2:
        print("Usage: python validate-links.py <markdown_file> [<markdown_file> ...]")
        sys.exit(1)
    
    all_errors = []
    
    for file_path in sys.argv[1:]:
        errors = validate_links(file_path)
        all_errors.extend(errors)
    
    if all_errors:
        print("Link validation errors found:")
        for error in all_errors:
            print(f" {error}")
        sys.exit(1)
    else:
        print("All links validated successfully")
        sys.exit(0)


if __name__ == '__main__':
    main()
