/**
 * Shared validation utilities for Supabase Edge Functions
 * Uses Zod for schema validation with proper error handling
 */

// Zod-compatible validation (Deno-native implementation for edge functions)
// Avoiding external zod import for faster cold starts

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: ValidationError[];
}

// Type validators
export const isString = (val: unknown): val is string => typeof val === 'string';
export const isNumber = (val: unknown): val is number => typeof val === 'number' && !isNaN(val);
export const isBoolean = (val: unknown): val is boolean => typeof val === 'boolean';
export const isArray = (val: unknown): val is unknown[] => Array.isArray(val);
export const isObject = (val: unknown): val is Record<string, unknown> => 
  typeof val === 'object' && val !== null && !Array.isArray(val);

// String validators
export const minLength = (str: string, min: number): boolean => str.length >= min;
export const maxLength = (str: string, max: number): boolean => str.length <= max;
export const isEmail = (str: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
export const isUUID = (str: string): boolean => 
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
export const isISOCode = (str: string, length = 2): boolean => 
  /^[A-Z]+$/i.test(str) && str.length === length;

// Sanitization
export const sanitizeString = (str: string): string => 
  str.trim().replace(/[<>]/g, '').slice(0, 10000);

export const sanitizeForSQL = (str: string): string =>
  str.replace(/'/g, "''").replace(/;/g, '').replace(/--/g, '');

// Validation builder
export class Validator<T> {
  private errors: ValidationError[] = [];
  private data: Partial<T> = {};
  private input: Record<string, unknown>;

  constructor(input: unknown) {
    this.input = isObject(input) ? input : {};
  }

  string(field: keyof T, options?: { 
    required?: boolean; 
    min?: number; 
    max?: number; 
    pattern?: RegExp;
    sanitize?: boolean;
    default?: string;
  }): this {
    const value = this.input[field as string];
    const opts = options ?? {};
    
    if (value === undefined || value === null || value === '') {
      if (opts.required) {
        this.errors.push({ field: field as string, message: `${String(field)} is required` });
      } else if (opts.default !== undefined) {
        (this.data as Record<string, unknown>)[field as string] = opts.default;
      }
      return this;
    }

    if (!isString(value)) {
      this.errors.push({ field: field as string, message: `${String(field)} must be a string` });
      return this;
    }

    let str = opts.sanitize !== false ? sanitizeString(value) : value;
    
    if (opts.min && str.length < opts.min) {
      this.errors.push({ field: field as string, message: `${String(field)} must be at least ${opts.min} characters` });
      return this;
    }
    
    if (opts.max && str.length > opts.max) {
      this.errors.push({ field: field as string, message: `${String(field)} must be at most ${opts.max} characters` });
      return this;
    }
    
    if (opts.pattern && !opts.pattern.test(str)) {
      this.errors.push({ field: field as string, message: `${String(field)} has invalid format` });
      return this;
    }

    (this.data as Record<string, unknown>)[field as string] = str;
    return this;
  }

  uuid(field: keyof T, options?: { required?: boolean }): this {
    const value = this.input[field as string];
    const opts = options ?? {};
    
    if (value === undefined || value === null || value === '') {
      if (opts.required) {
        this.errors.push({ field: field as string, message: `${String(field)} is required` });
      }
      return this;
    }

    if (!isString(value) || !isUUID(value)) {
      this.errors.push({ field: field as string, message: `${String(field)} must be a valid UUID` });
      return this;
    }

    (this.data as Record<string, unknown>)[field as string] = value;
    return this;
  }

  email(field: keyof T, options?: { required?: boolean }): this {
    const value = this.input[field as string];
    const opts = options ?? {};
    
    if (value === undefined || value === null || value === '') {
      if (opts.required) {
        this.errors.push({ field: field as string, message: `${String(field)} is required` });
      }
      return this;
    }

    if (!isString(value) || !isEmail(value)) {
      this.errors.push({ field: field as string, message: `${String(field)} must be a valid email` });
      return this;
    }

    (this.data as Record<string, unknown>)[field as string] = value.toLowerCase().trim();
    return this;
  }

  enum<E extends string>(field: keyof T, values: E[], options?: { 
    required?: boolean;
    default?: E;
  }): this {
    const value = this.input[field as string];
    const opts = options ?? {};
    
    if (value === undefined || value === null || value === '') {
      if (opts.required) {
        this.errors.push({ field: field as string, message: `${String(field)} is required` });
      } else if (opts.default !== undefined) {
        (this.data as Record<string, unknown>)[field as string] = opts.default;
      }
      return this;
    }

    if (!isString(value) || !values.includes(value as E)) {
      this.errors.push({ 
        field: field as string, 
        message: `${String(field)} must be one of: ${values.join(', ')}` 
      });
      return this;
    }

    (this.data as Record<string, unknown>)[field as string] = value;
    return this;
  }

  number(field: keyof T, options?: { 
    required?: boolean;
    min?: number;
    max?: number;
    integer?: boolean;
    default?: number;
  }): this {
    const value = this.input[field as string];
    const opts = options ?? {};
    
    if (value === undefined || value === null) {
      if (opts.required) {
        this.errors.push({ field: field as string, message: `${String(field)} is required` });
      } else if (opts.default !== undefined) {
        (this.data as Record<string, unknown>)[field as string] = opts.default;
      }
      return this;
    }

    const num = typeof value === 'string' ? parseFloat(value) : value;
    
    if (!isNumber(num)) {
      this.errors.push({ field: field as string, message: `${String(field)} must be a number` });
      return this;
    }

    if (opts.integer && !Number.isInteger(num)) {
      this.errors.push({ field: field as string, message: `${String(field)} must be an integer` });
      return this;
    }

    if (opts.min !== undefined && num < opts.min) {
      this.errors.push({ field: field as string, message: `${String(field)} must be at least ${opts.min}` });
      return this;
    }

    if (opts.max !== undefined && num > opts.max) {
      this.errors.push({ field: field as string, message: `${String(field)} must be at most ${opts.max}` });
      return this;
    }

    (this.data as Record<string, unknown>)[field as string] = num;
    return this;
  }

  boolean(field: keyof T, options?: { required?: boolean; default?: boolean }): this {
    const value = this.input[field as string];
    const opts = options ?? {};
    
    if (value === undefined || value === null) {
      if (opts.required) {
        this.errors.push({ field: field as string, message: `${String(field)} is required` });
      } else if (opts.default !== undefined) {
        (this.data as Record<string, unknown>)[field as string] = opts.default;
      }
      return this;
    }

    if (!isBoolean(value)) {
      this.errors.push({ field: field as string, message: `${String(field)} must be a boolean` });
      return this;
    }

    (this.data as Record<string, unknown>)[field as string] = value;
    return this;
  }

  array(field: keyof T, options?: { 
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    default?: unknown[];
  }): this {
    const value = this.input[field as string];
    const opts = options ?? {};
    
    if (value === undefined || value === null) {
      if (opts.required) {
        this.errors.push({ field: field as string, message: `${String(field)} is required` });
      } else if (opts.default !== undefined) {
        (this.data as Record<string, unknown>)[field as string] = opts.default;
      }
      return this;
    }

    if (!isArray(value)) {
      this.errors.push({ field: field as string, message: `${String(field)} must be an array` });
      return this;
    }

    if (opts.minLength !== undefined && value.length < opts.minLength) {
      this.errors.push({ field: field as string, message: `${String(field)} must have at least ${opts.minLength} items` });
      return this;
    }

    if (opts.maxLength !== undefined && value.length > opts.maxLength) {
      this.errors.push({ field: field as string, message: `${String(field)} must have at most ${opts.maxLength} items` });
      return this;
    }

    (this.data as Record<string, unknown>)[field as string] = value;
    return this;
  }

  object(field: keyof T, options?: { required?: boolean }): this {
    const value = this.input[field as string];
    const opts = options ?? {};
    
    if (value === undefined || value === null) {
      if (opts.required) {
        this.errors.push({ field: field as string, message: `${String(field)} is required` });
      }
      return this;
    }

    if (!isObject(value)) {
      this.errors.push({ field: field as string, message: `${String(field)} must be an object` });
      return this;
    }

    (this.data as Record<string, unknown>)[field as string] = value;
    return this;
  }

  validate(): ValidationResult<T> {
    if (this.errors.length > 0) {
      return { success: false, errors: this.errors };
    }
    return { success: true, data: this.data as T };
  }
}

// Factory function for cleaner usage
export function validate<T>(input: unknown): Validator<T> {
  return new Validator<T>(input);
}

// Response helper for validation errors
export function validationErrorResponse(errors: ValidationError[], corsHeaders: Record<string, string>) {
  return new Response(
    JSON.stringify({ 
      error: 'Validation failed', 
      details: errors 
    }),
    { 
      status: 400, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}
