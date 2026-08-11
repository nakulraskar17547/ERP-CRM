import { z } from 'zod';
import { MovementType } from '../types/enums';

export const createProductSchema = z.object({
  body: z.object({
    productName: z.string().min(2, 'Product name is required'),
    SKU: z.string().min(2, 'SKU is required'),
    category: z.string().min(2, 'Category is required'),
    unitPrice: z.number().positive('Unit price must be greater than 0'),
    currentStock: z.number().int().min(0, 'Initial stock cannot be negative').optional(),
    minimumStockAlert: z.number().int().min(0).optional(),
    warehouseLocation: z.string().min(1, 'Warehouse location is required'),
  }),
});

export const updateProductSchema = z.object({
  body: z.object({
    productName: z.string().min(2).optional(),
    SKU: z.string().min(2).optional(),
    category: z.string().min(2).optional(),
    unitPrice: z.number().positive().optional(),
    currentStock: z.number().int().min(0).optional(),
    minimumStockAlert: z.number().int().min(0).optional(),
    warehouseLocation: z.string().min(1).optional(),
  }),
});

export const adjustStockSchema = z.object({
  body: z.object({
    quantityChanged: z.number().int().positive('Quantity must be greater than 0'),
    movementType: z.nativeEnum(MovementType),
    reason: z.string().min(2, 'Reason for stock adjustment is required'),
  }),
});
