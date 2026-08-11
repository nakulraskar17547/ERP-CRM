import { Response, NextFunction } from 'express';
import { StockMovementService } from '../services/stockMovement.service';
import { ApiResponse } from '../utils/apiResponse';
import { AuthRequest } from '../middleware/auth.middleware';

export class StockMovementController {
  static async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? Number(req.query.page) : undefined;
      const limit = req.query.limit ? Number(req.query.limit) : undefined;
      const productId = req.query.productId ? String(req.query.productId) : undefined;
      const movementType = req.query.movementType ? (String(req.query.movementType) as any) : undefined;

      const result = await StockMovementService.getStockMovements({
        page,
        limit,
        productId,
        movementType,
      });
      return ApiResponse.success(res, result, 'Stock movements fetched successfully');
    } catch (error) {
      next(error);
    }
  }
}
