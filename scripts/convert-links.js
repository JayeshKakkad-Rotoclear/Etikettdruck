#!/usr/bin/env node
/**
 * Link Format Converter for Documentation Export
 * Converts internal links between different wiki/documentation formats
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

// Link format patterns
const LINK_FORMATS = {
  'github-wiki': {
    pattern: /\[([^\]]+)\]\(([^)]+\.md)\)/g,
    replacement: (text, url) => {
      // Remove .md extension and convert to wiki format
      const wikiPage = path.basename(url, '.md');
      return `[${text}](${wikiPage})`;
    }
  },
  'gitlab-wiki': {
    pattern: /\[([^\]]+)\]\(([^)]+\.md)\)/g,
    replacement: (text, url) => {
      // GitLab wiki uses [[Page Name]] format
      const wikiPage = path.basename(url, '.md').replace(/-/g, ' ');
      return `[[${wikiPage}|${text}]]`;
    }
  },
  'confluence': {
    pattern: /\[([^\]]+)\]\(([^)]+\.md)\)/g,
    replacement: (text, url) => {
      // Confluence uses [text|page] format
      const wikiPage = path.basename(url, '.md').replace(/-/g, ' ');
      return `[${text}|${wikiPage}]`;
    }
  },
  'relative-md': {
    pattern: /\[([^\]]+)\]\(([^)]+)\)/g,
    replacement: (text, url) => {
      // Convert to relative markdown links
      if (!url.startsWith('http') && !url.startsWith('#')) {
        return `[${text}](./${url})`;
      }
      return `[${text}](${url})`;
    }
  }
};

function convertLinks(content, format) {
  const formatter = LINK_FORMATS[format];
  if (!formatter) {
    throw new Error(`Unknown format: ${format}. Available: ${Object.keys(LINK_FORMATS).join(', ')}`);
  }

  return content.replace(formatter.pattern, (match, text, url) => {
    return formatter.replacement(text, url);
  });
}

function processFile(filePath, format, outputDir) {
  const content = fs.readFileSync(filePath, 'utf8');
  const convertedContent = convertLinks(content, format);
  
  const fileName = path.basename(filePath);
  const outputPath = path.join(outputDir, fileName);
  
  fs.writeFileSync(outputPath, convertedContent);
  console.log(`Converted: ${fileName}`);
}

function main() {
  const args = process.argv.slice(2);
  const formatIndex = args.indexOf('--format');
  const outputIndex = args.indexOf('--output');
  const inputIndex = args.indexOf('--input');

  if (formatIndex === -1) {
    console.error('Usage: node convert-links.js --format <format> [--input <dir>] [--output <dir>]');
    console.error('Formats:', Object.keys(LINK_FORMATS).join(', '));
    process.exit(1);
  }

  const format = args[formatIndex + 1];
  const inputDir = inputIndex !== -1 ? args[inputIndex + 1] : 'docs/wiki-export';
  const outputDir = outputIndex !== -1 ? args[outputIndex + 1] : `docs/wiki-export-${format}`;

  if (!LINK_FORMATS[format]) {
    console.error(`Unknown format: ${format}`);
    console.error('Available formats:', Object.keys(LINK_FORMATS).join(', '));
    process.exit(1);
  }

  // Create output directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Find all markdown files
  const markdownFiles = glob.sync(`${inputDir}/*.md`);
  
  if (markdownFiles.length === 0) {
    console.error(`No markdown files found in ${inputDir}`);
    process.exit(1);
  }

  console.log(`Converting ${markdownFiles.length} files to ${format} format...`);
  
  markdownFiles.forEach(file => {
    processFile(file, format, outputDir);
  });

  console.log(`Conversion complete! Files saved to: ${outputDir}`);
  console.log(`Format: ${format}`);
  console.log(`Files converted: ${markdownFiles.length}`);
}

if (require.main === module) {
  main();
}

module.exports = { convertLinks, LINK_FORMATS };
