import { Response, NextFunction } from 'express';
import { ChallanService } from '../services/challan.service';
import { ApiResponse } from '../utils/apiResponse';
import { AuthRequest } from '../middleware/auth.middleware';

export class ChallanController {
  static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const createdById = req.user!.userId;
      const challan = await ChallanService.createChallan(req.body, createdById);
      return ApiResponse.success(res, challan, 'Sales challan generated successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? Number(req.query.page) : undefined;
      const limit = req.query.limit ? Number(req.query.limit) : undefined;
      const search = req.query.search ? String(req.query.search) : undefined;
      const status = req.query.status ? (String(req.query.status) as any) : undefined;
      const customerId = req.query.customerId ? String(req.query.customerId) : undefined;

      const result = await ChallanService.getChallans({
        page,
        limit,
        search,
        status,
        customerId,
      });
      return ApiResponse.success(res, result, 'Sales challans fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const challan = await ChallanService.getChallanById(id);
      return ApiResponse.success(res, challan, 'Sales challan details fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  static async updateStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const userId = req.user!.userId;
      const { status } = req.body;
      const challan = await ChallanService.updateChallanStatus(id, status, userId);
      return ApiResponse.success(res, challan, 'Sales challan status updated successfully');
    } catch (error) {
      next(error);
    }
  }
}
