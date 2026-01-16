import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { isProduction } from '../../config/env';

/**
 * Standardized error response interface
 */
export interface ErrorResponse {
  statusCode: number;
  timestamp: string;
  message: string;
  errors?: Record<string, string[]>; // For validation errors
  path?: string; // Request path
  method?: string; // HTTP method
  stack?: string; // Stack trace (development only)
  name?: string; // Error name (development only)
  details?: string; // Additional error details (development only)
}

/**
 * Global exception filter for HTTP exceptions
 * Handles all HTTP exceptions with consistent error response format
 * Includes validation error handling and proper logging
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    // Get request context for logging and response
    const path = request.url;
    const method = request.method;

    // Handle validation errors specially
    if (exception instanceof BadRequestException && this.isValidationError(exceptionResponse)) {
      const validationErrors = this.transformValidationErrors(exceptionResponse);
      
      const errorResponse: ErrorResponse = {
        statusCode: status,
        timestamp: new Date().toISOString(),
        message: 'Validation failed',
        errors: validationErrors,
        path,
        method,
      };

      // Log validation errors at warn level (not critical)
      this.logger.warn(
        `Validation failed: ${method} ${path} - ${Object.keys(validationErrors).length} field(s) with errors`
      );

      // Include stack trace in non-production environments
      if (!isProduction()) {
        errorResponse.stack = exception.stack;
        errorResponse.name = exception.name;
      }

      response.status(status).json(errorResponse);
      return;
    }

    // Standard error response
    const errorResponse: ErrorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      message: exception.message,
      path,
      method,
      ...(typeof exceptionResponse === 'object' ? exceptionResponse : {}),
    };

    // Include stack trace and additional details in non-production environments
    if (!isProduction()) {
      errorResponse.stack = exception.stack;
      errorResponse.name = exception.name;
    }

    // Log error with appropriate level based on status code
    const logMessage = `${method} ${path} - ${status} ${exception.message}`;
    if (status >= 500) {
      this.logger.error(logMessage, exception.stack);
    } else if (status >= 400) {
      this.logger.warn(logMessage);
    } else {
      this.logger.log(logMessage);
    }

    response.status(status).json(errorResponse);
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

/**
 * Catch-all exception filter for unhandled errors
 * Handles any exception that wasn't caught by HttpExceptionFilter
 * This should be registered last in the filter chain
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.message
        : 'Internal server error';

    // Get request context
    const path = request.url;
    const method = request.method;

    const errorResponse: ErrorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      message,
      path,
      method,
    };

    // Include detailed error information in non-production environments
    if (!isProduction()) {
      if (exception instanceof Error) {
        errorResponse.stack = exception.stack;
        errorResponse.name = exception.name;
        errorResponse.details = exception.message;
      } else {
        errorResponse.details = String(exception);
      }
    }

    // Log unhandled errors at error level
    const logMessage = `Unhandled exception: ${method} ${path} - ${status} ${message}`;
    if (exception instanceof Error) {
      this.logger.error(logMessage, exception.stack);
    } else {
      this.logger.error(logMessage, String(exception));
    }

    response.status(status).json(errorResponse);
  }
}
