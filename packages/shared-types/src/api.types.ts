// API-specific types

export interface ValidationError {
  field: string;
  message: string;
}

export interface ErrorResponse {
  statusCode: number;
  message: string;
  error?: string;
  validationErrors?: ValidationError[];
}

export interface SuccessResponse<T = unknown> {
  statusCode: number;
  data: T;
  message?: string;
}
