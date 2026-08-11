import { Response, NextFunction } from 'express';
import { CustomerService } from '../services/customer.service';
import { ApiResponse } from '../utils/apiResponse';
import { AuthRequest } from '../middleware/auth.middleware';

export class CustomerController {
  static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const customer = await CustomerService.createCustomer(req.body);
      return ApiResponse.success(res, customer, 'Customer created successfully', 201);
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
      const customerType = req.query.customerType ? (String(req.query.customerType) as any) : undefined;

      const result = await CustomerService.getCustomers({
        page,
        limit,
        search,
        status,
        customerType,
      });
      return ApiResponse.success(res, result, 'Customers fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const customer = await CustomerService.getCustomerById(id);
      return ApiResponse.success(res, customer, 'Customer fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  static async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const customer = await CustomerService.updateCustomer(id, req.body);
      return ApiResponse.success(res, customer, 'Customer updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const result = await CustomerService.deleteCustomer(id);
      return ApiResponse.success(res, result, 'Customer deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  static async addNote(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const { note, followUpDate } = req.body;
      const customer = await CustomerService.addFollowUpNote(id, note, followUpDate);
      return ApiResponse.success(res, customer, 'Follow-up note added successfully');
    } catch (error) {
      next(error);
    }
  }
}
