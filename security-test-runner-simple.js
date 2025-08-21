#!/usr/bin/env node

/**
 * Security Test Runner - Works with Node.js ES Modules
 * Run with: node security-test-runner-simple.js
 */

console.log('Security Test Suite Starting...\n');

// Import built-in modules
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runSecurityTests() {
  try {
    console.log('Running Standalone Security Tests...\n');
    
    // Run the CommonJS test file
    const testFile = path.join(__dirname, 'tests', 'security-simple.test.cjs');
    
    const child = spawn('node', [testFile], {
      stdio: 'inherit',
      shell: true
    });
    
    child.on('close', (code) => {
      console.log('\nTest Results Summary');
      console.log('========================');
      
      if (code === 0) {
        console.log('All automated security tests PASSED!');
        console.log('');
        console.log('What was tested:');
        console.log('   • Password validation (weak/strong passwords)');
        console.log('   • Input sanitization (XSS prevention)');
        console.log('   • SQL injection detection');
        console.log('   • Email validation');
        console.log('   • Security audit logging');
        console.log('   • Required field validation');
        console.log('');
      } else {
        console.log('Some tests failed. Check the output above.');
        console.log('');
      }
      
    });
    
    child.on('error', (error) => {
      console.log(`Error running standalone tests: ${error.message}`);
    });
    
  } catch (error) {
    console.log(`Error: ${error.message}`);
  }
}


// Run the tests
runSecurityTests();
