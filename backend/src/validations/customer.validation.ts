import { z } from 'zod';
import { CustomerType, CustomerStatus } from '../types/enums';

export const createCustomerSchema = z.object({
  body: z.object({
    customerName: z.string().min(2, 'Customer name is required'),
    mobileNumber: z.string().min(8, 'Mobile number is required'),
    email: z.string().email('Invalid email').optional().or(z.literal('')),
    businessName: z.string().min(2, 'Business name is required'),
    gstNumber: z.string().optional().or(z.literal('')),
    customerType: z.nativeEnum(CustomerType).optional(),
    address: z.string().min(3, 'Address is required'),
    status: z.nativeEnum(CustomerStatus).optional(),
    followUpDate: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
  }),
});

export const updateCustomerSchema = z.object({
  body: z.object({
    customerName: z.string().min(2).optional(),
    mobileNumber: z.string().min(8).optional(),
    email: z.string().email().optional().or(z.literal('')),
    businessName: z.string().min(2).optional(),
    gstNumber: z.string().optional().or(z.literal('')),
    customerType: z.nativeEnum(CustomerType).optional(),
    address: z.string().min(3).optional(),
    status: z.nativeEnum(CustomerStatus).optional(),
    followUpDate: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
  }),
});

export const addNoteSchema = z.object({
  body: z.object({
    note: z.string().min(1, 'Note content is required'),
    followUpDate: z.string().optional().nullable(),
  }),
});
