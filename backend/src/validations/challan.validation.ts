import { z } from 'zod';
import { ChallanStatus } from '../types/enums';

export const createChallanSchema = z.object({
  body: z.object({
    customerId: z.string().uuid('Invalid Customer ID'),
    status: z.nativeEnum(ChallanStatus).optional(),
    items: z
      .array(
        z.object({
          productId: z.string().uuid('Invalid Product ID'),
          quantity: z.number().int().positive('Quantity must be at least 1'),
        })
      )
      .min(1, 'At least one product item is required in a challan'),
  }),
});

export const updateChallanStatusSchema = z.object({
  body: z.object({
    status: z.nativeEnum(ChallanStatus),
  }),
});