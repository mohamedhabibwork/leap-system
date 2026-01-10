import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';
import { ValidationError } from 'class-validator';

/**
 * Custom exception filter to handle validation errors from class-validator
 * Transforms validation errors into a structured format:
 * {
 *   statusCode: 400,
 *   timestamp: "...",
 *   message: "Validation failed",
 *   errors: {
 *     "fieldName": ["error message 1", "error message 2"],
 *     "nested.field": ["error message"]
 *   }
 * }
 */
@Catch(BadRequestException)
export class ValidationExceptionFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    // Check if this is a validation error from class-validator
    if (this.isValidationError(exceptionResponse)) {
      const validationErrors = this.transformValidationErrors(exceptionResponse);

      const errorResponse: any = {
        statusCode: status,
        timestamp: new Date().toISOString(),
        message: 'Validation failed',
        errors: validationErrors,
      };

      // Include additional details in non-production
      if (process.env.NODE_ENV !== 'production') {
        errorResponse.stack = exception.stack;
      }

      response.status(status).json(errorResponse);
    } else {
      // Not a validation error, return as-is
      const errorResponse: any = {
        statusCode: status,
        timestamp: new Date().toISOString(),
        ...(typeof exceptionResponse === 'object' ? exceptionResponse : { message: exceptionResponse }),
      };

      // Include stack trace in non-production
      if (process.env.NODE_ENV !== 'production') {
        errorResponse.stack = exception.stack;
      }

      response.status(status).json(errorResponse);
    }
  }

  /**
   * Check if the exception response contains validation errors
   */
  private isValidationError(exceptionResponse: any): boolean {
    return (
      typeof exceptionResponse === 'object' &&
      Array.isArray(exceptionResponse.message) &&
      exceptionResponse.message.length > 0 &&
      typeof exceptionResponse.message[0] === 'string'
    );
  }

  /**
   * Transform validation error messages into structured format
   * Supports both flat and nested field paths
   */
  private transformValidationErrors(exceptionResponse: any): Record<string, string[]> {
    const errors: Record<string, string[]> = {};
    const messages = exceptionResponse.message;

    if (!Array.isArray(messages)) {
      return errors;
    }

    // Group error messages by field
    for (const message of messages) {
      // Parse error messages in various formats:
      // 1. "email must be an email" -> field: "email"
      // 2. "password must be longer than or equal to 6 characters" -> field: "password"
      // 3. "profile.firstName must be a string" -> field: "profile.firstName"
      
      const parsed = this.parseErrorMessage(message);
      if (parsed) {
        const { field, message: errorMessage } = parsed;
        if (!errors[field]) {
          errors[field] = [];
        }
        errors[field].push(errorMessage);
      } else {
        // If we can't parse it, add to a general field
        if (!errors['_general']) {
          errors['_general'] = [];
        }
        errors['_general'].push(message);
      }
    }

    return errors;
  }

  /**
   * Parse error message to extract field name and error text
   * Handles various formats from class-validator
   */
  private parseErrorMessage(message: string): { field: string; message: string } | null {
    if (typeof message !== 'string') {
      return null;
    }

    // Try to extract field name from common patterns
    // Pattern 1: "fieldName must be..." or "fieldName should be..."
    const match = message.match(/^([a-zA-Z0-9_.]+)\s+(must|should|cannot|is)/i);
    
    if (match) {
      const field = match[1];
      return { field, message };
    }

    // Pattern 2: "property fieldName has failed..."
    const propertyMatch = message.match(/property\s+([a-zA-Z0-9_.]+)\s+has\s+failed/i);
    if (propertyMatch) {
      const field = propertyMatch[1];
      return { field, message };
    }

    // Pattern 3: Try to find field name at the beginning
    const fieldMatch = message.match(/^([a-zA-Z0-9_.]+)/);
    if (fieldMatch) {
      const field = fieldMatch[1];
      return { field, message };
    }

    return null;
  }
}
