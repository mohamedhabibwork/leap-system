import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    // Handle validation errors specially
    if (exception instanceof BadRequestException && this.isValidationError(exceptionResponse)) {
      const validationErrors = this.transformValidationErrors(exceptionResponse);
      
      response.status(status).json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        message: 'Validation failed',
        errors: validationErrors,
      });
      return;
    }

    // Standard error response
    const errorResponse: any = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      message: exception.message,
      ...(typeof exceptionResponse === 'object' ? exceptionResponse : {}),
    };

    // Include stack trace and additional details in non-production environments
    if (process.env.NODE_ENV !== 'production') {
      errorResponse.stack = exception.stack;
      errorResponse.name = exception.name;
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
   */
  private transformValidationErrors(exceptionResponse: any): Record<string, string[]> {
    const errors: Record<string, string[]> = {};
    const messages = exceptionResponse.message;

    if (!Array.isArray(messages)) {
      return errors;
    }

    for (const message of messages) {
      const parsed = this.parseErrorMessage(message);
      if (parsed) {
        const { field, message: errorMessage } = parsed;
        if (!errors[field]) {
          errors[field] = [];
        }
        errors[field].push(errorMessage);
      } else {
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
   */
  private parseErrorMessage(message: string): { field: string; message: string } | null {
    if (typeof message !== 'string') {
      return null;
    }

    // Pattern: "fieldName must be..." or "fieldName should be..."
    const match = message.match(/^([a-zA-Z0-9_.]+)\s+(must|should|cannot|is)/i);
    
    if (match) {
      const field = match[1];
      return { field, message };
    }

    // Pattern: "property fieldName has failed..."
    const propertyMatch = message.match(/property\s+([a-zA-Z0-9_.]+)\s+has\s+failed/i);
    if (propertyMatch) {
      const field = propertyMatch[1];
      return { field, message };
    }

    // Try to find field name at the beginning
    const fieldMatch = message.match(/^([a-zA-Z0-9_.]+)/);
    if (fieldMatch) {
      const field = fieldMatch[1];
      return { field, message };
    }

    return null;
  }
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.message
        : 'Internal server error';

    const errorResponse: any = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      message,
    };

    // Include detailed error information in non-production environments
    if (process.env.NODE_ENV !== 'production') {
      if (exception instanceof Error) {
        errorResponse.stack = exception.stack;
        errorResponse.name = exception.name;
        errorResponse.details = exception.message;
      } else {
        errorResponse.details = String(exception);
      }
    }

    response.status(status).json(errorResponse);
  }
}
