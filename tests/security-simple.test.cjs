/**
 * Simple Security Test Suite - Standalone JavaScript Version
 * This file can be run directly with Node.js without TypeScript or SvelteKit
 */

// Simple Password Validator
class SimplePasswordValidator {
  static validatePassword(password, username) {
    const errors = [];
    let strength = 0;

    if (!password) {
      return { isValid: false, errors: ['Password is required'], strength: 0 };
    }

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    } else {
      strength += 1;
    }

    if (password.length > 128) {
      errors.push('Password must be less than 128 characters');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    } else {
      strength += 1;
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    } else {
      strength += 1;
    }

    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    } else {
      strength += 1;
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    } else {
      strength += 1;
    }

    const commonPasswords = ['password', '123456', 'password123', 'admin', 'qwerty'];
    if (commonPasswords.includes(password.toLowerCase())) {
      errors.push('Password is too common');
    }

    if (username && password.toLowerCase().includes(username.toLowerCase())) {
      errors.push('Password cannot contain username');
    }

    const isValid = errors.length === 0;
    return { isValid, errors, strength };
  }
}

// Simple Input Validator
class SimpleInputValidator {
  static validateEmail(email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailPattern.test(email);
    return { isValid, value: email };
  }

  static validateText(text, options = {}) {
    const errors = [];
    const { required, maxLength, fieldName = 'Field' } = options;

    if (required && (!text || text.trim().length === 0)) {
      errors.push(`${fieldName} is required`);
      return { isValid: false, errors, sanitized: '' };
    }

    if (!text) {
      return { isValid: true, errors: [], sanitized: '' };
    }

    if (maxLength && text.length > maxLength) {
      errors.push(`${fieldName} must be ${maxLength} characters or less`);
    }

    // Basic XSS prevention - remove script tags and dangerous attributes
    let sanitized = text
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .replace(/<iframe/gi, '&lt;iframe')
      .replace(/<object/gi, '&lt;object')
      .replace(/<embed/gi, '&lt;embed');

    // Check for dangerous patterns
    const dangerousPatterns = [
      /\bselect\s+.*\bfrom\b/i,
      /\bunion\s+select\b/i,
      /\binsert\s+into\b/i,
      /\bdelete\s+from\b/i,
      /\bdrop\s+table\b/i,
      /<script/i,
      /javascript:/i,
      /vbscript:/i,
      /data:text\/html/i
    ];

    const hasDangerousContent = dangerousPatterns.some(pattern => pattern.test(text));
    if (hasDangerousContent) {
      errors.push(`${fieldName} contains potentially dangerous content`);
    }

    const isValid = errors.length === 0;
    return { isValid, errors, sanitized };
  }
}

// Simple Security Audit Logger
class SimpleSecurityAuditLogger {
  static logs = [];

  static logEvent(event) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      type: event.type,
      userId: event.userId,
      username: event.username,
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
      risk: event.risk || 'MEDIUM',
      details: event.details || {}
    };

    this.logs.push(logEntry);
    console.log(`[SECURITY AUDIT] ${logEntry.timestamp} - ${logEntry.type} - ${logEntry.username} - ${logEntry.risk}`);
    
    return logEntry;
  }

  static getLogs() {
    return this.logs;
  }

  static getLogsByType(type) {
    return this.logs.filter(log => log.type === type);
  }
}

// Test utilities
class SecurityTestUtils {
  static runAllTests() {
    console.log('Running Standalone Security Tests...\n');

    this.testPasswordValidation();
    this.testInputValidation();
    this.testSecurityAuditLogger();

    console.log('\nAll standalone security tests completed!');
  }

  static testPasswordValidation() {
    console.log('Testing Password Validation...');

    // Test weak password
    const weakResult = SimplePasswordValidator.validatePassword('weak', 'testuser');
    const weakPass = !weakResult.isValid;
    console.log(`   Weak password rejection: ${weakPass ? 'PASS' : 'FAIL'}`);
    if (!weakResult.isValid) {
      console.log(`   Errors: ${weakResult.errors.join(', ')}`);
    }

    // Test strong password
    const strongResult = SimplePasswordValidator.validatePassword('MyStr0ng!P@ssw0rd2024', 'testuser');
    const strongPass = strongResult.isValid && strongResult.strength >= 4;
    console.log(`   Strong password acceptance: ${strongPass ? 'PASS' : 'FAIL'}`);
    console.log(`   Strength score: ${strongResult.strength}/5`);

    // Test password with username
    const usernameResult = SimplePasswordValidator.validatePassword('testuser123', 'testuser');
    const usernamePass = !usernameResult.isValid;
    console.log(`   Username in password rejection: ${usernamePass ? 'PASS' : 'FAIL'}`);

    // Test common password
    const commonResult = SimplePasswordValidator.validatePassword('password123', 'user');
    const commonPass = !commonResult.isValid;
    console.log(`   Common password rejection: ${commonPass ? 'PASS' : 'FAIL'}`);

    console.log('');
  }

  static testInputValidation() {
    console.log('Testing Input Validation...');

    // Test email validation
    const validEmail = SimpleInputValidator.validateEmail('test@example.com');
    const invalidEmail = SimpleInputValidator.validateEmail('invalid-email');
    const emailPass = validEmail.isValid && !invalidEmail.isValid;
    console.log(`   Email validation: ${emailPass ? 'PASS' : 'FAIL'}`);

    // Test XSS prevention
    const xssInput = '<script>alert("XSS")</script>Hello World';
    const xssResult = SimpleInputValidator.validateText(xssInput, { maxLength: 100, fieldName: 'Test' });
    const xssPass = !xssResult.sanitized.includes('<script>');
    console.log(`   XSS prevention: ${xssPass ? 'PASS' : 'FAIL'}`);
    console.log(`   Sanitized: "${xssResult.sanitized}"`);

    // Test SQL injection patterns
    const sqlInput = "'; DROP TABLE users; --";
    const sqlResult = SimpleInputValidator.validateText(sqlInput, { fieldName: 'SQL Test' });
    const sqlPass = !sqlResult.isValid;
    console.log(`   SQL injection detection: ${sqlPass ? 'PASS' : 'FAIL'}`);

    // Test required field validation
    const emptyResult = SimpleInputValidator.validateText('', { required: true, fieldName: 'Required Field' });
    const requiredPass = !emptyResult.isValid;
    console.log(`   Required field validation: ${requiredPass ? 'PASS' : 'FAIL'}`);

    console.log('');
  }

  static testSecurityAuditLogger() {
    console.log('Testing Security Audit Logger...');

    // Test logging functionality
    const logsBefore = SimpleSecurityAuditLogger.getLogs().length;
    
    SimpleSecurityAuditLogger.logEvent({
      type: 'LOGIN_SUCCESS',
      userId: 1,
      username: 'testuser',
      ipAddress: '127.0.0.1',
      userAgent: 'test-agent',
      risk: 'LOW',
      details: { action: 'automated_test' }
    });

    SimpleSecurityAuditLogger.logEvent({
      type: 'LOGIN_FAILED',
      userId: null,
      username: 'baduser',
      ipAddress: '192.168.1.100',
      userAgent: 'suspicious-agent',
      risk: 'HIGH',
      details: { attempts: 5 }
    });

    const logsAfter = SimpleSecurityAuditLogger.getLogs().length;
    const loggingPass = logsAfter === logsBefore + 2;
    console.log(`   Event logging: ${loggingPass ? 'PASS' : 'FAIL'}`);

    // Test log filtering
    const loginSuccessLogs = SimpleSecurityAuditLogger.getLogsByType('LOGIN_SUCCESS');
    const filterPass = loginSuccessLogs.length > 0;
    console.log(`   Log filtering: ${filterPass ? 'PASS' : 'FAIL'}`);

    console.log('');
  }
}

// Export for use in other modules
module.exports = {
  SimplePasswordValidator,
  SimpleInputValidator,
  SimpleSecurityAuditLogger,
  SecurityTestUtils
};

// If run directly, execute tests
if (require.main === module) {
  SecurityTestUtils.runAllTests();
}
