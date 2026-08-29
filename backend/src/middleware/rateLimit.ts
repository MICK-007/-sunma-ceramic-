import { Request, Response, NextFunction } from 'express';

// Rate limiters disabled/bypassed per user request for smooth testing and development
export const authLimiter = (req: Request, res: Response, next: NextFunction) => next();
export const refreshLimiter = (req: Request, res: Response, next: NextFunction) => next();
export const orderLimiter = (req: Request, res: Response, next: NextFunction) => next();
export const apiLimiter = (req: Request, res: Response, next: NextFunction) => next();
