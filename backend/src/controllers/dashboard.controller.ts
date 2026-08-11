import { Response, NextFunction } from 'express';
import { DashboardService } from '../services/dashboard.service';
import { ApiResponse } from '../utils/apiResponse';
import { AuthRequest } from '../middleware/auth.middleware';

export class DashboardController {
  static async getStats(_req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const stats = await DashboardService.getMetrics();
      return ApiResponse.success(res, stats, 'Dashboard metrics fetched successfully');
    } catch (error) {
      next(error);
    }
  }
}
