import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('API Error:', err);

  const statusCode = err.statusCode || (err.status ? err.status : 500);
  const isProd = process.env.NODE_ENV === 'production';

  // Sanitize 500 error messages in production to prevent DB schema / stack trace leaks
  const message = (isProd && statusCode === 500)
    ? 'An internal server error occurred. Please try again later.'
    : (err.message || 'Internal server error occurred.');

  res.status(statusCode).json({
    success: false,
    message,
    ...(err.errors && { errors: err.errors }), // Include Zod validation field errors
    ...(!isProd && { stack: err.stack }),
  });
};
