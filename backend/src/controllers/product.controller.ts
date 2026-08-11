import { Response, NextFunction } from 'express';
import { ProductService } from '../services/product.service';
import { ApiResponse } from '../utils/apiResponse';
import { AuthRequest } from '../middleware/auth.middleware';

export class ProductController {
  static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const createdById = req.user!.userId;
      const product = await ProductService.createProduct(req.body, createdById);
      return ApiResponse.success(res, product, 'Product created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? Number(req.query.page) : undefined;
      const limit = req.query.limit ? Number(req.query.limit) : undefined;
      const search = req.query.search ? String(req.query.search) : undefined;
      const category = req.query.category ? String(req.query.category) : undefined;
      const lowStockOnly = req.query.lowStockOnly === 'true';

      const result = await ProductService.getProducts({
        page,
        limit,
        search,
        category,
        lowStockOnly,
      });
      return ApiResponse.success(res, result, 'Products fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const product = await ProductService.getProductById(id);
      return ApiResponse.success(res, product, 'Product details fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  static async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const product = await ProductService.updateProduct(id, req.body);
      return ApiResponse.success(res, product, 'Product updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const result = await ProductService.deleteProduct(id);
      return ApiResponse.success(res, result, 'Product deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  static async adjustStock(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const createdById = req.user!.userId;
      const { quantityChanged, movementType, reason } = req.body;
      const result = await ProductService.adjustStock(
        id,
        quantityChanged,
        movementType,
        reason,
        createdById
      );
      return ApiResponse.success(res, result, 'Stock updated and movement logged successfully');
    } catch (error) {
      next(error);
    }
  }
}
