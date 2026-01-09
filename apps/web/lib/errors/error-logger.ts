interface ErrorContext {
  userRole?: string;
  userId?: string;
  status?: number;
  code?: string;
  url?: string;
  [key: string]: any;
}

export function logError(error: Error | any, context?: ErrorContext) {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const timestamp = new Date().toISOString();

  // Prepare error data
  const errorData = {
    timestamp,
    message: error.message || 'Unknown error',
    name: error.name || 'Error',
    stack: error.stack,
    context,
  };

  // In development, log to console with formatting
  if (isDevelopment) {
    console.group(`🚨 Error: ${errorData.message}`);
    console.error('Timestamp:', timestamp);
    console.error('Error:', error);
    if (context) {
      console.error('Context:', context);
    }
    if (error.stack) {
      console.error('Stack Trace:', error.stack);
    }
    console.groupEnd();
  } else {
    // In production, log minimal info to console
    console.error('[Error]', errorData.message, {
      code: context?.code,
      status: context?.status,
    });

    // TODO: Send to monitoring service (e.g., Sentry, DataDog, etc.)
    // Example:
    // Sentry.captureException(error, {
    //   extra: context,
    //   tags: {
    //     userRole: context?.userRole,
    //     status: context?.status,
    //   },
    // });
  }
}

export function logWarning(message: string, context?: Record<string, any>) {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const timestamp = new Date().toISOString();

  if (isDevelopment) {
    console.warn(`⚠️  Warning: ${message}`, { timestamp, ...context });
  } else {
    console.warn('[Warning]', message, context);
  }
}

export function logInfo(message: string, context?: Record<string, any>) {
  const isDevelopment = process.env.NODE_ENV === 'development';

  if (isDevelopment) {
    console.info(`ℹ️  Info: ${message}`, context);
  }
}

export function logDebug(message: string, context?: Record<string, any>) {
  const isDevelopment = process.env.NODE_ENV === 'development';

  if (isDevelopment) {
    console.debug(`🔍 Debug: ${message}`, context);
  }
}

// Initialize error tracking service (call this in app initialization)
export function initErrorTracking(config?: {
  dsn?: string;
  environment?: string;
  release?: string;
}) {
  // TODO: Initialize monitoring service
  // Example for Sentry:
  // if (config?.dsn && process.env.NODE_ENV === 'production') {
  //   Sentry.init({
  //     dsn: config.dsn,
  //     environment: config.environment || process.env.NODE_ENV,
  //     release: config.release,
  //     tracesSampleRate: 1.0,
  //   });
  // }
}
