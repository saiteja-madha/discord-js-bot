// @/middleware/errors/errorHandler.ts
import type { APIContext } from 'astro';
import {
  AppError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ValidationError,
} from './types';

export function errorHandler(error: Error, context: APIContext) {
  console.error('Error caught by middleware:', {
    name: error.name,
    message: error.message,
    stack: error.stack,
    url: context.url.pathname,
  });

  // Default error response
  let response = {
    status: 500,
    message: 'Internal server error',
    code: 'INTERNAL_ERROR',
  };

  // Handle known errors
  if (error instanceof AppError) {
    response = {
      status: error.statusCode,
      message: error.message,
      code: error.code || 'APP_ERROR',
    };
  }

  // Specific error handling
  if (error instanceof AuthenticationError) {
    return context.redirect('/auth/login?error=unauthenticated');
  }

  if (error instanceof AuthorizationError) {
    return context.redirect('/403');
  }

  if (error instanceof NotFoundError) {
    return context.redirect('/404');
  }

  if (error instanceof ValidationError) {
    return new Response(
      JSON.stringify({
        status: response.status,
        message: response.message,
        code: response.code,
      }),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }

  // Log unknown errors
  if (!(error instanceof AppError)) {
    console.error('Unhandled error:', error);
  }

  // Production vs Development error responses
  const isProd = import.meta.env.PROD;
  const errorResponse = {
    status: response.status,
    message: isProd ? response.message : error.message,
    code: response.code,
    ...(isProd ? {} : { stack: error.stack }),
  };

  return new Response(JSON.stringify(errorResponse), {
    status: response.status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
