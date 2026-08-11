import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/apiError';
import { ApiResponse } from '../utils/apiResponse';

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = err.errors || [];

  if (err instanceof ApiError) {
    return ApiResponse.error(res, message, statusCode, errors);
  }

  // Handle Prisma errors
  if (err.code === 'P2002') {
    const target = err.meta?.target ? ` (${(err.meta.target as string[]).join(', ')})` : '';
    statusCode = 409;
    message = `A record with this unique field already exists${target}.`;
  } else if (err.code === 'P2025') {
    statusCode = 404;
    message = 'Requested record not found in database.';
  }

  console.error('[Error Details]:', err);
  return ApiResponse.error(res, message, statusCode, errors);
};
