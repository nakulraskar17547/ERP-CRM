import { Response, NextFunction } from 'express';
import { Role } from '../types/enums';
import { AuthRequest } from './auth.middleware';
import { ApiError } from '../utils/apiError';

export const authorizeRoles = (...roles: Role[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new ApiError(401, 'User context missing. Authentication required.'));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError(
          403,
          `Access forbidden: Role '${req.user.role}' is not authorized to perform this operation.`
        )
      );
    }

    next();
  };
};
