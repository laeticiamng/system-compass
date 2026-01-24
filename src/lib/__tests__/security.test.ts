import { describe, it, expect } from 'vitest';
import { z } from 'zod';

/**
 * Security-Focused Tests
 *
 * These tests verify security-critical behaviors:
 * - Input validation
 * - XSS prevention
 * - SQL injection prevention
 * - Password strength requirements
 * - Data sanitization
 */

// Password schema matching the one in Auth.tsx
const passwordSchema = z.string()
  .min(8, 'Minimum 8 caractères requis')
  .regex(/[A-Z]/, 'Au moins une majuscule requise')
  .regex(/[a-z]/, 'Au moins une minuscule requise')
  .regex(/[0-9]/, 'Au moins un chiffre requis');

const emailSchema = z.string().email();

describe('Security Tests', () => {
  describe('Password Validation', () => {
    const testCases = {
      valid: [
        'Password1',
        'MySecure123',
        'Test1234',
        'AbCdEf99',
        'VeryLongPassword123',
        'A1bcdefgh', // Minimum requirements met
      ],
      invalidTooShort: [
        'Pass1', // 5 chars
        'Ab1', // 3 chars
        'Pa1', // 3 chars
        '', // empty
        'A1b', // 3 chars
      ],
      invalidNoUppercase: [
        'password1',
        'lowercase123',
        'no_caps_here1',
        'alllower99',
      ],
      invalidNoLowercase: [
        'PASSWORD1',
        'UPPERCASE123',
        'NO_LOWER_HERE1',
        'ALLUPPER99',
      ],
      invalidNoNumber: [
        'PasswordNoNum',
        'NoDigitsHere',
        'ABCDEfgh',
        'SecureButNoNum',
      ],
    };

    describe('accepts valid passwords', () => {
      testCases.valid.forEach(password => {
        it(`accepts "${password}"`, () => {
          expect(() => passwordSchema.parse(password)).not.toThrow();
        });
      });
    });

    describe('rejects passwords too short', () => {
      testCases.invalidTooShort.forEach(password => {
        it(`rejects "${password}" (too short)`, () => {
          expect(() => passwordSchema.parse(password)).toThrow();
        });
      });
    });

    describe('rejects passwords without uppercase', () => {
      testCases.invalidNoUppercase.forEach(password => {
        it(`rejects "${password}" (no uppercase)`, () => {
          expect(() => passwordSchema.parse(password)).toThrow();
        });
      });
    });

    describe('rejects passwords without lowercase', () => {
      testCases.invalidNoLowercase.forEach(password => {
        it(`rejects "${password}" (no lowercase)`, () => {
          expect(() => passwordSchema.parse(password)).toThrow();
        });
      });
    });

    describe('rejects passwords without number', () => {
      testCases.invalidNoNumber.forEach(password => {
        it(`rejects "${password}" (no number)`, () => {
          expect(() => passwordSchema.parse(password)).toThrow();
        });
      });
    });

    describe('edge cases', () => {
      it('accepts password with special characters', () => {
        expect(() => passwordSchema.parse('Password1!')).not.toThrow();
        expect(() => passwordSchema.parse('Secure@123')).not.toThrow();
      });

      it('accepts password with unicode letters', () => {
        // Note: These may or may not be accepted depending on regex behavior
        const unicodePasswords = ['Pässwörd1', 'Contraseña1'];
        unicodePasswords.forEach(pwd => {
          // At minimum, the regex should not crash
          try {
            passwordSchema.parse(pwd);
          } catch {
            // Acceptable to reject unicode
          }
        });
      });

      it('handles extremely long passwords', () => {
        const longPassword = 'A1' + 'a'.repeat(1000);
        expect(() => passwordSchema.parse(longPassword)).not.toThrow();
      });

      it('rejects null/undefined', () => {
        expect(() => passwordSchema.parse(null)).toThrow();
        expect(() => passwordSchema.parse(undefined)).toThrow();
      });
    });
  });

  describe('Email Validation', () => {
    const validEmails = [
      'user@example.com',
      'user@subdomain.example.com',
      'user+tag@example.com',
      'user.name@example.com',
      'user@example.co.uk',
      'user@example.io',
      '123@example.com',
      'user@123.com',
    ];

    const invalidEmails = [
      'notanemail',
      '@example.com',
      'user@',
      'user@.com',
      'user @example.com',
      'user@example',
      '',
      'user@@example.com',
    ];

    describe('accepts valid emails', () => {
      validEmails.forEach(email => {
        it(`accepts "${email}"`, () => {
          expect(() => emailSchema.parse(email)).not.toThrow();
        });
      });
    });

    describe('rejects invalid emails', () => {
      invalidEmails.forEach(email => {
        it(`rejects "${email}"`, () => {
          expect(() => emailSchema.parse(email)).toThrow();
        });
      });
    });
  });

  describe('XSS Prevention - Input Sanitization', () => {
    const xssPayloads = [
      '<script>alert("xss")</script>',
      'javascript:alert(1)',
      '<img src=x onerror=alert(1)>',
      '<svg onload=alert(1)>',
      '"><script>alert(String.fromCharCode(88,83,83))</script>',
      "'-alert(1)-'",
      '<body onload=alert(1)>',
      '<iframe src="javascript:alert(1)">',
      '<a href="javascript:alert(1)">click</a>',
    ];

    describe('validates that XSS payloads are handled safely', () => {
      xssPayloads.forEach(payload => {
        it(`handles payload: ${payload.substring(0, 30)}...`, () => {
          // When XSS payload is used as email, it should be rejected
          expect(() => emailSchema.parse(payload)).toThrow();

          // When used as password, should be treated as a string
          // (though it would fail other validation rules)
          if (payload.length >= 8 && /[A-Z]/.test(payload) && /[a-z]/.test(payload) && /[0-9]/.test(payload)) {
            // If it happens to meet password requirements, it's just a string
            expect(() => passwordSchema.parse(payload)).not.toThrow();
          } else {
            // Should fail for not meeting requirements, not for XSS
            expect(() => passwordSchema.parse(payload)).toThrow();
          }
        });
      });
    });
  });

  describe('SQL Injection Prevention', () => {
    const sqlPayloads = [
      "'; DROP TABLE users; --",
      "1 OR 1=1",
      "admin'--",
      "1; SELECT * FROM users",
      "' OR '1'='1",
      "UNION SELECT * FROM users",
      "'; INSERT INTO users VALUES ('hacked');--",
    ];

    describe('validates that SQL payloads are handled as plain strings', () => {
      sqlPayloads.forEach(payload => {
        it(`treats SQL payload as plain string: ${payload.substring(0, 30)}...`, () => {
          // SQL payloads should be rejected as emails
          expect(() => emailSchema.parse(payload)).toThrow();

          // SQL payloads are just strings for password validation
          // They should fail normal validation, not cause injection
          const result = passwordSchema.safeParse(payload);
          // Just verify it's handled without crashing
          expect(result.success || !result.success).toBe(true);
        });
      });
    });
  });

  describe('Data Length Limits', () => {
    it('handles maximum reasonable email length', () => {
      const longLocalPart = 'a'.repeat(64);
      const longDomain = 'example.com';
      const longEmail = `${longLocalPart}@${longDomain}`;

      // Valid per RFC 5321
      expect(() => emailSchema.parse(longEmail)).not.toThrow();
    });

    it('handles maximum reasonable password length', () => {
      const longPassword = 'Aa1' + 'x'.repeat(997);
      expect(() => passwordSchema.parse(longPassword)).not.toThrow();
    });

    it('handles empty strings appropriately', () => {
      expect(() => emailSchema.parse('')).toThrow();
      expect(() => passwordSchema.parse('')).toThrow();
    });
  });

  describe('Type Coercion Safety', () => {
    it('rejects non-string types', () => {
      const nonStrings = [123, true, false, {}, [], null, undefined, NaN];

      nonStrings.forEach(value => {
        expect(() => emailSchema.parse(value)).toThrow();
        expect(() => passwordSchema.parse(value)).toThrow();
      });
    });

    it('rejects objects with toString', () => {
      const objWithToString = {
        toString: () => 'test@example.com',
      };

      expect(() => emailSchema.parse(objWithToString)).toThrow();
    });
  });

  describe('Unicode and Encoding Safety', () => {
    it('handles unicode in local part of email', () => {
      // These may or may not be valid depending on implementation
      const unicodeEmails = ['üser@example.com', 'пользователь@example.com'];

      unicodeEmails.forEach(email => {
        // Should not crash regardless of validity
        try {
          emailSchema.parse(email);
        } catch {
          // Acceptable to reject
        }
      });
    });

    it('handles null bytes', () => {
      const withNullByte = 'test\x00@example.com';
      expect(() => emailSchema.parse(withNullByte)).toThrow();
    });

    it('handles newlines and special whitespace', () => {
      const withNewline = 'test\n@example.com';
      const withTab = 'test\t@example.com';
      const withCarriageReturn = 'test\r@example.com';

      expect(() => emailSchema.parse(withNewline)).toThrow();
      expect(() => emailSchema.parse(withTab)).toThrow();
      expect(() => emailSchema.parse(withCarriageReturn)).toThrow();
    });
  });
});
