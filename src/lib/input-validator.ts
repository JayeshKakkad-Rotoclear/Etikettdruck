/* cSpell:disable */
import { SecurityAuditLogger } from './security.js';

// cSpell:ignore validator sanitizer xss dompurify

/**
 * Enhanced input validation and sanitization utilities
 */
export class InputValidator {
  // Common validation patterns
  private static patterns = {
    email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    username: /^[a-zA-Z0-9_-]{3,30}$/,
    password: /^.{8,128}$/,
    serialNumber: /^[A-Za-z0-9-]{1,50}$/,
    articleNumber: /^[A-Za-z0-9-_\.]{1,50}$/,
    ipAddress: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
    macAddress: /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/,
    phoneNumber: /^\+?[1-9]\d{1,14}$/
  };

  // Dangerous patterns that should be rejected
  private static dangerousPatterns = [
    // Script injection
    /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
    /<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi,
    /<object[\s\S]*?>[\s\S]*?<\/object>/gi,
    /<embed[\s\S]*?>/gi,
    
    // Event handlers
    /on\w+\s*=/gi,
    
    // Javascript protocols
    /javascript:/gi,
    /vbscript:/gi,
    /data:text\/html/gi,
    
    // SQL injection patterns
    /(\%27)|(\')|(\')|(\%3D)|(=)|(\%3B)|(;)|(\%20)|(( or | OR )|( and | AND ))/gi,
    /(union|select|insert|update|delete|drop|create|alter|exec|execute)/gi,
    
    // Command injection
    /(\||\&|\;|\$|\{|\}|`|>|<)/g,
    
    // Path traversal
    /\.\.[\/\\]/g,
    
    // LDAP injection
    /(\(|\)|\*|\||\&|!|=)/g
  ];

  /**
   * Validate email format
   */
  static validateEmail(email: string): { isValid: boolean; error?: string } {
    if (!email || typeof email !== 'string') {
      return { isValid: false, error: 'E-Mail-Adresse ist erforderlich' };
    }

    email = email.trim();
    
    if (email.length > 254) {
      return { isValid: false, error: 'E-Mail-Adresse ist zu lang' };
    }

    if (!this.patterns.email.test(email)) {
      return { isValid: false, error: 'Ungültiges E-Mail-Format' };
    }

    return { isValid: true };
  }

  /**
   * Validate username format
   */
  static validateUsername(username: string): { isValid: boolean; error?: string } {
    if (!username || typeof username !== 'string') {
      return { isValid: false, error: 'Benutzername ist erforderlich' };
    }

    username = username.trim();

    if (username.length < 3) {
      return { isValid: false, error: 'Benutzername muss mindestens 3 Zeichen lang sein' };
    }

    if (username.length > 30) {
      return { isValid: false, error: 'Benutzername darf maximal 30 Zeichen lang sein' };
    }

    if (!this.patterns.username.test(username)) {
      return { isValid: false, error: 'Benutzername darf nur Buchstaben, Zahlen, Unterstriche und Bindestriche enthalten' };
    }

    // Check for reserved usernames (excluding admin since we have an admin user)
    const reservedNames = [
      'root', 'administrator', 'system', 'guest',
      'api', 'www', 'mail', 'ftp', 'null', 'undefined'
    ];

    if (reservedNames.includes(username.toLowerCase())) {
      return { isValid: false, error: 'Dieser Benutzername ist reserviert' };
    }

    return { isValid: true };
  }

  /**
   * Validate and sanitize general text input
   */
  static validateText(
    text: string, 
    options: {
      required?: boolean;
      minLength?: number;
      maxLength?: number;
      allowHtml?: boolean;
      skipDangerousPatterns?: boolean;
      fieldName?: string;
    } = {}
  ): { isValid: boolean; sanitized?: string; error?: string } {
    const {
      required = true,
      minLength = 0,
      maxLength = 1000,
      allowHtml = false,
      skipDangerousPatterns = false,
      fieldName = 'Eingabe'
    } = options;

    if (!text || typeof text !== 'string') {
      if (required) {
        return { isValid: false, error: `${fieldName} ist erforderlich` };
      }
      return { isValid: true, sanitized: '' };
    }

    let sanitized = text.trim();

    // Length validation
    if (sanitized.length < minLength) {
      return { 
        isValid: false, 
        error: `${fieldName} muss mindestens ${minLength} Zeichen lang sein` 
      };
    }

    if (sanitized.length > maxLength) {
      return { 
        isValid: false, 
        error: `${fieldName} darf maximal ${maxLength} Zeichen lang sein` 
      };
    }

    // Security validation
    if (!allowHtml && !skipDangerousPatterns) {
      // Check for dangerous patterns
      for (const pattern of this.dangerousPatterns) {
        if (pattern.test(sanitized)) {
          SecurityAuditLogger.logEvent({
            type: 'SUSPICIOUS_ACTIVITY',
            ipAddress: 'unknown',
            userAgent: 'unknown',
            risk: 'HIGH',
            details: {
              reason: 'Dangerous pattern detected in input',
              field: fieldName,
              pattern: pattern.source,
              input: sanitized.substring(0, 100) // Log only first 100 chars
            }
          });
          
          return { 
            isValid: false, 
            error: 'Eingabe enthält nicht erlaubte Zeichen oder Muster' 
          };
        }
      }

      // Basic HTML sanitization
      sanitized = this.sanitizeHtml(sanitized);
    }

    return { isValid: true, sanitized };
  }

  /**
   * Validate serial number format
   */
  static validateSerialNumber(serialNumber: string): { isValid: boolean; error?: string } {
    if (!serialNumber || typeof serialNumber !== 'string') {
      return { isValid: false, error: 'Seriennummer ist erforderlich' };
    }

    const sanitized = serialNumber.trim().toUpperCase();

    if (!this.patterns.serialNumber.test(sanitized)) {
      return { 
        isValid: false, 
        error: 'Ungültiges Seriennummernformat. Nur Buchstaben, Zahlen und Bindestriche erlaubt' 
      };
    }

    return { isValid: true };
  }

  /**
   * Validate article number format
   */
  static validateArticleNumber(articleNumber: string): { isValid: boolean; error?: string } {
    if (!articleNumber || typeof articleNumber !== 'string') {
      return { isValid: false, error: 'Artikelnummer ist erforderlich' };
    }

    const sanitized = articleNumber.trim();

    if (!this.patterns.articleNumber.test(sanitized)) {
      return { 
        isValid: false, 
        error: 'Ungültiges Artikelnummernformat' 
      };
    }

    return { isValid: true };
  }

  /**
   * Validate IP address format
   */
  static validateIpAddress(ip: string): { isValid: boolean; error?: string } {
    if (!ip || typeof ip !== 'string') {
      return { isValid: false, error: 'IP-Adresse ist erforderlich' };
    }

    if (!this.patterns.ipAddress.test(ip.trim())) {
      return { isValid: false, error: 'Ungültiges IP-Adressenformat' };
    }

    return { isValid: true };
  }

  /**
   * Validate MAC address format
   */
  static validateMacAddress(mac: string): { isValid: boolean; error?: string } {
    if (!mac || typeof mac !== 'string') {
      return { isValid: false, error: 'MAC-Adresse ist erforderlich' };
    }

    if (!this.patterns.macAddress.test(mac.trim())) {
      return { isValid: false, error: 'Ungültiges MAC-Adressenformat' };
    }

    return { isValid: true };
  }

  /**
   * Validate numeric input
   */
  static validateNumber(
    value: any,
    options: {
      required?: boolean;
      min?: number;
      max?: number;
      integer?: boolean;
      fieldName?: string;
    } = {}
  ): { isValid: boolean; number?: number; error?: string } {
    const {
      required = true,
      min,
      max,
      integer = false,
      fieldName = 'Zahl'
    } = options;

    if (value === null || value === undefined || value === '') {
      if (required) {
        return { isValid: false, error: `${fieldName} ist erforderlich` };
      }
      return { isValid: true, number: undefined };
    }

    const num = Number(value);

    if (isNaN(num)) {
      return { isValid: false, error: `${fieldName} muss eine gültige Zahl sein` };
    }

    if (integer && !Number.isInteger(num)) {
      return { isValid: false, error: `${fieldName} muss eine ganze Zahl sein` };
    }

    if (min !== undefined && num < min) {
      return { isValid: false, error: `${fieldName} muss mindestens ${min} sein` };
    }

    if (max !== undefined && num > max) {
      return { isValid: false, error: `${fieldName} darf maximal ${max} sein` };
    }

    return { isValid: true, number: num };
  }

  /**
   * Validate boolean input
   */
  static validateBoolean(
    value: any,
    options: {
      required?: boolean;
      fieldName?: string;
    } = {}
  ): { isValid: boolean; boolean?: boolean; error?: string } {
    const { required = false, fieldName = 'Wert' } = options;

    if (value === null || value === undefined) {
      if (required) {
        return { isValid: false, error: `${fieldName} ist erforderlich` };
      }
      return { isValid: true, boolean: undefined };
    }

    if (typeof value === 'boolean') {
      return { isValid: true, boolean: value };
    }

    if (typeof value === 'string') {
      const lower = value.toLowerCase();
      if (lower === 'true' || lower === '1' || lower === 'yes' || lower === 'ja') {
        return { isValid: true, boolean: true };
      }
      if (lower === 'false' || lower === '0' || lower === 'no' || lower === 'nein') {
        return { isValid: true, boolean: false };
      }
    }

    return { isValid: false, error: `${fieldName} muss true oder false sein` };
  }

  /**
   * Validate date input
   */
  static validateDate(
    value: any,
    options: {
      required?: boolean;
      minDate?: Date;
      maxDate?: Date;
      fieldName?: string;
    } = {}
  ): { isValid: boolean; date?: Date; error?: string } {
    const { required = true, minDate, maxDate, fieldName = 'Datum' } = options;

    if (!value) {
      if (required) {
        return { isValid: false, error: `${fieldName} ist erforderlich` };
      }
      return { isValid: true, date: undefined };
    }

    let date: Date;

    if (value instanceof Date) {
      date = value;
    } else if (typeof value === 'string' || typeof value === 'number') {
      date = new Date(value);
    } else {
      return { isValid: false, error: `${fieldName} hat ein ungültiges Format` };
    }

    if (isNaN(date.getTime())) {
      return { isValid: false, error: `${fieldName} ist ungültig` };
    }

    if (minDate && date < minDate) {
      return { 
        isValid: false, 
        error: `${fieldName} darf nicht vor ${minDate.toLocaleDateString('de-DE')} liegen` 
      };
    }

    if (maxDate && date > maxDate) {
      return { 
        isValid: false, 
        error: `${fieldName} darf nicht nach ${maxDate.toLocaleDateString('de-DE')} liegen` 
      };
    }

    return { isValid: true, date };
  }

  /**
   * Basic HTML sanitization (remove dangerous tags and attributes)
   */
  private static sanitizeHtml(html: string): string {
    // Remove script tags and their content
    html = html.replace(/<script[\s\S]*?<\/script>/gi, '');
    
    // Remove dangerous tags
    const dangerousTags = ['script', 'iframe', 'object', 'embed', 'form', 'input'];
    for (const tag of dangerousTags) {
      const regex = new RegExp(`<${tag}[^>]*>`, 'gi');
      html = html.replace(regex, '');
      html = html.replace(new RegExp(`</${tag}>`, 'gi'), '');
    }
    
    // Remove event handlers
    html = html.replace(/on\w+\s*=\s*"[^"]*"/gi, '');
    html = html.replace(/on\w+\s*=\s*'[^']*'/gi, '');
    
    // Remove javascript: and vbscript: protocols
    html = html.replace(/javascript:/gi, '');
    html = html.replace(/vbscript:/gi, '');
    
    return html;
  }

  /**
   * Validate an object against a schema
   */
  static validateObject(
    obj: any,
    schema: Record<string, {
      type: 'string' | 'number' | 'boolean' | 'date' | 'email' | 'username';
      required?: boolean;
      minLength?: number;
      maxLength?: number;
      min?: number;
      max?: number;
      pattern?: RegExp;
      skipDangerousPatterns?: boolean;
      custom?: (value: any) => { isValid: boolean; error?: string };
    }>
  ): { isValid: boolean; errors: Record<string, string>; sanitized?: Record<string, any> } {
    const errors: Record<string, string> = {};
    const sanitized: Record<string, any> = {};

    for (const [key, rules] of Object.entries(schema)) {
      const value = obj[key];
      
      try {
        switch (rules.type) {
          case 'string':
            const textResult = this.validateText(value, {
              required: rules.required,
              minLength: rules.minLength,
              maxLength: rules.maxLength,
              skipDangerousPatterns: rules.skipDangerousPatterns,
              fieldName: key
            });
            if (!textResult.isValid) {
              errors[key] = textResult.error!;
            } else {
              sanitized[key] = textResult.sanitized;
            }
            break;

          case 'email':
            const emailResult = this.validateEmail(value);
            if (!emailResult.isValid) {
              errors[key] = emailResult.error!;
            } else {
              sanitized[key] = value?.trim();
            }
            break;

          case 'username':
            const usernameResult = this.validateUsername(value);
            if (!usernameResult.isValid) {
              errors[key] = usernameResult.error!;
            } else {
              sanitized[key] = value?.trim();
            }
            break;

          case 'number':
            const numberResult = this.validateNumber(value, {
              required: rules.required,
              min: rules.min,
              max: rules.max,
              fieldName: key
            });
            if (!numberResult.isValid) {
              errors[key] = numberResult.error!;
            } else {
              sanitized[key] = numberResult.number;
            }
            break;

          case 'boolean':
            const booleanResult = this.validateBoolean(value, {
              required: rules.required,
              fieldName: key
            });
            if (!booleanResult.isValid) {
              errors[key] = booleanResult.error!;
            } else {
              sanitized[key] = booleanResult.boolean;
            }
            break;

          case 'date':
            const dateResult = this.validateDate(value, {
              required: rules.required,
              fieldName: key
            });
            if (!dateResult.isValid) {
              errors[key] = dateResult.error!;
            } else {
              sanitized[key] = dateResult.date;
            }
            break;
        }

        // Custom validation
        if (rules.custom && value !== undefined && value !== null) {
          const customResult = rules.custom(value);
          if (!customResult.isValid) {
            errors[key] = customResult.error!;
          }
        }

        // Pattern validation
        if (rules.pattern && value && typeof value === 'string') {
          if (!rules.pattern.test(value)) {
            errors[key] = `${key} hat ein ungültiges Format`;
          }
        }

      } catch (error) {
        errors[key] = `Validierungsfehler für ${key}`;
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      sanitized: Object.keys(errors).length === 0 ? sanitized : undefined
    };
  }
}

export default InputValidator;
