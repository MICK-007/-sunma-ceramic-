import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export const validateBody = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        const primaryMessage = formattedErrors.length > 0 ? formattedErrors[0].message : 'Validation failed. Invalid request payload.';

        return res.status(400).json({
          success: false,
          message: primaryMessage,
          errors: formattedErrors,
        });
      }
      next(error);
    }
  };
};

export const validateParams = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.params = schema.parse(req.params);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        const primaryMessage = formattedErrors.length > 0 ? formattedErrors[0].message : 'Validation failed. Invalid path parameter.';

        return res.status(400).json({
          success: false,
          message: primaryMessage,
          errors: formattedErrors,
        });
      }
      next(error);
    }
  };
};

export const validateQuery = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.query = schema.parse(req.query);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        const primaryMessage = formattedErrors.length > 0 ? formattedErrors[0].message : 'Validation failed. Invalid query parameters.';

        return res.status(400).json({
          success: false,
          message: primaryMessage,
          errors: formattedErrors,
        });
      }
      next(error);
    }
  };
};
